Class(function Assets() {
  const _this = this,
    _support = { webp: !1, avif: !1 };
  let _getPathHooks;
  function AssetList(arr) {
    return ((arr.__proto__ = AssetList.prototype), arr);
  }
  function getPath(path) {
    // Worker scripts must share the application's origin. Keep engine code local;
    // media paths below are resolved against the immutable R2 release.
    if (path.startsWith('assets/js/')) return `/${path}`;
    if (path.includes("~")) return _this.BASE_PATH + path.replace("~", "");
    if (path.includes("//") || path.startsWith("data:") || path.startsWith("blob:")) return path;
    if (
      ((path = (function parseResolution(path) {
        if (!window.ASSETS || !ASSETS.RES) return path;
        var res = ASSETS.RES[path],
          ratio = Math.min(Device.pixelRatio, 3);
        if (!res) return path;
        if (!res["x" + ratio]) return path;
        var split = path.split("/"),
          file = split[split.length - 1];
        return (
          (split = file.split(".")),
          path.replace(file, split[0] + "-" + ratio + "x." + split[1])
        );
      })(path)),
      _this.replacementPaths)
    )
      for (let pathKey in _this.replacementPaths)
        if (path.startsWith(pathKey))
          return (path = path.replace(pathKey, _this.replacementPaths[pathKey]));
    if (_this.dictionary)
      for (let pathKey in _this.dictionary)
        if (_this.dictionary[pathKey].includes(path.split("?")[0])) return pathKey + path;
    return (this.CDN && !~path.indexOf(this.CDN) && (path = this.CDN + path), path);
  }
  ((this.__loaded = []),
    (this.FLIPY = !0),
    (this.CDN = window.HYDRA_ASSETS_CDN ?? ""),
    (this.CORS = "anonymous"),
    (this.disableFallbackImage = !1),
    (this.IMAGES = {}),
    (this.VIDEOS = {}),
    (this.AUDIOS = {}),
    (this.SDF = {}),
    (this.JSON = {
      push: function (prop, value) {
        ((this[prop] = value),
          Object.defineProperty(this, prop, { get: () => JSON.parse(JSON.stringify(value)) }));
      },
    }),
    Object.defineProperty(this.JSON, "push", { enumerable: !1, writable: !0 }),
    (this.SVG = {}),
    (AssetList.prototype = new Array()),
    (AssetList.prototype.filter = function (items) {
      for (let i = this.length - 1; i >= 0; i--) this[i].includes(items) || this.splice(i, 1);
      return this;
    }),
    (AssetList.prototype.exclude = function (items) {
      for (let i = this.length - 1; i >= 0; i--) this[i].includes(items) && this.splice(i, 1);
      return this;
    }),
    (AssetList.prototype.prepend = function (prefix) {
      for (let i = this.length - 1; i >= 0; i--) this[i] = prefix + this[i];
      return this;
    }),
    (AssetList.prototype.append = function (suffix) {
      for (let i = this.length - 1; i >= 0; i--) this[i] = this[i] + suffix;
      return this;
    }),
    (this.list = function () {
      return (
        window.ASSETS || console.warn("ASSETS list not available"),
        new AssetList(window.ASSETS.slice(0) || [])
      );
    }),
    (this.BASE_PATH = window.HYDRA_ASSETS_BASE_PATH || ""),
    (this.getPath = getPath),
    (this.registerPathReplacement = function (path, replacedPath) {
      (_this.replacementPaths || (_this.replacementPaths = {}),
        (_this.replacementPaths[path] = replacedPath));
    }),
    (this.registerPath = function (path, assets) {
      (_this.dictionary || (_this.dictionary = {}), (_this.dictionary[path] = assets));
    }),
    (this.registerGetPathHook = function (hook) {
      (_getPathHooks ||
        ((_getPathHooks = new Set()),
        (_this.getPath = function (path) {
          for (const hook of _getPathHooks) {
            let result = hook(path, getPath);
            if (result) return result;
          }
          return getPath(path);
        })),
        _getPathHooks.add(hook));
    }),
    (this.unregisterGetPathHook = function (hook) {
      _getPathHooks &&
        (_getPathHooks.delete(hook),
        0 === _getPathHooks.size && ((_getPathHooks = null), (_this.getPath = getPath)));
    }),
    (this.loadImage = function (path, isStore) {
      var img = new Image();
      img.crossOrigin = this.CORS;
      let src = _this.getPath(path);
      return (
        this.disableFallbackImage &&
          path.includes("assets/images/_scenelayout/uv.jpg") &&
          (src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
        (img.src = src),
        (img.loadPromise = function () {
          let promise = Promise.create();
          return ((img.onload = promise.resolve), promise);
        }),
        isStore && (this.IMAGES[path] = img),
        img
      );
    }),
    (this.decodeImage = function (path, params, promise) {
      promise || (promise = Promise.create());
      let img = _this.loadImage(path);
      return (
        (img.onload = () => promise.resolve(img)),
        (img.onerror = () =>
          _this.decodeImage("assets/images/_scenelayout/uv.jpg", params, promise)),
        promise
      );
    }));
  const _supportsNextGen = (function () {
    const testImages = {
      webp: "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
      avif: "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=",
    };
    function checkSupport(format) {
      return new Promise((resolve) => {
        const img = new Image();
        ((img.onload = () => resolve(!0)),
          (img.onerror = () => resolve(!1)),
          (img.src = testImages[format]));
      });
    }
    return Promise.all([
      checkSupport("webp").then((supported) => (_support.webp = supported)),
      checkSupport("avif").then((supported) => (_support.avif = supported)),
    ]);
  })();
  ((this.supportsWebP = function () {
    return _support.webp;
  }),
    (this.supportsAvif = function () {
      return _support.avif;
    }),
    (this.waitForSupportedImage = function () {
      return _supportsNextGen;
    }),
    (this.perfImage = function (path, prefer = "webp") {
      let result = path;
      if (path.includes([".jpg", ".jpeg", ".png"])) {
        const basePath = path.substring(0, path.lastIndexOf("."));
        _support.avif && "avif" === prefer
          ? (result = `${basePath}.avif`)
          : _support.webp && (result = `${basePath}.webp`);
      }
      return result;
    }));
}, "static");
