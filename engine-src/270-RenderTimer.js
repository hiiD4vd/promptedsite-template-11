Class(function RenderTimer() {
  const _this = this;
  var $container,
    _display = {},
    _times = {};
  (!(async function () {
    (await Hydra.ready(),
      (_this.active = Utils.query("renderTimer")),
      _this.active &&
        (async function initUIL() {
          ($container = Stage.create("RenderTimer"))
            .css({
              position: "absolute",
              width: 150,
              height: "auto",
              paddingBottom: 5,
              bottom: 0,
              right: 0,
            })
            .bg("#111")
            .setZ(9999999);
        })());
  })(),
    (this.start = function (name) {
      _times[name] = performance.now();
    }),
    (this.stop = function (name) {
      if (!_display[name] && $container) {
        let $wrapper = $container.create("wrapper");
        ($wrapper.css({ position: "relative", width: "100%", height: 20 }),
          ($wrapper.label = $wrapper.create("label")),
          $wrapper.label.fontStyle("Arial", 12, "#fff").text(name).css({ left: 10 }),
          ($wrapper.value = $wrapper.create("value")),
          $wrapper.value.fontStyle("Arial", 12, "#fff").text(0).css({ right: 10 }),
          (_display[name] = $wrapper));
      }
      _display[name] &&
        _display[name].value.text((performance.now() - _times[name]).toFixed(3) || "0");
    }));
}, "static");
