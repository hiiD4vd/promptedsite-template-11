Interaction.Class(function Renderer(_object) {
  var _hydraObject = _object instanceof HydraObject;
  ((this.needsUpdate = !!_hydraObject),
    _hydraObject &&
      ((_object.x = _object.x || 0),
      (_object.y = _object.y || 0),
      (_object.z = _object.z || 0),
      (_object.pos = { x: 0, y: 0, z: 0 })),
    (this.update = function () {
      _object.transform();
    }));
});
