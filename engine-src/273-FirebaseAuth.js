Class(function FirebaseAuth() {
  Inherit(this, Model);
  const _this = this;
  var _hasInit;
  function init() {
    if (!firebase.auth) return _this.delayedCall(init);
    _this.dataReady = !0;
  }
  this.init = async function () {
    if (_hasInit) return _this.ready();
    ((_hasInit = !0),
      await Firebase.ready(),
      await AssetLoader.loadAssets(["~assets/js/lib/firebase-auth.js"]),
      init());
  };
}, "Static");
