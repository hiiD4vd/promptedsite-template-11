Class(function RenderManagerCamera() {
  Inherit(this, Component);
  const _this = this;
  ((this.worldCamera = window.THREE
    ? new THREE.PerspectiveCamera(30, Stage.width / Stage.height, 0.1, 1e3)
    : new PerspectiveCamera(30, Stage.width / Stage.height, 0.1, 1e3)),
    _this.events.sub(Events.RESIZE, () => {
      ((_this.worldCamera.aspect = Stage.width / Stage.height),
        _this.worldCamera.updateProjectionMatrix());
    }));
});
