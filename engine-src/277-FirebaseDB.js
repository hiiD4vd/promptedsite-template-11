Class(function FirebaseDB() {
  Inherit(this, Model);
  const _this = this;
  var _hasInit,
    _app,
    _hasBooted,
    _booted = Promise.create();
  function init() {
    if (!firebase.database) return _this.delayedCall(init);
    _this.dataReady = !0;
  }
  ((this.init = async function () {
    if (_hasInit) return _this.ready();
    ((_hasInit = !0),
      await Firebase.ready(),
      await AssetLoader.loadAssets(["~assets/js/lib/firebase-database.js"]),
      init());
  }),
    (this.sanitize = function (key) {
      return key.replace(/[.$#[\]/]/g, "-");
    }),
    (this.boot = async function (app) {
      return _hasBooted
        ? _booted
        : ((_hasBooted = !0),
          Firebase.init(),
          _this.init(),
          await _this.ready(),
          (_app = app || firebase.initializeApp(Config.PLATFORM_CONFIG)),
          _booted.resolve(_app),
          _app);
    }),
    (this.booted = () => _booted),
    (this.getDB = function (type = "firebase") {
      if (!_app) throw "Wait for FirebaseDB.ready() before calling getDB()";
      return "firebase" === type
        ? new FireDBFirebase(_app.database())
        : "firestore" === type
          ? new FireDBFirestore(_app.firestore())
          : void 0;
    }));
}, "Static");
