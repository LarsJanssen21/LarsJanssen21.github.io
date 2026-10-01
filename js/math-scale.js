// Scales down MathJax display equations that are wider than their
// container, instead of letting them overflow or just scroll.
// Equations that already fit are left completely untouched.

(function () {
  function wrapEquations() {
    document.querySelectorAll('mjx-container[display="true"]').forEach(function (mjx) {
      if (!mjx.parentElement.classList.contains('mjx-scale-wrapper')) {
        var wrapper = document.createElement('div');
        wrapper.className = 'mjx-scale-wrapper';
        mjx.parentNode.insertBefore(wrapper, mjx);
        wrapper.appendChild(mjx);
      }
    });
  }

  function fitEquations() {
    document.querySelectorAll('.mjx-scale-wrapper').forEach(function (wrapper) {
      var mjx = wrapper.querySelector('mjx-container');
      if (!mjx) return;

      // Reset before measuring, so we're never scaling an already-scaled value
      mjx.style.transform = '';
      wrapper.style.height = '';

      var naturalWidth = mjx.scrollWidth;
      var availableWidth = wrapper.clientWidth;

      if (naturalWidth > availableWidth && naturalWidth > 0) {
        var scale = availableWidth / naturalWidth;
        mjx.style.transformOrigin = 'center top';
        mjx.style.transform = 'scale(' + scale + ')';
        // The transform doesn't shrink the box's own layout height,
        // so set it explicitly to avoid leftover blank space below.
        wrapper.style.height = (mjx.offsetHeight * scale) + 'px';
      }
    });
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function init() {
    wrapEquations();
    fitEquations();
  }

  if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
    MathJax.startup.promise.then(init);
  } else {
    window.addEventListener('load', init);
  }

  window.addEventListener('resize', debounce(fitEquations, 200));
})();