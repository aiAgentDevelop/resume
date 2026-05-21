document.addEventListener('DOMContentLoaded', function () {
  var API = window.ResumeAPI;
  if (!API) return;

  renderHeader(API.profile);
  renderProfile(API.profile);
  renderSummary(API.summary);
  renderSkills(API.skills);
  renderProjects(API.projects);
  renderEducation(API.education);
  renderCareer(API.career);
  renderAbout(API.about);
  renderMilitary(API.military);
  renderFooter();
});

function renderHeader(profile) {
  var el = document.getElementById('resume-header');
  el.innerHTML = '<h1>' + escapeHtml(profile.title) + '</h1>';
}

function renderProfile(profile) {
  var el = document.getElementById('profile-section');

  var githubBlock = '';
  if (profile.github) {
    githubBlock += '<dt>GitHub</dt><dd><a href="https://' + escapeHtml(profile.github) + '" target="_blank" rel="noopener">' + escapeHtml(profile.github) + '</a></dd>';
  }

  if (profile.repositories && profile.repositories.length > 0) {
    profile.repositories.forEach(function (repo) {
      githubBlock += '<dd class="github-line">' +
        '<strong>' + escapeHtml(repo.name) + '</strong> — ' +
        '<a href="' + escapeHtml(repo.url) + '" target="_blank" rel="noopener">' + escapeHtml(repo.url) + '</a>' +
        (repo.note ? '<br>' + escapeHtml(repo.note) : '') +
      '</dd>';
    });
  }

  var html = '<div class="profile-info">' +
      '<div class="profile-name">' +
        escapeHtml(profile.name) +
        '<span class="gender-age">' + escapeHtml(profile.gender) + ' ' + profile.birthYear + '년 (만 ' + profile.age + '세)</span>' +
      '</div>' +
      '<dl class="profile-details">' +
        '<dt>Email</dt><dd><a href="mailto:' + escapeHtml(profile.email) + '">' + escapeHtml(profile.email) + '</a></dd>' +
        '<dt>휴대폰</dt><dd>' + escapeHtml(profile.phone) + '</dd>' +
        '<dt>주소</dt><dd>' + escapeHtml(profile.address) + '</dd>' +
        githubBlock +
      '</dl>' +
    '</div>';

  el.innerHTML = html;
}

function renderSummary(summary) {
  var el = document.getElementById('summary-section');
  el.innerHTML =
    '<div class="summary-item">' +
      '<div class="summary-label">학력</div>' +
      '<div class="summary-value">' + escapeHtml(summary.education.school) + '</div>' +
      '<div class="summary-sub">' + escapeHtml(summary.education.degree) + '</div>' +
      '<div class="summary-status">' + escapeHtml(summary.education.status) + '</div>' +
    '</div>' +
    '<div class="summary-item">' +
      '<div class="summary-label">경력</div>' +
      '<div class="summary-value">' + escapeHtml(summary.career.company) + '</div>' +
      '<div class="summary-sub">' + escapeHtml(summary.career.status) + '</div>' +
      '<div class="summary-status">' + escapeHtml(summary.career.totalExperience) + '</div>' +
    '</div>' +
    '<div class="summary-item">' +
      '<div class="summary-label">인턴·대외활동 / 해외경험</div>' +
      '<div class="summary-value">' + escapeHtml(summary.internship) + '</div>' +
    '</div>' +
    '<div class="summary-item">' +
      '<div class="summary-label">자격증 / 어학</div>' +
      '<div class="summary-value">' + escapeHtml(summary.certification) + '</div>' +
    '</div>';
}

