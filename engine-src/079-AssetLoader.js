Class(
  function AssetLoader(_assets, _callback, ASSETS = Assets) {
    Inherit(this, Events);
    const _this = this;
    let _total = _assets.length,
      _loaded = 0,
      _lastFiredPercent = 0;
    function loadAsset() {
      let path = _assets.splice(_assets.length - 1, 1)[0];
      const name = path.split("assets/").last().split(".")[0],
        ext = path.split(".").last().split("?")[0].toLowerCase();
      let timeout = Timer.create(function timedOut() {
        console.warn("Asset timed out", path);
      }, AssetLoader.TIMEOUT);
      if (!Assets.preventCache && ~Assets.__loaded.indexOf(path)) return loaded();
      if (ext.includes(["jpg", "jpeg", "png", "gif"])) {
        let image = ASSETS.loadImage(path);
        return image.complete ? loaded() : ((image.onload = loaded), void (image.onerror = loaded));
      }
      function loaded() {
        (timeout && clearTimeout(timeout), increment(), _assets.length && loadAsset());
      }
      ext.includes(["mp4", "webm"])
        ? fetch(Assets.getPath(path))
            .then(async (response) => {
              let blob = await response.blob();
              ((Assets.VIDEOS[name] = URL.createObjectURL(blob)), loaded());
            })
            .catch((e) => {
              (console.warn(e), loaded());
            })
        : ext.includes(["mp3"])
          ? fetch(Assets.getPath(path))
              .then(async (response) => {
                let blob = await response.blob();
                ((Assets.AUDIOS[name] = URL.createObjectURL(blob)), loaded());
              })
              .catch((e) => {
                (console.warn(e), loaded());
              })
          : "js" !== ext
            ? get(Assets.getPath(path), Assets.HEADERS)
                .then((data) => {
                  (Assets.__loaded.push(path),
                    "json" == ext && ASSETS.JSON.push(name, data),
                    "svg" == ext && (ASSETS.SVG[name] = data),
                    "fnt" == ext && (ASSETS.SDF[name.split("/")[1]] = data),
                    ext.includes(["fs", "vs", "glsl"]) &&
                      window.Shaders &&
                      Shaders.parse(data, path),
                    loaded());
                })
                .catch((e) => {
                  (console.warn(e), loaded());
                })
            : (function loadJsLib(path) {
                const scriptSrc = Assets.getPath(path);
                let promise = AssetLoader.JS_LIBS_PROMISES.get(scriptSrc);
                if (promise) return promise;
                ((promise = Promise.create()),
                  AssetLoader.JS_LIBS_PROMISES.set(scriptSrc, promise));
                const scr = document.createElement("script");
                return (
                  (scr.onload = promise.resolve),
                  (scr.onerror = promise.reject),
                  (scr.src = scriptSrc),
                  document.head.appendChild(scr),
                  promise
                );
              })(path)
                .then(() => {
                  loaded();
                })
                .catch((e) => {
                  (console.warn(e), loaded());
                });
    }
    function increment() {
      let percent = Math.max(_lastFiredPercent, Math.min(1, ++_loaded / _total));
      (_this.events.fire(Events.PROGRESS, { percent: percent }),
        (_lastFiredPercent = percent),
        _loaded >= _total && defer(complete));
    }
    function complete() {
      _this.completed ||
        ((_this.completed = !0),
        defer(() => {
          (_callback && _callback(), _this.events.fire(Events.COMPLETE));
        }));
    }
    (!(function () {
      if (!Array.isArray(_assets)) throw "AssetLoader requires array of assets to load";
      ((_assets = _assets.slice(0).reverse()),
        (function init() {
          if (!_assets.length) return complete();
          for (let i = 0; i < AssetLoader.SPLIT; i++) _assets.length && loadAsset();
        })());
    })(),
      (this.loadModules = function () {
        if (!window._BUILT_) return;
        this.add(1);
        let module = window._ES5_ ? "es5-modules" : "modules",
          src = window._CACHE_
            ? "assets/js/" + module + "." + window._CACHE_ + ".js"
            : "assets/js/" + module + ".js";
        src = Assets.getPath(src);
        let s = document.createElement("link");
        return (
          (s.href = src),
          (s.rel = "preload"),
          (s.as = "script"),
          document.head.appendChild(s),
          (s = document.createElement("script")),
          (s.src = src),
          (s.async = !0),
          document.head.appendChild(s),
          AssetLoader.waitForLib("_MODULES_").then((_) => _this.trigger(1))
        );
      }),
      (this.add = function (num) {
        _total += num || 1;
      }),
      (this.trigger = function (num) {
        for (let i = 0; i < (num || 1); i++) increment();
      }));
  },
  () => {
    ((AssetLoader.SPLIT = 2),
      (AssetLoader.TIMEOUT = 5e3),
      (AssetLoader.JS_LIBS_PROMISES = new Map()),
      (AssetLoader.loadAllAssets = function (callback) {
        let promise = Promise.create();
        return (
          callback || (callback = promise.resolve),
          (promise.loader = new AssetLoader(Assets.list(), () => {
            (callback && callback(),
              promise.loader &&
                promise.loader.destroy &&
                (promise.loader = promise.loader.destroy()));
          })),
          promise
        );
      }),
      (AssetLoader.loadAssets = function (list, callback) {
        let promise = Promise.create();
        return (
          callback || (callback = promise.resolve),
          (promise.loader = new AssetLoader(list, () => {
            (callback && callback(),
              promise.loader &&
                promise.loader.destroy &&
                (promise.loader = promise.loader.destroy()));
          })),
          promise
        );
      }),
      (AssetLoader.waitForLib = function (name, callback) {
        let promise = Promise.create();
        return (
          callback || (callback = promise.resolve),
          Render.start(function check() {
            window[name] && (Render.stop(check), callback && callback());
          }),
          promise
        );
      }),
      (AssetLoader.waitForModules = function () {
        return AssetLoader.waitForLib(window._BUILT_ ? "_MODULES_" : "zUtils3D");
      }));
  },
);
