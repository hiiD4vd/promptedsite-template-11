Module(function MacOSPerformanceTest() {
  const { hash: hash, primeTest: primeTest } = require("GPUCalculations");
  this.exports = function () {
    let hashValue = hash().toString();
    switch (((Global.MACOSHASHVALUE = hashValue), hashValue)) {
      case "154539004":
      case "2370358002":
        return (Device.graphics.webgl.gpu = "intel iris opengl engine");
      case "174373703":
        return (Device.graphics.webgl.gpu = "apple m1");
      case "245727699":
        return (Device.graphics.webgl.gpu = "apple m1 pro");
      case "2650655516":
        return (Device.graphics.webgl.gpu = "apple m1 max");
      case "1031999577":
      case "604831120":
      case "1085686600":
      case "1589747348":
        return (Device.graphics.webgl.gpu = "amd radeon pro 5500m");
      case "2267488256":
        return (Device.graphics.webgl.gpu = "apple m2");
      case "640654249":
        return (Device.graphics.webgl.gpu = "apple m4 max");
    }
    let result = primeTest();
    if (result < 100) return (Device.graphics.webgl.gpu = "apple m1 max");
    screen.width <= 1440 && screen.height <= 900
      ? (Device.graphics.webgl.gpu = result > 540 ? "intel iris opengl engine" : "safari tier 1")
      : (Device.graphics.webgl.gpu =
          result > 475
            ? result > 540
              ? "intel iris opengl engine"
              : "safari tier 1"
            : result < 375
              ? "amd radeon pro 455 opengl engine"
              : "nvidia geforce 750m opengl engine");
  };
});
