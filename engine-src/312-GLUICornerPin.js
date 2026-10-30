Class(function GLUICornerPin($obj) {
  Inherit(this, Component);
  const _this = this;
  var _geom, _vertices, _last;
  function loop() {
    ((_vertices[0] = _this.tl.x),
      (_vertices[1] = -_this.tl.y),
      (_vertices[3] = _vertices[9] = _this.bl.x),
      (_vertices[4] = _vertices[10] = -_this.bl.y),
      (_vertices[6] = _vertices[15] = _this.tr.x),
      (_vertices[7] = _vertices[16] = -_this.tr.y),
      (_vertices[12] = _this.br.x),
      (_vertices[13] = -_this.br.y),
      (function dirty() {
        let a = _vertices,
          b = _last;
        for (let i = a.length - 1; i > -1; i--) if (a[i] != b[i]) return !0;
        return !1;
      })() && (_geom.attributes.position.needsUpdate = !0),
      _last.set(_vertices));
  }
  ((this.tl = new Vector2(0, 0)),
    (this.tr = new Vector2($obj.width, 0)),
    (this.bl = new Vector2(0, $obj.height)),
    (this.br = new Vector2($obj.width, $obj.height)),
    (function initGeometry() {
      ((_geom = $obj.mesh.geometry.toNonIndexed()),
        $obj.useGeometry(_geom),
        $obj.mesh.scale.set(1, 1, 1),
        (_vertices = _geom.attributes.position.array),
        (_last = new Float32Array(_vertices)));
    })(),
    _this.startRender(loop),
    (this.update = function () {
      (this.tl.set(0, 0),
        this.tr.set($obj.width, 0),
        this.bl.set(0, $obj.height),
        this.br.set($obj.width, $obj.height));
    }),
    (this.tween = function (type, val, time, ease, delay) {
      return (
        (val = val instanceof Vector2 ? val : new Vector2(val.x, val.y)),
        tween(_this[type], val, time, ease, delay)
      );
    }));
});
