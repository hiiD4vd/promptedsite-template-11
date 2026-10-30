Class(function CameraLookAtHelper() {
  Inherit(this, Component);
  const _this = this;
  let _camera,
    _object,
    _defaultLookAt,
    _tweener = { alpha: 0 },
    _lookAt = new Vector3();
  function update() {
    (_lookAt.copy(_defaultLookAt),
      _tweener.alpha > 0 && _lookAt.lerp(_object.position, _tweener.alpha, !1));
  }
  (_this.get("tweener", () => _tweener),
    (_this.create = async function (camera, object, tween) {
      ((_camera = camera),
        (_object = object),
        (_defaultLookAt = _camera.lookAt),
        await tween.loaded(),
        (_camera.lookAt = _lookAt),
        _this.events.sub(tween, TweenUIL.UPDATED, update));
    }));
});
