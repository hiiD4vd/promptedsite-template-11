Class(function ServicesAuth() {
  Inherit(this, Model);
  const _this = this;
  let _app,
    _auth,
    _user,
    _loggedIn,
    _reload,
    _hasInit = !1,
    _providers = {};
  function onAuth(user) {
    if (user) {
      if (((_user = user), (_loggedIn = !0), _reload)) return window.location.reload();
      _this.events.fire("logged_in");
    } else ((_user = null), (_loggedIn = !1), _this.events.fire("logged_out"));
    _this.dataReady = !0;
  }
  ((this.init = async function (app) {
    if (_hasInit) return _hasInit;
    ((_hasInit = Promise.create()),
      await FirebaseAuth.ready(),
      (_app = app),
      (function init() {
        ((_auth = _app.auth()),
          (function initProviders() {
            _providers.google = new firebase.auth.GoogleAuthProvider();
          })(),
          (function addListeners() {
            _auth.onAuthStateChanged(onAuth);
          })(),
          _hasInit.resolve());
      })());
  }),
    (this.isLoggedIn = function () {
      return _loggedIn;
    }),
    (this.user = function () {
      return _user || null;
    }),
    (this.login = function (email, password) {
      if (_auth) return _auth.signInWithEmailAndPassword(email, password);
      console.error("Auth not ready");
    }),
    (this.loginGoogle = function (r = !1) {
      if (((_reload = r), _auth && _providers.google))
        return _auth.signInWithPopup(_providers.google);
      console.error("Google login error");
    }),
    (this.logout = function () {
      if (_auth) return ((_user = null), _auth.signOut());
      console.error("Auth not ready");
    }));
}, "Static");
