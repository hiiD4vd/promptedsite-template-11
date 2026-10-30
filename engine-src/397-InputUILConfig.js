Class(function InputUILConfig(_name, _uil, _decoupled, _slim) {
  var _cache,
    _this = this;
  const prefix = "INPUT_" + _name;
  var _group = _uil
      ? (function createFolder() {
          if (!UIL.sidebar) return null;
          let folder = new UILFolder(_name, { closed: !0 });
          _decoupled || (_uil.add?.(folder), _uil == UIL.sidebar && folder.hide());
          return folder;
        })()
      : null,
    _fields = _uil ? {} : null;
  function getUILStorage() {
    return _this.CMS ? UILStorage.setCMS : UILStorage.set;
  }
  function externalUpdate(e) {
    e.prefix == prefix &&
      e.group != _this &&
      (getUILStorage()(`${prefix}_${e.key}`, e.value), _this.onUpdate && _this.onUpdate(e.key));
  }
  ((_this.group = _group),
    (_this.keys = []),
    _uil?.add &&
      (function addListeners() {
        Events.emitter._addEvent(InputUIL.UPDATE, externalUpdate, _this);
      })(),
    (this.state = AppState.createLocal()),
    (this.get = function (key) {
      if (_cache && void 0 !== _cache[key]) return _cache[key];
      let val = UILStorage.get(`${prefix}_${key}`);
      return "boolean" == typeof val
        ? val
        : val && "" != val
          ? "true" === val ||
            ("false" !== val &&
              (val.charAt && "[" == val.charAt(0)
                ? JSON.parse(val)
                : (UIL.global || (_cache || (_cache = {}), _cache[key] || (_cache[key] = val)),
                  val)))
          : void 0;
    }),
    (this.getFilePath = function (key) {
      let data = this.get(key);
      return "{" === data?.charAt?.(0)
        ? ((data = JSON.parse(data)), data.relative.includes(".") ? data.relative : data.src)
        : "object" == typeof data
          ? data.relative.includes(".")
            ? data.relative
            : data.src
          : data;
    }),
    (this.getNumber = function (key) {
      let number = Number(this.get(key));
      return (isNaN(number) && (number = 0), number);
    }),
    _slim ||
      ((this.add = function (key, initValue, uil = window.UILControlText, options, params = {}) {
        if (
          (_this.CMS &&
            defer((_) => {
              _this.onUpdate(key);
            }),
          _this.keys.push(key),
          !_group || "hidden" == initValue || !UIL.sidebar)
        )
          return this;
        let fallback;
        "string" == typeof uil && ((fallback = uil), (uil = window.UILControlText));
        let value = UILStorage.get(`${prefix}_${key}`);
        if (
          (void 0 === value && fallback && (value = UILStorage.get(`${prefix}_${fallback}`)),
          "true" === value && (value = !0),
          "false" === value && (value = !1),
          uil == UILControlVector && "string" == typeof value && (value = JSON.parse(value)),
          void 0 === value && (value = initValue),
          "string" == typeof value && (uil == UILControlImage || uil == UILControlFile))
        )
          try {
            value = JSON.parse(value);
          } catch (e) {}
        let change = (val, fromInit) => {
          ((val = "string" == typeof val ? val : JSON.stringify(val)),
            getUILStorage()(`${prefix}_${key}`, val),
            _this.onUpdate && _this.onUpdate(key, val),
            fromInit ||
              Events.emitter._fireEvent(InputUIL.UPDATE, {
                prefix: prefix,
                key: key,
                value: val,
                group: _this,
              }));
        };
        ("string" != typeof initValue && "number" != typeof initValue && uil != UILControlVector) ||
          UILStorage.get(`${prefix}_${key}`) ||
          change(initValue, !0);
        let opts = Utils.mergeObject(params, { label: key, value: value, options: options });
        uil == window.UILControlButton && (opts = options);
        let config = new uil(`${prefix}_${key}`, opts);
        return (
          config.onFinishChange(change),
          UILStorage.state.bind(`${prefix}_${key}`, (val) => _this.state.set(key, val)),
          (uil != UILControlVector && uil != UILControlRange) || config.onChange(change),
          _group.add(config),
          (_fields[key] = config),
          this
        );
      }),
      (this.addToggle = function (key, initValue) {
        return UIL.sidebar ? this.add(key, initValue, UILControlCheckbox) : this;
      }),
      (this.addSelect = function (key, options) {
        return UIL.sidebar ? this.add(key, null, UILControlSelect, options) : this;
      }),
      (this.addImage = function (key, options) {
        return UIL.sidebar ? this.add(key, null, UILControlImage, null, options) : this;
      }),
      (this.addFile = function (key, options) {
        if (!UIL.sidebar) return this;
        this.get(key);
        return this.add(key, null, UILControlFile, null, options);
      }),
      (this.addRange = function (key, initValue, options) {
        return UIL.sidebar ? this.add(key, initValue, UILControlRange, null, options) : this;
      }),
      (this.addNumber = function (key, initValue, step) {
        return UIL.sidebar
          ? this.add(key, initValue, UILControlNumber, null, { step: step })
          : this;
      }),
      (this.addColor = function (key, initValue = new Color()) {
        return UIL.sidebar ? this.add(key, initValue.getHexString(), UILControlColor) : this;
      }),
      (this.addTextarea = function (key, initValue) {
        return UIL.sidebar
          ? this.add(key, initValue, UILControlTextarea, null, { monospace: !0, rows: 4 })
          : this;
      }),
      (this.addButton = function (key, options) {
        if (!UIL.sidebar) return this;
        if ("function" == typeof options) {
          let cb = options;
          options = { actions: [{ title: key, callback: (_) => cb(key) }], hideLabel: !0 };
        }
        return this.add(key, null, UILControlButton, options);
      }),
      (this.addVector = function (key, initValue, options) {
        return UIL.sidebar
          ? (options || (options = { step: 0.05 }),
            this.add(key, initValue, UILControlVector, null, options))
          : this;
      }),
      (this.getImage = function (key) {
        let data = this.get(key);
        if (data) return ("object" != typeof data && (data = JSON.parse(data)), data?.src);
      }),
      (this.setValue = function (key, value) {
        if (
          (getUILStorage()(`${prefix}_${key}`, value),
          _this.onUpdate && _this.onUpdate(key),
          _this.state.set(key, value),
          _fields)
        ) {
          let field = _fields[key];
          field && ((field.value = value), field.update && field.update());
        }
        return this;
      }),
      (this.copyFrom = function (input, fields) {
        fields.forEach((key) => {
          let val = input.get(key);
          void 0 !== val &&
            ("string" != typeof val && (val = JSON.stringify(val)), _this.setValue(key, val));
        });
      }),
      (this.setLabel = function (name) {
        _group && _group.setLabel(name);
      }),
      (this.getField = function (key) {
        if (_fields) return _fields[key];
      }),
      (this.setDescription = function (key, desc) {
        _this.getField(key)?.setDescription(desc);
      })));
});
