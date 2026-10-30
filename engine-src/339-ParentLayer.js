Class(function ParentLayer(_input, _group) {
  Inherit(this, Object3D);
  const _this = this;
  !(function () {
    const wildcard = _input.get("wildcard");
    wildcard &&
      wildcard.split(",").forEach((layerName) => {
        !(async function addLayer(name) {
          const attach = name.match(/^attach=(.*)$/),
            useAttach = !(!attach || !attach[1]);
          useAttach && (name = attach[1]);
          const layer = await _this.parent.getLayer(name);
          layer || console.error("layer not found.");
          const obj = layer.isMesh ? layer : layer.group;
          ((obj._parentlayer = _this.group),
            useAttach ? _this.group.attach(obj) : _this.group.add(obj));
          obj?.updateMatrixWorld?.(!0);
        })(layerName.trim());
      });
  })();
});
