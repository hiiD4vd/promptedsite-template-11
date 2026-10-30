Class(
  function Component() {
    if (this.initClass) return;
    Inherit(this, Events);
    const _this = this,
      _setters = {},
      _flags = {},
      _timers = [],
      _loops = [];
    var _onDestroy, _appStateBindings;
    function defineSetter(_this, prop) {
      ((_setters[prop] = {}),
        Object.defineProperty(_this, prop, {
          set: function (v) {
            (_setters[prop] && _setters[prop].s && _setters[prop].s.call(_this, v), (v = null));
          },
          get: function () {
            if (_setters[prop] && _setters[prop].g) return _setters[prop].g.apply(_this);
          },
        }));
    }
    ((this.classes = {}),
      (this.findParent = function (type) {
        let p = _this.parent;
        for (; p;) {
          if (
            (p._cachedName || (p._cachedName = Utils.getConstructorName(p)), p._cachedName == type)
          )
            return p;
          p = p.parent;
        }
      }),
      (this.set = function (prop, callback) {
        (_setters[prop] || defineSetter(this, prop), (_setters[prop].s = callback));
      }),
      (this.get = function (prop, callback) {
        (_setters[prop] || defineSetter(this, prop), (_setters[prop].g = callback));
      }),
      (this.isPlayground = function (name) {
        return (
          !("boolean" != typeof name || !Global.PLAYGROUND) ||
          (Global.PLAYGROUND && Global.PLAYGROUND == (name || Utils.getConstructorName(_this)))
        );
      }),
      (this.initClass = function (clss) {
        if (!clss) throw (console.trace(), "unable to locate class");
        const clssName = Utils.getConstructorName(clss);
        if (
          (Global.RESERVED_CLASSES[clssName] && (clss = Global.RESERVED_HYDRA_CLASSES[clssName]),
          clss.instance)
        )
          return clss.instance();
        const args = [].slice.call(arguments, 1),
          child = Object.create(clss.prototype);
        if (
          ((child.parent = this),
          (child.__afterInitClass = []),
          clss.apply(child, args),
          child.destroy)
        ) {
          const id = Utils.timestamp();
          ((this.classes[id] = child), (this.classes[id].__id = id));
        }
        if (child.element) {
          const last = arguments[arguments.length - 1];
          Array.isArray(last) && 1 == last.length && last[0] instanceof child.element.constructor
            ? last[0].add(child.element)
            : this.element && this.element.add && null !== last && this.element.add(child.element);
        }
        if (child.group) {
          const last = arguments[arguments.length - 1];
          (this.group && null !== last && this.group.add(child.group),
            this.scene && null !== last && this.scene.add(child.group));
        }
        if ("undefined" != typeof Hydra && Hydra.LOCAL) {
          let key = Utils.getConstructorName(child);
          key &&
            (Component.HMR.has(key) || Component.HMR.set(key, []),
            Component.HMR.get(key).push({ ref: child, args: args }));
        }
        return (
          child.__afterInitClass.forEach((callback) => {
            callback();
          }),
          delete child.__afterInitClass,
          child
        );
      }),
      (this.delayedCall = function (callback, time, scaledTime) {
        const timer = Timer.create(
          () => {
            _this && _this.destroy && callback && callback();
          },
          time,
          scaledTime,
        );
        return (_timers.push(timer), _timers.length > 50 && _timers.shift(), timer);
      }),
      (this.clearTimers = function () {
        for (let i = _timers.length - 1; i >= 0; i--) clearTimeout(_timers[i]);
        _timers.length = 0;
      }),
      (this.startRender = function (callback, fps, obj) {
        "number" != typeof fps && ((obj = fps), (fps = void 0));
        for (let i = 0; i < _loops.length; i++) if (_loops[i].callback == callback) return;
        let flagInvisible = (_) => {
            _this._invisible || ((_this._invisible = !0), _this.onInvisible && _this.onInvisible());
          },
          loop = (a, b, c, d) => {
            if (!_this.startRender) return !1;
            let p = _this;
            for (; p;) {
              if (!1 === p.visible) return flagInvisible();
              if (p.group && !1 === p.group.visible) return flagInvisible();
              p = p.parent;
            }
            !1 !== _this._invisible &&
              ((_this._invisible = !1), _this.onVisible && _this.onVisible());
            try {
              callback(a, b, c, d);
            } catch (error) {
              let evt = {
                callback: callback,
                error: error,
                component: _this,
                preventStopRender: !1,
              };
              (Events.emitter._fireEvent(Render.RENDER_CALLBACK_ERROR, evt),
                evt.preventStopRender || _this.stopRender(callback, obj));
            }
            return !0;
          };
        (_loops.push({ callback: callback, loop: loop, obj: obj }),
          obj
            ? obj == RenderManager.NATIVE_FRAMERATE
              ? Render.start(loop, null, !0)
              : RenderManager.schedule(loop, obj)
            : Render.start(loop, fps));
      }),
      (this.onResize = function (callback, callInitial = !0) {
        (callInitial && callback(), this.events.sub(Events.RESIZE, callback));
      }),
      (this.stopRender = function (callback, obj) {
        for (let i = 0; i < _loops.length; i++)
          if (_loops[i].callback == callback) {
            let loop = _loops[i].loop;
            (obj && RenderManager.unschedule(loop, obj), Render.stop(loop), _loops.splice(i, 1));
          }
      }),
      (this.clearRenders = function () {
        for (let i = 0; i < _loops.length; i++) {
          let { loop: loop, obj: obj } = _loops[i];
          obj ? RenderManager.unschedule(loop, obj) : Render.stop(loop);
        }
        _loops.length = 0;
      }),
      (this.wait = function (object, key, callback) {
        const promise = Promise.create();
        let condition, appState;
        if (
          ("string" == typeof object && ((callback = key), (key = object), (object = _this)),
          key?.includes?.("/") && (appState = AppState),
          object.isAppState && (appState = object),
          "number" == typeof object && 1 === arguments.length)
        )
          return (_this.delayedCall(promise.resolve, object), promise);
        if (
          ("function" == typeof object &&
            1 === arguments.length &&
            ((condition = object), (object = _this)),
          "function" == typeof object && "string" == typeof callback)
        ) {
          let _object = object;
          ((object = key), (key = callback), (callback = _object));
        }
        if (
          ((callback = callback || promise.resolve),
          condition ||
            (appState
              ? "!" === key?.charAt?.(0)
                ? ((key = key.slice(1)), (condition = () => !appState.get(key)))
                : (condition = () => !!appState.get(key))
              : "!" === key?.charAt?.(0)
                ? ((key = key.slice(1)),
                  (condition = () =>
                    !(object[key] || ("function" == typeof object.flag && object.flag(key)))))
                : (condition = () =>
                    !!object[key] || !("function" != typeof object.flag || !object.flag(key)))),
          condition())
        )
          callback();
        else {
          let stop;
          if (appState) {
            let binding = _this.bindState(appState, key, test);
            stop = function () {
              binding.destroy();
            };
          } else
            ((stop = function () {
              Render.stop(test);
            }),
              Render.start(test));
          function test() {
            if (!object || !_this.flag || null === object.destroy) return stop(test);
            condition() && (callback(), stop(test));
          }
        }
        return promise;
      }),
      (this.bindState = function (appState, key, ...rest) {
        if (appState.then) return (async () => _this.bindState(await appState, key, ...rest))();
        ("object" != typeof appState ||
          appState.constructor !== Object ||
          appState.isAppState ||
          (appState = AppState.createLocal(appState)),
          _appStateBindings || (_appStateBindings = []));
        let binding = (appState._bind || appState.bind).bind(appState)(key, ...rest);
        return (
          _appStateBindings.push(binding),
          binding._bindOnDestroy(() => {
            _appStateBindings.remove(binding);
          }),
          binding
        );
      }),
      (this.flag = function (name, value, time) {
        if (void 0 === value) return _flags[name];
        {
          _flags[name] = value;
          let timerKey = name + "_timer",
            timer = _flags[timerKey];
          (timer && (clearTimeout(timer), (_flags[timerKey] = null)),
            time &&
              (_flags[timerKey] = this.delayedCall(() => {
                ((_flags[name] = !value), (_flags[timerKey] = null));
              }, time)));
        }
      }),
      (this.destroy = function () {
        (this.removeDispatch && this.removeDispatch(),
          this.onDestroy && this.onDestroy(),
          this.fxDestroy && this.fxDestroy(),
          _onDestroy && (_onDestroy.forEach((cb) => cb()), (_onDestroy = null)));
        for (let key in _setters) delete _setters[key];
        for (let key in _flags) delete _flags[key];
        for (let id in this.classes) {
          var clss = this.classes[id];
          clss && clss.destroy && clss.destroy();
        }
        if (((this.classes = null), Hydra.LOCAL)) {
          let key = Utils.getConstructorName(this),
            array = Component.HMR.get(key);
          array && array.remove(this);
        }
        if (
          (this.clearRenders && this.clearRenders(),
          this.clearTimers && this.clearTimers(),
          this.element &&
            window.GLUI &&
            this.element instanceof GLUIObject &&
            this.element.remove(),
          this.events && (this.events = this.events.destroy()),
          this.parent && this.parent.__destroyChild && this.parent.__destroyChild(this.__id),
          _appStateBindings)
        )
          for (; _appStateBindings.length > 0;)
            _appStateBindings[_appStateBindings.length - 1].destroy?.();
        return Utils.nullObject(this);
      }),
      (this._bindOnDestroy = function (cb) {
        (_onDestroy || (_onDestroy = []), _onDestroy.push(cb));
      }),
      (this.__destroyChild = function (name) {
        delete this.classes[name];
      }),
      (this.navigate = function (route) {
        let p = _this.parent;
        for (; p;) (p.navigate && p.navigate(route), (p = p.parent));
      }));
  },
  (_) => {
    ((Component.HMR = new Map()),
      (Component.HMR_INSTANCE_RELOADED = "Component.HMR_INSTANCE_RELOADED"));
  },
);
