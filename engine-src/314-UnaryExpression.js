!(function () {
  var _geom2d, _geom3d;
  ((GLUIObject.getGeometry = function (type) {
    return "2d" == type
      ? (_geom2d ||
          (_geom2d = new PlaneGeometry(1, 1)).applyMatrix(
            new Matrix4().makeTranslation(0.5, -0.5, 0),
          ),
        _geom2d)
      : (_geom3d || (_geom3d = World.PLANE), _geom3d);
  }),
    (GLUIObject.clear = function () {
      _geom2d = _geom3d = null;
    }),
    (GLUIObject.noop = (_) => {}));
})();
