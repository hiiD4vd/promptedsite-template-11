Class(function FragBatch(_config = {}) {
  Inherit(this, Object3D);
  const _this = this;
  var _batches = {},
    _params = AppState.createLocal({
      worldCoords: !0,
      addParentPosition: _config.parentPosition || 1,
    });
  function wait(obj, key) {
    let time = 0;
    const check = (_) => {
      if (obj[key]) {
        let mesh = obj[key];
        if (!mesh.geometry) return console.error(`FragBatch :: ${key} is not a mesh`);
        (_this.stopRender(check), _batches[key].add(mesh));
      }
      ((time += Render.DELTA), time > 5e3 && _this.stopRender(check));
    };
    _this.startRender(check);
  }
  (!(function () {
    if (!_config.layers) throw "FragBatch || requires {layers} array";
    _config.layers.forEach((name) => {
      _batches[name] = _this.initClass(MeshBatch, _params);
    });
  })(),
    (this.add = function (obj) {
      obj.layout && !_config.parentPosition && (_params.addParentPosition = 2);
      for (let key in _batches) wait(obj, key);
    }));
});
