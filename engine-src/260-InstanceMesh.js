Class(
  function InstanceMesh(_mesh, _shader, _group, _input) {
    Inherit(this, Component);
    const _this = this;
    var _config,
      _frustumCulled = !1,
      _blankShader,
      _instanceGroup;
    function initHotReload() {
      ((_mesh.cacheGeom = _mesh.geometry.clone()),
        _this.events.sub(SceneLayout.HOTLOAD_GEOMETRY, ({ file: file }) => {
          (_mesh.geometry?._src?.includes(file) &&
            GeomThread.loadGeometry(file).then((_) => {
              createInstanceMesh(_config.getFilePath("json"));
            }),
            file.includes(_config.getFilePath("json")) &&
              createInstanceMesh(_config.getFilePath("json")));
        }));
    }
    async function createInstanceMesh(file) {
      if (!file) return;
      let isBinary = file.includes(".bin"),
        data;
      (file.includes("http") ||
        file.includes("assets/geometry") ||
        (file = `assets/geometry/${file}`),
        isBinary || file.includes(".json") || (file += ".json"),
        _mesh.cacheGeom && (file += "?" + Utils.timestamp()),
        _mesh.instanceMesh && (_mesh.instanceMesh.visible = !1),
        isBinary
          ? (await GeomThread.loadDracoLib(),
            (data = await Thread.shared().loadDraco({
              type: "decode",
              path: Thread.absolutePath(Assets.getPath(file)),
            })))
          : (data = await Thread.shared().parseInstanceMesh({
              url: Thread.absolutePath(Assets.getPath(file)),
            })));
      let isStatic = !_config.get("dynamic");
      if (
        ((_this.batch = _this.initClass(MeshBatch, { visibilityCheck: !isStatic })),
        _mesh._parent.add(_this.batch.group),
        (_this.batch.static = isStatic),
        (_this.batch.frustumCulled = _frustumCulled),
        (_this.batch.onMeshCreated = (mesh) => {
          let geom = mesh.geometry;
          for (let key in data) {
            if (["_type", "userData", "offset", "orientation", "scale"].includes(key)) continue;
            let itemSize = data[`${key}ItemSize`];
            "number" == typeof itemSize &&
              geom.addAttribute(
                key,
                new GeometryAttribute(data[key], itemSize, 1, _this.batch.useDynamic),
              );
          }
          let instances = [];
          for (let i = 0; i < count; i++) instances.push(i);
          (geom.addAttribute("instance", new GeometryAttribute(new Float32Array(instances), 1, 1)),
            (_mesh.instanceMesh = mesh),
            mesh.position.copy(_mesh.position),
            mesh.quaternion.copy(_mesh.quaternion),
            mesh.scale.copy(_mesh.scale),
            (mesh.geometry.maxInstancedCount = _this.maxInstancedCount * _this.instanceMultiplier),
            _mesh.instanceMeshReady.resolve());
        }),
        !data.offsetItemSize)
      )
        return;
      let count = data.offset.length / data.offsetItemSize;
      for (let i = 0; i < count; ++i) {
        let m = new Mesh(_mesh.cacheGeom || _mesh.geometry, _mesh.shader);
        (m.position.fromArray(data.offset, i * data.offsetItemSize),
          data.orientation &&
            m.quaternion.fromArray(data.orientation, i * data.orientationItemSize),
          data.scale && m.scale.fromArray(data.scale, i * data.scaleItemSize),
          (m.renderOrder = _mesh.renderOrder),
          (m.castShadow = _mesh.castShadow),
          (m.frustumCulled = !1),
          (m.renderOrder = _mesh.renderOrder),
          (m.castShadow = _mesh.castShadow),
          (m.receiveLight = _mesh.receiveLight),
          (m.shader.neverRender = !1),
          _this.batch.add(m),
          (m.shader.neverRender = !1),
          (m.shader = _blankShader),
          _instanceGroup.add(m));
      }
      let test = _config.get("test");
      (test && (_this.instanceMultiplier = eval(test)),
        void 0 === _this.maxInstancedCount && (_this.maxInstancedCount = count),
        isStatic && (await _this.batch.staticReady(), (_instanceGroup.matrixAutoUpdate = !1)));
    }
    function addHandlers() {
      (_this.events.sub(MeshUIL.UPDATE, handleMeshUpdate),
        _this.bindState(
          UILStorage.state,
          `MESH_${_mesh.prefix}position`,
          (val) => _mesh.instanceMesh && _mesh.instanceMesh.position.fromArray(val),
        ),
        _this.bindState(
          UILStorage.state,
          `MESH_${_mesh.prefix}rotation`,
          (val) =>
            _mesh.instanceMesh && _mesh.instanceMesh.rotation.fromArray(val.map(Math.radians)),
        ),
        _this.bindState(
          UILStorage.state,
          `MESH_${_mesh.prefix}scale`,
          (val) => _mesh.instanceMesh && _mesh.instanceMesh.scale.fromArray(val),
        ),
        Hydra.LOCAL &&
          UIL.global &&
          (_this.events.sub(UILGraphNode.TOGGLE_VISIBILITY, handleToggleVisibility),
          _this.events.sub(InputUIL.UPDATE, handleUILUpdate)));
    }
    function handleMeshUpdate({ key: key, prefix: prefix, val: val }) {
      if (_mesh.instanceMesh && (prefix = prefix.substring(5)) === _mesh.prefix)
        switch (key) {
          case "position":
            _mesh.instanceMesh.position.fromArray(val);
            break;
          case "rotation":
            _mesh.instanceMesh.rotation.fromArray(val.map(Math.radians));
            break;
          case "scale":
            _mesh.instanceMesh.scale.fromArray(val);
        }
    }
    function handleToggleVisibility({ id: id, visible: visible }) {
      _this.batch &&
        _mesh.uilGroup &&
        id === _mesh.uilGroup.id &&
        (_this.batch.group.visible = visible);
    }
    function handleUILUpdate(e) {
      _this.batch &&
        e.group === _input &&
        "visible" === e.key &&
        (_this.batch.group.visible = _input.get("visible"));
    }
    ((this.instanceMultiplier = 1),
      (_config = InputUIL.create("im_" + _input.prefix, _group)).addFile("json", {
        relative: "assets/geometry",
      }),
      _config.add("test"),
      _config.addToggle("dynamic", !1),
      _config.setLabel("Instance"),
      !1 !== _input.get("visible") &&
        ((_this._config = _config),
        ((_blankShader = Utils3D.getTestShader()).visible = !1),
        ((_instanceGroup = new Group()).doNotProject = !0),
        _mesh._parent.add(_instanceGroup),
        _mesh._parent.remove(_mesh),
        (_mesh.visible = !1),
        (_mesh.geometry.destroyDataAfterUpload = !1),
        (_mesh.instanceMeshReady = Promise.create()),
        (_mesh.instanceMeshBeforeReady = Promise.create()),
        createInstanceMesh(_config.getFilePath("json")),
        (_config.onUpdate = (_) => {
          createInstanceMesh(_config.getFilePath("json"));
        }),
        addHandlers(),
        Hydra.LOCAL && initHotReload()),
      (this.applyToShader = function (shader) {
        _this.batch.applyToShader(shader);
      }),
      this.get("frustumCulled", () => (_this.batch ? _this.batch.frustumCulled : _frustumCulled)),
      this.set("frustumCulled", async (b) => {
        (_this.batch && (_this.batch.frustumCulled = b), (_frustumCulled = b));
      }));
  },
  (_) => {
    Thread.upload(function parseInstanceMesh({ url: url }, id) {
      get(url).then((data) => {
        let bufferList = {},
          buffers = [];
        if (data.data && data.metadata?.type) {
          bufferList._type = data.metadata.type;
          let jsonData = data.data;
          for (let key in jsonData.attributes) {
            let attrib = jsonData.attributes[key];
            ((bufferList[key] = new Geometry.TYPED_ARRAYS[attrib.type](attrib.array)),
              (bufferList[`${key}ItemSize`] = attrib.itemSize),
              buffers.push(bufferList[key].buffer));
          }
        } else {
          bufferList._type = "BufferGeometry";
          for (let key in data) {
            let attrib = data[key];
            ((bufferList[key] = new Float32Array(attrib.buffer)),
              (bufferList[`${key}ItemSize`] = attrib.components),
              buffers.push(bufferList[key].buffer));
          }
        }
        resolve(bufferList, id, buffers);
      });
    });
  },
);
