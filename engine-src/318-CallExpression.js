Module(function FirefoxGPUFixer() {
  this.exports = function () {
    GPU.detect("radeon r9 200") &&
      ("mac" == Device.system.os || Device.pixelRatio > 1) &&
      (Device.graphics.webgl.gpu = "radeon pro 455");
  };
});
