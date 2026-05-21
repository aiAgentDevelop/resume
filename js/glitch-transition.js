/* ================================================================
   CRT/VHS Glitch Transition
   - 포트폴리오 링크 클릭 시 치지직 효과 후 portfolio.html로 이동
   - prefers-reduced-motion 환경에서는 효과 없이 즉시 이동
================================================================ */
(function () {
  'use strict';

  var TRANSITION_TARGET = 'portfolio.html?skip=1';
  var GLITCH_DURATION   = 900;   // 본 글리치 지속 시간 (ms)
  var FLASH_FADE_IN     = 90;    // 흰 플래시 fade-in
  var FLASH_HOLD        = 140;   // 플래시 유지 후 페이지 이동

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

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

  function runTransition() {
    var noise     = document.getElementById('vhs-noise');
    var scanlines = document.getElementById('scanlines');
    var flash     = document.getElementById('glitch-flash');

    if (!noise || !scanlines || !flash) {
      window.location.href = TRANSITION_TARGET;
      return;
    }

    // 1) 글리치 시작: shake + slice + noise + scanlines
    document.body.classList.add('glitching');
    noise.style.opacity     = '0.55';
    scanlines.style.opacity = '0.9';
    startNoise(noise);

    // 2) 중반에 노이즈 더 강하게
    setTimeout(function () {
      noise.style.opacity = '0.85';
    }, GLITCH_DURATION * 0.5);

    // 3) 글리치 종료 직후 흰 플래시
    setTimeout(function () {
      flash.style.transition = 'opacity ' + FLASH_FADE_IN + 'ms ease-in';
      flash.style.opacity = '1';
    }, GLITCH_DURATION);

    // 4) 플래시 정점에서 페이지 이동
    setTimeout(function () {
      stopNoise();
      window.location.href = TRANSITION_TARGET;
    }, GLITCH_DURATION + FLASH_FADE_IN + FLASH_HOLD);
  }

  function init() {
    var link = document.querySelector('.portfolio-link');
    if (!link) return;

    link.addEventListener('click', function (e) {
      // 새 탭/창 열기 modifier는 그대로 통과
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      if (prefersReducedMotion()) return;

      e.preventDefault();
      runTransition();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
