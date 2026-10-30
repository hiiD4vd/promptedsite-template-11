window.requestIdleCallback = (function () {
  const _requestIdleCallback = window.requestIdleCallback;
  return function (callback, max) {
    return _requestIdleCallback
      ? _requestIdleCallback(callback, max ? { timeout: max } : null)
      : defer(() => {
          callback({ didTimeout: !1 });
        }, 0);
  };
})();
