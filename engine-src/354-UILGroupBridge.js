Class(function UILGroupBridge() {
  Inherit(this, Component);
  const _this = this;
  var _map = new Map();
  function Bridge(name) {
    let store = InputUIL.create(`scenelayout_${name}`, null),
      data = JSON.parse(store.get("data") || "{}");
    (void 0 === data.layers && (data.layers = -1), void 0 === data.groups && (data.groups = -1));
    var _healedGroups,
      _healedMap,
      _name = name;
    ((this.all = new StateArray()),
      (this.layers = new StateArray()),
      (this.groups = new StateArray()));
    const $this = this;
    async function bindChanges(obj, key) {
      (await _this.wait($this, "sceneLayout"),
        $this.sceneLayout.bindState(obj, "name", (name) => {
          UILStorage.set(`${key}_name`, name);
        }),
        $this.sceneLayout.bindState(obj, "sortIndex", (index) => {
          UILStorage.set(`${key}_sortIndex`, index);
        }),
        $this.sceneLayout.bindState(obj, "parent", (parent) => {
          UILStorage.set(`${key}_parent`, parent);
        }));
    }
    function run() {
      data.groups = Math.max(
        data.groups,
        Number(UILStorage.get(`groupBridge_${name}_groups`)) - 1 || -1,
      );
      let healedGroups = (_healedGroups = Number(UILStorage.get(`groupBridge_${name}healGroups`)));
      healedGroups > 0 && (_healedMap = {});
      for (let i = 0, c = data.layers + 1; i < c; i++) {
        let obj = AppState.createLocal(),
          key = `INPUT_Config_${i}_${name}`;
        ((obj.deleted = UILStorage.get(`sl_${name}_${i}_deleted`)),
          (obj.visible = !0),
          (obj.parent = UILStorage.get(`${key}_parent`)),
          (obj.name = UILStorage.get(`${key}_name`) || "layer_" + i),
          (obj.id = `sl_${name}_${i}`),
          (obj.firebaseKeyPrefix = key),
          (obj.sortIndex = Number(UILStorage.get(`${key}_sortIndex`))),
          isNaN(obj.sortIndex) && (obj.sortIndex = $this.all.length),
          $this.layers.push(obj),
          obj.deleted || $this.all.push(obj),
          (obj.type = "layer"),
          bindChanges(obj, key),
          this.onChange?.());
      }
      this.groups = new StateArray();
      for (let i = 0, c = data.groups + 1; i < c; i++) {
        if (healedGroups > 0 && i < healedGroups) continue;
        let obj = AppState.createLocal(),
          key = `GROUP_${name}_group_${i}`;
        ((obj.visible = !0),
          (obj.children = new StateArray()),
          (obj.id = `sl_${name}_group_${i}`),
          (obj.deleted = UILStorage.get(`groupBridge_${obj.id}_deleted`)),
          (obj.name = UILStorage.get(`${key}_name`) || "group_" + i),
          (obj.firebaseKeyPrefix = key),
          (obj.sortIndex = Number(UILStorage.get(`${key}_sortIndex`))),
          isNaN(obj.sortIndex) && (obj.sortIndex = $this.all.length),
          $this.groups.push(obj),
          (obj.type = "group"),
          _this.wait($this, "sceneLayout").then((_) => {
            $this.sceneLayout._getGroup("group_" + i, healedGroups > 0 ? i : void 0);
          }),
          _healedMap && (_healedMap[i] = obj),
          obj.deleted || $this.all.push(obj),
          bindChanges(obj, key));
      }
      $this.all.sort((a, b) => a.sortIndex - b.sortIndex);
    }
    (run(),
      (this.createGroup = async function ({ groupName: groupName } = {}) {
        let obj = AppState.createLocal();
        ((obj.deleted = !1),
          (obj.visible = !0),
          (obj.type = "group"),
          (obj.children = new StateArray()),
          (obj.sortIndex = this.all.length),
          this.groups.push(obj),
          this.all.push(obj));
        let prevCount = Number(UILStorage.get(`groupBridge_${name}_groups`)) || 0;
        return (
          UILStorage.set(`groupBridge_${name}_groups`, prevCount + 1),
          _healedGroups > 0
            ? ((prevCount += _healedGroups),
              this.sceneLayout._getGroup("group_" + prevCount, prevCount),
              (_healedMap[prevCount] = obj))
            : this.sceneLayout._createGroup(),
          (obj.name = groupName || "group_" + prevCount),
          (obj.id = `sl_${name}_group_${prevCount}`),
          obj
        );
      }),
      (this.syncGroup = function (index, name) {
        let obj = AppState.createLocal();
        return (
          (obj.deleted = !1),
          (obj.visible = !0),
          (obj.type = "group"),
          (obj.children = new StateArray()),
          (obj.sortIndex = this.all.length),
          this.groups.push(obj),
          this.all.push(obj),
          (obj.name = name),
          (obj.id = `sl_${_name}_${name}`),
          obj
        );
      }),
      (this.getGroup = function (index) {
        return _healedMap ? _healedMap[index] : this.groups[index];
      }),
      (this.healGroups = function (index) {
        Number(UILStorage.get(`groupBridge_${name}healGroups`)) > 0 ||
          UILStorage.set(`groupBridge_${name}healGroups`, index);
      }),
      (this.createLayer = async function (
        parent,
        { layerName: layerName, titleString: titleString } = {},
      ) {
        let obj = AppState.createLocal(),
          key = `INPUT_Config_${this.layers.length}_${name}`;
        ((obj.deleted = !1),
          (obj.visible = !0),
          (obj.parent = parent),
          (obj.name = layerName || "layer_" + this.layers.length),
          (obj.type = "layer"),
          (obj.id = `sl_${name}_${this.layers.length}`),
          (obj.sortIndex = this.all.length),
          (obj.layerId = this.layers.length),
          (obj.titleString = titleString || obj.name),
          (obj.firebaseKeyPrefix = key),
          this.layers.push(obj),
          this.all.push(obj));
        let layer = await this.sceneLayout._createLayer();
        return (
          (obj.name = layer.get("name") || obj.name),
          bindChanges(obj, key),
          this.onChange?.(),
          obj
        );
      }),
      (this.sync = function () {
        (this.all.refresh([]), this.layers.refresh([]), this.groups.refresh([]), run());
      }),
      (this.deleteNode = function (obj) {
        return obj.children?.length
          ? alert("You can't delete a group with children")
          : confirm("Are you sure you want to delete this layer?")
            ? ((obj.deleted = !0),
              this.all.remove(obj),
              "layer" == obj.type && this.sceneLayout._deleteLayer(obj.id, obj.name, !0),
              "group" == obj.type &&
                (this.sceneLayout._deleteGroup(obj.id, obj.name, !0),
                UILStorage.set(`groupBridge_${obj.id}_deleted`, !0)),
              !0)
            : void 0;
      }),
      (this.calculateRenderFraction = async function (index) {
        let parent,
          obj = this.layers[index];
        if (
          (this.groups.forEach((node) => {
            node.id.includes(obj.parent) && (parent = node);
          }),
          !parent)
        )
          return [0, 0];
        let fraction = (parent.children.indexOf(obj) / (parent.children.length - 1)) * 0.99;
        return isNaN(fraction)
          ? (await _this.wait(50), this.calculateRenderFraction(index))
          : [fraction, parent.sortIndex];
      }),
      (this.destroySceneLayout = async function (name, layout) {
        layout && (_map.delete(layout), _map.get(name) === this && _map.delete(name));
      }));
  }
  this.createSceneLayout = this.create = async function (name, layout) {
    if ((layout || (await _this.wait((_) => _map.has(name))), layout && !_map.has(layout))) {
      let bridge = new Bridge(name);
      (_map.set(layout, bridge),
        _map.has(name) || _map.set(name, bridge),
        (bridge.sceneLayout = layout));
    }
    return layout ? _map.get(layout) : _map.get(name);
  };
}, "static");
