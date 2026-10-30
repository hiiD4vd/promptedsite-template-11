Class(function TimelineUILItem(_id, _parent, _template, _index) {
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
      (_this.parent && _this.parent.config.lock) || _folder.group.draggable(!0),
      _this.events.sub(_folder.group, UIL.REORDER, onReorder),
      _folder.group.open());
  })(),
    (function initTemplate() {
      let id = _id;
      (0, _template().onAdd)(id, _folder, _index);
    })(),
    (function initUI() {
      (_folder.add("label", _this.parent && _this.parent.config.lock ? "hidden" : void 0),
        _folder.addRange("keyframe"),
        _folder.add("percent", "hidden"),
        _folder.getField("keyframe").force(Math.round(100 * _folder.getNumber("percent")) || 0),
        (_folder.onUpdate = (key) => {
          if ("keyframe" == key) {
            let val = _folder.getNumber(key) / 100;
            (_folder.setValue("percent", val), _this.onUpdate && _this.onUpdate(val));
          }
        }));
      let label = _folder.get("label");
      if ((label && _folder.setLabel(label), !_this.parent || !_this.parent.config.lock)) {
        let actions = [{ title: "Delete", callback: onDelete }],
          hideLabel = !0,
          btn =
            (_folder.addButton("delete", { actions: actions, hideLabel: hideLabel }),
            _folder.getField("delete"));
        btn && btn.$content.css({ width: "20%" });
      }
    })(),
    (this.setLabel = function (label) {
      _folder.setLabel(label);
    }),
    (this.getValue = function (value) {
      return _folder.getNumber("percent");
    }),
    (this.setValue = function (value) {
      (_folder.setValue("percent", value),
        _folder.getField("keyframe").force(Math.round(100 * value) || 0));
    }));
});
