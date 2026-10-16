(function () {
  'use strict';
  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }
  window.ResumeView = {
    highlightRequirements: function (item) {
      return '<p class="highlight-requirements">관련 역량 · ' + item.requirements.map(escapeHtml).join(' / ') + '</p>';
    },
    highlightBody: function (item) {
      return '<ul class="highlight-items">' + item.items.map(function (bullet) {
        return '<li><strong>' + escapeHtml(bullet.lead) + '</strong> ' + escapeHtml(bullet.text) +
          '<div class="highlight-references">' + bullet.references.map(function (reference) {
            return '<a class="evidence-link" data-career-id="' + escapeHtml(reference.careerId) + '" href="#' + escapeHtml(reference.projectId) + '">' + escapeHtml(reference.label) + ' ↗</a>';
          }).join('') + '</div></li>';
      }).join('') + '</ul>';
    },
    position: function (item) {
      return [item.department, item.grade].filter(Boolean).join(' ') +
        (item.position ? ' / ' + item.position : '');
    },
    experience: function () { return window.ResumeAPI.summary.career.totalExperience; }
  };
})();
