Class(function Hydra() {
  const _this = this,
    _readyPromise = Promise.create();
  var _base,
    _callbacks = [];
  function initLoad() {
    return document && window
      ? window._NODE_
        ? setTimeout(loaded, 1)
        : window._AURA_
          ? window.Main
            ? setTimeout(loaded, 1)
            : setTimeout(initLoad, 1)
          : void ("loading" !== document.readyState
              ? setTimeout(readyStateChange, 1)
              : document.addEventListener("readystatechange", readyStateChange))
      : setTimeout(initLoad, 1);
  }
  function loaded() {
    if (window._HYDRA_BEFORE_READY) {
      let promise = window._HYDRA_BEFORE_READY;
      return (delete window._HYDRA_BEFORE_READY, promise.then(loaded));
    }
    ((_this.LOCAL =
      (!window._BUILT_ || location.pathname.toLowerCase().includes("platform")) &&
      (location.hostname.indexOf("local") > -1 ||
        "127.0.0.1" === location.hostname ||
        "10" == location.hostname.split(".")[0] ||
        "192" == location.hostname.split(".")[0] ||
        /atdev.online$/.test(location.hostname)) &&
      ("" == location.port || "3000" === location.port)),
      _callbacks.forEach((cb) => cb()),
      (_callbacks = null),
      _readyPromise.resolve(),
      window.Main && _readyPromise.then(() => (Hydra.Main = new window.Main())));
  }
  function readyStateChange() {
    "loading" !== document.readyState &&
      (document.removeEventListener("readystatechange", readyStateChange), loaded());
  }
  ((this.HASH = window.location.hash.slice(1)),
    (this.LOCAL =
      !window._BUILT_ &&
      (location.hostname.indexOf("local") > -1 ||
        "127.0.0.1" === location.hostname ||
        "10" == location.hostname.split(".")[0] ||
        "192" == location.hostname.split(".")[0] ||
        /atdev.online$/.test(location.hostname)) &&
      ("" == location.port || "3000" === location.port)),
    initLoad(),
    (this.__triggerReady = function () {
      _callbacks || loaded();
    }),
    (this.ready = function (callback) {
      if (!callback) return _readyPromise;
      _callbacks ? _callbacks.push(callback) : callback();
    }),
    (this.absolutePath = function (path) {
      if (window.AURA) return path;
      let base = window.HYDRA_BASE_PATH ?? _base;
      if (void 0 === base)
        try {
          if (document.getElementsByTagName("base").length > 0) {
            var a = document.createElement("a");
            ((a.href = document.getElementsByTagName("base")[0].href),
              (base = a.pathname),
              (_base = base));
          }
        } catch (e) {
          _base = null;
        }
      let pathname = base ?? location.pathname;
      pathname.includes("/index.html") && (pathname = pathname.replace("/index.html", ""));
      let port = Number(location.port) > 1e3 ? `:${location.port}` : "";
      return path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("//") ||
        path.startsWith("data:") ||
        path.startsWith("blob:")
        ? path
        : (location.protocol.length ? location.protocol + "//" : "") +
            (location.hostname + port + pathname + "/" + path).replace("//", "/");
    }));
}, "Static");
