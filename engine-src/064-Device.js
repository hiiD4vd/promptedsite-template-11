Class(function Device() {
  var vid,
    _this = this;
  ((this.agent = navigator.userAgent.toLowerCase()),
    (this.detect = function (match) {
      return this.agent.includes(match);
    }),
    (this.touchCapable = !!navigator.maxTouchPoints),
    (this.hoverCapable = window.matchMedia?.("(hover: hover)")?.matches || !this.touchCapable),
    (this.pixelRatio = window.devicePixelRatio),
    (this.system = {}),
    (this.system.retina = window.devicePixelRatio > 1),
    (this.system.webworker = void 0 !== window.Worker),
    window._NODE_ || (this.system.geolocation = void 0 !== navigator.geolocation),
    window._NODE_ || (this.system.pushstate = void 0 !== window.history.pushState),
    (this.system.webcam = !!(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.mediaDevices
    )),
    (this.system.language = window.navigator.userLanguage || window.navigator.language),
    (this.system.webaudio = void 0 !== window.AudioContext),
    (this.system.xr = {}),
    (this.system.detectXR = async function () {
      if (window.AURA) return ((_this.system.xr.vr = !0), void (_this.system.xr.ar = !0));
      if (!navigator.xr) return ((_this.system.xr.vr = !1), void (_this.system.xr.ar = !1));
      try {
        [_this.system.xr.vr, _this.system.xr.ar] = await Promise.all([
          navigator.xr.isSessionSupported("immersive-vr"),
          navigator.xr.isSessionSupported("immersive-ar"),
        ]);
      } catch (e) {}
      "android" == _this.system.os && (_this.detect("oculus") || (_this.system.xr.vr = !1));
    }));
  try {
    this.system.localStorage = void 0 !== window.localStorage;
  } catch (e) {
    this.system.localStorage = !1;
  }
  ((this.system.fullscreen =
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled),
    (this.system.os =
      _this.detect(["ipad", "iphone", "ios"]) ||
      (function detectIpad() {
        let aspect = Math.max(screen.width, screen.height) / Math.min(screen.width, screen.height);
        return (
          _this.detect("mac") &&
          _this.touchCapable &&
          Math.abs(aspect - 4 / 3) < Math.abs(aspect - 1.6)
        );
      })()
        ? "ios"
        : _this.detect(["android", "kindle"])
          ? "android"
          : _this.detect(["blackberry"])
            ? "blackberry"
            : _this.detect(["mac os"])
              ? "mac"
              : _this.detect(["windows", "iemobile"])
                ? "windows"
                : _this.detect(["linux"])
                  ? "linux"
                  : "unknown"),
    (this.system.version = (function () {
      try {
        if ("ios" == _this.system.os) {
          if (_this.agent.includes("intel mac")) {
            let split = _this.agent.split("version/")[1].split(" ")[0].split(".");
            return Number(split[0] + "." + split[1]);
          }
          var num = _this.agent.split("os ")[1].split("_"),
            main = num[0],
            sub = num[1].split(" ")[0];
          return Number(main + "." + sub);
        }
        if ("android" == _this.system.os) {
          var version = _this.agent.split("android ")[1].split(";")[0];
          return (
            version.length > 3 && (version = version.slice(0, -2)),
            "." == version.charAt(version.length - 1) && (version = version.slice(0, -1)),
            Number(version)
          );
        }
        if ("windows" == _this.system.os)
          return _this.agent.includes("rv:11")
            ? 11
            : Number(_this.agent.split("windows phone ")[1].split(";")[0]);
      } catch (e) {}
      return -1;
    })()),
    (this.system.browser =
      "ios" == _this.system.os
        ? _this.detect(["twitter", "fbios", "instagram"])
          ? "social"
          : _this.detect(["crios"])
            ? "chrome"
            : _this.detect(["fxios"])
              ? "firefox"
              : _this.detect(["safari"])
                ? "safari"
                : "unknown"
        : "android" == _this.system.os
          ? _this.detect(["twitter", "fb", "facebook", "instagram"])
            ? "social"
            : _this.detect(["chrome"])
              ? "chrome"
              : _this.detect(["firefox"])
                ? "firefox"
                : "browser"
          : _this.detect(["msie"]) ||
              (_this.detect(["trident"]) && _this.detect(["rv:"])) ||
              (_this.detect(["windows"]) && _this.detect(["edge"]))
            ? "ie"
            : _this.detect(["chrome"])
              ? "chrome"
              : _this.detect(["safari"])
                ? "safari"
                : _this.detect(["firefox"])
                  ? "firefox"
                  : "unknown"),
    (this.system.browserVersion = (function () {
      try {
        if ("chrome" == _this.system.browser)
          return _this.detect("crios")
            ? Number(_this.agent.split("crios/")[1].split(".")[0])
            : Number(_this.agent.split("chrome/")[1].split(".")[0]);
        if ("firefox" == _this.system.browser)
          return Number(_this.agent.split("firefox/")[1].split(".")[0]);
        if ("safari" == _this.system.browser)
          return Number(_this.agent.split("version/")[1].split(".")[0].split(".")[0]);
        if ("ie" == _this.system.browser)
          return _this.detect(["msie"])
            ? Number(_this.agent.split("msie ")[1].split(".")[0])
            : _this.detect(["rv:"])
              ? Number(_this.agent.split("rv:")[1].split(".")[0])
              : Number(_this.agent.split("edge/")[1].split(".")[0]);
      } catch (e) {
        return -1;
      }
    })()),
    (this.mobile =
      !(
        window._NODE_ ||
        (!("ontouchstart" in window) && !("onpointerdown" in window)) ||
        !_this.system.os.includes(["ios", "android", "magicleap"])
      ) && {}),
    _this.detect("oculusbrowser") && (this.mobile = !0),
    _this.detect("quest") && (this.mobile = !0),
    this.mobile && this.detect(["windows"]) && !this.detect(["touch"]) && (this.mobile = !1),
    this.mobile &&
      ((this.mobile.tablet =
        Math.max(
          window.screen ? screen.width : window.innerWidth,
          window.screen ? screen.height : window.innerHeight,
        ) > 1e3),
      (this.mobile.phone = !this.mobile.tablet),
      (this.mobile.pwa =
        !(!window.matchMedia || !window.matchMedia("(display-mode: standalone)").matches) ||
        !!window.navigator.standalone),
      Hydra.ready(() => {
        _this.mobile.native = !(!Mobile.NativeCore || !Mobile.NativeCore.active) || !!window._AURA_;
      })),
    (this.media = {}),
    (this.media.audio =
      !!document.createElement("audio").canPlayType &&
      (_this.detect(["firefox", "opera"]) ? "ogg" : "mp3")),
    (this.media.video =
      ((vid = document.createElement("video")).setAttribute("muted", !0),
      vid.setAttribute("loop", !0),
      vid.setAttribute("autoplay", !0),
      vid.setAttribute("preload", !0),
      vid.setAttribute("playsinline", !0),
      vid.setAttribute("webkit-playsinline", !0),
      (vid.autoplay = !0),
      (vid.muted = !0),
      (vid.src =
        "data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAACAG1wNDJpc28yYXZjMW1wNDEAAANObW9vdgAAAGxtdmhkAAAAAOA5QnjgOUJ4AAAD6AAAAEMAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAmt0cmFrAAAAXHRraGQAAAAD4DlCeOA5QngAAAABAAAAAAAAAEMAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAACAAAAAgAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAABDAAAAAAABAAAAAAHjbWRpYQAAACBtZGhkAAAAAOA5QnjgOUJ4AAFfkAAAF3BVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABjm1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAU5zdGJsAAAAznN0c2QAAAAAAAAAAQAAAL5hdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAACAAIABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMWF2Y0MBTUAo/+EAGWdNQCjspLYC1BgYGQAAAwABAAK/IA8YMZYBAAVo6uEyyAAAABNjb2xybmNseAAGAAYABgAAAAAQcGFzcAAAAAEAAAABAAAAFGJ0cnQAAAAAAAF1IAABdSAAAAAYc3R0cwAAAAAAAAABAAAAAgAAC7gAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAAAgAAAAEAAAAcc3RzegAAAAAAAAAAAAAAAgAAAxAAAAAMAAAAFHN0Y28AAAAAAAAAAQAAA34AAABvdWR0YQAAAGdtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAADppbHN0AAAAMql0b28AAAAqZGF0YQAAAAEAAAAASGFuZEJyYWtlIDEuNi4xIDIwMjMwMTIyMDAAAAAIZnJlZQAAAyRtZGF0AAAC9AYF///w3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwMCBlZDBmN2E2IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMiAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTIgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9NiBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTEga2V5aW50PTMwMCBrZXlpbnRfbWluPTMwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9MzAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMi4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCB2YnZfbWF4cmF0ZT0yMDAwMCB2YnZfYnVmc2l6ZT0yNTAwMCBjcmZfbWF4PTAuMCBuYWxfaHJkPW5vbmUgZmlsbGVyPTAgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAABRliIQAK//+9q78yyt0fpUs1YVPgQAAAAhBmiFsQn/+Vg=="),
      vid
        .play()
        .then(() => {})
        .catch(() => {}),
      vid.addEventListener("canplaythrough", (_) => {
        (vid.paused && _this.mobile && (_this.mobile.lowPowerMode = !0),
          setTimeout((_) => vid.pause(), 500));
      }),
      !!vid.canPlayType && (vid.canPlayType("video/webm;") ? "webm" : "mp4"))),
    (this.media.webrtc = !!(
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.msRTCPeerConnection ||
      window.oRTCPeerConnection ||
      window.RTCPeerConnection
    )),
    (this.graphics = {}),
    (this.graphics.webgl = (function () {
      let DISABLED = !1;
      Object.defineProperty(_this.graphics, "webgl", {
        get: () => {
          if (DISABLED) return !1;
          if (_this.graphics._webglContext) return _this.graphics._webglContext;
          let iOSContextLoss =
            "ios" === _this.system.os &&
            _this.system.browserVersion > 16.7 &&
            _this.system.browserVersion < 17.1;
          try {
            const names = ["webgl2", "webgl", "experimental-webgl"],
              canvas = document.createElement("canvas");
            ((canvas.width = 1), (canvas.height = 1));
            let gl,
              contextAttributes = {};
            (iOSContextLoss || (contextAttributes.powerPreference = "high-performance"),
              canvas.addEventListener(
                "webglcontextlost",
                () => Events.emitter._fireEvent(Events.WEBGL_CONTEXT_LOSS),
                !1,
              ));
            for (
              let i = 0;
              i < names.length &&
              (("webgl2" === names[i] && Utils.query("compat")) ||
                ((gl = canvas.getContext(names[i], contextAttributes)), !gl));
              i++
            );
            if (gl.isContextLost())
              return ((window.__WEBGL_CONTEXT_LOSS = !0), (DISABLED = !0), !1);
            let output = { gpu: "unknown" };
            if (
              (iOSContextLoss && (output.iOSContextLoss = iOSContextLoss),
              (output.renderer = gl.getParameter(gl.RENDERER).toLowerCase()),
              (output.version = gl.getParameter(gl.VERSION).toLowerCase()),
              (output.glsl = gl.getParameter(gl.SHADING_LANGUAGE_VERSION).toLowerCase()),
              (output.extensions = gl.getSupportedExtensions()),
              (output.webgl2 = output.version.includes(["webgl 2", "webgl2"])),
              (output.canvas = canvas),
              (output.context = gl),
              "firefox" === _this.system.browser && _this.system.browserVersion >= 92)
            )
              output.gpu = output.renderer;
            else {
              let info = gl.getExtension("WEBGL_debug_renderer_info");
              if (info) {
                let gpu = info.UNMASKED_RENDERER_WEBGL;
                output.gpu = gl.getParameter(gpu).toLowerCase();
              }
            }
            return (
              (output.detect = function (matches) {
                if (output.gpu && output.gpu.toLowerCase().includes(matches)) return !0;
                if (output.version && output.version.toLowerCase().includes(matches)) return !0;
                for (let i = 0; i < output.extensions.length; i++)
                  if (output.extensions[i].toLowerCase().includes(matches)) return !0;
                return !1;
              }),
              output.webgl2 || output.detect("instance") || window.AURA
                ? ((_this.graphics._webglContext = output), output)
                : ((DISABLED = !0), !1)
            );
          } catch (e) {
            return !1;
          }
        },
        set: (v) => {
          !1 === v && (DISABLED = !0);
        },
      });
    })()),
    (this.graphics.metal = (function () {
      if (!window.Metal) return !1;
      let output = {};
      return (
        (output.gpu = Metal.device.getName().toLowerCase()),
        (output.detect = function (matches) {
          return output.gpu.includes(matches);
        }),
        output
      );
    })()),
    (this.graphics.gpu = (function () {
      if (!_this.graphics.webgl && !_this.graphics.metal) return !1;
      let output = {};
      return (
        ["metal", "webgl"].forEach((name) => {
          _this.graphics[name] &&
            !output.identifier &&
            ((output.detect = _this.graphics[name].detect),
            (output.identifier = _this.graphics[name].gpu));
        }),
        output
      );
    })()),
    (this.graphics.canvas = !!document.createElement("canvas").getContext));
  const checkForStyle = (function () {
    let _tagDiv;
    return function (prop) {
      _tagDiv = _tagDiv || document.createElement("div");
      const vendors = ["Khtml", "ms", "O", "Moz", "Webkit"];
      if (prop in _tagDiv.style) return !0;
      prop = prop.replace(/^[a-z]/, (val) => val.toUpperCase());
      for (let i = vendors.length - 1; i >= 0; i--)
        if (vendors[i] + prop in _tagDiv.style) return !0;
      return !1;
    };
  })();
  ((this.styles = {}),
    (this.styles.filter = checkForStyle("filter")),
    (this.styles.blendMode = checkForStyle("mix-blend-mode")),
    (this.tween = {}),
    (this.tween.transition = checkForStyle("transition")),
    (this.tween.css2d = checkForStyle("transform")),
    (this.tween.css3d = checkForStyle("perspective")),
    (this.social = _this.agent.includes("instagram")
      ? "instagram"
      : _this.agent.includes("fban") ||
          _this.agent.includes("fbav") ||
          _this.agent.includes("fbios")
        ? "facebook"
        : (_this.agent.includes("twitter") ||
            !(!document.referrer || !document.referrer.includes("//t.co/"))) &&
          "twitter"));
}, "Static");
