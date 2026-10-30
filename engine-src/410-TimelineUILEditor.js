Class(function TimelineUILEditor(_id, _name, _template) {
  Inherit(this, Component);
  const _this = this,
    PANEL_CONFIG = { label: "Timeline Editor", width: "800px", height: "auto", drag: !0 };
  var _gui,
    _list,
    _add,
    _config,
    _items,
    _tabs = [],
    _index = 0;
  function initList() {
    (!(function read() {
      let data = UILStorage.get(`${_id}_list_items`);
      void 0 === data && (data = "[]");
      _items = JSON.parse(data);
    })(),
      (_list = new UILFolder(`${_id}_list`, { hideTitle: !0 })),
      _gui.add(_list));
    for (let id of _items) {
      let view = _this.initClass(TimelineUILItem, id, _list, _template, _index++);
      (_this.events.sub(view, Events.UPDATE, reorder),
        _this.events.sub(view, Events.END, remove),
        _tabs.push(view));
    }
    _config.rails &&
      (function attachRails() {
        _tabs.forEach((t, i) => {
          t.onUpdate = (v) => {
            _tabs.forEach((t2, j) => {
              t2 != t &&
                (j < i && t.getValue() < t2.getValue() && t2.setValue(t.getValue()),
                j > i && t.getValue() > t2.getValue() && t2.setValue(t.getValue()));
            });
          };
        });
      })();
  }
  function initButton(title, callback) {
    let btn = new UILControlButton("button", {
      actions: [{ title: title, callback: callback }],
      hideLabel: !0,
    });
    return (_gui.add(btn), btn);
  }
  function spaceEvenly() {
    _tabs.forEach((t, i) => {
      let perc = Math.range(i, 0, _tabs.length - 1, 0, 1);
      t.setValue(perc);
    });
  }
  function add() {
    let id = `${_id}_${Utils.timestamp()}`,
      view = new TimelineUILItem(id, _list, _template, _index++);
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
      (function initAdd() {
        (_config.lock || (_add = initButton("Add Item", add)).element.css({ width: "20%" }),
          initButton("Space Evenly", spaceEvenly).element.css({ width: "20%" }));
      })());
  }
  ((_this.config = _config = JSON.parse(UILStorage.get(`${_id}_config`) || "{}")),
    (function initPanel() {
      ((_this.gui = _gui = new UILWindow(_id, PANEL_CONFIG)), UIL.add(_gui));
    })(),
    refresh(),
    (this.onDestroy = function () {
      _gui.destroy();
    }));
});
