Class(function UILExternalColor(_title, _value) {
  Inherit(this, Component);
  const _this = this;
  var _window;
  function onReload() {
    _this.onDestroy();
  }
  (((_window = window.open(
    location.protocol + "//localhost/hydra/editor/color/index.html",
    `hydra_color_${_title}`,
    "width=480,height=220,left=200,top=100,location=no",
  )).window.onload = (_) => {
    _window.window.initPicker(_title, _value, _this);
  }),
    window.addEventListener("beforeunload", onReload),
    (this.update = function (value) {
      _this.events.fire(Events.UPDATE, { value: value });
    }),
    (this.onDestroy = function () {
      (window.removeEventListener("beforeunload", onReload),
        _window && _window.window && _window.window.close());
    }));
});
