Class(function UILClipboard() {
  Inherit(this, Component);
  var _store = {};
  ((this.copy = function (folders) {
    _store = {};
    for (let key in folders) {
      let folder = folders[key];
      _store[folder.label] = folder.value;
    }
  }),
    (this.paste = function (folders) {
      for (let key in folders) {
        let folder = folders[key];
        folder &&
          null != _store[folder.label] &&
          (key.includes("name") ||
            key.includes("shader") ||
            (folder.force(_store[folder.label], !0), folder.finish()));
      }
    }),
    this.get("store", (_) => _store));
}, "static");
