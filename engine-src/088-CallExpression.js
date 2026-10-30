(function () {
  var windowsPointer = !!window.MSGesture,
    translateEvent = function (evt) {
      if (windowsPointer)
        switch (evt) {
          case "touchstart":
            return "pointerdown";
          case "touchmove":
            return "MSGestureChange";
          case "touchend":
            return "pointerup";
        }
      return evt;
    },
    convertTouchEvent = function (e) {
      var touchEvent = { x: 0, y: 0 };
      if (e.windowsPointer) return e;
      if (!e) return touchEvent;
      if (
        (e.touches || e.changedTouches
          ? e.touches.length
            ? ((touchEvent.x = e.touches[0].clientX), (touchEvent.y = e.touches[0].clientY))
            : ((touchEvent.x = e.changedTouches[0].clientX),
              (touchEvent.y = e.changedTouches[0].clientY))
          : ((touchEvent.x = e.clientX), (touchEvent.y = e.clientY)),
        Mobile.ScreenLock &&
          Mobile.ScreenLock.isActive &&
          Mobile.orientationSet &&
          Mobile.orientation !== Mobile.orientationSet)
      ) {
        if (90 == window.orientation || 0 === window.orientation) {
          var x = touchEvent.y;
          ((touchEvent.y = touchEvent.x), (touchEvent.x = Stage.width - x));
        }
        if (-90 == window.orientation || 180 === window.orientation) {
          var y = touchEvent.x;
          ((touchEvent.x = touchEvent.y), (touchEvent.y = Stage.height - y));
        }
      }
      return touchEvent;
    };
  function addSharedEventListener(_this, unique, evt, callback, fn, options) {
    _this._events = _this._events || {};
    let key = `${unique}_${evt}`;
    ((_this._events[key] = _this._events[key] || {
      options: options,
      destroy: addTrackedEventListener(_this, evt, fn, options),
      callbacks: [],
    }),
      _this._events[key].callbacks.push({ callback: callback, target: _this.div }));
  }
  function callSharedEventListenerCallbacks(_this, unique, evt, e) {
    let { callbacks: callbacks } = _this._events[`${unique}_${evt}`];
    for (let i = 0; i < callbacks.length; i++) {
      let { callback: callback, target: target } = callbacks[i];
      callback && target == e.currentTarget && callback(e);
    }
  }
  function addTrackedEventListener(_this, evt, callback, options) {
    ((evt = translateEvent(evt)), (_this._cleanups = _this._cleanups || new Set()));
    let cleanup = () => {
      (_this.div.removeEventListener(evt, callback, options), _this._cleanups.delete(cleanup));
    };
    return (
      _this._cleanups.add(cleanup),
      _this.div.addEventListener(evt, callback, options),
      cleanup
    );
  }
  (($.fn.click = function (callback) {
    var _this = this;
    return (
      addSharedEventListener(
        _this,
        "click",
        "click",
        callback,
        function click(e) {
          return (
            !!_this.div &&
            !Mouse._preventClicks &&
            ((e.object = "hit" == _this.div.className ? _this.parent() : _this),
            (e.action = "click"),
            callSharedEventListenerCallbacks(_this, "click", "click", e),
            void (Mouse.autoPreventClicks && Mouse.preventClicks()))
          );
        },
        !0,
      ),
      (this.div.style.cursor = "pointer"),
      this
    );
  }),
    ($.fn.hover = function (callback) {
      var _time,
        _this = this,
        _over = !1;
      function hover(e) {
        if (!_this.div) return !1;
        var time = performance.now(),
          original = e.toElement || e.relatedTarget;
        if (_time && time - _time < 5) return ((_time = time), !1);
        switch (
          ((_time = time),
          (e.object = "hit" == _this.div.className ? _this.parent() : _this),
          e.type)
        ) {
          case "mouseout":
          case "mouseleave":
            e.action = "out";
            break;
          default:
            e.action = "over";
        }
        if (_over) {
          if (Mouse._preventClicks) return !1;
          if ("over" == e.action) return !1;
          if ("out" == e.action && isAChild(_this.div, original)) return !1;
          _over = !1;
        } else {
          if ("out" == e.action) return !1;
          _over = !0;
        }
        callSharedEventListenerCallbacks(_this, "hover", "mouseover", e);
      }
      function isAChild(div, object) {
        for (var len = div.children.length - 1, i = len; i > -1; i--)
          if (object == div.children[i]) return !0;
        for (i = len; i > -1; i--) if (isAChild(div.children[i], object)) return !0;
      }
      return (
        addSharedEventListener(_this, "hover", "mouseover", callback, hover, !0),
        addSharedEventListener(_this, "hover", "mouseout", callback, hover, !0),
        this
      );
    }),
    ($.fn.press = function (callback) {
      var _this = this;
      function press(action, e) {
        if (!_this.div) return !1;
        ((e.object = "hit" == _this.div.className ? _this.parent() : _this),
          (e.action = action),
          callback && callback(e));
      }
      return (
        this.bind("touchstart", (e) => press("down", e), !0),
        this.bind("touchend", (e) => press("up", e), !0),
        this
      );
    }),
    ($.fn.bind = function (evt, callback) {
      var _this = this;
      if (windowsPointer && this == __window) return Stage.bind(evt, callback);
      "touchstart" == evt
        ? Device.mobile ||
          (Device.touchCapable ? this.bind("mousedown", callback) : (evt = "mousedown"))
        : "touchmove" == evt
          ? (Device.mobile ||
              (Device.touchCapable ? this.bind("mousemove", callback) : (evt = "mousemove")),
            windowsPointer &&
              !this.div.msGesture &&
              ((this.div.msGesture = new MSGesture()), (this.div.msGesture.target = this.div)))
          : "touchend" == evt &&
            (Device.mobile ||
              (Device.touchCapable ? this.bind("mouseup", callback) : (evt = "mouseup")));
      var target = this.div;
      return (
        addSharedEventListener(
          _this,
          "bind",
          evt,
          callback,
          function touchEvent(e) {
            windowsPointer &&
              target.msGesture &&
              "touchstart" == evt &&
              target.msGesture.addPointer(e.pointerId);
            var touch = convertTouchEvent(e);
            if (windowsPointer) {
              var windowsEvt = e;
              (((e = {}).preventDefault = () => windowsEvt.preventDefault()),
                (e.stopPropagation = () => windowsEvt.stopPropagation()),
                (e.x = Number(windowsEvt.clientX)),
                (e.y = Number(windowsEvt.clientY)),
                (e.target = windowsEvt.target),
                (e.currentTarget = windowsEvt.currentTarget),
                (e.path = []));
              for (var node = e.target; node;)
                (e.path.push(node), (node = node.parentElement || null));
              e.windowsPointer = !0;
            } else ((e.x = touch.x), (e.y = touch.y));
            callSharedEventListenerCallbacks(_this, "bind", evt, e);
          },
          { capture: !0, passive: !1 },
        ),
        this
      );
    }),
    ($.fn.unbind = function (evt, callback) {
      return windowsPointer && this == __window
        ? Stage.unbind(evt, callback)
        : ("touchstart" == evt
            ? Device.mobile ||
              (Device.touchCapable ? this.unbind("mousedown", callback) : (evt = "mousedown"))
            : "touchmove" == evt
              ? Device.mobile ||
                (Device.touchCapable ? this.unbind("mousemove", callback) : (evt = "mousemove"))
              : "touchend" == evt &&
                (Device.mobile ||
                  (Device.touchCapable ? this.unbind("mouseup", callback) : (evt = "mouseup"))),
          (function removeSharedEventListener(_this, unique, evt, callback) {
            if (!_this._events) return;
            let key = `${unique}_${evt}`,
              binding = _this._events[key];
            if (binding) {
              let { callbacks: callbacks } = binding;
              for (let i = 0; i < callbacks.length; i++)
                if (callbacks[i].callback === callback) {
                  callbacks.splice(i, 1);
                  break;
                }
              callbacks.length || (binding.destroy(), (_this._events[key] = null));
            }
          })(this, "bind", evt, callback),
          this);
    }),
    ($.fn.interact = function (overCallback, clickCallback, seoLink, seoText, zIndex, options) {
      const position = getComputedStyle(this.div).position;
      if (((position && "static" !== position) || this.css({ position: "relative" }), !this.hit)) {
        ("object" == typeof arguments[arguments.length - 1] &&
          ((options = arguments[arguments.length - 1]),
          ([overCallback, clickCallback, seoLink, seoText, zIndex] = Array.prototype.slice.call(
            arguments,
            0,
            -1,
          )),
          options.overCallback && (overCallback = options.overCallback),
          options.clickCallback && (clickCallback = options.clickCallback),
          options.seoLink && (seoLink = options.seoLink),
          options.seoText && (seoText = options.seoText),
          options.zIndex && (zIndex = options.zIndex)),
          options || (options = {}),
          (this.hit = $(".hit", seoLink ? "a" : void 0)),
          this.hit.css({
            width: "100%",
            height: "100%",
            zIndex: zIndex || 99999,
            top: 0,
            left: 0,
            position: "absolute",
          }),
          this.add(this.hit));
        var _this = this;
        (seoLink &&
          (this.hit.attr(
            "href",
            "#" === seoLink || seoLink.includes("mailto:") ? seoLink : Hydra.absolutePath(seoLink),
          ),
          this.hit.text(seoText || this.div.textContent),
          this.hit.css({ fontSize: 0 }),
          this.hit.accessible(),
          "function" == typeof overCallback &&
            ((this.hit.div.onfocus = (_) => overCallback({ action: "over", object: this })),
            (this.hit.div.onblur = (_) => overCallback({ action: "out", object: this }))),
          (this.hit.div.onclick = (e) => {
            (e.preventDefault(), (e.object = _this), (e.action = "click"), clicked(e));
          })),
          options.role &&
            (this.hit.attr("role", options.role),
            "button" === options.role &&
              (this.hit.div.onkeydown = (e) => {
                switch (e.key) {
                  case " ":
                  case "Spacebar":
                    (e.preventDefault(),
                      e.stopPropagation(),
                      (e.object = _this),
                      (e.action = "click"),
                      clicked(e));
                }
              })));
      }
      let time = Render.TIME;
      function clicked(e) {
        const timeout = options.clickTimeout ?? 250;
        (clickCallback && Render.TIME - time > timeout && clickCallback(e), (time = Render.TIME));
      }
      Device.mobile
        ? this.hit.touchClick(overCallback, clicked)
        : this.hit.hover(overCallback).click(clicked);
    }),
    ($.fn.clearInteract = function () {
      this.hit && (this.hit = this.hit.destroy());
    }),
    ($.fn.disableInteract = function () {
      this.hit && this.hit.css({ pointerEvents: "none" });
    }),
    ($.fn.enableInteract = function () {
      this.hit && this.hit.css({ pointerEvents: "auto" });
    }),
    ($.fn.clearBind = function () {
      this._cleanups &&
        (this._cleanups.forEach((cleanup) => cleanup()),
        (this._cleanups = null),
        (this._events = null));
    }),
    ($.fn.touchSwipe = function (callback, distance) {
      if (!window.addEventListener) return this;
      var _startX,
        _startY,
        _removeTouchMove,
        _this = this,
        _distance = distance || 75,
        _moving = !1,
        _move = {};
      function touchMove(e) {
        if (!_this.div) return !1;
        if (_moving) {
          var touch = convertTouchEvent(e),
            dx = _startX - touch.x,
            dy = _startY - touch.y;
          ((_move.direction = null),
            (_move.moving = null),
            (_move.x = null),
            (_move.y = null),
            (_move.evt = e),
            Math.abs(dx) >= _distance
              ? (touchEnd(), (_move.direction = dx > 0 ? "left" : "right"))
              : Math.abs(dy) >= _distance
                ? (touchEnd(), (_move.direction = dy > 0 ? "up" : "down"))
                : ((_move.moving = !0), (_move.x = dx), (_move.y = dy)),
            callback && callback(_move, e));
        }
      }
      function touchEnd(e) {
        if (!_this.div) return !1;
        ((_startX = _startY = _moving = !1),
          _removeTouchMove && (_removeTouchMove(), (_removeTouchMove = null)));
      }
      return (
        Device.mobile &&
          (addTrackedEventListener(
            _this,
            "touchstart",
            function touchStart(e) {
              var touch = convertTouchEvent(e);
              if (!_this.div) return !1;
              1 == e.touches.length &&
                ((_startX = touch.x),
                (_startY = touch.y),
                (_moving = !0),
                (_removeTouchMove = addTrackedEventListener(_this, "touchmove", touchMove, {
                  passive: !0,
                })));
            },
            { passive: !0 },
          ),
          addTrackedEventListener(_this, "touchend", touchEnd, { passive: !0 }),
          addTrackedEventListener(_this, "touchcancel", touchEnd, { passive: !0 })),
        this
      );
    }),
    ($.fn.touchClick = function (hover, click) {
      if (!window.addEventListener) return this;
      var _time,
        _move,
        _this = this,
        _start = {},
        _touch = {};
      function setTouch(e) {
        var touch = convertTouchEvent(e);
        ((e.touchX = touch.x), (e.touchY = touch.y), (_start.x = e.touchX), (_start.y = e.touchY));
      }
      return (
        Device.mobile &&
          (addTrackedEventListener(
            _this,
            "touchstart",
            function touchStart(e) {
              if (!_this.div) return !1;
              ((_time = performance.now()),
                (e.action = "over"),
                (e.object = "hit" == _this.div.className ? _this.parent() : _this),
                setTouch(e),
                hover && !_move && hover(e));
            },
            { passive: !0 },
          ),
          addTrackedEventListener(
            _this,
            "touchend",
            function touchEnd(e) {
              if (!_this.div) return !1;
              var time = performance.now();
              if (
                ((_touch = convertTouchEvent(e)),
                (_move =
                  (function findDistance(p1, p2) {
                    var dx = p2.x - p1.x,
                      dy = p2.y - p1.y;
                    return Math.sqrt(dx * dx + dy * dy);
                  })(_start, _touch) > 25),
                (e.object = "hit" == _this.div.className ? _this.parent() : _this),
                setTouch(e),
                _time && time - _time < 750)
              ) {
                if (Mouse._preventClicks) return !1;
                click &&
                  !_move &&
                  ((e.action = "click"),
                  click && !_move && click(e),
                  Mouse.autoPreventClicks && Mouse.preventClicks());
              }
              hover && ((e.action = "out"), Mouse._preventFire || hover(e));
              _move = !1;
            },
            { passive: !0 },
          )),
        this
      );
    }));
})();
