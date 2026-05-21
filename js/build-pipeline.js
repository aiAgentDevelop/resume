/* ================================================================
   Build Pipeline 미니게임 엔진
   - 6단계 CI/CD stage를 자동 진행
   - 터미널 typing animation + pipeline progress bar
   - ESC / Skip 버튼 / localStorage 자동 스킵 지원
================================================================ */
(function () {
  'use strict';

  var STAGES = [
    {
      id: 'setup',
      cmd: 'npm install',
      duration: 600,
      lines: [
        { type: 'cmd',     text: '$ npm install' },
        { type: 'out',     text: '  resolving dependencies ...' },
        { type: 'ok',      text: '  ✓ 1,247 packages installed in 0.6s' }
      ]
    },
    {
      id: 'lint',
      cmd: 'eslint .',
      duration: 350,
      lines: [
        { type: 'cmd',     text: '$ eslint .' },
        { type: 'ok',      text: '  ✓ 0 errors, 0 warnings' }
      ]
    },
    {
      id: 'test',
      cmd: 'jest run',
      duration: 1000,
      lines: [
        { type: 'cmd',     text: '$ jest run --coverage' },
        { type: 'out',     text: '  PASS  test/auth.spec.ts' },
        { type: 'out',     text: '  PASS  test/socket.spec.ts' },
        { type: 'ok',      text: '  ✓ 259 tests passed (nestjs-vibe-engine)' }
      ]
    },
    {
      id: 'build',
      cmd: 'tsc + bundle',
      duration: 700,
      lines: [
        { type: 'cmd',     text: '$ tsc && bundle' },
        { type: 'ok',      text: '  ✓ build/portfolio.bundle.js (124 KB)' }
      ]
    },
    {
      id: 'container',
      cmd: 'docker build',
      duration: 1100,
      lines: [
        { type: 'cmd',     text: '$ docker build -t portfolio:latest .' },
        { type: 'out',     text: '  [5/5] FROM node:20-alpine ...' },
        { type: 'ok',      text: '  ✓ Successfully tagged portfolio:latest' }
      ]
    },
    {
      id: 'deploy',
      cmd: 'kubectl apply',
      duration: 800,
      lines: [
        { type: 'cmd',     text: '$ kubectl apply -f deploy.yaml' },
        { type: 'out',     text: '  deployment.apps/portfolio created' },
        { type: 'ok',      text: '  ✓ Rollout complete — 3/3 pods ready' },
        { type: 'emph',    text: '  🚀 Portfolio ready' }
      ]
    }
  ];

  // ─────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────
  var skipped = false;
  var TYPE_SPEED = 7;    // ms per char
  var stageEl = null;
  var terminalBody = null;
  var progressLabel = null;
  var skipBtn = null;
  var portfolioApp = null;

  function el(id) { return document.getElementById(id); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function queryParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name);
    } catch (e) { return null; }
  }

  // ─────────────────────────────────────────────────────────────
  // Terminal printing
  // ─────────────────────────────────────────────────────────────
  function appendLine(line, instant) {
    return new Promise(function (resolve) {
      if (!terminalBody || skipped) { resolve(); return; }

      var span = document.createElement('span');
      span.className = 't-' + (line.type || 'out');
      terminalBody.appendChild(span);

      var trailing = document.createElement('br');

      var text = line.text || '';
      if (instant || prefersReducedMotion()) {
        span.textContent = text;
        terminalBody.appendChild(trailing);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        resolve();
        return;
      }

      var i = 0;
      function step() {
        if (skipped) {
          span.textContent = text;
          terminalBody.appendChild(trailing);
          terminalBody.scrollTop = terminalBody.scrollHeight;
          resolve();
          return;
        }
        if (i >= text.length) {
          terminalBody.appendChild(trailing);
          terminalBody.scrollTop = terminalBody.scrollHeight;
          resolve();
          return;
        }
        span.textContent += text.charAt(i);
        i += 1;
        terminalBody.scrollTop = terminalBody.scrollHeight;
        setTimeout(step, TYPE_SPEED);
      }
      step();
    });
  }

  function printComment(text) {
    return appendLine({ type: 'comment', text: text }, true);
  }

  // ─────────────────────────────────────────────────────────────
  // Pipeline cards
  // ─────────────────────────────────────────────────────────────
  function setStageActive(stageId, duration) {
    var card = stageEl.querySelector('.pipeline-card[data-stage="' + stageId + '"]');
    if (!card) return;
    card.classList.add('is-active');
    var status = card.querySelector('.card-status');
    if (status) status.textContent = 'running…';
    var fill = card.querySelector('.progress-fill');
    if (fill) {
      fill.style.transitionDuration = duration + 'ms';
      // force reflow so transition picks up
      void fill.offsetWidth;
      fill.style.width = '100%';
    }
  }

  function setStageDone(stageId, durationSec) {
    var card = stageEl.querySelector('.pipeline-card[data-stage="' + stageId + '"]');
    if (!card) return;
    card.classList.remove('is-active');
    card.classList.add('is-done');
    var status = card.querySelector('.card-status');
    if (status) status.textContent = '✓ ' + durationSec + 's';

    // ✓ burst
    var burst = document.createElement('span');
    burst.className = 'card-check';
    burst.textContent = '✓';
    var head = card.querySelector('.card-head');
    if (head && !head.querySelector('.card-check')) head.appendChild(burst);
  }

  function updateProgress(idx) {
    if (progressLabel) progressLabel.textContent = idx + '/' + STAGES.length;
  }

  // ─────────────────────────────────────────────────────────────
  // Pipeline runner
  // ─────────────────────────────────────────────────────────────
  async function runStage(stage) {
    if (skipped) return;
    setStageActive(stage.id, stage.duration);

    // 첫 줄 typing
    var lines = stage.lines || [];
    for (var i = 0; i < lines.length; i++) {
      if (skipped) break;
      await appendLine(lines[i]);
    }

    // progress 끝까지 대기 (남은 시간만큼)
    if (!skipped) await wait(Math.max(0, stage.duration - lines.length * 120));

    var durationSec = (stage.duration / 1000).toFixed(1);
    setStageDone(stage.id, durationSec);
  }

  async function runPipeline() {
    await printComment('// initializing portfolio pipeline ...');
    await wait(200);

    for (var i = 0; i < STAGES.length; i++) {
      if (skipped) break;
      await runStage(STAGES[i]);
      updateProgress(i + 1);
    }

    if (!skipped) {
      try { localStorage.setItem('pipeline.seen', 'true'); } catch (e) {}
      await wait(350);
    }
    fadeToPortfolio();
  }

  // ─────────────────────────────────────────────────────────────
  // Skip
  // ─────────────────────────────────────────────────────────────
  function skipInstant() {
    skipped = true;
    // 모든 stage를 즉시 done 상태로
    for (var i = 0; i < STAGES.length; i++) {
      setStageDone(STAGES[i].id, (STAGES[i].duration / 1000).toFixed(1));
    }
    updateProgress(STAGES.length);
    try { localStorage.setItem('pipeline.seen', 'true'); } catch (e) {}
    fadeToPortfolio(true);
  }

  function fadeToPortfolio(instant) {
    if (!portfolioApp) return;
    portfolioApp.hidden = false;
    // force reflow then mark visible
    void portfolioApp.offsetWidth;
    portfolioApp.classList.add('is-visible');

    if (instant || prefersReducedMotion()) {
      stageEl.classList.add('is-hidden');
      document.body.style.overflow = '';
      return;
    }

    stageEl.classList.add('is-fading');
    setTimeout(function () {
      stageEl.classList.add('is-hidden');
      document.body.style.overflow = '';
    }, 450);
  }

  // ─────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────
  function shouldSkipGame() {
    if (queryParam('game') === '1') return false; // force play
    if (queryParam('skip') === '1') return true;
    if (prefersReducedMotion()) return true;
    try {
      if (localStorage.getItem('pipeline.seen') === 'true') return true;
    } catch (e) {}
    return false;
  }

  function init() {
    stageEl       = el('pipeline-stage');
    terminalBody  = el('terminal-body');
    progressLabel = el('pipeline-progress');
    skipBtn       = el('skip-btn');
    portfolioApp  = el('portfolio-app');

    if (!stageEl || !portfolioApp) return;

    if (shouldSkipGame()) {
      stageEl.classList.add('is-hidden');
      portfolioApp.hidden = false;
      portfolioApp.classList.add('is-visible');
      return;
    }

    // 게임 모드: 본문 스크롤 잠금
    document.body.style.overflow = 'hidden';

    // 이벤트
    if (skipBtn) skipBtn.addEventListener('click', skipInstant);
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && !stageEl.classList.contains('is-hidden')) {
        e.preventDefault();
        skipInstant();
      }
    });

    // 시작
    runPipeline();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
