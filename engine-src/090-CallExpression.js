Hydra.ready(() => {
  ((TweenManager.Transforms = [
    "scale",
    "scaleX",
    "scaleY",
    "x",
    "y",
    "z",
    "rotation",
    "rotationX",
    "rotationY",
    "rotationZ",
    "skewX",
    "skewY",
    "perspective",
  ]),
    (TweenManager.CubicEases = [
      { name: "easeOutCubic", curve: "cubic-bezier(0.215, 0.610, 0.355, 1.000)" },
      { name: "easeOutQuad", curve: "cubic-bezier(0.250, 0.460, 0.450, 0.940)" },
      { name: "easeOutQuart", curve: "cubic-bezier(0.165, 0.840, 0.440, 1.000)" },
      { name: "easeOutQuint", curve: "cubic-bezier(0.230, 1.000, 0.320, 1.000)" },
      { name: "easeOutSine", curve: "cubic-bezier(0.390, 0.575, 0.565, 1.000)" },
      { name: "easeOutExpo", curve: "cubic-bezier(0.190, 1.000, 0.220, 1.000)" },
      { name: "easeOutCirc", curve: "cubic-bezier(0.075, 0.820, 0.165, 1.000)" },
      { name: "easeOutBack", curve: "cubic-bezier(0.175, 0.885, 0.320, 1.275)" },
      { name: "easeInCubic", curve: "cubic-bezier(0.550, 0.055, 0.675, 0.190)" },
      { name: "easeInQuad", curve: "cubic-bezier(0.550, 0.085, 0.680, 0.530)" },
      { name: "easeInQuart", curve: "cubic-bezier(0.895, 0.030, 0.685, 0.220)" },
      { name: "easeInQuint", curve: "cubic-bezier(0.755, 0.050, 0.855, 0.060)" },
      { name: "easeInSine", curve: "cubic-bezier(0.470, 0.000, 0.745, 0.715)" },
      { name: "easeInExpo", curve: "cubic-bezier(0.950, 0.050, 0.795, 0.035)" },
      { name: "easeInCirc", curve: "cubic-bezier(0.600, 0.040, 0.980, 0.335)" },
      { name: "easeInBack", curve: "cubic-bezier(0.600, -0.280, 0.735, 0.045)" },
      { name: "easeInOutCubic", curve: "cubic-bezier(0.645, 0.045, 0.355, 1.000)" },
      { name: "easeInOutQuad", curve: "cubic-bezier(0.455, 0.030, 0.515, 0.955)" },
      { name: "easeInOutQuart", curve: "cubic-bezier(0.770, 0.000, 0.175, 1.000)" },
      { name: "easeInOutQuint", curve: "cubic-bezier(0.860, 0.000, 0.070, 1.000)" },
      { name: "easeInOutSine", curve: "cubic-bezier(0.445, 0.050, 0.550, 0.950)" },
      { name: "easeInOutExpo", curve: "cubic-bezier(1.000, 0.000, 0.000, 1.000)" },
      { name: "easeInOutCirc", curve: "cubic-bezier(0.785, 0.135, 0.150, 0.860)" },
      { name: "easeInOutBack", curve: "cubic-bezier(0.680, -0.550, 0.265, 1.550)" },
      { name: "easeInOut", curve: "cubic-bezier(.42,0,.58,1)" },
      { name: "linear", curve: "linear" },
    ]),
    (TweenManager.useCSSTrans = function (props, ease, object) {
      return !(
        props.math ||
        ("string" == typeof ease && ease.includes(["Elastic", "Bounce"])) ||
        object.multiTween ||
        TweenManager._inspectEase(ease).path ||
        !Device.tween.transition
      );
    }),
    (TweenManager._detectTween = function (object, props, time, ease, delay, callback) {
      return TweenManager.useCSSTrans(props, ease, object)
        ? new CSSTransition(object, props, time, ease, delay, callback)
        : new FrameTween(object, props, time, ease, delay, callback);
    }),
    (TweenManager._parseTransform = function (props) {
      var unitRequiresCSSTween = ["%", "vw", "vh", "em"],
        transforms = "",
        translate = "";
      if (
        (props.perspective > 0 && (transforms += "perspective(" + props.perspective + "px)"),
        void 0 !== props.x || void 0 !== props.y || void 0 !== props.z)
      ) {
        var x = props.x || 0,
          y = props.y || 0,
          z = props.z || 0;
        ((translate +=
          x +
          ("string" == typeof props.x && props.x.includes(unitRequiresCSSTween) ? "" : "px") +
          ", "),
          (translate +=
            y + ("string" == typeof props.y && props.y.includes(unitRequiresCSSTween) ? "" : "px")),
          Device.tween.css3d
            ? (transforms += "translate3d(" + (translate += ", " + z + "px") + ")")
            : (transforms += "translate(" + translate + ")"));
      }
      return (
        void 0 !== props.scale
          ? (transforms += "scale(" + props.scale + ")")
          : (void 0 !== props.scaleX && (transforms += "scaleX(" + props.scaleX + ")"),
            void 0 !== props.scaleY && (transforms += "scaleY(" + props.scaleY + ")")),
        void 0 !== props.rotation && (transforms += "rotate(" + props.rotation + "deg)"),
        void 0 !== props.rotationX && (transforms += "rotateX(" + props.rotationX + "deg)"),
        void 0 !== props.rotationY && (transforms += "rotateY(" + props.rotationY + "deg)"),
        void 0 !== props.rotationZ && (transforms += "rotateZ(" + props.rotationZ + "deg)"),
        void 0 !== props.skewX && (transforms += "skewX(" + props.skewX + "deg)"),
        void 0 !== props.skewY && (transforms += "skewY(" + props.skewY + "deg)"),
        transforms
      );
    }),
    (TweenManager._clearCSSTween = function (obj) {
      obj &&
        !obj._cssTween &&
        obj.div._transition &&
        !obj.persistTween &&
        ((obj.div.style[HydraCSS.styles.vendorTransition] = ""),
        (obj.div._transition = !1),
        (obj._cssTween = null));
    }),
    (TweenManager._isTransform = function (key) {
      return TweenManager.Transforms.indexOf(key) > -1;
    }),
    (TweenManager._getAllTransforms = function (object) {
      for (var obj = {}, i = TweenManager.Transforms.length - 1; i > -1; i--) {
        var tf = TweenManager.Transforms[i],
          val = object[tf];
        0 === val || ("number" != typeof val && "string" != typeof val) || (obj[tf] = val);
      }
      return obj;
    }));
  const prefix = (function () {
    let pre = "",
      dom = "";
    try {
      var styles = window.getComputedStyle(document.documentElement, "");
      return (
        (pre = (Array.prototype.slice
          .call(styles)
          .join("")
          .match(/-(moz|webkit|ms)-/) ||
          ("" === styles.OLink && ["", "o"]))[1]),
        (dom = "WebKit|Moz|MS|O".match(new RegExp("(" + pre + ")", "i"))[1]),
        {
          unprefixed: "ie" == Device.system.browser && !Device.detect("msie 9"),
          dom: dom,
          lowercase: pre,
          css: "-" + pre + "-",
          js: ("ie" == Device.system.browser ? pre[0] : pre[0].toUpperCase()) + pre.substr(1),
        }
      );
    } catch (e) {
      return { unprefixed: !0, dom: "", lowercase: "", css: "", js: "" };
    }
  })();
  ((HydraCSS.vendor = prefix.css),
    (HydraCSS.styles = {}),
    (HydraCSS.styles.vendor = prefix.unprefixed ? "" : prefix.js),
    (HydraCSS.styles.vendorTransition = HydraCSS.prefixCSS("transition", "transition-property")),
    (HydraCSS.styles.vendorTransform = HydraCSS.prefixCSS("transform")),
    (HydraCSS.transformProperty = HydraCSS.prefixCSS("transform")),
    (HydraCSS.tween = {}),
    (HydraCSS.tween.complete = prefix.unprefixed
      ? "transitionend"
      : prefix.lowercase + "TransitionEnd"));
});
