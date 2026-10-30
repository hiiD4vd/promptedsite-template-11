Class(function FirebaseStorage() {
  Inherit(this, Model);
  const _this = this;
  let _hasInit;
  function init() {
    if (!firebase.storage) return _this.delayedCall(init);
    _this.dataReady = !0;
  }
  this.init = async function () {
    if (_hasInit) return _this.ready();
    ((_hasInit = !0),
      await Firebase.ready(),
      await AssetLoader.loadAssets(["~assets/js/lib/firebase-storage.js"]),
      init());
  };
}, "Static");
