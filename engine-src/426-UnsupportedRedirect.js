Class(function UnsupportedRedirect() {
  Inherit(this, Component);
  var _this = this,
    _tests = [];
  ((this.BOTS = [
    "google",
    "apis-google",
    "mediapartners-google",
    "adsbot-google",
    "googlebot",
    "feedfetcher-google",
    "google-read-aloud",
    "storebot-google",
    "bingbot",
    "facebot",
    "facebookexternalhit",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "sogou",
    "exabot",
  ]),
    (this.chrome = 55),
    (this.firefox = 51),
    (this.safari = 8),
    (this.ie = 13),
    (this.requiresWebGL = !0),
    (this.url = "./fallback"),
    (this.test = function () {
      _this.unsupported() &&
        (function redirect() {
          window.location = _this.url;
        })();
    }),
    (this.unsupported = function () {
      if (_this.BOTS.find((bot) => Device.detect(bot))) return !1;
      if (_tests.find((test) => test())) return !0;
      if (_this.requiresWebGL && (!Device.graphics.webgl || GPU.BLOCKLIST)) return !0;
      if (Device?.system?.browserVersion >= 0) {
        if ("chrome" === Device.system.browser && Device.system.browserVersion < _this.chrome)
          return !0;
        if ("firefox" === Device.system.browser && Device.system.browserVersion < _this.firefox)
          return !0;
        if ("safari" === Device.system.browser && Device.system.browserVersion < _this.safari)
          return !0;
        if ("ie" === Device.system.browser && Device.system.browserVersion < _this.ie) return !0;
      }
      return !!Utils.query("unsupported");
    }),
    (this.custom = function (...tests) {
      _tests.push(...tests);
    }));
}, "static");
