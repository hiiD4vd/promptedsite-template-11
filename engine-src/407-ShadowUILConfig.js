Class(function ShadowUILConfig(_light, _uil) {
  if (!_light.prefix) throw "light.prefix required when using MeshUIL";
  var prefix = "SHADOW_" + _light.prefix,
    _group = _uil
      ? (function createFolder() {
          if (!UIL.sidebar) return null;
          let folder = new UILFolder(prefix, { label: _light.prefix, closed: !0 });
          return (_uil.add(folder), folder);
        })()
      : null;
  function initNumber(key) {
    let initValue = UILStorage.get(`${prefix}${key}`) || _light.shadow[key];
    if (_group) {
      UILStorage.state.bind(`${prefix}${key}`, (val) => (_light.shadow[key] = val));
      let number = new UILControlNumber(`${prefix}${key}`, {
        label: key,
        value: initValue,
        step: 0.05,
      });
      (number.onFinishChange((e) => {
        ((_light.shadow[key] = e), UILStorage.set(`${prefix}${key}`, e));
      }),
        _group.add(number));
    }
    _light.shadow[key] = initValue;
  }
  function initVec(key) {
    let initValue = UILStorage.get(`${prefix}${key}`) || _light[key].toArray();
    if (_group) {
      UILStorage.state.bind(`${prefix}_${key}`, (val) => _light[key].fromArray(val));
      let vector = new UILControlVector(`${prefix}${key}`, {
        label: key,
        value: initValue,
        step: 0.05,
      });
      (vector.onChange((e) => {
        (_light[key].fromArray(e), "target" == key && _light.shadow.camera.lookAt(_light.target));
      }),
        vector.onFinishChange((e) => {
          (_light[key].fromArray(e),
            "target" == key && _light.shadow.camera.lookAt(_light.target),
            UILStorage.set(`${prefix}${key}`, e));
        }),
        _group.add(vector));
    }
    _light[key].fromArray(initValue);
  }
  ((_light.target = _light.shadow.target),
    initVec("position"),
    initVec("target"),
    initNumber("fov"),
    initNumber("size"),
    initNumber("area"),
    initNumber("near"),
    initNumber("far"),
    (function initTick(key) {
      let initValue = UILStorage.get(`${prefix}${key}`);
      if (_group) {
        UILStorage.state.bind(`${prefix}_${key}`, (val) => (_light[key] = val));
        let tick = new UILControlCheckbox(`${prefix}${key}`, { label: key, value: initValue });
        (tick.onFinishChange((e) => {
          ((_light[key] = e), UILStorage.set(`${prefix}${key}`, e));
        }),
          _group.add(tick));
      }
      _light[key] = initValue;
    })("static"),
    (this.setLabel = function (name) {
      _group && _group.setLabel(name);
    }));
});
