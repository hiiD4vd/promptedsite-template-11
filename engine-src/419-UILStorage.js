Class(function UILStorage() {
  Inherit(this, Model);
  const _this = this;
  var _fs;
  ((_this.USE_CACHED_FILE = window.USE_CACHED_FILE || !1), (_this.ID = window.UIL_ID));
  var _data = {},
    _dataSession = {},
    _id = window.UIL_ID || "default";
  const OFFLINE_FIREBASE = Utils.query("offlineFB");
  if (!_this.ID) throw new Error("Missing UIL ID!");
  ((this.SAVE = "uil_save"), (this.UPLOADING = "uil_uploading"), (this.UPLOADED = "uil_uploaded"));
  const _persistentIds = [];
  async function write(direct, silent) {
    let prevent = !1,
      e = { prevent: (_) => (prevent = !0) };
    if ((_this.events.fire(_this.SAVE, e), direct || (e.wait && (await e.wait()), !prevent))) {
      for (let key in _dataSession)
        if (key.includes("/")) {
          let newKey = key.replace(/\//g, "@");
          ((_dataSession[newKey] = _dataSession[key]), delete _dataSession[key]);
        }
      (AppState.set("UILStorage/saving", !0),
        await UILRemote.write(_dataSession, `${_this.ID}/${_id}`),
        await _this.wait(800),
        AppState.set("UILStorage/saving", !1),
        (_dataSession = {}));
    }
  }
  (Hydra.ready(async () => {
    ((_this.state = AppState.createLocal()),
      _this.USE_CACHED_FILE || (await UILRemote.ready()),
      _this.init(),
      __window.bind("keydown", (e) => {
        (e.ctrlKey || e.metaKey) && 83 == e.keyCode && (e.preventDefault(), write());
      }));
  }),
    (_this.write = write),
    (_this.ready = () => _this.wait(_this, "loaded")),
    (_this.init = async (id = null, extension = "", persist = !1) => {
      let data;
      (_fs && _fs.destroy(),
        (_fs = _this.initClass(UILFile, OFFLINE_FIREBASE)),
        (data = _this.USE_CACHED_FILE
          ? await _fs.load()
          : await UILRemote.fetchAllData(`${_this.ID}/${_id}`)));
      for (let key in data) {
        if (key.includes("@")) {
          let newKey = key.replace(/@/g, "/");
          ((data[newKey] = data[key]), delete data[key], (key = newKey));
        }
        _this.state.set(key, data[key]);
      }
      if (
        ((_data[_id] = data),
        (_this.loaded = !0),
        !OFFLINE_FIREBASE &&
          Storage.get("uil_update_partial") &&
          !(function uilFile() {
            return !(
              Utils.query("editMode") ||
              (Hydra.LOCAL &&
                ((window.Config && Config.PLATFORM_CONFIG && Utils.query("uil")) ||
                  (!Device.mobile &&
                    !OFFLINE_FIREBASE &&
                    (!window._BUILT_ || Hydra.LOCAL) &&
                    !window.AURA &&
                    !window._UIL_FILE_ &&
                    (window._FIREBASE_UIL_ || window.UIL_ID) &&
                    (Device.detect("hydra") || Utils.query("uil")))))
            );
          })())
      ) {
        if (
          !confirm(
            "Looks like you have UIL data captured offline, do you want to sync it to Firebase?",
          )
        )
          return clearOfflineData();
        let data = await get("assets/data/uil-partial.json");
        for (let key in data) _this.set(key, data[key]);
        (write(!0), clearOfflineData());
      }
    }),
    (_this.get = (key) => {
      let val = _this.state[key];
      if (
        (null === val && null in _this.state && (val = _this.state.null[key]),
        null === val && _persistentIds.length > 0)
      )
        for (const id of _persistentIds)
          try {
            val = _this.state[id][key];
          } catch {
            val = null;
          }
      return val;
    }),
    (_this.getKeys = () => Array.from(_this.state.getMap().keys())),
    (_this.set = (key, value) => {
      if (JSON.stringify(_this.state[key]) !== JSON.stringify(value)) {
        if (void 0 === value)
          return console.warn(`Trying to set UILStorage with an undefined value for ${key}`);
        (_this.state.set(key, value),
          null === value
            ? (delete _data[_id][key], (_dataSession[key] = value))
            : ((_data[_id][key] = value), (_dataSession[key] = value)));
      }
    }),
    (_this.setCMS = function (key, value) {
      if (JSON.stringify(_this.state[key]) === JSON.stringify(value)) return;
      if (void 0 === value)
        return console.warn(`Trying to set UILStorage with an undefined value for ${key}`);
      _this.state.set(key, value);
      let obj = {};
      ((obj[key] = value), UILRemote.writeCMS(obj, `${_this.ID}/${_id}`));
    }),
    (_this.duplicateData = async (targetLayerDataKeys, newId) => {
      targetLayerDataKeys
        .filter(
          (key) => !key.includes("renderOrder") && !key.includes("sortIndex") && _data[_id][key],
        )
        .map((key) => ({ key: key.replace(/_([\d]+)_/, `_${newId}_`), value: _data[_id][key] }))
        .forEach((item) => {
          _this.set(item.key, item.value);
        });
    }),
    (_this.pasteLayerData = ({
      layerData: layerData,
      newLayerNumber: newLayerNumber,
      sceneName: sceneName,
      oldSceneName: oldSceneName,
    }) => {
      layerData
        .map((item) => {
          let newKey = item.key.replace(/_([\d]+)_/, `_${newLayerNumber}_`);
          return (
            oldSceneName &&
              sceneName &&
              oldSceneName !== sceneName &&
              (newKey = newKey.replace(`_${oldSceneName}`, `_${sceneName}`)),
            { key: newKey, value: item.value }
          );
        })
        .forEach((item) => {
          _this.set(item.key, item.value);
        });
    }),
    (_this.getDataForKeys = (keys) =>
      keys
        .map((key) => ({ key: key, value: _data[_id][key] }))
        .filter((item) => void 0 !== item.value)),
    (_this.deleteItemsWithKeys = (keys) => {
      keys.forEach((key) => {
        ((_data[_id][key] = null), (_dataSession[key] = null));
      });
    }),
    (_this.getAssets = async () => {
      try {
        return UILRemote.getAssets(file);
      } catch (err) {
        Hydra.LOCAL && console.error(err);
      }
    }),
    (_this.handleUpdate = function (ref, data) {
      let [_, id] = ref.split("/");
      for (let key in data) {
        if (key.includes("@")) {
          let newKey = key.replace(/@/g, "/");
          ((data[newKey] = data[key]), delete data[key], (key = newKey));
        }
        _this.state.set(key, data[key]);
      }
      _data[id] = data;
    }),
    (_this.uploadAsset = async (file) => {
      try {
        _this.events.fire(_this.UPLOADING, { file: file });
        let asset = await UILRemote.uploadAsset(file);
        return (_this.events.fire(_this.UPLOADED, { asset: asset, file: file }), asset);
      } catch (err) {
        Hydra.LOCAL && console.error(err);
      }
    }),
    (_this.getHistory = (actorId = null) => null),
    (_this.getUsers = async () => []),
    (_this.hasData = () => _this.state.getMap().size > 0),
    (_this.parse = function (key, hint) {
      const data = _this.state[key];
      if (void 0 === data) return null;
      if (Array.isArray(data)) {
        if (hint instanceof Vector2) return { value: new Vector2().fromArray(data) };
        if (hint instanceof Vector3) return { value: new Vector3().fromArray(data) };
        if (hint instanceof Vector4) return { value: new Vector4().fromArray(data) };
      } else if ("string" == typeof data && "#" === data.charAt(0))
        return { value: new Color(data) };
      return { value: data };
    }));
}, "static");
