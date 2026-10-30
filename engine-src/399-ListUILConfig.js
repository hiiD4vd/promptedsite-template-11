Class(
  function ListUILConfig(_id, _version = 1, _store) {
    Inherit(this, Component);
    const _this = this;
    var _items,
      _folder,
      _config,
      _template = { onSort: (_) => {}, onAdd: (_) => {}, onRemove: (_) => {} },
      _name = "";
    function updateConfig() {
      _config.version = _version;
    }
    function edit() {
      let panel = ListUIL.openPanel(_id, _name, _this.template);
      (_this.events.bubble(panel, Events.UPDATE), _this.events.fire(ListUIL.OPEN));
    }
    (_store && (_items = []),
      (function initConfig() {
        (_config = UILStorage.get(
          (function name() {
            return `LIST_${_id}_config`;
          })(),
        ))
          ? _config.version != _version && updateConfig()
          : ((_config = {}), updateConfig());
      })(),
      (this.add = function (item) {
        return (_items && _items.push(item), item);
      }),
      (this.template = function (config) {
        return ("function" == typeof config && (_template = config), _template);
      }),
      (this.appendUILGroup = function (uil) {
        let folder = new UILFolder("LIST_" + _id, { closed: !0 }),
          button = new UILControlButton("button", {
            actions: [{ title: "Edit List", callback: edit }],
            hideLabel: !0,
          });
        (folder.add(button), uil.add(folder), (_folder = folder));
      }),
      (this.setLabel = function (name) {
        (_folder && _folder.setLabel(name), (_name = name));
      }),
      (this.onAdd = function (cb) {
        _template.onAdd = cb;
      }),
      (this.onRemove = function (cb) {
        _template.onRemove = cb;
      }),
      (this.onSort = function (cb) {
        _template.onSort = cb;
      }),
      (this.internalAddItems = function (count) {
        if (!count) return;
        let array = [];
        for (let i = 0; i < count; i++) {
          let id = `${_id}_${Utils.timestamp()}`;
          array.push(id);
        }
        UILStorage.set(`${_id}_list_items`, JSON.stringify(array));
      }));
  },
  (_) => {
    ListUIL.OPEN = "list_uil_open";
  },
);
