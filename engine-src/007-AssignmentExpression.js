window.clearTimeout = (function () {
  const _clearTimeout = window.clearTimeout;
  return function (ref) {
    return (window.Timer && Timer.__clearTimeout(ref)) || _clearTimeout(ref);
  };
})();
