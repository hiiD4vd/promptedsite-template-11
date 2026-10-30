Class(function Container() {
  Inherit(this, Element);
  const _this = this,
    $this = this.element;
  var _app;
  (AppState.set("Global/playground", !1),
    (_app = _this.initClass(App)),
    (function initHTML() {
      (Stage.add($this), $this.css({ position: "static" }));
    })(),
    (async function loadView() {
      (await AssetLoader.loadAssets(["assets/js/lib/lottie.min.js"]),
        await AssetLoader.waitForLib("lottie"));
      let loader = _this.initClass(
        AssetLoader,
        Assets.list().filter(_app.loaderData.assets.split(",").map((f) => f.trim())),
      );
      ((Global.loader = loader),
        _this.initClass(AgeGate),
        _this.initClass(window[_app.loaderData.fragment], { loader: loader }));
      let promises = [];
      (_app.firebaseData && promises.push(Firebase.boot(_app.firebaseData, loader)),
        loader.add(1),
        loader.add(3),
        await Promise.all([...promises, Initializer3D.createWorld()]),
        await _this.wait(() => AppState.get("VOManager/loaded")),
        loader.trigger(1),
        AppState.set("Global/loadComplete", !0),
        (function initView() {
          (World.instance(), $this.add(World.ELEMENT));
          let entryPoint = _app.entryPointData;
          ((entryPoint = entryPoint?.startsWith("$")
            ? window[_app[entryPoint.slice(1)]()]
            : window[entryPoint]),
            _this.initClass(entryPoint));
        })());
    })());
}, "singleton");
