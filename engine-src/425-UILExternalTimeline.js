Class(function UILExternalTimeline(_title, _height = 500, _width = 700, _config) {
  Inherit(this, Component);
  const _this = this;
  var _window;
  ((_window = window.open(
    location.protocol + "//localhost/hydra/editor/timeline/index.html",
    "_blank",
    `width=${_width},height=${_height},left=200,top=100`,
  )),
    _this.events.sub(Events.UNLOAD, (_) => _window.close()),
    (_window.window.onload = (_) => {
      _window.window.initEditor(_title, _config);
    }),
    _window.window.addEventListener("message", (e) => {
      if ((e.data.bundle && _this.onMessage && _this.onMessage(e.data.bundle), e.data.save)) {
        let path;
        (_this.onSave && _this.onSave(),
          window.UIL_STATIC_PATH
            ? ((path = window.UIL_STATIC_PATH), (path = path.substring(0, path.lastIndexOf("/"))))
            : (path = "assets/data"),
          Dev.writeFile(`${path}/timeline-${_title}.json?compress`, e.data.save));
      }
      (e.data.visualizePath && _this.onVisualizePath?.(e.data.visualizePath),
        void 0 !== e.data.position &&
          _this.onPositionChange &&
          _this.onPositionChange(e.data.position));
    }),
    _this.startRender((_) => {
      _window.closed && _this.destroy();
    }, 10),
    (this.saved = async function (code) {
      (_this.onSave && _this.onSave(code), await defer(), UILStorage.write());
    }),
    (this.sendUpdate = function (layerName, value, key) {
      _window.window.sendUpdate(layerName, value, key);
    }));
});
