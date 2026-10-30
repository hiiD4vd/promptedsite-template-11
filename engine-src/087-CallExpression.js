(function () {
  const cursorLockIdProp = "function" == typeof Symbol ? Symbol("cursorLockId") : "_cursorLockId";
  (($.fn.text = function (text) {
    return void 0 !== text
      ? (this.__cacheText != text && (this.div.textContent = text), (this.__cacheText = text), this)
      : this.div.textContent;
  }),
    ($.fn.html = function (text, force) {
      return "string" != typeof text || text.includes("<") || force
        ? void 0 !== text
          ? ((this.div.innerHTML = text), this)
          : this.div.innerHTML
        : this.text(text);
    }),
    ($.fn.hide = function () {
      return ((this.div.style.display = "none"), this);
    }),
    ($.fn.show = function () {
      return ((this.div.style.display = ""), this);
    }),
    ($.fn.visible = function () {
      return ((this.div.style.visibility = "visible"), this);
    }),
    ($.fn.invisible = function () {
      return ((this.div.style.visibility = "hidden"), this);
    }),
    ($.fn.setZ = function (z) {
      return ((this.div.style.zIndex = z), this);
    }),
    ($.fn.clearAlpha = function () {
      return ((this.div.style.opacity = ""), this);
    }),
    ($.fn.size = function (w, h, noScale) {
      return (
        "string" == typeof w
          ? (void 0 === h ? (h = "100%") : "string" != typeof h && (h += "px"),
            (this.div.style.width = w),
            (this.div.style.height = h))
          : ((this.div.style.width = w + "px"),
            (this.div.style.height = h + "px"),
            noScale || (this.div.style.backgroundSize = w + "px " + h + "px")),
        (this.width = w),
        (this.height = h),
        this
      );
    }),
    ($.fn.mouseEnabled = function (bool) {
      return ((this.div.style.pointerEvents = bool ? "auto" : "none"), this);
    }),
    ($.fn.fontStyle = function (family, size, color, style) {
      var font = {};
      return (
        family && (font.fontFamily = family),
        size && (font.fontSize = size),
        color && (font.color = color),
        style && (font.fontStyle = style),
        this.css(font),
        this
      );
    }),
    ($.fn.font = function (font) {
      return (this.css("font", font), this);
    }),
    ($.fn.bg = function (src, x, y, repeat) {
      return src
        ? (src.includes(".") && (src = Assets.getPath(src)),
          src.includes(".")
            ? (this.div.style.backgroundImage = "url(" + src + ")")
            : (this.div.style.backgroundColor = src),
          void 0 !== x &&
            ((x = "number" == typeof x ? x + "px" : x),
            (y = "number" == typeof y ? y + "px" : y),
            (this.div.style.backgroundPosition = x + " " + y)),
          repeat &&
            ((this.div.style.backgroundSize = ""), (this.div.style.backgroundRepeat = repeat)),
          ("cover" != x && "contain" != x) ||
            ((this.div.style.backgroundSize = x),
            (this.div.style.backgroundPosition = void 0 !== y ? y + " " + repeat : "center")),
          this)
        : this;
    }),
    ($.fn.svgMask = function (src) {
      return src
        ? (src.includes(".") && (src = Assets.getPath(src)),
          (this.div.style.maskImage = `url(${src})`),
          (this.div.style.webkitMaskImage = `url(${src})`),
          this)
        : this;
    }),
    ($.fn.center = function (x, y, noPos) {
      var css = {};
      return (
        void 0 === x
          ? ((css.left = "50%"),
            (css.top = "50%"),
            (css.marginLeft = -this.width / 2),
            (css.marginTop = -this.height / 2))
          : (x && ((css.left = "50%"), (css.marginLeft = -this.width / 2)),
            y && ((css.top = "50%"), (css.marginTop = -this.height / 2))),
        noPos && (delete css.left, delete css.top),
        this.css(css),
        this
      );
    }),
    ($.fn.max = function (width, height) {
      let w, h;
      return (
        void 0 !== width &&
          ((w = "number" == typeof width ? width + "px" : width), (this.div.style.maxWidth = w)),
        void 0 !== height
          ? ((h = "number" == typeof height ? height + "px" : height),
            (this.div.style.maxHeight = h))
          : ((h = w), (this.div.style.maxHeight = h)),
        this
      );
    }),
    ($.fn.min = function (width, height) {
      let w, h;
      return (
        void 0 !== width &&
          ((w = "number" == typeof width ? width + "px" : width), (this.div.style.minWidth = w)),
        void 0 !== height
          ? ((h = "number" == typeof height ? height + "px" : height),
            (this.div.style.minHeight = h))
          : ((h = w), (this.div.style.minHeight = h)),
        this
      );
    }),
    ($.fn.flex = function (inline) {
      return (
        (this.div.style.display = inline ? "inline-flex" : "flex"),
        (this.div.style.justifyContent = "center"),
        (this.div.style.alignItems = "center"),
        this.div.classList.add("relative-children"),
        this
      );
    }),
    ($.fn.order = function (opts = {}) {
      let s = this.div.style;
      return (
        "none" === opts.flexWrap && (opts.flexWrap = "nowrap"),
        opts.direction && (s.flexDirection = opts.direction),
        opts.wrap && (s.flexWrap = opts.wrap),
        opts.order && (s.order = opts.order),
        this
      );
    }),
    ($.fn.align = function (opts = {}) {
      let s = this.div.style;
      function flex(str, contentMode = !1) {
        return "start" === str
          ? "flex-start"
          : "end" === str
            ? "flex-end"
            : "between" === str
              ? contentMode
                ? "space-between"
                : "flex-between"
              : "around" === str
                ? contentMode
                  ? "space-around"
                  : "flex-around"
                : "none" === str
                  ? "nowrap"
                  : str;
      }
      return (
        opts.justify && (s.justifyContent = flex(opts.justify)),
        opts.items && (s.alignItems = flex(opts.items)),
        opts.self && (s.alignSelf = flex(opts.self)),
        opts.content && (s.alignContent = flex(opts.content, !0)),
        this
      );
    }),
    ($.fn.flexibility = function (opts = {}) {
      let s = this.div.style;
      return (
        "undefined" !== opts.grow && (s.flexGrow = opts.grow),
        "undefined" !== opts.shrink && (s.flexGrow = opts.shrink),
        void 0 !== opts.basis &&
          (s.flexBasis = "number" == typeof opts.basis ? opts.basis + "px" : opts.basis),
        this
      );
    }),
    ($.fn.mask = function (arg) {
      let maskPrefix = "Moz" === HydraCSS.styles.vendor ? "mask" : HydraCSS.prefix("Mask");
      return (
        (this.div.style[maskPrefix] =
          (arg.includes(".") ? "url(" + arg + ")" : arg) + " no-repeat"),
        (this.div.style[maskPrefix + "Size"] = "contain"),
        this
      );
    }),
    ($.fn.blendMode = function (mode, bg) {
      return (
        bg
          ? (this.div.style["background-blend-mode"] = mode)
          : (this.div.style["mix-blend-mode"] = mode),
        this
      );
    }));
  const DEFAULT_UNITS = {
    animationDelay: "ms",
    animationDuration: "ms",
    transitionDelay: "ms",
    transitionDuration: "ms",
    perspectiveOriginX: "%",
    perspectiveOriginY: "%",
    transformOrigin: "%",
    transformOriginX: "%",
    transformOriginY: "%",
    transformOriginZ: "%",
    rotate: "deg",
    animationIterationCount: !1,
    aspectRatio: !1,
    borderImageSlice: !1,
    borderImageWidth: !1,
    columnCount: !1,
    counterIncrement: !1,
    counterReset: !1,
    flex: !1,
    flexGrow: !1,
    flexShrink: !1,
    fontSizeAdjust: !1,
    fontWeight: !1,
    lineHeight: !1,
    navIndex: !1,
    opacity: !1,
    order: !1,
    orphans: !1,
    tabSize: !1,
    widows: !1,
    zIndex: !1,
    scale: !1,
    strokeDasharray: !1,
    strokeDashoffset: !1,
    strokeWidth: !1,
  };
  function clsxToVal(mix) {
    var k,
      y,
      str = "";
    if ("string" == typeof mix || "number" == typeof mix) str += mix;
    else if ("object" == typeof mix)
      if (Array.isArray(mix)) {
        var len = mix.length;
        for (k = 0; k < len; k++)
          mix[k] && (y = toVal(mix[k])) && (str && (str += " "), (str += y));
      } else for (y in mix) mix[y] && (str && (str += " "), (str += y));
    return str;
  }
  (($.fn.css = function (obj, value) {
    if (("boolean" == typeof value && (value = null), "object" != typeof obj)) {
      if (value) return ((this.div.style[obj] = value), this);
      var style = this.div.style[obj];
      if ("number" != typeof style) {
        if (!style) return !1;
        (style.includes("px") && (style = Number(style.slice(0, -2))),
          "opacity" == obj &&
            (style = isNaN(Number(this.div.style.opacity)) ? 1 : Number(this.div.style.opacity)));
      }
      return (style || (style = 0), style);
    }
    TweenManager._clearCSSTween(this);
    for (let type in obj) {
      let val = obj[type];
      if ("string" == typeof val || "number" == typeof val) {
        if ("number" == typeof val) {
          let unit = DEFAULT_UNITS[type];
          !1 !== unit && (val += unit || "px");
        }
        ("position" == type &&
          "sticky" == val &&
          "safari" == Device.system.browser &&
          (val = "-webkit-sticky"),
          (this.div.style[type] = val));
      }
    }
    return this;
  }),
    ($.fn.transform = function (props) {
      if (
        (Hydra.LOCAL &&
          props &&
          !this.__warningShown &&
          !props._mathTween &&
          (this.__lastTransform &&
            performance.now() - this.__lastTransform < 20 &&
            ((this.__warningCount = ++this.__warningCount || 1),
            (props.__warningCount2 = ++props.__warningCount2 || 1),
            this.__warningCount > 10 &&
              props.__warningCount2 !== this.__warningCount &&
              (console.warn(
                "Are you using .transform() in a loop? Avoid creating a new object {} every frame. Ex. assign .x = 1; and .transform();",
              ),
              console.log(this),
              (this.__warningShown = !0))),
          (this.__lastTransform = performance.now())),
        TweenManager._clearCSSTween(this),
        Device.tween.css2d)
      ) {
        if (props)
          for (var key in props)
            ("number" != typeof props[key] && "string" != typeof props[key]) ||
              (this[key] = props[key]);
        else props = this;
        var transformString = TweenManager._parseTransform(props);
        this.__transformCache != transformString &&
          ((this.div.style[HydraCSS.styles.vendorTransform] = transformString),
          (this.__transformCache = transformString));
      }
      return this;
    }),
    ($.fn.willChange = function (props) {
      if ("boolean" == typeof props) this._willChangeLock = !0 === props;
      else if (this._willChangeLock) return;
      var string = "string" == typeof props;
      (this._willChange && !string) || "null" == typeof props
        ? ((this._willChange = !1), (this.div.style["will-change"] = ""))
        : ((this._willChange = !0),
          (this.div.style["will-change"] = string
            ? props
            : HydraCSS.transformProperty + ", opacity"));
    }),
    ($.fn.backfaceVisibility = function (visible) {
      this.div.style[HydraCSS.prefix("BackfaceVisibility")] = visible ? "visible" : "hidden";
    }),
    ($.fn.enable3D = function (perspective, x, y) {
      return Device.tween.css3d
        ? ((this.div.style[HydraCSS.prefix("TransformStyle")] = "preserve-3d"),
          perspective && (this.div.style[HydraCSS.prefix("Perspective")] = perspective + "px"),
          void 0 !== x &&
            ((x = "number" == typeof x ? x + "px" : x),
            (y = "number" == typeof y ? y + "px" : y),
            (this.div.style[HydraCSS.prefix("PerspectiveOrigin")] = x + " " + y)),
          this)
        : this;
    }),
    ($.fn.disable3D = function () {
      return (
        (this.div.style[HydraCSS.prefix("TransformStyle")] = ""),
        (this.div.style[HydraCSS.prefix("Perspective")] = ""),
        this
      );
    }),
    ($.fn.transformPoint = function (x, y, z) {
      var origin = "";
      return (
        void 0 !== x && (origin += "number" == typeof x ? x + "px " : x + " "),
        void 0 !== y && (origin += "number" == typeof y ? y + "px " : y + " "),
        void 0 !== z && (origin += "number" == typeof z ? z + "px" : z),
        (this.div.style[HydraCSS.prefix("TransformOrigin")] = origin),
        this
      );
    }),
    ($.fn.tween = function (props, time, ease, delay, callback, manual) {
      ("boolean" == typeof delay
        ? ((manual = delay), (delay = 0), (callback = null))
        : "function" == typeof delay && ((callback = delay), (delay = 0)),
        "boolean" == typeof callback && ((manual = callback), (callback = null)),
        delay || (delay = 0));
      var usePromise = null;
      callback &&
        callback instanceof Promise &&
        ((usePromise = callback), (callback = callback.resolve));
      var tween = TweenManager._detectTween(this, props, time, ease, delay, callback, manual);
      return usePromise || tween;
    }),
    ($.fn.clearTransform = function () {
      return (
        "number" == typeof this.x && (this.x = 0),
        "number" == typeof this.y && (this.y = 0),
        "number" == typeof this.z && (this.z = 0),
        "number" == typeof this.scale && (this.scale = 1),
        "number" == typeof this.scaleX && (this.scaleX = 1),
        "number" == typeof this.scaleY && (this.scaleY = 1),
        "number" == typeof this.rotation && (this.rotation = 0),
        "number" == typeof this.rotationX && (this.rotationX = 0),
        "number" == typeof this.rotationY && (this.rotationY = 0),
        "number" == typeof this.rotationZ && (this.rotationZ = 0),
        "number" == typeof this.skewX && (this.skewX = 0),
        "number" == typeof this.skewY && (this.skewY = 0),
        (this.div.style[HydraCSS.styles.vendorTransform] = ""),
        (this.__transformCache = ""),
        this
      );
    }),
    ($.fn.clearTween = function () {
      return (
        this._cssTween && this._cssTween.stop(),
        this._mathTween && this._mathTween.stop(),
        this
      );
    }),
    ($.fn.stopTween = function () {
      return (console.warn(".stopTween deprecated. use .clearTween instead"), this.clearTween());
    }),
    ($.fn.keypress = function (callback) {
      this.div.onkeypress = function (e) {
        (((e = e || window.event).code = e.keyCode ? e.keyCode : e.charCode),
          callback && callback(e));
      };
    }),
    ($.fn.keydown = function (callback) {
      this.div.onkeydown = function (e) {
        (((e = e || window.event).code = e.keyCode), callback && callback(e));
      };
    }),
    ($.fn.keyup = function (callback) {
      this.div.onkeyup = function (e) {
        (((e = e || window.event).code = e.keyCode), callback && callback(e));
      };
    }),
    ($.fn.attr = function (attr, value) {
      return "string" != typeof attr
        ? this
        : void 0 === value
          ? this.div.getAttribute(attr)
          : (!1 === value || null === value
              ? this.div.removeAttribute(attr)
              : this.div.setAttribute(attr, value),
            this);
    }),
    ($.fn.val = function (value) {
      return void 0 === value ? this.div.value : ((this.div.value = value), this);
    }),
    ($.fn.change = $.fn.onChange =
      function (callback) {
        var _this = this;
        this.div.onchange = this.div.onblur = function () {
          callback({ object: _this, value: _this.div.value || "" });
        };
      }),
    ($.fn.svgSymbol = function (id, width, height) {
      var config = SVG.getSymbolConfig(id),
        svgHTML =
          '<svg viewBox="0 0 ' +
          config.width +
          " " +
          config.height +
          '" width="' +
          width +
          '" height="' +
          height +
          '"><use xlink:href="#' +
          config.id +
          '" x="0" y="0" /></svg>';
      this.html(svgHTML, !0);
    }),
    ($.fn.svg = async function (url) {
      let promise = Promise.create();
      return (
        fetch(Assets.getPath(url)).then(async (res) => {
          let svgHTML = await res.text();
          (this.html(svgHTML, !0), promise.resolve());
        }),
        promise
      );
    }),
    ($.fn.overflowScroll = function (dir) {
      var x = !!dir.x,
        y = !!dir.y,
        overflow = {};
      return (
        ((!x && !y) || (x && y)) && (overflow.overflow = "auto"),
        !x && y && ((overflow.overflowY = "auto"), (overflow.overflowX = "hidden")),
        x && !y && ((overflow.overflowX = "auto"), (overflow.overflowY = "hidden")),
        Device.mobile &&
          ((overflow["-webkit-overflow-scrolling"] = "touch"), Mobile._addOverflowScroll(this)),
        this.css(overflow)
      );
    }),
    ($.fn.removeOverflowScroll = function () {
      return (
        this.css({
          overflow: "hidden",
          overflowX: "",
          overflowY: "",
          "-webkit-overflow-scrolling": "",
        }),
        Device.mobile && Mobile._removeOverflowScroll(this),
        this
      );
    }),
    ($.fn.accessible = function (type = "label", tabIndex = -1) {
      switch ((tabIndex > -1 && this.attr("tabindex", tabIndex), type)) {
        case "label":
          this.attr("aria-label", this.div.textContent);
          break;
        case "hidden":
          this.attr("aria-hidden", !0);
      }
      return this;
    }),
    ($.fn.tabIndex = function (tabIndex) {
      return (this.attr("tabindex", tabIndex), this);
    }),
    ($.fn.createObserver = function (callback, { isViewport: isViewport = !1, ...options } = {}) {
      isViewport && (options.root = this.div);
      const observer = (this._observer = new IntersectionObserver((array) => {
        (array.forEach((entry) => {
          entry.object = entry.target.hydraObject;
        }),
          callback(array));
      }, options));
      return (
        this._bindOnDestroy(() => {
          observer.disconnect();
        }),
        this
      );
    }),
    ($.fn.observe = function (obj = this) {
      return (this._observer?.observe(obj.div), this);
    }),
    ($.fn.unobserve = function (obj = this) {
      return (this._observer?.unobserve(obj.div), this);
    }),
    ($.fn.cursor = function (cursor, lock) {
      if (!Device.mobile) {
        if (lock) {
          lock[cursorLockIdProp] || (lock[cursorLockIdProp] = {});
          let id = lock[cursorLockIdProp];
          (this.cursorLock || (this.cursorLock = new Map()),
            "auto" == cursor ? this.cursorLock.delete(id) : this.cursorLock.set(id, cursor));
        }
        return (
          this.cursorLock &&
            "auto" == cursor &&
            this.cursorLock.forEach((v) => {
              cursor = v;
            }),
          this.css("cursor", cursor),
          this
        );
      }
    }),
    ($.fn.classList = function () {
      return this.div.classList;
    }),
    ($.fn.clsx = function (...args) {
      for (var tmp, x, i = 0, str = "", len = args.length; i < len; i++)
        (tmp = args[i]) && (x = clsxToVal(tmp)) && (str && (str += " "), (str += x));
      return (str.length && this.div.classList.add(...str.split(/\s+/).filter(Boolean)), this);
    }),
    ($.fn.goob = function (styles) {
      let _styles;
      return (
        (_styles = "string" == typeof styles ? goober.css`${styles}` : goober.css(styles)),
        (this.goobClass = _styles),
        this.div.classList.add(_styles),
        this
      );
    }),
    ($.fn.glob = function (styles) {
      let key = styles.replace("\n", "").slice(0, 100);
      (goober.globbed || (goober.globbed = {}),
        goober.globbed[key] || (goober.glob(styles), (goober.globbed[key] = 1)));
    }),
    ($.fn.href = function (str) {
      return (this.attr("href", str), this);
    }),
    ($.fn.target = function (str) {
      return (this.attr("target", str), this);
    }),
    ($.fn.ariaLabel = function (str) {
      return (this.attr("aria-label", str), this);
    }),
    ($.fn.alt = function (str) {
      return (this.attr("alt", str), this);
    }),
    ($.fn.src = function (str) {
      return (this.attr("src", str && Assets.getPath(str)), this);
    }),
    ($.fn.display = function (bool) {
      bool ? $this.show() : $this.hide();
    }),
    ($.fn.type = function (str) {
      return (this.attr("type", str), this);
    }),
    ($.fn.id = function (str) {
      return (this.attr("id", str), this);
    }),
    ($.fn.htmlFor = function (str) {
      return (this.attr("for", str), this);
    }),
    ($.fn.ariaLabelledBy = function (str) {
      return (this.attr("aria-labelledby", str), this);
    }),
    ($.fn.checked = function (bool) {
      return (this.attr("checked", bool), this);
    }),
    ($.fn.min = function (num) {
      return (this.attr("min", num), this);
    }),
    ($.fn.max = function (num) {
      return (this.attr("max", num), this);
    }),
    ($.fn.step = function (num) {
      return (this.attr("step", num), this);
    }),
    ($.fn.value = function (any) {
      return (this.attr("value", any), this);
    }),
    ($.fn.title = function (str) {
      return (this.attr("title", str), this);
    }),
    ($.fn.minlength = function (num) {
      return (this.attr("minlength", num), this);
    }),
    ($.fn.maxlength = function (num) {
      return (this.attr("maxlength", num), this);
    }),
    ($.fn.rows = function (num) {
      return (this.attr("rows", num), this);
    }),
    ($.fn.readonly = function (bool) {
      return (this.attr("readonly", bool), this);
    }));
})();
