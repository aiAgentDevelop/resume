/* ================================================================
   Portfolio Renderer
   - api/*.js의 window.ResumeAPI 데이터를 다크 테마 섹션으로 렌더링
   - IntersectionObserver 기반 scroll reveal
   - Sticky nav active state
   - Career timeline 토글 (최근 4개 ↔ 전체)
================================================================ */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────
  function escapeHtml(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(text)));
    return div.innerHTML;
  }

  function el(id) { return document.getElementById(id); }

  // ─────────────────────────────────────────────────────────────
  // About
  // ─────────────────────────────────────────────────────────────
  function renderAbout(about) {
    if (!about || !about.sections) return;
    var sections = about.sections;
    var p1 = el('about-p1');
    var p2 = el('about-p2');
    if (p1 && sections[0]) {
      // 첫 섹션의 첫 두 문단만 발췌
      var paragraphs = sections[0].content.split('\n\n');
      p1.innerHTML = highlightAccent(paragraphs[0] || '');
      if (p2) p2.innerHTML = highlightAccent(paragraphs[1] || paragraphs[0] || '');
    }
  }

  function highlightAccent(text) {
    var escaped = escapeHtml(text);
    var keywords = [
      'Claude Code', 'AI Agent', 'AI 에이전트', '오픈소스', '하네스', 'Harness Skill',
      '병렬', 'NestJS', '게임 서버', '오케스트레이션', '한 사람 몫'
    ];
    keywords.forEach(function (kw) {
      var re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'g');
      escaped = escaped.replace(re, '<span class="accent">$1</span>');
    });
    return escaped;
  }

  // ─────────────────────────────────────────────────────────────
  // Career Timeline
  // ─────────────────────────────────────────────────────────────
  var careerExpanded = false;
  var DEFAULT_CAREER_COUNT = 4;

  function renderCareer(career) {
    var container = el('career-timeline');
    if (!container || !career) return;

    var items = careerExpanded ? career : career.slice(0, DEFAULT_CAREER_COUNT);
    var html = items.map(function (item, idx) {
      var isCurrent = (idx === 0 && /재직/.test(item.duration || ''));
      var projects = (item.projects || []);

      var projectsHtml = projects.map(function (p) {
        var cls = 'timeline-project' + (p.highlight ? ' is-highlight' : '');
        return '<div class="' + cls + '">' + escapeHtml(p.title) + '</div>';
      }).join('');

      var techSet = {};
      projects.forEach(function (p) {
        (p.techStack || []).forEach(function (t) { techSet[t] = true; });
      });
      var techs = Object.keys(techSet).slice(0, 12);
      var techHtml = techs.length
        ? '<div class="timeline-techs">' +
            techs.map(function (t) { return '<span class="chip">' + escapeHtml(t) + '</span>'; }).join('') +
          '</div>'
        : '';

      return '<div class="timeline-item' + (isCurrent ? ' is-current' : '') + ' reveal">' +
          '<div class="timeline-period">' +
            escapeHtml(item.period) +
            '<span class="duration">' + escapeHtml(item.duration) + '</span>' +
          '</div>' +
          '<div class="timeline-card">' +
            '<div class="timeline-company">' + escapeHtml(item.company) + '</div>' +
            '<div class="timeline-meta">' +
              '<span class="role">' + escapeHtml(item.role || '') + '</span> · ' +
              escapeHtml(item.department || '') +
            '</div>' +
            (item.summary ? '<div class="timeline-summary">' + escapeHtml(item.summary) + '</div>' : '') +
            (projectsHtml ? '<div class="timeline-projects">' + projectsHtml + '</div>' : '') +
            techHtml +
          '</div>' +
        '</div>';
    }).join('');

    container.innerHTML = html;
    // reveal class를 즉시 활성화 (이미 viewport 안에 있을 수 있음)
    observeReveal(container.querySelectorAll('.reveal'));
  }

  function setupCareerToggle(career) {
    var btn = el('career-toggle');
    if (!btn || !career) return;
    if (career.length <= DEFAULT_CAREER_COUNT) {
      btn.style.display = 'none';
      return;
    }
    btn.addEventListener('click', function () {
      careerExpanded = !careerExpanded;
      btn.setAttribute('aria-expanded', careerExpanded ? 'true' : 'false');
      btn.textContent = careerExpanded
        ? '접기 (최근 ' + DEFAULT_CAREER_COUNT + '개만)'
        : '전체 펼치기 (' + career.length + '개 회사)';
      renderCareer(career);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Open Source
  // ─────────────────────────────────────────────────────────────
  function renderOSS(projects) {
    var container = el('oss-grid');
    if (!container || !projects || !projects.items) return;

    var html = projects.items.map(function (p) {
      var bullets = (p.description || []).slice(0, 5).map(function (d) {
        return '<div class="oss-bullet">' + escapeHtml(d) + '</div>';
      }).join('');

      var techs = (p.techStack || []).map(function (t) {
        return '<span class="chip">' + escapeHtml(t) + '</span>';
      }).join('');

      return '<article class="oss-card reveal">' +
          '<div class="oss-head">' +
            '<div class="oss-icon" aria-hidden="true">📦</div>' +
            '<div class="oss-name-wrap">' +
              '<div class="oss-name">' + escapeHtml(p.name) + '</div>' +
              '<div class="oss-badge-row">' +
                '<span class="oss-badge is-accent">' + escapeHtml(p.role || '') + '</span>' +
                '<span class="oss-badge">' + escapeHtml(p.period || '') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          (p.summary ? '<div class="oss-summary">' + escapeHtml(p.summary) + '</div>' : '') +
          (bullets ? '<div class="oss-bullets">' + bullets + '</div>' : '') +
          (techs ? '<div class="chip-row">' + techs + '</div>' : '') +
          '<a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener" class="oss-link">View on GitHub →</a>' +
        '</article>';
    }).join('');

    container.innerHTML = html;
    observeReveal(container.querySelectorAll('.reveal'));
  }

  // ─────────────────────────────────────────────────────────────
  // Tech Stack — 카테고리 그룹핑
  // ─────────────────────────────────────────────────────────────
  var SKILL_GROUPS = [
    {
      label: 'Languages',
      match: ['TypeScript', 'JavaScript', 'Golang', 'Python', 'PHP', 'Java', 'Node.js']
    },
    {
      label: 'Frameworks',
      match: ['NestJS', 'Socket.io', 'Express', 'Vue', 'React', 'Next.js', 'Svelte']
    },
    {
      label: 'Database & Cache',
      match: ['MySQL', 'MariaDB', 'Redis', 'Redis Cluster', 'Prisma', 'TypeORM', 'PostgreSQL', 'Supabase']
    },
    {
      label: 'Infra & DevOps',
      match: ['AWS', 'Docker', 'Kubernetes', 'Coolify', 'CI/CD Pipeline', 'Linux', 'Apache', 'Nginx']
    },
    {
      label: 'AI Tooling',
      match: ['Claude Code Agent', 'AI Orchestration (Parallel)', 'Harness Skill', 'Claude Code', 'MCP']
    }
  ];

  function renderSkills(skills) {
    var container = el('skills-grid');
    if (!container || !skills) return;

    var remaining = skills.slice();
    var html = SKILL_GROUPS.map(function (grp) {
      var matched = remaining.filter(function (s) { return grp.match.indexOf(s) !== -1; });
      // 매칭된 항목은 remaining에서 제거
      matched.forEach(function (m) {
        var i = remaining.indexOf(m);
        if (i > -1) remaining.splice(i, 1);
      });
      if (matched.length === 0) return '';
      return '<div class="skill-group reveal">' +
          '<div class="skill-group-title">' + escapeHtml(grp.label) + '</div>' +
          '<div class="chip-row">' +
            matched.map(function (m) { return '<span class="chip">' + escapeHtml(m) + '</span>'; }).join('') +
          '</div>' +
        '</div>';
    }).join('');

    // 남은 항목들은 "Etc" 그룹
    if (remaining.length > 0) {
      html += '<div class="skill-group reveal">' +
          '<div class="skill-group-title">Etc</div>' +
          '<div class="chip-row">' +
            remaining.map(function (m) { return '<span class="chip">' + escapeHtml(m) + '</span>'; }).join('') +
          '</div>' +
        '</div>';
    }

    container.innerHTML = html;
    observeReveal(container.querySelectorAll('.reveal'));
  }

  // ─────────────────────────────────────────────────────────────
  // Scroll Reveal
  // ─────────────────────────────────────────────────────────────
  var revealObserver = null;

  function setupRevealObserver() {
    if (!('IntersectionObserver' in window)) {
      // fallback: 즉시 visible
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var target = entry.target;
          // stagger: 같은 부모 안의 요소들 100ms 간격
          var siblings = Array.prototype.slice.call(target.parentElement ? target.parentElement.children : []);
          var idx = siblings.indexOf(target);
          var delay = Math.min(idx, 8) * 60;
          setTimeout(function () { target.classList.add('is-visible'); }, delay);
          revealObserver.unobserve(target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  function observeReveal(nodeList) {
    if (!revealObserver) return;
    Array.prototype.forEach.call(nodeList, function (el) {
      revealObserver.observe(el);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Sticky Nav — Active state
  // ─────────────────────────────────────────────────────────────
  function setupNavActiveState() {
    if (!('IntersectionObserver' in window)) return;
    var sections = document.querySelectorAll('section[id]');
    var links = document.querySelectorAll('.nav-link[data-nav]');

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (l) {
          if (l.getAttribute('data-nav') === id) l.classList.add('is-active');
          else l.classList.remove('is-active');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  // ─────────────────────────────────────────────────────────────
  // Footer year
  // ─────────────────────────────────────────────────────────────
  function setFooterYear() {
    var y = el('copy-year');
    if (y) y.textContent = new Date().getFullYear();
  }

  // ─────────────────────────────────────────────────────────────
  // Hero typing animation — character stagger
  // ─────────────────────────────────────────────────────────────
  function animateHeroName() {
    var name = el('hero-name');
    if (!name) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      name.classList.add('is-visible');
      return;
    }
    // 각 line의 글자를 span으로 분할해서 stagger
    var lines = name.querySelectorAll('.line1, .line2');
    var globalIdx = 0;
    lines.forEach(function (line) {
      var text = line.textContent;
      line.textContent = '';
      var chars = text.split('');
      chars.forEach(function (ch) {
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch === ' ' ? ' ' : ch;
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        span.style.display = 'inline-block';
        span.style.transition = 'opacity 500ms ease, transform 500ms ease';
        line.appendChild(span);
        setTimeout(function () {
          span.style.opacity = '1';
          span.style.transform = 'translateY(0)';
        }, 200 + globalIdx * 35);
        globalIdx += 1;
      });
    });

    // line3 (이동완)는 split하지 않고 통째로 fade-in (background-clip:text gradient 보존)
    var line3 = name.querySelector('.line3');
    if (line3) {
      line3.style.opacity = '0';
      line3.style.transform = 'translateY(20px)';
      line3.style.transition = 'opacity 600ms ease, transform 600ms ease';
      setTimeout(function () {
        line3.style.opacity = '1';
        line3.style.transform = 'translateY(0)';
      }, 200 + globalIdx * 35 + 120);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Smooth anchor scroll (fallback)
  // ─────────────────────────────────────────────────────────────
  function setupAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────
  function init() {
    var API = window.ResumeAPI;
    if (!API) return;

    setFooterYear();
    renderAbout(API.about);
    renderCareer(API.career || []);
    setupCareerToggle(API.career || []);
    renderOSS(API.projects);
    renderSkills(API.skills || []);

    setupRevealObserver();
    setupNavActiveState();
    setupAnchorScroll();

    var portfolio = el('portfolio-app');
    if (portfolio) {
      animateHeroName();
      // Hero 섹션 안의 reveal 요소는 즉시 visible 처리 (viewport에 이미 있음, IntersectionObserver 타이밍 보호)
      var heroEl = el('hero');
      if (heroEl) {
        heroEl.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('is-visible'); });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
