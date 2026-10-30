Class(function RenderCount() {
  const _this = this;
  var $container,
    LOG,
    _map = {},
    _display = {};
  ((this.map = _map),
    (async function () {
      (await Hydra.ready(),
        (_this.active = Utils.query("uil") || Utils.query("renderCount")),
        (LOG = _this.active && Utils.query("log")),
        Utils.query("renderCount") &&
          (async function initUIL() {
            (await Hydra.ready(),
              ($container = Stage.create("RenderCount"))
                .css({
                  width: 175,
                  height: "auto",
                  paddingBottom: 5,
                  bottom: 0,
                  maxHeight: 400,
                  overflowY: "scroll",
                  position: "absolute",
                })
                .bg("#111")
                .setZ(9999999));
          })());
    })(),
    (this.add = function (name, detail, amt = 1) {
      if (_this.active) {
        if (void 0 === _map[name] && ((_map[name] = 0), $container)) {
          let $wrapper = $container.create("wrapper");
          ($wrapper.css({ position: "relative", width: "100%", height: 20 }),
            ($wrapper.label = $wrapper.create("label")),
            $wrapper.label
              .fontStyle("Arial", 12, "#fff")
              .text(name)
              .css({ left: 10, position: "absolute" }),
            ($wrapper.value = $wrapper.create("value")),
            $wrapper.value
              .fontStyle("Arial", 12, "#fff")
              .text(0)
              .css({ right: 10, position: "absolute" }),
            (_display[name] = $wrapper));
        }
        (LOG &&
          (console.groupCollapsed(name),
          detail && console.log(detail),
          console.trace(),
          console.groupEnd()),
          (_map[name] += amt),
          _display[name]?.value?.text?.(_map[name] || "0"));
      }
    }),
    (this.remove = function (name, amt = 1) {
      _this.active &&
        _map[name] &&
        ((_map[name] -= amt), _display[name]?.value?.text?.(_map[name] || "0"));
    }));
}, "static");
