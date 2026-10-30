Class(
  function PushState(_isHash) {
    Inherit(this, Component);
    const _this = this;
    let _store,
      _useInternal,
      _root = "";
    function getState() {
      return _useInternal
        ? new String(_store)
        : _isHash
          ? String(window.location.hash.slice(3))
          : ("/" !== _root && "" !== _root
              ? location.pathname.split(_root)[1]
              : location.pathname.slice(1)) || "";
    }
    function handleStateChange(state, forced) {
      if (state === _store && !forced) return;
      if (_this.flag("isInitializingUseInternal")) return;
      if (_this.isLocked && !forced) {
        if (!_store) return;
        return void (
          _useInternal ||
          (_isHash
            ? (window.location.hash = "!/" + _store)
            : window.history.pushState(null, null, Utils.addQueryToPath(_root + _store)))
        );
      }
      let prevValue = _store;
      ((_store = state),
        _this.events.fire(Events.UPDATE, {
          prevValue: prevValue,
          value: state,
          split: state.split("/"),
        }),
        _this.onStateUpdate?.({ prevValue: prevValue, value: state, split: state.split("/") }));
    }
    ("boolean" != typeof _isHash && (_isHash = Hydra.LOCAL || !Device.system.pushstate),
      (this.isLocked = !1),
      _this.flag("isNotBlocked", !0),
      (function addHandlers() {
        const handler = () => handleStateChange(getState());
        (_isHash
          ? window.addEventListener("hashchange", handler, !1)
          : window.addEventListener("popstate", handler, !1),
          _this._bindOnDestroy(() => {
            _isHash
              ? window.removeEventListener("hashchange", handler, !1)
              : window.removeEventListener("popstate", handler, !1);
          }));
      })(),
      (_store = getState()),
      _this.flag("isInitializing", !0),
      deferNextTick(() => {
        _this.flag("isInitializing", !1);
      }),
      (this.getState = this._getState =
        function () {
          return Device.mobile.native ? Storage.get("app_state") || "" : getState();
        }),
      (this.setRoot = function (root) {
        _root = "/" === root.charAt(0) ? root : "/" + root;
      }),
      (this.setState = this._setState =
        async function (state, forced) {
          if (
            ("/" == state.charAt(0) && (state = state.slice(1)),
            _this.events.fire(PushState.SET_STATE),
            await _this.wait("isNotBlocked"),
            Device.mobile.native && Storage.set("app_state", state),
            state !== _store || forced)
          )
            return (
              _useInternal
                ? (_store = state)
                : _isHash
                  ? (window.location.hash = "!/" + state)
                  : window.history.pushState(null, null, Utils.addQueryToPath(_root + state)),
              _this.fireChangeWhenSet && handleStateChange(getState(), forced),
              (_store = state),
              !0
            );
        }),
      (this.enableBlocker = function () {
        _this.flag("isNotBlocked", !1);
      }),
      (this.disableBlocker = function () {
        _this.flag("isNotBlocked", !0);
      }),
      (this.replaceState = function (state) {
        state !== _store &&
          (_useInternal
            ? (_store = state)
            : _isHash
              ? (window.location.hash = "!/" + state)
              : window.history.replaceState(null, null, Utils.addQueryToPath(_root + state)),
          _this.fireChangeWhenSet ? handleStateChange(getState(), !0) : (_store = state));
      }),
      (this.setTitle = function (title) {
        document.title = title;
      }),
      (this.lock = function () {
        ((this.isLocked = !0), _this.events.fire(PushState.LOCK));
      }),
      (this.unlock = function () {
        ((this.isLocked = !1), _this.events.fire(PushState.UNLOCK));
      }),
      (this.useHash = function () {
        _isHash = !0;
      }),
      (this.useInternal = function () {
        (_this.flag("isInitializing") &&
          "" !== _store &&
          (_this.flag("isInitializingUseInternal", !0),
          _this.replaceState(""),
          deferNextTick(() => {
            _this.flag("isInitializingUseInternal", !1);
          })),
          (_useInternal = !0));
      }));
  },
  (_) => {
    ((PushState.SET_STATE = "push_state_set_state"),
      (PushState.LOCK = "push_state_lock"),
      (PushState.UNLOCK = "push_state_unlock"));
  },
);
