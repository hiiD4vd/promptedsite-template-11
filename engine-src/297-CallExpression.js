Interaction.Class(
  function Slider(_object, _direction, _config) {
    Inherit(this, Component);
    var _input,
      _values,
      _renderer,
      _side,
      _delta,
      _addInput,
      _axis,
      _views,
      _dragging,
      _lockMove,
      _cacheStart,
      _hitObject,
      _this = this,
      _holdOffset = 0,
      _lastSign = 1;
    function handleArrowNavigation({ code: code }) {
      if (!_this.preventVisible && !_this.preventMovement) {
        switch (code) {
          case "ArrowUp":
          case "ArrowDown":
            break;
          case "ArrowLeft":
            _this.prev();
            break;
          case "ArrowRight":
            _this.next();
        }
        if (_this.useARIAControls)
          switch (code) {
            case "ShiftLeft":
            case "ShiftRight":
              _this.prev();
              break;
            case "Tab":
              _this.next();
          }
      }
    }
    function copyFromTo(o1, o2) {
      _this.interpolate ||
        (void 0 !== o1.x && (o2.x = o1.x),
        void 0 !== o1.y && (o2.y = o1.y),
        void 0 !== o1.z && (o2.z = o1.z));
    }
    function loop(time, clock) {
      if (
        (_this.interpolate &&
          (void 0 !== _values.x && (_object.x = Math.lerp(_values.x, _object.x, _this.interpolate)),
          void 0 !== _values.y && (_object.y = Math.lerp(_values.y, _object.y, _this.interpolate)),
          void 0 !== _values.z && (_object.z = Math.lerp(_values.z, _object.z, _this.interpolate))),
        _this.autoProgress)
      ) {
        !(function doAutoProgress() {
          if (_dragging || _this.preventMovement || _this.preventVisible) return;
          (((_this.interpolate ? _values : _object)[_axis] -=
            _this.autoMultiplier * _this.multiplier),
            !_this.infinite && outOfBounds() && clampWithFriction());
          _this.cssTransitions && _object.stopTween();
          _this.autoRender &&
            _renderer.needsUpdate &&
            (_this.cssTransitions && (_object.pos[_axis] = _object[_axis]), _renderer.update());
        })();
        let currentSlide = Math.round((-_object[_axis] / _this[_side]) * _this.textDir);
        (_this.infinite || Math.clamp(currentSlide, 0, _this.maxSlides - 1),
          currentSlide !== _this.currentSlide &&
            ((_this.currentSlide = currentSlide), onUpdateSlide(_this.currentSlide)));
      }
      !(function getFullElapsed(time, clock) {
        if (!_this.preventVisible && ((_this.elapsed = _object[_axis] / -_this[_side]), _views))
          for (var i = 0; i < _views.length; i++) {
            var view = _views[i],
              pos = _this[_side] * i,
              offset = (_object[_axis] + pos) / _this[_side];
            ((view.sliderOffset = offset),
              view.updatePosition && view.updatePosition(offset, _dragging, time, clock, _delta));
          }
      })(time, clock);
    }
    function tweenObj(_to) {
      var css = _this.cssTransitions;
      if (
        ((_this.needsRender = !0),
        _this.interpolate && void 0 === _values[_axis] && (_values[_axis] = _object[_axis]),
        copyFromTo(_object, _values),
        tween(_values, _to, _this.easeTime, _this.ease)
          .onUpdate(() => {
            (copyFromTo(_values, css ? _object.pos : _object),
              !css && _this.autoRender && _renderer.needsUpdate && _renderer.update(),
              _this.onUpdate && _this.onUpdate(_this.elapsed));
          })
          .onComplete((_) => (_this.needsRender = !1)),
        css)
      ) {
        var cssTo = {};
        ((cssTo[_axis] = _to[_axis]), _object.tween(cssTo, _this.easeTime, _this.ease));
      }
    }
    function incSlide() {
      (_this.currentSlide++,
        _this.repeatable && _this.currentSlide > _this.maxSlides - 1 && (_this.currentSlide = 0),
        !_this.infinite &&
          _this.currentSlide > _this.maxSlides - 1 &&
          (_this.currentSlide = _this.maxSlides - 1),
        onUpdateSlide(_this.currentSlide));
    }
    function decSlide() {
      (_this.currentSlide--,
        _this.repeatable && _this.currentSlide < 0 && (_this.currentSlide = _this.maxSlides - 1),
        !_this.infinite && _this.currentSlide < 0 && (_this.currentSlide = 0),
        onUpdateSlide(_this.currentSlide));
    }
    function outOfBounds() {
      return (
        _this.textDir * _object[_axis] > 0 ||
        (_this.currentSlide == _this.maxSlides - 1 &&
          _this.textDir * _object[_axis] < -_this[_side] * _this.currentSlide * _this.textDir)
      );
    }
    function clampWithFriction() {
      let obj = _this.interpolate ? _values : _object;
      var val = obj[_axis],
        max = -_this[_side] * _this.currentSlide * _this.textDir;
      _this.textDir * val > 0
        ? (obj[_axis] = val * _this.friction)
        : _this.textDir * val < max && (obj[_axis] = max + (val - max) * _this.friction);
    }
    function onUpdateSlide(slide) {
      (_this.events.fire(Interaction.Slider.UPDATE, { slide: slide }), (_this.state.slide = slide));
    }
    function inputUpdate(e, delta = _input.move, override) {
      if (
        (!Device.mobile && !_this.desktopDrag) ||
        (!_dragging && !override) ||
        _this.preventMovement ||
        _this.preventVisible
      )
        return;
      (((_this.interpolate ? _values : _object)[_axis] =
        -_this[_side] * _this.currentSlide + delta[_axis] * _this.multiplier + _holdOffset),
        !_this.infinite && outOfBounds() && clampWithFriction(),
        _this.cssTransitions && _object.stopTween(),
        (e.elapsed = _this.elapsed),
        _this.events.fire(Interaction.MOVE, e, !0),
        _this.events.fire(Interaction.Slider.MOVE, { event: e, delta: delta }, !0),
        _this.autoRender &&
          _renderer.needsUpdate &&
          (_this.cssTransitions && (_object.pos[_axis] = _object[_axis]), _renderer.update()),
        (_delta = delta),
        (_this.delta = delta));
    }
    function lockStart(e) {
      _cacheStart = e;
    }
    function lockMove(e) {
      (Math.abs(_input.move[_axis]) > _lockMove &&
        !_this.flag("overrideLock") &&
        !_this.flag("preventMove") &&
        (inputStart(_cacheStart),
        _this.flag("overrideLock", !0),
        _this.events.fire(Interaction.Slider.OVERRIDE_LOCK, { action: "start" })),
        "x" == _axis
          ? (Math.abs(_input.move.y) > _lockMove || Math.abs(_input.move.z) > _lockMove) &&
            _this.flag("preventMove", !0)
          : "y" == _axis
            ? (Math.abs(_input.move.x) > _lockMove || Math.abs(_input.move.z) > _lockMove) &&
              _this.flag("preventMove", !0)
            : (Math.abs(_input.move.x) > _lockMove || Math.abs(_input.move.y) > _lockMove) &&
              _this.flag("preventMove", !0));
    }
    function lockEnd(e) {
      ((_cacheStart = null),
        _this.flag("overrideLock") &&
          _this.events.fire(Interaction.Slider.OVERRIDE_LOCK, { action: "end" }),
        _this.flag("overrideLock", !1),
        _this.flag("preventMove", !1));
    }
    function checkHit(e) {
      return !_hitObject || _hitObject.interaction.checkObjectHit(_hitObject, e, _config.hitCamera);
    }
    function inputStart(e) {
      (!Device.mobile && !_this.desktopDrag) ||
        ("hit" == e.target.className && 1 != _config.allowHit) ||
        _this.preventMovement ||
        _this.preventVisible ||
        ((_dragging = !0),
        clearTween(_values),
        (_holdOffset = _values[_axis] + _this[_side] * _this.currentSlide || 0),
        Date.now(),
        (_delta = 0),
        (_this.delta = 0),
        (_this.needsRender = !0),
        _this.events.fire(Interaction.Slider.START_INTERACTION, null, !0));
    }
    function inputEnd(_, override) {
      if (
        (Device.mobile || _this.desktopDrag) &&
        (_dragging || override) &&
        !_this.preventMovement &&
        !_this.preventVisible
      ) {
        var velocity,
          target = {},
          delta = _input.delta[_axis];
        if (
          ((0 === delta && 0 !== _input.velocity[_axis]) || (_lastSign = Math.sign(delta)),
          (velocity = _input.velocity[_axis] * _lastSign),
          _this.flickable && Math.abs(velocity) > 1.5)
        ) {
          let flick = (Math.log(Math.abs(velocity)) / Math.log(2)) * Math.sign(velocity),
            currentSlide = Math.round((-(_object[_axis] + flick) / _this[_side]) * _this.textDir);
          (_this.infinite || Math.clamp(currentSlide, 0, _this.maxSlides - 1),
            currentSlide !== _this.currentSlide &&
              ((_this.currentSlide = currentSlide), onUpdateSlide(_this.currentSlide)));
        } else if (
          window.RenderManager &&
          window.RenderManager.type != window.RenderManager.VR &&
          (Math.abs(velocity) > 0.1 || override)
        ) {
          (override || velocity) * _this.textDir > 0 ? decSlide() : incSlide();
        } else {
          let currentSlide = Math.round((-_object[_axis] / _this[_side]) * _this.textDir);
          (_this.infinite || Math.clamp(currentSlide, 0, _this.maxSlides - 1),
            currentSlide !== _this.currentSlide &&
              ((_this.currentSlide = currentSlide), onUpdateSlide(_this.currentSlide)));
        }
        ((target[_axis] = -_this[_side] * _this.currentSlide * _this.textDir),
          (_dragging = !1),
          tweenObj(target),
          _this.events.fire(Interaction.Slider.END_INTERACTION, null, !0));
      }
    }
    ("object" != typeof _object ||
      _direction ||
      _config ||
      ((_object = (_config = _object).object),
      (_direction = { x: !!_config.x, y: !!_config.y, z: !!_config.z }),
      (_config.desktopDrag = "true" === _config.desktopDrag || !0 === _config.desktopDrag),
      (_config.useKeyboard = "true" === _config.useKeyboard || !0 === _config.useKeyboard),
      (_config.useARIAControls =
        "true" === _config.useARIAControls || !0 === _config.useARIAControls),
      (_config.autoResizing = "true" === _config.autoResizing || !0 === _config.autoResizing),
      (_config.slideObject = _config.slideObject || !1)),
      (this.autoRender = !0),
      (this.autoProgress = !1),
      (this.autoMultiplier = 0.5),
      (this.currentSlide = 0),
      (this.maxSlides = _config.slides),
      (this.width = _config.width),
      (this.height = _config.height),
      (this.gap = _config.gap),
      (this.snapPoint = 0.3),
      (this.ease = "easeOutCubic"),
      (this.easeTime = 500),
      (this.friction = 0.3),
      (this.infinite = !1),
      (this.desktopDrag = "boolean" != typeof _config.desktopDrag || _config.desktopDrag),
      (this.useKeyboard = "boolean" != typeof _config.useKeyboard || _config.useKeyboard),
      (this.useARIAControls =
        "boolean" == typeof _config.useARIAControls && _config.useARIAControls),
      (this.preventMovement = !1),
      (this.cssTransitions = !1),
      (this.multiplier = 1),
      (this.elapsed = 0),
      (this.interpolate = !1),
      (this.textDir = Interaction.Slider.LTR),
      (this.autoResizing = "boolean" == typeof _config.autoResizing && _config.autoResizing),
      (this.slideObject = _config.slideObject),
      (this.delta = 0),
      (this.flickable = !1),
      (this.state = AppState.createLocal()),
      (function initHelpers() {
        let object;
        (window.RenderManager && window.RenderManager?.type == window.RenderManager.VR
          ? (object = _config.vrHit || _config.hit || _object)
          : ((object = _config.hit || _object),
            window.GLUIObject &&
              object instanceof window.GLUIObject &&
              ((_hitObject = object), (object = Stage))),
          (_input = GestureManager.add(_this, object, checkHit, {
            joystick: !0,
            hitCamera: _config.hitCamera,
          })),
          _this.events.sub(_input, Interaction.MOVE, inputUpdate),
          _this.events.sub(_input, Interaction.START, inputStart),
          _this.events.sub(_input, Interaction.END, inputEnd),
          _this.useKeyboard && _this.events.sub(Keyboard.DOWN, handleArrowNavigation),
          (_this.input = _input),
          (_values = {}),
          (_renderer = _config.renderer || _this.initClass(Interaction.Renderer, _object)),
          _this.autoResizing &&
            (function setupResizeObserver() {
              if (!(_object || (_this.slideObject && _this.slideObject.div)))
                return console.warn(
                  "Couldn't setup ResizeObserver on Slider.js, missing div to observer.",
                );
              let domObj = _object.div;
              _this.slideObject && _this.slideObject.div && (domObj = _this.slideObject.div);
              const resizeObserver = new ResizeObserver((entries) => {
                let slideSize = (entries[0].contentRect || entries[0].contentBoxSize)[_side];
                ((_this[_side] = slideSize), _this.moveTo(_this.currentSlide));
              });
              (resizeObserver.observe(domObj),
                _this._bindOnDestroy(() => {
                  resizeObserver.unobserve(domObj);
                }));
            })());
      })(),
      (function initDirection() {
        ((_side = _direction.x ? "width" : _direction.y ? "height" : "gap"),
          (_axis = _direction.x ? "x" : _direction.y ? "y" : "z"),
          (_values[_axis] = -_this[_side] * _this.currentSlide * _this.textDir));
      })(),
      _this.startRender(loop),
      this.set("views", function (v) {
        _views = v;
      }),
      this.set("lockMove", function (v) {
        _lockMove = v;
      }),
      (this.lockDirection = function (move = 50) {
        ((_lockMove = move),
          _this.events.unsub(_input, Interaction.START, inputStart),
          _this.events.sub(_input, Interaction.START, lockStart),
          _this.events.sub(_input, Interaction.MOVE, lockMove),
          _this.events.sub(_input, Interaction.END, lockEnd));
      }),
      (this.moveTo = function (slide) {
        (_this.infinite ||
          (slide < 0 && (slide = 0), slide >= _this.maxSlides && (slide = _this.maxSlides - 1)),
          (_this.currentSlide = slide));
        var target = {};
        ((target[_axis] = -_this[_side] * _this.currentSlide * _this.textDir),
          tweenObj(target),
          onUpdateSlide(_this.currentSlide));
      }),
      (this.jumpTo = function (slide) {
        (_this.infinite ||
          (slide < 0 && (slide = 0), slide >= _this.maxSlides && (slide = _this.maxSlides - 1)),
          (_this.currentSlide = slide),
          (_values[_axis] = -_this[_side] * _this.currentSlide * _this.textDir),
          copyFromTo(_values, _object),
          _this.autoRender &&
            _renderer.needsUpdate &&
            ((_object.pos[_axis] = _object[_axis]), _renderer.update()),
          onUpdateSlide(_this.currentSlide));
      }),
      (this.next = function () {
        -1 === _this.textDir ? decSlide() : incSlide();
        var target = {};
        ((target[_axis] = -_this[_side] * _this.currentSlide * _this.textDir), tweenObj(target));
      }),
      (this.prev = function () {
        -1 === _this.textDir ? incSlide() : decSlide();
        var target = {};
        ((target[_axis] = -_this[_side] * _this.currentSlide * _this.textDir), tweenObj(target));
      }),
      (this.clearTween = function () {
        clearTween(_values);
      }),
      (this.onInvisible = function () {
        _this.preventVisible = !0;
      }),
      (this.onVisible = function () {
        _this.preventVisible = !1;
      }),
      (this.addInput = function (x = 0, y = 0) {
        if (
          !_this.flag("preventInput") &&
          (_addInput || ((_addInput = {}).delta = {}),
          (_addInput.delta.x = x),
          (_addInput.delta.y = y),
          _addInput.total || (_addInput.total = 0),
          inputUpdate(_addInput, _addInput.delta, !0),
          Math.abs(_object[_axis]) > 0.2 * Math.abs(_this[_side]))
        ) {
          let val = Math.abs(y) > Math.abs(x) ? y : x;
          (_this.moveTo(_this.currentSlide + Math.sign(val)),
            _this.flag("preventInput", !0, _this.easeTime));
        }
      }),
      (this.isDragging = function () {
        return _dragging;
      }));
  },
  (_) => {
    ((Interaction.Slider.OVERRIDE_LOCK = "slider_override_lock"),
      (Interaction.Slider.UPDATE = "slider_update"),
      (Interaction.Slider.MOVE = "slider_move"),
      (Interaction.Slider.START_INTERACTION = "slider_start_interaction"),
      (Interaction.Slider.END_INTERACTION = "slider_end_interaction"),
      (Interaction.Slider.LTR = 1),
      (Interaction.Slider.RTL = -1));
  },
);
