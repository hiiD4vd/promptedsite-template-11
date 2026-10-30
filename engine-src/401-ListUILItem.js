Class(function ListUILItem(_id, _parent, _template, _index) {
  Inherit(this, Component);
  const _this = this;
  var _folder;
  function onDelete() {
    if (!confirm("You sure you want to delete this?")) return;
    let id = _id;
    (_template().onRemove(id), _this.events.fire(Events.END, { id: id }));
  }
  function onReorder(e) {
    _this.events.fire(Events.UPDATE, e);
  }
  (!(async function initFolder() {
    ((_folder = InputUIL.create(`${_id}_folder`, _parent)).setLabel("Item"),
      _folder.group.draggable(!0),
      _this.events.sub(_folder.group, UIL.REORDER, onReorder),
      (_folder.listUILItem = _this));
  })(),
    (function initTemplate() {
      let id = _id;
      (0, _template().onAdd)(id, _folder, _index);
    })(),
    (function initUI() {
      let actions = [{ title: "Delete", callback: onDelete }],
        hideLabel = !0;
      _folder.addButton("delete", { actions: actions, hideLabel: hideLabel });
    })(),
    (this.setLabel = function (label) {
      _folder.setLabel(label);
    }),
    (this.forceSort = function (index) {
      _folder.group.forceSort(index);
    }),
    (this.open = function () {
      (_folder.group.open(), _folder.group.openChildren());
    }),
    (this.close = function () {
      _folder.group.close();
    }));
});
