{
  var iGLUI;
  Class(function AppState(_default) {
    ((this.map = new Map()), (this.bindings = new Map()));
    const reservedKeys = ["map", "bindings", "onUpdate", "readonly", "origin"];
    _default && this.setAll(_default);
    const prototype = AppState.prototype;
    void 0 === prototype.set &&
      ((prototype.set = function (key, value, force) {
        const _this = this;
        if (_this.readonly) return console.warn("This AppState is locked and can not make changes");
        (_this.map.set(key, value), _this.onUpdate && _this.onUpdate(key, value));
        let array = _this.bindings.get(key);
        if (array) {
          if (array._updating) return void (array._reentered = !0);
          reenter: for (;;) {
            let len = array.length;
            array._updating = !0;
            for (let i = 0; i < len; i++) array[i]._updating = !0;
            for (let i = 0; i < len; i++) {
              let b = array[i];
              if (b && b.update) {
                if (b._updating) {
                  if ((b.update(key, value, force), (b._updating = !1), array._reentered)) {
                    ((array._reentered = !1), (value = _this.get(key)));
                    continue reenter;
                  }
                  (b.update && array.length === len && array[i] === b) ||
                    ((i = -1), (len = array.length));
                }
              } else (array.splice(i, 1), (i -= 1), (len = array.length));
            }
            break;
          }
          array._updating = !1;
        }
      }),
      (prototype.get = function (key) {
        return this.map.get(key);
      }),
      (prototype.getMap = function () {
        return this.map;
      }),
      (prototype.toJSON = function () {
        return Object.fromEntries(this.map);
      }),
      (prototype.bind = function (keys, ...rest) {
        const _this = this;
        if (!rest.length) return { state: _this, key: keys };
        Array.isArray(keys) || (keys = [keys]);
        const obj = 1 === rest.length ? rest[0] : rest;
        let binding = new StateBinding(keys, obj, this);
        return (
          keys.forEach((key) => {
            _this.bindings.has(key)
              ? _this.bindings.get(key).push(binding)
              : _this.bindings.set(key, [binding]);
            let value = _this.map.get(key);
            void 0 !== value && binding.update(key, value);
          }),
          binding
        );
      }),
      (prototype.createLocal = function (obj) {
        let appState = new AppState(obj);
        return new Proxy(appState, {
          set: (target, property = "", value) => (
            reservedKeys.includes(property)
              ? (appState[property] = value)
              : appState.set(property, value),
            !0
          ),
          get: (target, property) => (target[property] ? target[property] : appState.get(property)),
          has: (target, property) => !!target[property] || target.map.has(property),
          ownKeys: (target) => [...Reflect.ownKeys(target), ...target.map.keys()],
          getOwnPropertyDescriptor(target, property) {
            let descriptor = Object.getOwnPropertyDescriptor(target, property);
            return (
              descriptor ||
              (target.map.has(property)
                ? {
                    value: target.map.get(property),
                    writable: !0,
                    configurable: !0,
                    enumerable: !0,
                  }
                : void 0)
            );
          },
          delete(target, property) {
            Object.hasOwnProperty.call(target, property)
              ? delete target[property]
              : target.map.has(property) && target.map.delete(property);
          },
        });
      }),
      (prototype.setAll = function (obj) {
        const _this = this;
        for (let key in obj)
          Object.prototype.hasOwnProperty.call(obj, key) &&
            !reservedKeys.includes(key) &&
            _this.set(key, obj[key]);
      }),
      (prototype.lock = function () {
        this.readonly = !0;
      }),
      (prototype.unlock = function () {
        this.readonly = !1;
      }),
      (prototype.clearKeysMatching = function (str) {
        let keys = this.map.keys();
        for (let key of keys) key.startsWith(str) && this.map.delete(key);
      }),
      (prototype.isAppState = !0));
  }, "static");
  const unsetValue = "function" == typeof Symbol ? Symbol("unset") : { "@@unset": !0 };
  class StateBinding {
    constructor(_keys, _obj, _ref) {
      if (
        ((this._keys = _keys),
        (this._obj = _obj),
        (this._string = ""),
        (this._oldValue = unsetValue),
        (this._type = ""),
        (this._bindingLookup = ""),
        (this._ref = _ref),
        void 0 === iGLUI && (iGLUI = !!window.GLUI),
        _obj instanceof HTMLElement)
      )
        ("INPUT" == _obj.nodeName ? (this._string = _obj.value) : (this._string = _obj.innerText),
          (this._type = "HTMLElement"));
      else if ("function" == typeof DOMAttribute && _obj instanceof DOMAttribute)
        ((this._string = _obj.value),
          (this._name = _obj.name),
          (this._belongsTo = _obj.belongsTo),
          (this._bindingLookup = _obj.bindingLookup),
          (this._type = "DOMAttribute"));
      else if ("function" == typeof Sprite && _obj instanceof Sprite)
        ((this._string = _obj.id), (this._type = "Sprite"));
      else if (_obj instanceof HydraObject)
        ("input" == _obj._type ? (this._string = _obj.val()) : (this._string = _obj.text()),
          (this._type = "HydraObject"));
      else if (iGLUI && _obj instanceof GLUIText)
        ((this._string = _obj.getTextString()), (this._type = "GLUIText"));
      else {
        if (
          (_obj.createLocal && (this._type = "appState"),
          _obj.onStateChange && (this._type = "class"),
          "function" == typeof _obj && (this._type = "function"),
          Array.isArray(_obj) && _obj.every((el) => "function" == typeof el))
        ) {
          this._type = "piped";
          const lastFunctionInChain = this._obj.pop();
          ((this._operators = this._obj), (this._obj = lastFunctionInChain), (this._count = 0));
        }
        _obj.appStateTemplateString &&
          "string" == typeof _obj.appStateTemplateString &&
          (this._string = _obj.appStateTemplateString);
      }
    }
    parse(key, value) {
      if (!this._string || !this._string.includes("@[")) return value;
      const _this = this;
      let string = this._string;
      return (
        this._keys.forEach((key) => {
          string = string.replace(`@[${key}]`, _this._ref.get(key));
        }),
        string
      );
    }
    async operateOnValue(value) {
      return await this._operators.reduce(async (prev, fn) => {
        const prevResolved = await prev;
        return (await fn)(prevResolved, this._count++, this);
      }, value);
    }
    update(key, value, force) {
      let newValue = this.parse(key, value);
      if (Object.is(newValue, this._oldValue) && (!value || !value.push) && !force) return;
      let oldValue = this._oldValue;
      this._oldValue = newValue;
      try {
        switch (this._type) {
          case "HTMLElement":
            "input" == this._obj._type
              ? (this._obj.value = newValue)
              : (this._obj.innerText = newValue);
            break;
          case "DOMAttribute":
            this._obj.belongsTo.setAttribute(
              this._obj.name,
              this._obj.value.replace(this._obj.bindingLookup, newValue),
            );
            break;
          case "Sprite":
            this._obj.id = newValue;
            break;
          case "HydraObject":
            "input" == this._obj._type ? this._obj.val(newValue) : this._obj.html(newValue);
            break;
          case "GLUIText":
            this._obj.setText(newValue);
            break;
          case "function":
            oldValue !== unsetValue ? this._obj(newValue, oldValue) : this._obj(newValue);
            break;
          case "piped":
            this.operateOnValue(newValue).then(
              (val) => this._obj(val),
              (reject) => null,
            );
            break;
          case "class":
            this._obj.onStateChange(newValue);
            break;
          case "appState":
            this._obj.set(key, newValue);
        }
      } catch (err) {
        throw (
          console.error(
            "AppState binding failed to execute. You should probably be using _this.bindState instead",
          ),
          console.error(err),
          err
        );
      }
      return !0;
    }
    _bindOnDestroy(cb) {
      (this._onDestroy || (this._onDestroy = []), this._onDestroy.push(cb));
    }
    destroy() {
      (this._onDestroy && this._onDestroy.forEach((cb) => cb()),
        this._keys.forEach((key) => {
          let array = this._ref.bindings.get(key);
          if (array) {
            for (let i = 0; i < array.length; i++) {
              array[i] === this && (array.splice(i, 1), (i -= 1));
            }
            0 === array.length && this._ref.bindings.delete(key);
          }
        }),
        Utils.nullObject(this));
    }
  }
  window.StateBinding = StateBinding;
}
