Class(function MeshUILConfig(_mesh, _uil) {
  const _this = this;
  if (!_mesh.prefix) throw "mesh.prefix required when using MeshUIL";
  var _hmr,
    prefix = "MESH_" + _mesh.prefix,
    _group =
      _uil && !MeshUIL.exists[prefix]
        ? (function createFolder() {
            if (!UIL.sidebar) return null;
            let folder = new UILFolder(prefix, { label: _mesh.prefix, closed: !0 });
            return (_uil.add(folder), folder);
          })()
        : null,
    _controls = _group ? {} : null;
  function initVec(key) {
    let initValue = UILStorage.get(`${prefix}${key}`) || _mesh[key].toArray();
    if (_group) {
      UILStorage.state.bind(`${prefix}${key}`, (val) => _mesh[key].fromArray(val));
      let vector = new UILControlVector(`${prefix}${key}`, {
        label: key,
        value: initValue,
        step: 0.05,
      });
      (vector.onChange((e) => {
        (_mesh[key].fromArray(e), _group && _this["tweenUIL_" + key]?.(e));
      }),
        vector.onFinishChange(save),
        _group.add(vector),
        (_this["forceUpdate" + key.toUpperCase()] = (_) => {
          let val = _mesh[key].toArray();
          _this["tweenUIL_" + key]
            ? _this["tweenUIL_" + key](val)
            : vector.force(_mesh[key].toArray(), !0);
        }),
        (_controls[key] = vector));
    }
    _mesh[key].fromArray(initValue);
  }
  function save() {
    for (let key in _controls) {
      let value = _controls[key].value;
      UILStorage.set(`${prefix}${key}`, value);
    }
  }
  function update(e) {
    e.prefix == prefix && e.group != _this && _mesh[e.key].fromArray(e.val);
  }
  function handleInstanceReloaded({
    className: className,
    oldInstance: oldInstance,
    newInstance: newInstance,
  }) {
    if (className === _hmr.className) {
      let prefix = _mesh.prefix;
      (((_mesh = newInstance.group).prefix = prefix),
        _mesh.position.fromArray(_hmr.position || _controls.position.value),
        _mesh.rotation.fromArray(_hmr.rotation || _controls.rotation.value.map(Math.radians)),
        _mesh.scale.fromArray(_hmr.scale || _controls.scale.value));
    }
  }
  ((this.group = _group),
    initVec("position"),
    initVec("scale"),
    (function initRotation() {
      let key = "rotation",
        toRadians = (array) =>
          array ? ((array.length = 3), array.map((x) => Math.radians(x))) : [0, 0, 0],
        toDegrees = (array) =>
          array ? ((array.length = 3), array.map((x) => Math.degrees(x))) : [0, 0, 0],
        initValue = toRadians(UILStorage.get(`${prefix}${key}`));
      if (_group) {
        UILStorage.state.bind(`${prefix}${key}`, (val) => _mesh[key].fromArray(toRadians(val)));
        let vector = new UILControlVector(`${prefix}${key}`, {
          label: key,
          value: toDegrees(initValue),
        });
        (vector.onChange((e) => {
          (_mesh[key].fromArray(toRadians(e)), _group && _this["tweenUIL_" + key]?.(e));
        }),
          vector.onFinishChange(save),
          _group.add(vector),
          (_controls[key] = vector));
      }
      _mesh[key].fromArray(initValue);
      let rotationEuler = new Euler().fromArray(initValue);
      _mesh.customRotation = new Quaternion().setFromEuler(rotationEuler);
    })(),
    _group &&
      (function addListeners() {
        Events.emitter._addEvent(MeshUIL.UPDATE, update, _this);
      })(),
    Hydra.LOCAL &&
      (function initHotReload() {
        _mesh.prefix &&
          _mesh.classRef &&
          ((_hmr = { className: Utils.getConstructorName(_mesh.classRef) }),
          _group ||
            ((_hmr.position = _mesh.position.toArray()),
            (_hmr.rotation = _mesh.rotation.toArray()),
            (_hmr.scale = _mesh.scale.toArray())),
          Events.emitter._addEvent(Component.HMR_INSTANCE_RELOADED, handleInstanceReloaded, _this));
      })(),
    (this.setLabel = function (name) {
      _group && _group.setLabel(name);
    }),
    (this.forceUpdate = function (key, val) {
      (_mesh[key].fromArray(val), _this["forceUpdate" + key.toUpperCase()]?.());
    }));
});
