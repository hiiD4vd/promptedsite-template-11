Class(
  function XComponent() {
    const _this = this;
    var _state;
    (_this.state ||
      Object.defineProperty(_this, "state", {
        set: function (v) {
          throw "Don't override state!";
        },
        get: function () {
          return (
            _state ||
            (((_state = AppState.createLocal())._bind = _state.bind),
            (_state.bind = function (key, callback) {
              _this.bindState(_state, key, callback);
            }),
            (_state.fire = function (key, value) {
              _state.set(key, value, !0);
            }),
            AppState.set(_this.fragName + "/state", _state),
            _state)
          );
        },
      }),
      (_this.createState = (_) => this.state),
      (_this.createFragment = this.initClass),
      _this._bindOnDestroy((_) => {
        (_state?.destroy?.(), AppState.clearKeysMatching(_this.fragName + "/"));
      }));
  },
  (_) => {
    XComponent.inheritanceChain = {};
    const _this = XComponent.inheritanceChain;
    ((_this.fragName = "overwritten in descendent"),
      (_this.contexts = "overwritten in descendent"),
      (_this.help = function () {
        (console.groupCollapsed(`Fragment ${this.fragName} Overview`),
          console.log(`Your context(s) are: ${this.contexts}`),
          console.log("You have access to the following $ methods:"));
        for (let key in this)
          "_" != key.charAt(0) &&
            (key.includes([
              "flag",
              "initClass",
              "classes",
              "events",
              "parent",
              "findParent",
              "bindState",
            ]) ||
              console.log("$" + key));
        console.groupEnd();
      }),
      (_this.set = function (key, value) {
        (void 0 === value && (value = Utils.uuid()),
          key.includes("/") || (key = this.fragName + "/" + key),
          AppState.set(key, value));
      }),
      (_this.unset = function (key) {
        (key.includes("/") || (key = this.fragName + "/" + key), AppState.map.delete(key));
      }),
      (_this.fn = function (key, callback) {
        if (callback && "function" != typeof callback)
          throw "$fn requires callback to be a function";
        if (!callback) return this.get(key);
        this.set(key, callback);
      }),
      (_this.fire = function (key, value) {
        (void 0 === value && (value = Utils.uuid()),
          key.includes("/") || (key = this.fragName + "/" + key),
          AppState.set(key, value, !0));
      }),
      (_this.bind = _this.listen =
        function (keys, callback, ref) {
          if (
            "function" == typeof ref &&
            ("string" == typeof callback || Array.isArray(callback))
          ) {
            let rref = keys;
            ((keys = callback), (callback = ref), (ref = rref));
          }
          return ref
            ? (ref.state && ref.state.isAppState && (ref = ref.state),
              ref.isAppState
                ? this.bindState(ref, keys, callback)
                : this.events.sub(ref, keys, callback))
            : "string" == typeof keys && keys.startsWith("hydra_")
              ? this.events.sub(keys, callback)
              : (Array.isArray(keys)
                  ? (keys = keys.map((key) =>
                      key.includes("/") ? key : `${this.fragName}/${key}`,
                    ))
                  : keys.includes("/") || (keys = `${this.fragName}/${keys}`),
                this.bindState(AppState, keys, callback));
        }),
      (_this.get = function (key, noPromise) {
        let state = AppState;
        (key.isAppState && ((state = key), (key = noPromise), (noPromise = arguments[2])),
          state != AppState || key.includes("/") || (key = this.fragName + "/" + key));
        let value = state.get(key);
        if (void 0 !== value || noPromise) return value;
        {
          let timer,
            promise = Promise.create();
          const cb = (_) => {
            ((value = state.get(key)),
              void 0 !== value && (clearTimeout(timer), promise.resolve(value), Render.stop(cb)));
          };
          return (
            Render.start(cb, 24),
            Hydra.LOCAL &&
              (timer = this.delayedCall((_) => {
                console.warn(`$get ${key} has timed out after 5 seconds`);
              }, 5e3)),
            promise
          );
        }
      }),
      (_this.getSync = function (a, b, c) {
        return void 0 === b ? this.get(a, !0) : this.get(a, b, !0);
      }),
      (_this.createUIL = function () {
        let input = InputUIL.create.apply(this, arguments),
          appState = AppState.createLocal();
        arguments[arguments.length - 1] == UIL.cms && (input.CMS = !0);
        let promise = Promise.create();
        return (
          (appState.ready = (_) => promise),
          (input.onUpdate = (key) => {
            let val = input.get(key);
            (isNaN(val) || (val = Number(val)),
              appState.set(key, val),
              promise &&
                defer((_) => {
                  (promise?.resolve(), (promise = null));
                }));
          }),
          [input, appState]
        );
      }),
      (_this.requestData = Data.makeRequest),
      (_this.fulfillDataRequest = Data.request),
      Hydra.ready((_) => {
        ((_this.h = window.$), (_this.gl = window.$gl), (_this.glText = window.$glText));
      }),
      (_this.waitLayers = async function () {
        (this.parent.layout?.getAllLayers &&
          (this.layers = await this.parent.layout.getAllLayers()),
          this.parent?.getAllLayers && (this.layers = await this.parent.getAllLayers()));
      }));
  },
);
