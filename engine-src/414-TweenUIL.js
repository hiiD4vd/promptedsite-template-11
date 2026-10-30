Class(function TweenUIL() {
  Inherit(this, Component);
  const _this = this;
  var _getServerTime,
    _folders = {},
    _activeFolder = "Tweens",
    _cache = {},
    _counters = {},
    _synchronizedTweens = [];
  function synchronizedPlaybackLoop() {
    let i = _synchronizedTweens.length - 1;
    if (i < 0) return;
    let serverTime = _getServerTime();
    for (; i >= 0;) {
      let tween = _synchronizedTweens[i];
      if (tween.seekImmediate) {
        let duration = 1e3 * tween.duration,
          progress = (serverTime % duration) / duration;
        (tween.seekImmediate(progress), (i -= 1));
      } else if ((_synchronizedTweens.splice(i, 1), 0 === _synchronizedTweens.length)) {
        _this.stopRender(synchronizedPlaybackLoop);
        break;
      }
    }
  }
  ((_this.jsons = {}),
    (this.TOGGLE = "tweenuil_toggle"),
    _this.startRender(synchronizedPlaybackLoop),
    (this.create = function (name, config, group) {
      if ("undefined" == typeof TheatreJSLoader)
        throw (
          TweenUIL.moduleWarned ||
            (console.error('Theatre.js not found. Add "theatrejs" to your project.json'),
            (TweenUIL.moduleWarned = !0)),
          new Error("theatrejs module required")
        );
      "boolean" == typeof group && (group = void 0);
      let noCache = !1;
      "nocache" == group &&
        ((_counters[name] = (_counters[name] || 0) + 1), (noCache = !0), (group = void 0));
      let folderName = _activeFolder;
      if (
        ("string" == typeof group && ((folderName = group), (group = null)),
        _folders[folderName] ||
          (function initFolder() {
            if (UIL.global) {
              let folder = new UILFolder(_activeFolder, { label: _activeFolder, closed: !0 });
              ((_folders[_activeFolder] = folder), UIL.global.add(folder));
            }
          })(),
        !_cache[name] || noCache)
      ) {
        let tween = new TweenUILConfig(
          name,
          config,
          group || _folders[folderName],
          _counters[name],
        );
        (tween._bindOnDestroy((_) => {
          delete _cache[name];
        }),
          (_cache[name] = tween));
      }
      return _cache[name];
    }),
    (this.setFolder = function (name) {
      _activeFolder = name;
    }),
    (this.setServerTimeGetter = function (getServerTime) {
      _getServerTime = getServerTime;
    }),
    (this.playSynchronized = async function (tween) {
      _getServerTime
        ? (await tween.preload(),
          tween.progress,
          (tween.manualRender = !0),
          _synchronizedTweens.unshift(tween))
        : console.error(
            "Need to call TweenUIL.setServerTimeGetter(() => time) before using TweenUIL.playSynchronized()",
          );
    }),
    (this.stopSynchronized = function (tween) {
      _synchronizedTweens.remove(tween);
    }));
}, "static");
