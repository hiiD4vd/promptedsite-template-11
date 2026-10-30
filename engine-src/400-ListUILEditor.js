Class(function ListUILEditor(_id, _name, _template) {
  Inherit(this, Component);
  const _this = this,
    PANEL_CONFIG = { label: _name || "List", width: "400px", height: "auto", drag: !0 };
  var _gui,
    _list,
    _add,
    _items,
    _tabs = [],
    _index = 0;
  function initList() {
    (!(function read() {
      let data = UILStorage.get(`${_id}_list_items`);
      void 0 === data && (data = "[]");
      _items = JSON.parse(data);
    })(),
      (_list = new UILFolder(`${_id}_list`, { hideTitle: !0 })).enableSorting(_id),
      _gui.add(_list));
    for (let id of _items) {
      let view = new ListUILItem(id, _list, _template, _index++);
      (_this.events.sub(view, Events.UPDATE, reorder),
        _this.events.sub(view, Events.END, remove),
        _tabs.push(view));
    }
  }
  function initAdd() {
    !(function initButton(title, callback) {
      ((_add = new UILControlButton("button", {
        actions: [{ title: title, callback: callback }],
        hideLabel: !0,
      })),
        _gui.add(_add));
    })("Add Item", add);
  }
  function add() {
    let id = `${_id}_${Utils.timestamp()}`,
      view = new ListUILItem(id, _list, _template, _index++);
    (_this.events.sub(view, Events.UPDATE, reorder),
      _this.events.sub(view, Events.END, remove),
      _tabs.push(view),
      _items.push(id),
      write());
  }
  function reorder(e) {
    let order = [];
    for (let item of e.order) order.push(item.split("_folder")[0]);
    ((_items = order),
      _template().onSort(_items),
      write(),
      _this.events.fire(Events.UPDATE, { order: order }));
  }
  function close() {
    _this.events.fire(Events.COMPLETE);
  }
  function remove(e) {
    (_items.remove(e.id), write(), refresh());
  }
  function write() {
    let data = JSON.stringify(_items);
    UILStorage.set(`${_id}_list_items`, data);
  }
  function refresh() {
    ((_index = 0),
      _list && _list.destroy && (_list = _list.destroy()),
      _add && _add.destroy && (_add = _add.destroy()),
      initList(),
      initAdd());
  }
  (!(function initPanel() {
    ((_this.gui = _gui = new UILWindow(_id, PANEL_CONFIG)),
      (_this.gui.onClose = close),
      UIL.add(_gui));
  })(),
    refresh(),
    (this.onDestroy = function () {
      _gui.destroy();
    }),
    (this.add = function () {
      add();
    }));
});
