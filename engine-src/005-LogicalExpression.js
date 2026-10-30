window.requestAnimationFrame ||
  (window.requestAnimationFrame =
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function () {
      const start = Date.now();
      return function (callback) {
        window.setTimeout(() => callback(Date.now() - start), 1e3 / 60);
      };
    })());