function renderSkills(skills) {
  var el = document.getElementById('skills-section');
  var html = '<div class="skill-tags">';
  skills.forEach(function (skill) {
    html += '<span class="skill-tag">' + escapeHtml(skill) + '</span>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderProjects(projects) {
  if (!projects || !projects.items || projects.items.length === 0) return;

  var titleEl = document.getElementById('projects-title');
  titleEl.textContent = projects.title;

  var el = document.getElementById('projects-content');
  var html = '';

  if (projects.subtitle) {
    html += '<div class="projects-subtitle">' + escapeHtml(projects.subtitle) + '</div>';
  }

  projects.items.forEach(function (p) {
    html += '<div class="project-item">' +
      '<div class="project-item-header">' +
        '<span class="project-name">' + escapeHtml(p.name) + '</span>' +
        (p.role ? '<span class="project-role">' + escapeHtml(p.role) + '</span>' : '') +
        (p.period ? '<span class="project-period">' + escapeHtml(p.period) + '</span>' : '') +
      '</div>' +
      '<div class="project-link"><a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener">' + escapeHtml(p.url) + '</a></div>';

    if (p.summary) {
      html += '<div class="project-summary">' + escapeHtml(p.summary) + '</div>';
    }

    if (p.description && p.description.length > 0) {
      html += '<ul class="project-bullets">';
      p.description.forEach(function (d) {
        html += '<li>' + escapeHtml(d) + '</li>';
      });
      html += '</ul>';
    }

    if (p.techStack && p.techStack.length > 0) {
      html += '<div class="project-tech">' + p.techStack.map(escapeHtml).join(', ') + '</div>';
    }

    html += '</div>';
  });

  el.innerHTML = html;
}

function renderEducation(education) {
  var el = document.getElementById('education-content');
  var html = '';
  education.forEach(function (item) {
    html += '<div class="education-item">' +
      '<div class="education-period">' +
        escapeHtml(item.period) +
        '<span class="status">' + escapeHtml(item.status) + '</span>' +
      '</div>' +
      '<div class="education-detail">' +
        '<span class="school">' + escapeHtml(item.school) + '</span>' +
        (item.major ? ' <span class="major">' + escapeHtml(item.major) + '</span>' : '') +
      '</div>' +
    '</div>';
  });
  el.innerHTML = html;
}

function renderCareer(career) {
  var titleEl = document.getElementById('career-title');
  titleEl.innerHTML = '경력 <span class="total-experience">총 18년 1개월</span>';

  var el = document.getElementById('career-content');
  var html = '';
  career.forEach(function (item) {
    html += '<div class="career-item">' +
      '<div class="career-period">' +
        escapeHtml(item.period) +
        '<span class="duration">' + escapeHtml(item.duration) + '</span>' +
      '</div>' +
      '<div class="career-detail">' +
        '<div class="career-company">' +
          escapeHtml(item.company) +
          ' <span class="department">' + escapeHtml(item.department) + '</span>' +
        '</div>' +
        '<div class="career-projects">';

    item.projects.forEach(function (project) {
      var cls = 'career-project' + (project.highlight ? ' is-highlight' : '');
      html += '<div class="' + cls + '">' +
        '<div class="project-title">- ' + escapeHtml(project.title) + '</div>';

      if (project.url) {
        html += '<div class="project-url"><a href="' + escapeHtml(project.url) + '" target="_blank" rel="noopener">' + escapeHtml(project.url) + '</a></div>';
      }

      if (project.description && project.description.length > 0) {
        project.description.forEach(function (desc) {
          html += '<div class="project-description">' + escapeHtml(desc) + '</div>';
        });
      }

      if (project.techStack && project.techStack.length > 0) {
        html += '<div class="project-tech">' + project.techStack.map(escapeHtml).join(', ') + '</div>';
      }

      html += '</div>';
    });

    html += '</div>' +
        '<div class="career-meta">' +
          '<div><dt>주요직무</dt><dd>' + escapeHtml(item.role) + '</dd></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  });
  el.innerHTML = html;
}

function renderAbout(about) {
  var el = document.getElementById('about-content');
  var html = '<div class="about-box">';
  about.sections.forEach(function (section) {
    html += '<div class="about-heading">' + escapeHtml(section.heading) + '</div>' +
      '<div class="about-content">' + escapeHtml(section.content) + '</div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMilitary(military) {
  var el = document.getElementById('military-content');
  var m = military.military;
  el.innerHTML =
    '<table class="info-table">' +
      '<tr>' +
        '<th>보훈대상 여부</th><td>' + escapeHtml(military.veteranStatus) + '</td>' +
        '<th>취업보호대상 여부</th><td>' + escapeHtml(military.employmentProtection) + '</td>' +
        '<th>고용지원금대상 여부</th><td>' + escapeHtml(military.employmentSubsidy) + '</td>' +
      '</tr>' +
      '<tr>' +
        '<th>병역사항</th>' +
        '<td colspan="3">[' + escapeHtml(m.status) + '] ' + escapeHtml(m.period) + ' ' + escapeHtml(m.type) + ' ' + escapeHtml(m.rank) + ' ' + escapeHtml(m.discharge) + '</td>' +
        '<th>장애여부</th><td>' + escapeHtml(military.disability) + '</td>' +
      '</tr>' +
    '</table>';
}

function renderFooter() {
  var el = document.getElementById('resume-footer');
  el.innerHTML =
    '<div class="footer-confirm">위의 모든 기재사항은 사실과 다름없음을 확인합니다.</div>' +
    '<div class="footer-author">작성자 : 이동완</div>' +
    '<div class="footer-info">' +
      '이 이력서는 2026년 04월 17일에 갱신된 이력서 입니다.' +
    '</div>';
}

function escapeHtml(text) {
  if (text == null) return '';
  var str = String(text);
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}