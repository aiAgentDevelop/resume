/* ================================================================
   CRT/VHS Glitch Transition
   - index.html 진입 3초 후 자동으로 portfolio.html로 글리치 전환
   - 포트폴리오 링크 클릭 시 즉시 트리거 (카운트다운 취소)
   - 인쇄 / prefers-reduced-motion / 같은 세션 재방문 시 자동 전환 비활성
================================================================ */
(function () {
  'use strict';

  var TRANSITION_TARGET = 'portfolio.html?skip=1';
  var AUTO_DELAY_MS     = 3000;  // 자동 전환까지 대기
  var GLITCH_DURATION   = 900;   // 본 글리치 지속 시간 (ms)
  var FLASH_FADE_IN     = 90;    // 흰 플래시 fade-in
  var FLASH_HOLD        = 140;   // 플래시 유지 후 페이지 이동

  var autoTimer      = null;
  var countdownTimer = null;
  var transitionStarted = false;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // portfolio.html에서 "정식 이력서"로 돌아왔을 때는 ?stay=1로 진입 → 자동 전환 비활성
  function hasStayParam() {
    try {
      return new URL(window.location.href).searchParams.get('stay') === '1';
    } catch (e) { return false; }
  }

  function shouldAutoTransition() {
    if (prefersReducedMotion()) return false;
    if (hasStayParam()) return false;
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // Noise
  // ─────────────────────────────────────────────────────────────
  var noiseRaf = null;

  function startNoise(canvas) {
    var ctx = canvas.getContext('2d');
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      var w = canvas.width;
      var h = canvas.height;
      var image = ctx.createImageData(w, h);
      var buf = image.data;
      for (var i = 0; i < buf.length; i += 4) {
        var v = (Math.random() * 255) | 0;
        buf[i] = v;
        buf[i + 1] = v;
        buf[i + 2] = v;
        buf[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
      noiseRaf = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopNoise() {
    if (noiseRaf) cancelAnimationFrame(noiseRaf);
    noiseRaf = null;
  }

  // ─────────────────────────────────────────────────────────────
  // Transition
  // ─────────────────────────────────────────────────────────────
  function runTransition() {
    if (transitionStarted) return;
    transitionStarted = true;
    cancelAutoTransition();

    var noise     = document.getElementById('vhs-noise');
    var scanlines = document.getElementById('scanlines');
    var flash     = document.getElementById('glitch-flash');

    if (!noise || !scanlines || !flash) {
      window.location.href = TRANSITION_TARGET;
      return;
    }

    document.body.classList.add('glitching');
    noise.style.opacity     = '0.55';
    scanlines.style.opacity = '0.9';
    startNoise(noise);

    setTimeout(function () {
      noise.style.opacity = '0.85';
    }, GLITCH_DURATION * 0.5);

    setTimeout(function () {
      flash.style.transition = 'opacity ' + FLASH_FADE_IN + 'ms ease-in';
      flash.style.opacity = '1';
    }, GLITCH_DURATION);

    setTimeout(function () {
      stopNoise();
      window.location.href = TRANSITION_TARGET;
    }, GLITCH_DURATION + FLASH_FADE_IN + FLASH_HOLD);
  }

  // ─────────────────────────────────────────────────────────────
  // Auto countdown
  // ─────────────────────────────────────────────────────────────
  function scheduleAutoTransition() {
    var hint = document.getElementById('portfolio-auto-hint');
    var remaining = Math.ceil(AUTO_DELAY_MS / 1000);

    function render() {
      if (!hint) return;
      hint.textContent = remaining > 0
        ? remaining + '초 후 포트폴리오로 자동 전환'
        : '전환 중…';
    }
    render();

    countdownTimer = setInterval(function () {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      render();
    }, 1000);

    autoTimer = setTimeout(runTransition, AUTO_DELAY_MS);
  }

  function cancelAutoTransition() {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    var hint = document.getElementById('portfolio-auto-hint');
    if (hint) hint.textContent = '';
  }

  // ─────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────
  function init() {
    var link = document.querySelector('.portfolio-link');
    if (link) {
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        if (prefersReducedMotion()) return;
        e.preventDefault();
        runTransition();
      });
    }

    if (shouldAutoTransition()) {
      scheduleAutoTransition();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
