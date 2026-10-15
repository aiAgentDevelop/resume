(function () {
  'use strict';
  window.ResumeView = {
    position: function (item) {
      return [item.department, item.grade].filter(Boolean).join(' ') +
        (item.position ? ' / ' + item.position : '');
    },
    experience: function () { return window.ResumeAPI.summary.career.totalExperience; }
  };
})();
