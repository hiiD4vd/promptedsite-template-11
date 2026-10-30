Class(
  function Scroll(_object, _params) {
    Inherit(this, Component);
    const _this = this,
      PROHIBITED_ELEMENTS = ["prevent_interactionScroll"];
    ((this.x = 0),
      (this.y = 0),
      (this.max = { x: 0, y: 0 }),
      (this.delta = { x: 0, y: 0 }),
      (this.enabled = !0),
      (_this.bounds = null));
    const _scrollTarget = { x: 0, y: 0 },
      _scrollInertia = { x: 0, y: 0 };
    let _axes = ["x", "y"];
    var _lastDelta,
      _deltaChange = 0;
    function checkIfProhibited(element) {
      let el = element;
      for (; el;) {
        if (el.classList)
          for (let i = 0; i < PROHIBITED_ELEMENTS.length; i++)
            if (el.classList.contains(PROHIBITED_ELEMENTS[i])) return !0;
        el = el.parentNode;
      }
      return !1;
    }
    function loop() {
      (_this.object &&
        ((Math.round(_this.object.div.scrollLeft) === Math.round(_this.x) &&
          Math.round(_this.object.div.scrollTop) === Math.round(_this.y)) ||
          ((_this.x = _scrollTarget.x = _this.object.div.scrollLeft),
          (_this.y = _scrollTarget.y = _this.object.div.scrollTop),
          stopInertia())),
        _axes.forEach((axis) => {
          _this.isInertia &&
            ((_scrollInertia[axis] *= 0.9), (_scrollTarget[axis] += _scrollInertia[axis]));
          let scale = _this.scale;
          (Device.mobile && (scale = _this.touchScale),
            _this.limit && (_scrollTarget[axis] = Math.max(_scrollTarget[axis], 0)),
            _this.limit &&
              (_scrollTarget[axis] = Math.min(_scrollTarget[axis], _this.max[axis] / scale)),
            (_this.delta[axis] = _this.flag("block")
              ? 0
              : 0.5 * (_scrollTarget[axis] * scale - _this[axis])),
            (_this[axis] += _this.delta[axis]),
            Math.abs(_this.delta[axis]) < 0.01 && (_this.delta[axis] = 0),
            Math.abs(_this[axis]) < 0.001 && (_this[axis] = 0),
            _this.flag("block") &&
              ((_scrollTarget[axis] = 0), (_this.delta[axis] = 0), (_this[axis] = 0)),
            _this.object &&
              ("x" == axis && (_this.object.div.scrollLeft = Math.round(_this.x)),
              "y" == axis && (_this.object.div.scrollTop = Math.round(_this.y))));
        }));
    }
    function stopInertia() {
      ((_this.isInertia = !1), clearTween(_scrollTarget));
    }
    function edgeScroll(e) {
      let element = document.elementFromPoint(
        Math.clamp(Mouse.x, 0, Stage.width),
        Math.clamp(Mouse.y, 0, Stage.height),
      );
      (element && checkIfProhibited(element)) ||
        (_params.lockMouseX && Mouse.x > Stage.width) ||
        ("touch" === e.pointerType &&
          _this.enabled &&
          (e.preventDefault && e.preventDefault(),
          _axes.forEach((axis) => {
            let dir = axis.toUpperCase(),
              delta = `offset${dir}`,
              diff = (_this[`ieDelta${dir}`] || e[delta]) - e[delta];
            ((_scrollTarget[axis] += diff),
              (_scrollInertia[axis] = diff),
              (_this.isInertia = !0),
              (_this[`ieDelta${dir}`] = e[delta]));
          }),
          _this.onUpdate && _this.onUpdate(),
          _this.events.fire(Events.UPDATE, _scrollInertia)));
    }
    function edgeScrollEnd() {
      ((_this.ieDeltaX = !1), (_this.ieDeltaY = !1));
    }
    function scroll(e) {
      let element = document.elementFromPoint(
        Math.clamp(Mouse.x, 0, Stage.width),
        Math.clamp(Mouse.y, 0, Stage.height),
      );
      if (element && checkIfProhibited(element)) return;
      if (_params.lockMouseX && Mouse.x > Stage.width) return;
      if (!_this.enabled) return;
      if (!checkBounds(e)) return;
      if (
        (_this.object && _this.limit && e.preventDefault && e.preventDefault(), !_this.mouseWheel)
      )
        return;
      stopInertia();
      let newDelta = 0;
      (_axes.forEach((axis) => {
        let delta = "delta" + axis.toUpperCase();
        if ("mac" == Device.system.os) {
          if ("firefox" == Device.system.browser)
            return 1 === e.deltaMode
              ? ((_scrollTarget[axis] += 4 * e[delta]),
                (_scrollInertia[axis] = 4 * e[delta]),
                (_this.isInertia = !0),
                void (newDelta = _scrollInertia[axis]))
              : void (_scrollTarget[axis] += e[delta]);
          if (Device.system.browser.includes(["chrome", "safari"]))
            return (
              (_scrollTarget[axis] += 0.33 * e[delta]),
              (_scrollInertia[axis] = 0.33 * e[delta]),
              (_this.isInertia = !0),
              void (newDelta = _scrollInertia[axis])
            );
        }
        if ("windows" == Device.system.os) {
          if ("firefox" == Device.system.browser && 1 === e.deltaMode)
            return (
              (_scrollTarget[axis] += 10 * e[delta]),
              (_scrollInertia[axis] = 10 * e[delta]),
              (_this.isInertia = !0),
              void (newDelta = _scrollInertia[axis])
            );
          if (Device.system.browser.includes(["chrome"])) {
            let s = 0.25;
            return (
              (_scrollTarget[axis] += e[delta] * s),
              (_scrollInertia[axis] = e[delta] * s),
              (_this.isInertia = !0),
              void (newDelta = _scrollInertia[axis])
            );
          }
          if ("ie" == Device.system.browser)
            return (
              (_scrollTarget[axis] += e[delta]),
              (_scrollInertia[axis] = e[delta]),
              (_this.isInertia = !0),
              void (newDelta = _scrollInertia[axis])
            );
        }
        ((_scrollTarget[axis] += e[delta]), (newDelta = _scrollInertia[axis]));
      }),
        (newDelta = Math.abs(newDelta)),
        newDelta != _lastDelta && _deltaChange++,
        _this.flag("hardBlock") ||
          (_deltaChange > 3
            ? newDelta > _lastDelta && _this.flag("block", !1)
            : newDelta >= _lastDelta && _this.flag("block", !1)),
        (_lastDelta = newDelta),
        _this.onUpdate && _this.onUpdate(),
        _this.events.fire(Events.UPDATE, _scrollInertia),
        _this.events.fire(Scroll.EVENT, e));
    }
    function down(e) {
      if (!_this.enabled) return;
      if (!checkBounds(e)) return;
      let element = document.elementFromPoint(
        Math.clamp(e.x || 0, 0, Stage.width),
        Math.clamp(e.y || 0, 0, Stage.height),
      );
      (element && checkIfProhibited(element)) || (stopInertia(), (_this.isDragging = !0));
    }
    function drag(e) {
      if (!_this.enabled) return;
      if (!checkBounds(e)) return;
      let element = document.elementFromPoint(
        Math.clamp(e.x || 0, 0, Stage.width),
        Math.clamp(e.y || 0, 0, Stage.height),
      );
      (element && checkIfProhibited(element)) ||
        (_axes.forEach((axis) => {
          let newDelta = Math.abs(Mouse.delta[axis]);
          (_this.flag("hardBlock") || (newDelta > _lastDelta && _this.flag("block", !1)),
            (_lastDelta = newDelta),
            (_scrollTarget[axis] -= Mouse.delta[axis]));
        }),
        _this.events.fire(Events.UPDATE));
    }
    function up(e) {
      if (!_this.enabled || _this.preventInertia) return;
      if (!checkBounds(e)) return;
      let element = document.elementFromPoint(
        Math.clamp(e.x || 0, 0, Stage.width),
        Math.clamp(e.y || 0, 0, Stage.height),
      );
      if (element && checkIfProhibited(element)) return;
      const m = "android" == Device.system.os ? 35 : 25,
        obj = {};
      (_axes.forEach((axis) => {
        obj[axis] = _scrollTarget[axis] - Mouse.delta[axis] * m;
      }),
        tween(_scrollTarget, obj, 2500, "easeOutQuint"),
        (_this.isDragging = !1));
    }
    function onKeyDown({ key: key, shiftKey: shiftKey }) {
      if (!_this.enabled) return;
      let dst = null;
      switch (key) {
        case "Up":
        case "ArrowUp":
          dst = _scrollTarget.y - 150;
          break;
        case "Down":
        case "ArrowDown":
          dst = _scrollTarget.y + 150;
          break;
        case "Home":
          dst = 0;
          break;
        case "End":
          dst = _this.max.y;
          break;
        case "PageUp":
          dst = _scrollTarget.y - Stage.height;
          break;
        case "PageDown":
          dst = _scrollTarget.y + Stage.height;
          break;
        case " ":
        case "Spacebar":
          onKeyDown(shiftKey ? { key: "PageUp" } : { key: "PageDown" });
      }
      null !== dst && _this.scrollTo(dst, "y", 400, "easeOutCubic");
    }
    function resize() {
      if (!_this.enabled) return;
      if ((stopInertia(), !_this.object)) return;
      const p = {};
      (Device.mobile &&
        _axes.forEach(
          (axis) => (p[axis] = _this.max[axis] ? _scrollTarget[axis] / _this.max[axis] : 0),
        ),
        void 0 === _params.height &&
          (_this.max.y = _this.object.div.scrollHeight - _this.object.div.clientHeight),
        void 0 === _params.width &&
          (_this.max.x = _this.object.div.scrollWidth - _this.object.div.clientWidth),
        Device.mobile &&
          _axes.forEach((axis) => (_this[axis] = _scrollTarget[axis] = p[axis] * _this.max[axis])));
    }
    function checkBounds(e) {
      return (
        !_this.bounds ||
        !(
          e.x / Stage.width > _this.bounds.x.y ||
          e.x / Stage.width < _this.bounds.x.x ||
          e.y / Stage.height > _this.bounds.y.y ||
          e.y / Stage.height < _this.bounds.y.x
        )
      );
    }
    (!(function initParams() {
      ((_object && _object.div) || ((_params = _object), (_object = null)),
        _params || (_params = {}),
        (_this.object = _object),
        (_this.hitObject = _params.hitObject || _this.object),
        (_this.max.y = _params.height || 0),
        (_this.max.x = _params.width || 0),
        (_this.scale = _params.scale || 1),
        (_this.touchScale = _params.touchScale || 1),
        (_this.isDragging = !1),
        (_this.drag = void 0 !== _params.drag ? _params.drag : !!Device.mobile),
        (_this.mouseWheel = !1 !== _params.mouseWheel),
        (_this.limit = "boolean" == typeof _params.limit && _params.limit),
        (_this.bounds = _params.bounds || null),
        (_this.keyboard = _params.keyboard || !1),
        Array.isArray(_params.axes) && (_axes = _params.axes));
    })(),
      _this.object &&
        (function style() {
          _this.object.css({ overflow: "auto" });
        })(),
      (function addHandlers() {
        if (
          (Device.mobile ||
            ("ie" === Device.system.browser &&
              Device.system.browserVersion >= 17 &&
              (document.body.addEventListener("pointermove", edgeScroll, !0),
              document.body.addEventListener("pointerup", edgeScrollEnd, !0)),
            "ie" == Device.system.browser
              ? document.body.addEventListener("wheel", scroll, !0)
              : __window.bind("wheel", scroll),
            _this.keyboard && _this.events.sub(Keyboard.DOWN, onKeyDown)),
          _this.drag)
        ) {
          _this.hitObject &&
            _this.hitObject.bind("touchstart", (e) => {
              let element = document.elementFromPoint(
                Math.clamp(e.x || 0, 0, Stage.width),
                Math.clamp(e.y || 0, 0, Stage.height),
              );
              (element && checkIfProhibited(element)) || e.preventDefault();
            });
          let input = _this.hitObject ? _this.initClass(Interaction, _this.hitObject) : Mouse.input;
          (_this.events.sub(input, Interaction.START, down),
            _this.events.sub(input, Interaction.DRAG, drag),
            _this.events.sub(input, Interaction.END, up));
        }
        _this.events.sub(Events.RESIZE, resize);
      })(),
      resize(),
      _this.startRender(loop),
      (this.reset = function () {
        return (
          _this.object &&
            _this.object.div &&
            ((_this.object.div.scrollLeft = _this.x = 0),
            (_this.object.div.scrollTop = _this.y = 0)),
          (_scrollTarget.x = _scrollTarget.y = 0),
          (_scrollInertia.x = _scrollInertia.y = 0),
          stopInertia(),
          this
        );
      }),
      (this.onDestroy = function () {
        (__window.unbind("wheel", scroll), _this.events.unsub(Keyboard.DOWN, onKeyDown));
      }),
      (this.resize = resize),
      (this.scrollTo = function (value, axis = "y", time = 800, ease = "easeInOutCubic") {
        let values = {};
        ((values[axis] = value), tween(_scrollTarget, values, time, ease));
      }),
      (this.setTarget = function (value, axis = "y") {
        _scrollTarget[axis] = value;
      }),
      (this.blockUntilNewScroll = function () {
        return (_this.reset(), _this.flag("block", !0), _this.flag("hardBlock", !0, 200), this);
      }),
      (this.stopInertia = stopInertia));
  },
  (_) => {
    var _scroll;
    ((Scroll.EVENT = "scroll_event"),
      (Scroll.createUnlimited = Scroll.getUnlimited =
        function (options) {
          return (_scroll || (_scroll = new Scroll({ limit: !1, drag: Device.mobile })), _scroll);
        }));
  },
);
