Class(function TimelineUIL() {
  Inherit(this, Component);
  const _this = this;
  var _panel,
    _created = {};
  function removePanel() {
    _panel &&
      _panel.destroy &&
      (_this.events.unsub(_panel, Events.COMPLETE, removePanel), (_panel = _panel.destroy()));
  }
  ((this.create = function (id, version = 1, group) {
    ("number" != typeof version && ((group = version), (version = 1)),
      (group = null === group ? null : group || UIL.global));
    let config = new TimelineUILConfig(id, version, UIL.global && !_created[id]);
    return (
      UIL.global &&
        (_created[id] ||
          ((_created[id] = config), null != group && config.appendUILGroup(group || UIL.global))),
      config
    );
  }),
    (this.openPanel = function (id, name, template) {
      return (
        removePanel(),
        (_panel = new TimelineUILEditor(id, name, template)),
        _this.events.sub(_panel, Events.COMPLETE, removePanel),
        _panel
      );
    }),
    (this.set = function () {}),
    (this.get = function () {}));
}, "static");
