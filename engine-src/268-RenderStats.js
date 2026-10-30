Class(function RenderStats() {
  const _this = this;
  var _trace,
    _filter,
    $container,
    _map = {},
    _display = {};
  function flush() {
    for (let key in _map)
      ((_this.stats[key] = _map[key]),
        _display[key] && _display[key].value.text(_map[key] || "0"),
        (_map[key] = 0));
    _trace = null;
  }
  ((_this.stats = {}),
    (async function () {
      (await Hydra.ready(),
        (_this.active = Utils.query("renderStats")),
        Utils.query("renderStats") &&
          (async function initUIL() {
            if (
              (await Hydra.ready(),
              ($container = Stage.create("RenderStats"))
                .css({ position: "fixed", width: 150, height: "auto", paddingTop: 5 })
                .bg("#111")
                .setZ(99999),
              Utils.query("uil"))
            ) {
              const left = RenderCount.active ? 150 : 0;
              $container.css({ bottom: 0, left: left });
            }
          })(),
        (Render.drawFrame = flush));
      let frames = 0,
        prevTime = 0,
        fps = Render.REFRESH_RATE;
      Render.start((_) => {
        ((frames += 1),
          Render.TIME >= prevTime + 1e3 &&
            ((fps = (1e3 * frames) / (Render.TIME - prevTime)),
            (fps = Math.round(fps, fps >= 1 ? 0 : 2)),
            (prevTime = Render.TIME),
            (frames = 0)),
          _this.update("FPS", fps));
      });
    })(),
    (this.update = function (name, amt = 1, detail, detail2) {
      if (_trace == name) {
        if (_filter && detail) {
          if (
            !("string" == typeof detail ? detail : Utils.getConstructorName(detail))
              .toLowerCase()
              .includes(_filter.toLowerCase())
          )
            return;
        }
        (console.groupCollapsed(name),
          detail &&
            console.log("string" == typeof detail ? detail : Utils.getConstructorName(detail)),
          detail2 && console.log(detail2),
          console.trace(),
          console.groupEnd());
      }
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
      _map[name] += amt;
    }),
    (this.trace = function (name, filter = null) {
      ((_trace = name), (_filter = filter));
    }),
    (this.log = function () {
      for (let key in _this.stats) console.log(key, _this.stats[key]);
      console.log("----");
    }));
}, "static");
