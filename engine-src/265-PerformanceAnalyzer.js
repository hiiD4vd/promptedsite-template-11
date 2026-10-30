Class(function PerformanceAnalyzer() {
  Inherit(this, Component);
  const _this = this;
  var _lowFrame = 0;
  function startRender() {
    _this.startRender(loop);
  }
  function loop() {
    let targetDelta = 1e3 / Render.REFRESH_RATE,
      realDelta = Render.DELTA;
    Math.abs(targetDelta - realDelta) > 2 &&
      ++_lowFrame > 2 * Render.REFRESH_RATE &&
      (_this.stopRender(loop),
      (function reportLowFPS() {
        "undefined" != typeof RemoteLogger
          ? RemoteLogger.send("PerformanceAnalyzer low FPS")
          : console.warn("PerformanceAnalyzer: Unable to meet target framerate");
      })());
  }
  Hydra.LOCAL &&
    (function init() {
      _this.delayedCall(startRender, 1e4);
    })();
}, "static");
