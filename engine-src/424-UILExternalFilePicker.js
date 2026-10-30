Class(function UILExternalFilePicker(callback, type = "textures") {
  Inherit(this, Component);
  const _this = this;
  var _window;
  async function init() {
    const assets = await get(Assets.getPath("assets/js/app/config/UILAssetsConfig.js"));
    let basePath, list;
    (eval(assets),
      "textures" === type &&
        ((basePath = `${document.location.pathname}/assets/images`),
        (list = window.UIL_ASSETS_TEXTURES)),
      "geometries" === type &&
        ((basePath = `${document.location.pathname}/assets/geometry`),
        (list = window.UIL_ASSETS_GEOMETRIES)),
      (_window = window.open(
        `${location.protocol}//localhost/hydra/editor/filepicker/index.html`,
        "pick file",
        "width=800,height=700",
      )),
      _this.events.sub(Events.UNLOAD, (_) => _window.close()),
      (_window.window.onload = (_) => {
        _window.window.initPicker(_this, basePath, list);
      }),
      window.addEventListener("beforeunload", onReload));
  }
  function onReload() {
    _this.onDestroy();
  }
  (!(async function () {
    (await Dev.execUILScript("assetsconfig"), await init());
  })(),
    (this.refresh = function () {
      (_window && _window.window && _window.window.close(), init());
    }),
    (this.update = function (value) {
      callback && callback(value);
    }),
    (this.onDestroy = function () {
      (window.removeEventListener("beforeunload", onReload),
        _window && _window.window && _window.window.close());
    }));
});
