Class(function GPU() {
  Inherit(this, Component);
  var _this = this,
    _split = {};
  (Hydra.ready(async () => {
    if (
      ((_this.detect = function (match) {
        if (Device.graphics.gpu) return Device.graphics.gpu.detect(match);
      }),
      (_this.detectAll = function () {
        if (Device.graphics.gpu) {
          for (var match = !0, i = 0; i < arguments.length; i++)
            Device.graphics.gpu.detect(arguments[i]) || (match = !1);
          return match;
        }
      }),
      (_this.matchGPU = function (str, min, max = 99999) {
        let num = (function splitGPU(string) {
          if (_split[string]) return _split[string];
          if (!_this.detect(string)) return -1;
          try {
            var num = Number(
              _this.gpu
                .split(string)[1]
                .split(" ")[0]
                .replace(/[^a-zA-Z0-9]/g, "")
                .trim(),
            );
            return ((_split[string] = num), num);
          } catch (e) {
            return -1;
          }
        })(str);
        return num >= min && num < max;
      }),
      (_this.gpu = Device.graphics.gpu ? Device.graphics.gpu.identifier : ""),
      "apple gpu" == _this.gpu)
    )
      if (Device.mobile) {
        let { getRenderer: getRenderer, fallbackTest: fallbackTest } = require("iOSGPUTest"),
          gpu = await getRenderer();
        if (gpu) Device.graphics.webgl.gpu = gpu.toLowerCase();
        else {
          let gpu = fallbackTest();
          gpu && (Device.graphics.webgl.gpu = gpu);
        }
      } else require("MacOSPerformanceTest")();
    for (var key in ("firefox" === Device.system.browser && require("FirefoxGPUFixer")(),
    (_this.BLOCKLIST = require("GPUBlocklist").match()),
    (_this.T0 = !(
      Device.mobile ||
      (!_this.BLOCKLIST &&
        !_this.detect("radeon(tm) r5") &&
        !_this.detect("radeon r9 200") &&
        !_this.detect("hd graphics family") &&
        !_this.detect("intel(r) uhd graphics direct") &&
        !_this.matchGPU("hd graphics ", 1e3, 5001) &&
        !(_this.matchGPU("hd graphics ", 0, 618) && Device.pixelRatio > 1) &&
        !(_this.detect(["hd graphics", "iris"]) && Math.max(Stage.width, Stage.height) > 1800) &&
        !_this.detect(["intel iris opengl engine"]) &&
        !_this.matchGPU("iris(tm) graphics ", 1e3))
    )),
    (_this.T1 = !(
      _this.BLOCKLIST ||
      Device.mobile ||
      _this.T0 ||
      (!_this.matchGPU("iris(tm) graphics ", 540, 1e3) &&
        !_this.matchGPU("hd graphics ", 514, 1e3) &&
        !_this.matchGPU("intel(r) uhd graphics ", 600, 1e3) &&
        _this.detect(["nvidia", "amd", "radeon", "geforce"]) &&
        !_this.detect(["vega 8"]))
    )),
    (_this.T2 =
      !_this.BLOCKLIST &&
      !Device.mobile &&
      !(!_this.detect(["nvidia", "amd", "radeon", "geforce"]) || _this.T1 || _this.T0)),
    (_this.T3 = !(
      _this.BLOCKLIST ||
      Device.mobile ||
      (!_this.detect(["titan", "amd radeon pro", "quadro"]) &&
        !_this.matchGPU("gtx ", 940) &&
        !_this.matchGPU("radeon (tm) rx ", 400) &&
        !_this.detect("amd radeon(tm) graphics direct3d11 vs_5_0") &&
        !_this.matchGPU("radeon rx ", 400) &&
        !_this.matchGPU("radeon pro ", 420))
    )),
    (_this.T4 = !(
      _this.BLOCKLIST ||
      Device.mobile ||
      (!_this.detect(["titan", "quadro", "radeon vii", "apple m"]) &&
        !_this.matchGPU("gtx ", 1060) &&
        !_this.matchGPU("rtx") &&
        !_this.matchGPU("radeon rx ", 500) &&
        !_this.matchGPU("vega ", 50) &&
        !_this.detect([
          "radeon pro 5300m",
          "radeon pro 5500m",
          "radeon pro 5600m",
          "amd radeon unknown prototype",
        ]))
    )),
    (_this.T5 = !(
      _this.BLOCKLIST ||
      Device.mobile ||
      (!_this.detect(["titan", "radeon vii"]) &&
        !_this.matchGPU("gtx ", 1080) &&
        !_this.matchGPU("rtx ", 2060) &&
        !_this.matchGPU("radeon rx ", 5500) &&
        (!_this.detect("apple m") || !_this.detect("max")))
    )),
    (_this.MT0 =
      !!Device.mobile &&
      (!!_this.BLOCKLIST ||
        !("ios" != Device.system.os || !_this.detect("a7")) ||
        !("android" != Device.system.os || !_this.detect("sgx")) ||
        (_this.detect("adreno")
          ? _this.matchGPU("adreno (tm) ", 0, 415)
          : _this.detect("mali")
            ? _this.matchGPU("mali-t", 0, 628)
            : !("ios" != Device.system.os || !_this.detect(["a8", "a9"])) ||
              !!_this.detect("mali-g") ||
              !!_this.matchGPU("adreno (tm) ", 420)))),
    (_this.MT1 = (function () {
      if (!Device.mobile) return !1;
      if (_this.BLOCKLIST) return !1;
      if ("ios" == Device.system.os && _this.detect("a10")) return !0;
      if ("android" == Device.system.os && !_this.MT0) return !0;
      if (_this.detect("nvidia tegra") && Device.detect("pixel c")) return !0;
      if (_this.detect("mali-g")) return _this.matchGPU("mali-g", 73);
      if (_this.detect("adreno")) {
        if (_this.matchGPU("adreno (tm) ", 600, 616)) return !0;
        if (_this.matchGPU("adreno (tm) ", 530, 600)) return !0;
      }
      return !1;
    })()),
    (_this.MT2 =
      !!Device.mobile &&
      !_this.BLOCKLIST &&
      (!("ios" != Device.system.os || !_this.detect(["a11", "a12"])) ||
        (_this.detect("adreno")
          ? _this.matchGPU("adreno (tm) ", 630)
          : _this.detect("mali-g")
            ? _this.matchGPU("mali-g", 74)
            : !(
                !navigator.platform.toLowerCase().includes(["mac", "windows"]) ||
                "chrome" != Device.system.browser
              )))),
    (_this.MT3 =
      !!Device.mobile &&
      !_this.BLOCKLIST &&
      (!("ios" != Device.system.os || !_this.detect(["a13", "a14"])) ||
        (_this.detect("adreno")
          ? _this.matchGPU("adreno (tm) ", 640)
          : _this.detect("mali-g")
            ? _this.matchGPU("mali-g", 76)
            : !(
                !navigator.platform.toLowerCase().includes(["mac", "windows"]) ||
                "chrome" != Device.system.browser
              )))),
    (_this.MT4 =
      !!Device.mobile &&
      !_this.BLOCKLIST &&
      (!("ios" != Device.system.os || !_this.detect(["a15", "a16"])) ||
        (_this.detect("adreno")
          ? _this.matchGPU("adreno (tm) ", 650)
          : _this.detect("mali-g")
            ? _this.detect("mali-g710") || _this.matchGPU("mali-g", 78)
            : !(
                !navigator.platform.toLowerCase().includes(["mac", "windows"]) ||
                "chrome" != Device.system.browser
              )))),
    (_this.MT5 =
      !!Device.mobile &&
      !_this.BLOCKLIST &&
      (!(
        "ios" != Device.system.os ||
        !_this.detect(["a17", "a18", "a19", "a20", "a21", "a22", "a23", "a24", "a25", "apple m"])
      ) ||
        (_this.detect("adreno")
          ? _this.matchGPU("adreno (tm) ", 740)
          : !(
              !navigator.platform.toLowerCase().includes(["mac", "windows"]) ||
              "chrome" != Device.system.browser
            )))),
    (_this.lt = function (num) {
      return _this.TIER > -1 && _this.TIER <= num;
    }),
    (_this.gt = function (num) {
      return _this.TIER > -1 && _this.TIER >= num;
    }),
    (_this.eq = function (num) {
      return _this.TIER > -1 && _this.TIER == num;
    }),
    (_this.mobileEq = function (num) {
      return _this.M_TIER > -1 && _this.M_TIER == num;
    }),
    (_this.mobileLT = function (num) {
      return _this.M_TIER > -1 && _this.M_TIER <= num;
    }),
    (_this.mobileGT = function (num) {
      return _this.M_TIER > -1 && _this.M_TIER >= num;
    }),
    _this))
      ("T" == key.charAt(0) && !0 === _this[key] && (_this.TIER = Number(key.charAt(1))),
        "MT" == key.slice(0, 2) && !0 === _this[key] && (_this.M_TIER = Number(key.charAt(2))));
    (!1 !== Utils.query("gpu") &&
      (Device.mobile || Utils.query("gpu").toString().includes("m")
        ? ((_this.TIER = -1), (_this.M_TIER = Number(Utils.query("gpu").slice(1))))
        : (_this.TIER = Number(Utils.query("gpu")))),
      "ios" == Device.system.os && Render.REFRESH_RATE < 40 && (_this.M_TIER -= 1),
      (_this.OVERSIZED =
        (!Device.mobile &&
          _this.TIER <= 0 &&
          Math.max(window.innerWidth, window.innerHeight) > 1400) ||
        (!Device.mobile &&
          _this.TIER <= 1 &&
          Device.pixelRatio < 2 &&
          Math.max(window.innerWidth, window.innerHeight) > 1600)),
      "ie" == Device.system.browser && (_this.OVERSIZED = !0),
      (_this.initialized = !0));
  }),
    (this.ready = function () {
      return this.wait("initialized");
    }));
}, "static");
