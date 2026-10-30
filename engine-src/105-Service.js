Class(function Service() {
  Inherit(this, Component);
  var _sw,
    _this = this;
  function getSWAssets() {
    if (!window.ASSETS.SW || _this.cached) return [];
    var assets = window.ASSETS.SW;
    return (
      assets.forEach((asset, i) => {
        asset.includes(".js") && (asset = assets[i].replace(".js", ".js?" + window._CACHE_));
      }),
      assets
    );
  }
  function handleRegistration(e) {}
  function handleReady(e) {
    ((_this.isReady = !0),
      _this.events.fire(Events.READY, e, !0),
      (_sw = navigator.serviceWorker.controller),
      (function checkCache() {
        Storage.get("service_cache") != window._CACHE_ && _this.post("clearCache");
      })());
  }
  function handleError(e) {
    e && (_this.events.fire(Events.ERROR, e, !0), (_this.active = !1));
  }
  function handleMessage(e) {
    var data = e.data;
    data.evt && _this.events.fire(data.evt, data);
  }
  ((this.active = !1),
    (this.ready = !1),
    (this.cached = !1),
    (this.offline = !1),
    (this.disabled = !1),
    (this.ready = function () {
      return this.wait(this, "isReady");
    }),
    (this.init = function () {
      Hydra.ready(() => {
        !("serviceWorker" in navigator) ||
          (Hydra.LOCAL && "" == location.port) ||
          window.process ||
          _this.disabled ||
          (function initWorker() {
            ((_this.active = !0),
              navigator.serviceWorker
                .register(`${window._SW_PATH_ ? window._SW_PATH_ : ""}sw.js`)
                .then(handleRegistration)
                .then(handleReady)
                .then(handleError));
          })();
      });
    }),
    (this.cache = function (assets = []) {
      assets = Array.from(assets);
      _this.active &&
        _this.wait(_this, "ready", function () {
          (_this.post("upload", {
            assets: assets,
            cdn: Assets.CDN,
            hostname: location.hostname,
            sw: getSWAssets(),
            offline: _this.offline,
          }),
            Storage.set("service_cache", window._CACHE_),
            (_this.cached = !0));
        });
    }),
    (this.post = function (fn, data = {}) {
      if (!_this.active) return;
      _this.wait(_this, "ready", function () {
        let mc = new MessageChannel();
        ((mc.port1.onmessage = handleMessage),
          (data.fn = fn),
          _sw && _sw.postMessage(data, [mc.port2]));
      });
    }));
}, "static");
