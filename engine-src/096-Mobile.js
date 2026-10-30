Class(function Mobile() {
  (Inherit(this, Component), Namespace(this));
  const _this = this;
  var $html,
    $featureDetects,
    _is100vh = !1;
  function preventNativeScroll(e) {
    if (_this.isAllowNativeScroll) return;
    let target = e.target;
    if (target.closest("label, input, textarea, select, a, button, [contenteditable]")) return;
    let prevent = target.hydraObject;
    for (; target.parentNode && prevent;)
      (target._scrollParent && (prevent = !1), (target = target.parentNode));
    prevent && e.preventDefault();
  }
  function resize() {
    (updateOrientation(),
      checkResizeRefresh(),
      updateMobileFullscreen(),
      _this.isAllowNativeScroll || (document.body.scrollTop = 0));
  }
  function updateOrientation() {
    ((_this.orientation = Stage.width > Stage.height ? "landscape" : "portrait"),
      _this.orientationSet &&
        (window.Fullscreen?.isOpen || Device.mobile?.pwa) &&
        window.screen &&
        window.screen.orientation &&
        window.screen.orientation.lock(_this.orientationSet));
  }
  Hydra.ready(() => {
    if (Device.mobile) {
      if (
        (Stage.isNormalMobileScroll &&
          ((_this.isAllowNativeScroll = !0), (_this.isPreventResizeReload = !1)),
        (Hydra.LOCAL ||
          location.hostname.includes(["atdev", "xr.activetheory.app"]) ||
          Utils.query("eruda")) &&
          (async function setupMobileConsole() {
            try {
              var script = document.createElement("script");
              ((script.src = "https://cdn.jsdelivr.net/npm/eruda"),
                document.body.append(script),
                (script.onload = function () {
                  (eruda.init(), console.log("Eruda console successfully initialized"));
                }));
            } catch (error) {
              console.error("Error initializing Eruda:", error);
            }
          })(),
        (function initFeatureDetects() {
          $featureDetects = __body.create("feature-detects");
        })(),
        (function addHandlers() {
          (_this.events.sub(Events.RESIZE, resize),
            Device.mobile.native ||
              Stage.isNormalMobileScroll ||
              window.addEventListener("touchstart", preventNativeScroll, { passive: !1 }));
        })(),
        Device.mobile?.phone && !Device.mobile.native && !Stage.isNormalMobileScroll)
      ) {
        $html = $(document.documentElement);
        let ios = "safari" === Device.system.browser;
        (ios ? $html.div.classList.add("ios") : $html.div.classList.add("mob"),
          (_is100vh = !0),
          ios && (__body.css({ height: "100%" }).div.scrollTop = 0),
          updateMobileFullscreen());
      }
      Device.mobile.native && Stage.css({ width: "100vw", height: "100vh" });
    }
  });
  const checkResizeRefresh = (function () {
    let _lastWidth;
    return function () {
      _this.isPreventResizeReload ||
        (_lastWidth != Stage.width &&
          ((_lastWidth = Stage.width),
          ("ios" === Device.system.os ||
            ("android" == Device.system.os && Device.system.version >= 7)) &&
            (!Device.mobile.tablet ||
              Math.max(Stage.width, Stage.height) > 800 ||
              window.location.reload())));
    };
  })();
  function updateMobileFullscreen() {
    if (!Stage.isNormalMobileScroll && $html) {
      let vh100 = $featureDetects.div.offsetHeight;
      $html.div.offsetHeight !== Stage.height
        ? Stage.height === vh100
          ? ($html.css({ height: "" }), Stage.css({ height: "100%" }), (_is100vh = !0))
          : ($html.css({ height: Stage.height }),
            Stage.css({ height: Stage.height }),
            (_is100vh = !1))
        : _is100vh ||
          Stage.height !== vh100 ||
          ($html.css({ height: "" }), Stage.css({ height: "100%" }), (_is100vh = !0));
    }
  }
  ((this.vibrate = function (duration) {
    navigator.vibrate && navigator.vibrate(duration);
  }),
    (this.fullscreen = function () {
      if (Device.mobile && !Device.mobile.native && !Device.mobile.pwa && !Dev.emulator) {
        if (!window.Fullscreen) throw "Mobile.fullscreen requires Fullscreen module";
        "android" !== Device.system.os ||
          Device.detect("oculus") ||
          (__window.bind("touchend", () => {
            Fullscreen.open();
          }),
          _this.ScreenLock && _this.ScreenLock.isActive && Events._fireResize());
      }
    }),
    (this.setOrientation = function (orientation, isForce) {
      if (_this.System && _this.NativeCore.active)
        return (_this.System.orientation = _this.System[orientation.toUpperCase()]);
      if (((_this.orientationSet = orientation), updateOrientation(), isForce)) {
        if (!_this.ScreenLock)
          throw "Mobile.setOrientation isForce argument requires ScreenLock module";
        "any" === orientation ? _this.ScreenLock.unlock() : _this.ScreenLock.lock();
      }
    }),
    (this.isKeyboardOpen = function () {
      return (
        Device.mobile &&
        document.activeElement?.tagName?.toLowerCase()?.includes?.(["textarea", "input"])
      );
    }),
    (this.allowNativeScroll = function (enabled = !0) {
      _this.isAllowNativeScroll = enabled;
      let action = enabled ? "unset" : "";
      [$(document.documentElement), __body, Stage].forEach(($el) =>
        $el.css({ touchAction: action, MSContentZooming: action, MSTouchAction: action }),
      );
    }),
    (this.preventResizeReload = function () {
      _this.isPreventResizeReload = !0;
    }),
    (this._addOverflowScroll = function ($obj) {
      (($obj.div._scrollParent = !0),
        Device.mobile.native ||
          (($obj.div._preventEvent = function (e) {
            e.stopPropagation();
          }),
          $obj.bind("touchmove", $obj.div._preventEvent)));
    }),
    (this._removeOverflowScroll = function ($obj) {
      $obj.unbind("touchmove", $obj.div._preventEvent);
    }),
    this.get("phone", () => {
      throw "Mobile.phone is removed. Use Device.mobile.phone";
    }),
    this.get("tablet", () => {
      throw "Mobile.tablet is removed. Use Device.mobile.tablet";
    }),
    this.get("os", () => {
      throw "Mobile.os is removed. Use Device.system.os";
    }),
    (function () {
      var _props = [
        "--safe-area-inset-top",
        "--safe-area-inset-right",
        "--safe-area-inset-bottom",
        "--safe-area-inset-left",
      ];
      function getSafeAreaInset(index) {
        if (!$featureDetects) return 0;
        let style = getComputedStyle($featureDetects.div);
        return parseInt(style.getPropertyValue(_props[index])) || 0;
      }
      ((_this.getSafeAreaInsets = () => _props.map((_, i) => getSafeAreaInset(i))),
        (_this.getSafeAreaInsetTop = () => getSafeAreaInset(0)),
        (_this.getSafeAreaInsetRight = () => getSafeAreaInset(1)),
        (_this.getSafeAreaInsetBottom = () => getSafeAreaInset(2)),
        (_this.getSafeAreaInsetLeft = () => getSafeAreaInset(3)),
        Object.defineProperties(_this, {
          safeAreaInsets: { get: () => _props.map((_, i) => getSafeAreaInset(i)) },
          safeAreaInsetTop: { get: () => getSafeAreaInset(0) },
          safeAreaInsetRight: { get: () => getSafeAreaInset(1) },
          safeAreaInsetBottom: { get: () => getSafeAreaInset(2) },
          safeAreaInsetLeft: { get: () => getSafeAreaInset(3) },
          vh100: { get: () => ($featureDetects ? $featureDetects.div.offsetHeight : 0) },
        }));
    })());
}, "Static");
