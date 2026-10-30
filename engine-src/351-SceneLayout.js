Class(
  function SceneLayout(_name, _options = {}) {
    Inherit(this, Object3D);
    const _this = this;
    var _dataStore,
      _data,
      _timeline,
      _breakpoint,
      _stateData,
      _gizmo,
      _initializers = [],
      _promiseCount = 0,
      _promisesAllSettled = Promise.create(),
      _breakpoints = [],
      _folders = {},
      _groups = {},
      _custom = {},
      _meshes = {},
      _exists = {},
      _layers = {},
      _uil = UIL.sidebar,
      _graph,
      _config,
      _groupIndex = 0,
      _groupsSynced = Promise.create();
    async function initialize(promise) {
      try {
        ((_promiseCount += 1), await promise);
      } finally {
        0 === (_promiseCount -= 1) && _promisesAllSettled.resolve();
      }
    }
    function initGizmo() {
      _options.noGizmo ||
        Utils.query("nogizmo") ||
        RenderManager.type != RenderManager.NORMAL ||
        (_gizmo = _this.initClass(SceneLayoutGizmo));
    }
    function createFolder(name) {
      let folder = new UILFolder(`sl_${_name}_${name}`, { label: name, closed: !0 });
      return (folder.hide(), (_folders[`sl_${_name}_${name}`] = folder), folder);
    }
    async function initConfig() {
      let input = InputUIL.create(`CONFIG_sl_${_name}`, _uil);
      (input.add("Animation"),
        input.add("Layout"),
        input.add("Cinema Config"),
        _graph && _graph.addSpecial("Config", `Config (${_name})`, "Config"),
        input.setLabel("Config"));
      let animation = input.get("Animation"),
        layout = input.get("Layout");
      (animation &&
        (await ready(),
        _groupsSynced.then(async () => {
          if (
            ((animation = animation.replace(/^\//g, "")),
            (_this.animation = _this.initClass(HierarchyAnimation, animation, linkObjects)),
            _timeline)
          )
            _this.startRender((_) => {
              ((_this.animation.elapsed = _timeline.elapsed), _this.animation.update());
            });
          else if (_uil) {
            let range = new UILControlRange("Animation", { min: 0, max: 1, step: 0.001 });
            (range.onChange((val) => {
              ((_this.animation.elapsed = val), _this.animation.update());
            }),
              _uil.add(range));
          }
          (await _this.animation.ready(), _this.animation.update());
        })),
        layout &&
          (await ready(),
          (_this.layout = _this.initClass(HierarchyLayout, layout, linkObjects)),
          await _this.layout.ready()),
        (_config = input),
        await defer(),
        (_this.configured = !0));
    }
    async function linkObjects(data) {
      let array = [];
      for (let i = 0; i < data.length; i++) {
        let name = data[i].name,
          exists = _this.exists(name);
        exists ||
          "null" == name.toLowerCase() ||
          console.warn(`linkAnimation :: ${name} does not exist`);
        let group = new Group(),
          mesh = exists ? await _this.getLayer(name) : null;
        (mesh &&
          (_this.layout && mesh instanceof Mesh
            ? (mesh._parent.add(group), group.add(mesh))
            : (group = mesh.group || mesh)),
          (group.name = name),
          array.push(group));
      }
      return array;
    }
    async function initGraph() {
      if (
        _options.noGraph ||
        !window.UILGraph ||
        SceneLayout.noGraph ||
        (UIL.CMS_ONLY && !_options.cmsData) ||
        (!UIL.CMS_ONLY && _options.cmsData)
      )
        return ((_uil = null), void _groupsSynced.resolve());
      (_graph = UILGraph.instance().getGraph(_name, _this))
        ? (UIL.sidebar.element.show(),
          await _this.ready(),
          _graph.syncVisibility(_layers),
          _graph.syncGroupNames(_groups, _folders),
          _groupsSynced.resolve(),
          Global.PLAYGROUND &&
            Utils.getConstructorName(_this.parent) == Global.PLAYGROUND &&
            _graph.open())
        : _groupsSynced.resolve();
    }
    function initParams() {
      if (
        (_options.rootPath
          ? "/" != _options.rootPath.charAt(_options.rootPath.length - 1) &&
            (_options.rootPath += "/")
          : (_options.rootPath = ""),
        (_this.timeline = _timeline = _options.timeline),
        _timeline && (_timeline.add({ v: 0 }, { v: 1 }, 100, "linear"), _uil))
      ) {
        let range = new UILControlRange("Timeline", { min: 0, max: 1, step: 0.001 });
        (range.onChange((val) => {
          ((_timeline.elapsed = val), _timeline.update());
        }),
          _uil.add(range),
          range.hide(),
          _graph && _graph.addSpecial("Timeline", "Timeline"));
      }
      ((_this.baseRenderOrder = _options.baseRenderOrder || 0),
        (_this.data = _options.data),
        (_breakpoint = _options.breakpoint || SceneLayout.breakpoint),
        _options.breakpoint && (_this.localBreakpoint = !0),
        _options.uil && (_uil = _options.uil));
    }
    async function initData() {
      if (
        (await UILStorage.ready(),
        (_dataStore = InputUIL.create(`scenelayout_${_name}`, null)),
        void 0 === (_data = JSON.parse(_dataStore.get("data") || "{}")).layers &&
          (_data.layers = -1),
        (_stateData = await UILGroupBridge.createSceneLayout(_name, _this)),
        _options.perFrame)
      )
        _data.layers > 0 ? createLayers() : (_this.loaded = !0);
      else {
        for (let i = 0, c = _data.layers + 1; i < c; i++) initialize(createLayer(i));
        _this.loaded = !0;
      }
    }
    function createShader(shaderName, input, params = {}) {
      let shader;
      try {
        shader = _this.initClass(Shader, shaderName, {
          unique: `Element_${input.id}_${_name}`,
          ...params,
        });
      } catch (e) {
        if ("SceneLayout" === shaderName) throw e;
        return (
          console.error(e, ", replacing with default UV tile."),
          createShader("SceneLayout", input, params)
        );
      }
      if ("SceneLayout" === shaderName || !window[shaderName]) {
        let texturePath = input.getImage("texture");
        (texturePath
          ? texturePath.includes("assets/images") || (texturePath = _options.rootPath + texturePath)
          : (texturePath = "assets/images/_scenelayout/uv.jpg"),
          shader.addUniforms({
            tMap: { value: Utils3D.getTexture(texturePath) },
            uAlpha: { value: 1 },
          }));
      }
      return shader;
    }
    function createLayers() {
      let index = 0,
        renderWorker = new Render.Worker(function () {
          (initialize(createLayer(index)),
            index++ == _data.layers && (renderWorker.stop(), (_this.loaded = !0)));
        }, _options.perFrame);
    }
    function getGroup(name, index) {
      if (!name) return _this.group;
      if (name == _name) return _this.group;
      if (!_groups[name]) {
        let uilGroup = _uil ? createFolder(name) : null;
        uilGroup &&
          (uilGroup.setLabel(`${name} (Group)`),
          _uil.add(uilGroup),
          _graph && _graph.addGroup(uilGroup.id, name));
        let config = InputUIL.create(`GROUP_${_name}_${name}`, uilGroup);
        (config.setLabel("Parameters"),
          config.addToggle("occlusionCulling"),
          _timeline && config.add("tween"),
          config.addToggle("billboard"),
          config.add("breakpoints"),
          config.add("name", "hidden"));
        let breakpoints = config.get("breakpoints");
        breakpoints && (breakpoints = breakpoints.replace(/ /g, "").split(","));
        let breakpoint = breakpoints && _breakpoint ? "-" + _breakpoint : "";
        "-" == breakpoint.charAt(breakpoint.length - 1) && (breakpoint = "");
        let group = new Group();
        ((group.name = name),
          (_groups[name] = group),
          (_layers[name] = group),
          (_exists[name] = "group"),
          (group.prefix = `${name}_${_name}${breakpoint}`));
        let meshUIL = MeshUIL.add(group, uilGroup);
        (meshUIL.setLabel("Mesh"),
          _this.add(group),
          UIL.global && (group._meshUIL = meshUIL),
          uilGroup && (uilGroup.params = config),
          breakpoints && _breakpoints.push(group),
          config.get("billboard") && updateBillboard(!0, mesh));
        let occlusionCulling = config.get("occlusionCulling");
        "boolean" == typeof occlusionCulling &&
          occlusionCulling &&
          _groups[name].generateOcclusionMesh();
        let appState = _stateData.getGroup(index || _groupIndex);
        (appState ||
          ((appState = _stateData.syncGroup(index || _groupIndex, name)),
          _this.flag("needsGroupFixing", !0)),
          _this.flag("needsGroupFixing") && (group.fixStateBinding = appState.id),
          (appState.scene = _name),
          _this.bindState(appState, "name", (name) => {
            ((_groups[name] = group), (_layers[name] = group), (_exists[name] = "group"));
            for (let key in _layers)
              key != name &&
                _layers[key] == _layers[name] &&
                (delete _layers[key], delete _exists[key], delete _groups[key]);
          }),
          _this.bindState(appState, "visible", (bool) => {
            group.visible = bool;
          }),
          _this.bindState(appState, "deleted", (bool) => {
            bool &&
              (delete _groups[name], delete _layers[name], delete _exists[name], group.destroy());
          }),
          bindSortIndex(group, index || _groupIndex, appState, config),
          (appState.slGroup = group));
      }
      return (
        void 0 === index &&
          ((_data.groups = _groupIndex),
          _groupIndex++,
          _dataStore.setValue("data", JSON.stringify(_data))),
        _this.flag("needsGroupFixing") && Utils.debounce(healGroups, 100),
        _groups[name]
      );
    }
    function healGroups() {
      _stateData.healGroups(_groupIndex);
    }
    function addPhysicsInputs(input) {
      input.displayPhysics ||
        ((input.displayPhysics = !0),
        input.add("physicsCode"),
        Physics.supportsMeshTypes &&
          input.addSelect("physicsType", [
            { label: "Shapes/Bounds", value: "default" },
            { label: "Convex", value: "convex" },
            { label: "Triangle Mesh", value: "mesh" },
          ]),
        input.addFile("physicsBounds", { relative: "assets/geometry" }));
    }
    async function bindSortIndex(mesh, id, appState, input) {
      _this.bindState(appState, "sortIndex", async (index) => {
        if (appState.parent) {
          let [fraction, groupSortIndex] = await _stateData.calculateRenderFraction(id),
            renderOrder = _this.baseRenderOrder + groupSortIndex + fraction;
          (input && input.setValue("renderOrder", renderOrder - _this.baseRenderOrder),
            (mesh.renderOrder = renderOrder),
            mesh.classRef?.setRenderOrder && mesh.classRef.setRenderOrder(renderOrder));
        } else {
          let renderOrder = _this.baseRenderOrder + index;
          (input &&
            (input.setValue("renderOrder", renderOrder - _this.baseRenderOrder),
            input.setValue("sortIndex", index)),
            (mesh.renderOrder = renderOrder),
            mesh.classRef?.setRenderOrder && mesh.classRef.setRenderOrder(renderOrder));
        }
      });
    }
    async function createLayer(index, groupName, returnName) {
      let created = !1,
        input,
        id;
      "number" == typeof index
        ? (id = index)
        : ((id = ++_data.layers), _dataStore.setValue("data", JSON.stringify(_data)));
      let graphGroupName = groupName;
      if (graphGroupName) {
        let nameLabel = UILStorage.get(`INPUT_GROUP_${_name}_${groupName}_name`);
        nameLabel && (groupName = nameLabel);
      }
      let appState = _stateData.layers[id];
      if (appState?.deleted) return;
      if (
        _this.preventLayerCreation &&
        _this.preventLayerCreation(UILStorage.get(`INPUT_Config_${id}_${_name}_name`))
      )
        return;
      let group = _uil ? createFolder(id) : null,
        shader,
        mesh;
      (appState &&
        (_this.bindState(appState, "visible", (bool) => {
          mesh && (mesh.visible = bool);
        }),
        _this.bindState(appState, "parent", async (parentName) => {
          let parent;
          if (
            (await _this.wait((_) => !!mesh),
            parentName?.includes?.("group") && (parent = Number(parentName.split("group_")[1])),
            null == parentName)
          )
            return (_this.group.add(mesh), (mesh.position.y += 1), void (mesh.position.y -= 1));
          if (parentName.includes("_env_")) {
            let groupName = parentName.split("_env_")[1];
            return (
              _groups[groupName].add(mesh),
              (mesh.position.y += 1),
              void (mesh.position.y -= 1)
            );
          }
          if (parentName.startsWith("sl_")) {
            let groupName = parentName.split("_").pop();
            if (isNaN(groupName)) {
              return (
                _groups[groupName].add(mesh),
                (mesh.position.y += 1),
                void (mesh.position.y -= 1)
              );
            }
          }
          if (parent > -1) {
            let obj = _stateData.getGroup(parent);
            (obj?.slGroup && obj.slGroup.add(mesh), (mesh.position.y += 1), (mesh.position.y -= 1));
          } else _this.group.add(mesh);
        })),
        Hydra.LOCAL &&
          _this.delayedCall((_) => {
            created ||
              console.error(
                `SceneLayout :: 5 second timer expired creating ${_name} ${input.get("name")}`,
              );
          }, 5e3),
        (input = InputUIL.create(`Config_${id}_${_name}`, group)),
        input.setLabel("Parameters"),
        input
          .add("name", "hidden")
          .add("sortIndex", "hidden")
          .addFile("geometry", { relative: "assets/geometry" })
          .addToggle("visible", !0)
          .addToggle("transparent")
          .addToggle("depthWrite", !0)
          .addToggle("depthTest", !0)
          .addToggle("occlusionCulling", !1)
          .addToggle("castShadow")
          .addToggle("receiveShadow")
          .addToggle("receiveLight")
          .addToggle("billboard")
          .addToggle("animates", !0)
          .addSelect("type", [
            { label: "Mesh", value: "Mesh" },
            { label: "Points", value: "Points" },
            { label: "Line", value: "Line" },
          ])
          .add("shader")
          .add("custom", null, "customClass")
          .add("script", null, "scriptClass")
          .add("wildcard")
          .add("renderOrder", "hidden")
          .add("group", "hidden")
          .add("breakpoints")
          .addSelect("side", [
            { label: "Front Side", value: "shader_front_side" },
            { label: "Back Side", value: "shader_back_side" },
            { label: "Double Side", value: "shader_double_side" },
            { label: "Double Side Transparent", value: "shader_double_side_trasparency" },
          ])
          .addSelect("blending", [
            { label: "Normal", value: "shader_normal_blending" },
            { label: "Additive", value: "shader_additive_blending" },
            { label: "Premultiplied Alpha", value: "shader_premultiplied_alpha_blending" },
            { label: "Multiply", value: "shader_multiply_blending" },
          ]),
        UIL.global && (appState.inputUIL = input),
        (input.name = _name),
        (input.prefix = `Element_${id}_${_name}`),
        (input.id = id),
        group && (group.params = input),
        _timeline && input.addToggle("tween"),
        _options.physics &&
          (input.addToggle("physics"),
          input.get("physics")
            ? addPhysicsInputs(input)
            : _this.bindState(input.state, "physics", (bool) => {
                bool && addPhysicsInputs(input);
              })));
      let name = input.get("name") || id,
        shaderName = input.get("shader") || "SceneLayout",
        geomPath = input.getFilePath("geometry"),
        visible = input.get("visible"),
        transparent = input.get("transparent"),
        depthWrite = input.get("depthWrite"),
        depthTest = input.get("depthTest"),
        occlusionCulling = input.get("occlusionCulling"),
        billboard = input.get("billboard"),
        animates = input.get("animates"),
        doTween = input.get("tween"),
        type = input.get("type"),
        renderOrder = input.getNumber("renderOrder"),
        blending = input.get("blending"),
        side = input.get("side"),
        physics = input.get("physics"),
        castShadow = input.get("castShadow"),
        receiveShadow = input.get("receiveShadow"),
        receiveLight = input.get("receiveLight");
      appState &&
        ((appState.scene = _name),
        (async () => {
          (mesh || (await _this.wait((_) => mesh)),
            _this.destroy && bindSortIndex(mesh, id, appState, input));
        })());
      let breakpoints = input.get("breakpoints");
      breakpoints && (breakpoints = breakpoints.replace(/ /g, "").split(","));
      let breakpoint = breakpoints && _breakpoint ? "-" + _breakpoint : "";
      ("-" == breakpoint.charAt(breakpoint.length - 1) && (breakpoint = ""),
        name && group && group.setLabel(name),
        groupName && input.setValue("group", groupName));
      let groupParent = getGroup(input.get("group"));
      if (group) {
        let groupName = input.get("group"),
          groupId = groupName ? `sl_${_name}_${graphGroupName || groupName}` : void 0;
        _graph && _graph.addLayer(group.id, name || id + "", groupId);
      }
      if ((_uil && !UIL.CMS_ONLY && _uil.add(group), "ignore" == name)) return (created = !0);
      let customClass = input.get("custom") || input.get("customClass"),
        scriptClass = input.get("script") || input.get("scriptClass"),
        customCompile;
      if (
        (shaderName.includes("|") && ([shaderName, customCompile] = shaderName.split("|")),
        (_exists[name] = customClass ? "custom" : "mesh"),
        customClass)
      ) {
        if (customClass === _this.parent.constructor.name)
          return console.warn(`Tried to recursively initialize ${customClass}`);
        if (!window[customClass])
          return console.warn(`Tried to initialize ${customClass} but it doesn't  exist!`);
        let obj = _this.initClass(window[customClass], input, group, id, null);
        if (
          ((mesh = obj.group),
          (obj.wildcard = input.get("wildcard")),
          (obj.animates = input.get("animates")),
          "boolean" == typeof visible && mesh && (mesh.visible = visible),
          (_custom[name] = obj),
          (_layers[name] = obj),
          appState &&
            _this.bindState(appState, "name", (name) => {
              ((_layers[name] = obj), (_exists[name] = "custom"));
              for (let key in _layers)
                key != name &&
                  _layers[key] == _layers[name] &&
                  (delete _layers[key], delete _exists[key]);
            }),
          _this.onCreateLayer)
        ) {
          let capture = (cb) => (_this.delayedCall((_) => cb(obj, name), 32), !0);
          if (!0 === _this.onCreateLayer(name, group, capture)) return;
        }
        if (
          (obj.group &&
            (groupParent.add(obj.group),
            groupParent &&
              groupParent.fixStateBinding &&
              (appState.parent = groupParent.fixStateBinding)),
          (obj.renderOrder = _this.baseRenderOrder + renderOrder),
          mesh)
        ) {
          let meshUIL;
          (obj.camera ||
            ((mesh.prefix = `Element_${id}_${_name}${breakpoint}`),
            (meshUIL = MeshUIL.add(mesh, group)),
            meshUIL.setLabel("Mesh"),
            UIL.global && (mesh._meshUIL = meshUIL)),
            breakpoints && _breakpoints.push(mesh),
            scriptClass &&
              !1 !== visible &&
              (scriptClass.includes(",")
                ? ((scriptClass = scriptClass.replace(/ /g, "").split(",")),
                  scriptClass.forEach((script) => {
                    window[script]
                      ? ((mesh.scriptClass = mesh.scriptClass || []),
                        mesh.scriptClass.push(
                          _this.initClass(window[script], mesh, shader, group, input),
                        ))
                      : console.warn(`scriptClass ${script} not found`);
                  }))
                : window[scriptClass]
                  ? (mesh.scriptClass = _this.initClass(
                      window[scriptClass],
                      mesh,
                      shader,
                      group,
                      input,
                    ))
                  : console.warn(`scriptClass ${scriptClass} not found`)),
            UIL.global &&
              (mesh._sceneLayout = input._sceneLayout =
                { meshUIL: meshUIL, mesh: mesh, shader: shader, name: name, input: input }));
        }
        return ((created = !0), input);
      }
      if (_this.onCreateLayer) {
        let capture = (cb) => {
          let mesh = new Group();
          return (
            (mesh.prefix = `Element_${id}_${_name}${breakpoint}`),
            MeshUIL.add(mesh, group),
            (_meshes[name] = mesh),
            (_layers[name] = mesh),
            _this.delayedCall((_) => cb(mesh, name), 32),
            (created = !0),
            !0
          );
        };
        if (!0 === _this.onCreateLayer(name, group, capture)) return (created = !0);
      }
      let geom = World.PLANE;
      (geomPath &&
        geomPath.includes(["World", "SceneLayout"]) &&
        ((geom = eval(geomPath)), (geomPath = null)),
        shaderName.includes(".shader") &&
          ((shader = await resolveShaderRef(shaderName, name)),
          shader || (shaderName = "SceneLayout")),
        shader ||
          (shaderName.includes("PBR")
            ? (shader = _this.initClass(PBRShader, shaderName, {
                unique: `Element_${id}_${_name}`,
                customCompile: customCompile,
              }))
            : ((shader = createShader(shaderName, input, { customCompile: customCompile })),
              defer((_) => {
                for (let key in shader.uniforms) {
                  let uniform = shader.uniforms[key];
                  uniform && uniform.value instanceof Texture && initialize(uniform.value.promise);
                }
              }))),
        "boolean" == typeof depthWrite && (shader.depthWrite = depthWrite),
        "boolean" == typeof depthTest && (shader.depthTest = depthTest),
        "boolean" == typeof transparent && (shader.transparent = transparent),
        _this.onCreateGeometry &&
          (geomPath = _this.onCreateGeometry(geomPath, input.get("wildcard"))));
      let gltfNodes = null;
      if (geomPath)
        if (String(geomPath).indexOf(".glb") > 0 || String(geomPath).indexOf(".gltf") > 0) {
          let loader = new GLTFLoader();
          ((gltfNodes = await loader.parse(geomPath, _this, name)),
            (geom = new PlaneGeometry(0, 0)));
        } else geom = await GeomThread.loadGeometry(geomPath);
      switch (type) {
        case "Points":
          mesh = new Points(geom, shader);
          break;
        case "Line":
          mesh = new Line(geom, shader);
          break;
        default:
          mesh = new Mesh(geom, shader);
      }
      if (
        ("boolean" == typeof occlusionCulling && (mesh.occlusionCulled = occlusionCulling),
        gltfNodes)
      )
        for (let i = 0; i < gltfNodes.length; i++) mesh.add(gltfNodes[i]);
      ("boolean" == typeof _options.frustumCulled && (mesh.frustumCulled = _options.frustumCulled),
        "boolean" == typeof visible && (mesh.visible = visible),
        groupParent.fixStateBinding && (appState.parent = groupParent.fixStateBinding),
        (mesh.prefix = `Element_${id}_${_name}${breakpoint}`),
        (mesh.uilName = name),
        (mesh.uilGroup = group),
        (mesh.uilGraph = _graph),
        (mesh.wildcard = input.get("wildcard")),
        (mesh.animates = input.get("animates")));
      let meshUIL = MeshUIL.add(mesh, group);
      if ((meshUIL.setLabel("Mesh"), UIL.global && (mesh._meshUIL = meshUIL), physics)) {
        let p = _this.group,
          _physicsData;
        for (; p;) {
          if (p._physicsData) {
            _physicsData = p._physicsData;
            break;
          }
          p = p._parent;
        }
        _physicsData && (mesh._physicsData = _physicsData);
        let path = input.getFilePath("physicsBounds"),
          type = input.getFilePath("physicsType") ?? "default",
          obj;
        if ("default" !== type) {
          let shapes = [
            {
              type: type,
              pos: [0, 0, 0],
              rot: [0, 0, 0],
              scale: mesh.scale.toArray(),
              vertices: geom.attributes.position.array,
              index: geom.index,
            },
          ];
          obj = Physics.instance().createFromShapes(
            shapes,
            { sleep: !0, debugId: geom._src },
            mesh,
          );
        } else if (path) {
          const shapes = await PhysicsBounds.parsePhysicsBoundsShapes(Assets.getPath(path));
          shapes && (obj = Physics.instance().createFromShapes(shapes, {}, mesh));
        }
        (obj || (obj = Physics.instance().create(mesh)),
          _physicsData && delete mesh._physicsData,
          (obj.prefix = `Physics_${id}_${_name}`),
          PhysicsUIL.add(obj, group).setLabel("Physics"));
        let physicsCodeClassName = input.get("physicsCode"),
          physicsCodeClass;
        (physicsCodeClassName &&
          ((physicsCodeClass = window[physicsCodeClassName]),
          physicsCodeClass || console.warn(`physicsCode class ${physicsCodeClassName} not found`)),
          physicsCodeClass && _this.initClass(physicsCodeClass, obj, mesh, group, input));
      }
      if (
        (groupParent.add(mesh),
        (_meshes[name] = mesh),
        (_layers[name] = mesh),
        appState &&
          _this.bindState(appState, "name", (name) => {
            ((_layers[name] = mesh), (_exists[name] = customClass ? "custom" : mesh));
            for (let key in _layers)
              key != name &&
                _layers[key] == _layers[name] &&
                (delete _layers[key], delete _exists[key]);
          }),
        breakpoints && _breakpoints.push(mesh),
        (mesh.renderOrder = _this.baseRenderOrder + (renderOrder || 0)),
        billboard && updateBillboard(!0, mesh),
        "SceneLayout" != shaderName &&
          window[shaderName] &&
          (mesh.shaderClass = _this.initClass(window[shaderName], mesh, shader, group, input)),
        blending && (shader.blending = blending),
        side && (shader.side = side),
        castShadow && (mesh.castShadow = castShadow),
        (receiveShadow = receiveShadow || Shader.shouldReceiveShadow(shader)),
        receiveShadow && (shader.receiveShadow = receiveShadow),
        receiveLight && (shader.receiveLight = receiveLight),
        scriptClass &&
          (scriptClass.includes(",")
            ? ((scriptClass = scriptClass.replace(/ /g, "").split(",")),
              scriptClass.forEach((script) => {
                window[script]
                  ? ((mesh.scriptClass = mesh.scriptClass || []),
                    mesh.scriptClass.push(
                      _this.initClass(window[script], mesh, shader, group, input),
                    ))
                  : console.warn(`scriptClass ${script} not found`);
              }))
            : window[scriptClass]
              ? (mesh.scriptClass = _this.initClass(
                  window[scriptClass],
                  mesh,
                  shader,
                  group,
                  input,
                ))
              : console.warn(`scriptClass ${scriptClass} not found`)),
        shader._copied ||
          (shader !== mesh.shader && !shaderName.includes("PBR")) ||
          ShaderUIL.add(shader, group).setLabel("Shader"),
        shader._copied &&
          shader._copied.shaderClass &&
          shader._copied.shaderClass.applyClone &&
          shader._copied.shaderClass.applyClone(mesh),
        (input.onUpdate = (key) => {
          switch (key) {
            case "name":
              break;
            case "visible":
              mesh.visible = input.get(key);
              break;
            case "renderOrder":
              mesh.renderOrder = _this.baseRenderOrder + input.getNumber(key);
              break;
            case "transparent":
              shader.transparent = input.get(key);
              break;
            case "depthWrite":
              shader.depthWrite = input.get(key);
              break;
            case "depthTest":
              shader.depthTest = input.get(key);
              break;
            case "side":
              shader.side = input.get(key);
              break;
            case "blending":
              shader.blending = input.get(key);
              break;
            case "geometry":
              updateGeometry(input.getFilePath(key), mesh);
              break;
            case "shader":
              updateShader(input.get(key), mesh, group, input);
              break;
            case "scriptClass":
              updateScriptClass(input.get(key), mesh, group, input);
              break;
            case "receiveShadow":
              updateShadow(input.get(key), mesh);
              break;
            case "receiveLight":
              updateLighting(input.get(key), mesh);
              break;
            case "billboard":
              updateBillboard(input.get(key), mesh);
              break;
            case "type":
              updateType(input.get(key), mesh);
          }
          UIL.global &&
            ((World.SCENE.displayNeedsUpdate = !0),
            window?.view?.scene && (view.scene.displayNeedsUpdate = !0));
        }),
        Hydra.LOCAL && Global.PLAYGROUND)
      ) {
        _this.events.sub(SceneLayout.HOTLOAD_GEOMETRY, ({ file: file }) => {
          mesh.geometry?._src?.includes(file) && updateGeometry(file, mesh);
        });
        const scriptClassNeedsUpdate = (inst, file) => (
          inst.__cacheName || (inst.__cacheName = Utils.getConstructorName(inst)),
          !!file.includes(inst.__cacheName) && inst.__cacheName
        );
        _this.events.sub(SceneLayout.HOTLOAD_SCRIPT, ({ file: file }) => {
          if (
            (file.includes(mesh.shader?.vsName) &&
              ((shader.hotReloading = !0),
              "SceneLayout" !== shaderName &&
                window[shaderName] &&
                (mesh.shaderClass = _this.initClass(
                  window[shaderName],
                  mesh,
                  shader,
                  group,
                  input,
                )),
              group.remove(shader.UILPrefix),
              delete ShaderUIL.exists[shader.UILPrefix],
              ShaderUIL.add(shader, group).setLabel("Shader"),
              (shader.hotReloading = !1)),
            mesh.scriptClass)
          )
            if (Array.isArray(mesh.scriptClass))
              mesh.scriptClass.every((inst, index) => {
                let name = scriptClassNeedsUpdate(inst, file);
                return (
                  !name ||
                  (mesh.scriptClass.remove(inst), updateScriptClass(name, mesh, group, input), !1)
                );
              });
            else {
              let name = scriptClassNeedsUpdate(mesh.scriptClass, file);
              name && updateScriptClass(name, mesh, group, input);
            }
        });
      }
      if (
        (UIL.global &&
          (mesh._sceneLayout = input._sceneLayout =
            {
              meshUIL: meshUIL,
              mesh: mesh,
              input: input,
              name: name,
              get shaderUIL() {
                return this.mesh.shader.shaderUIL;
              },
            }),
        _options.cmsData)
      ) {
        let cmsGroup = _uil ? createFolder(id) : null,
          cmsInput = InputUIL.create(`Config_${id}_${_name}`, cmsGroup);
        ((cmsInput.CMS = !0), cmsInput.setLabel("Data"));
        for (let key in _options.cmsData) {
          let value = _options.cmsData[key];
          ("string" == typeof value &&
            (key.includes("textarea")
              ? cmsInput.addTextarea(key, value)
              : cmsInput.add(key, value)),
            "number" == typeof value && cmsInput.addNumber(key, value),
            "boolean" == typeof value && cmsInput.addToggle(key, value),
            "object" == typeof value &&
              ("image" == value.type && cmsInput.addImage(key),
              "file" == value.type && cmsInput.addFile(key),
              "range" == value.type && cmsInput.addRange(key),
              "color" == value.type && cmsInput.addColor(key)));
        }
        ((appState.cmsInput = cmsInput), UIL.CMS_ONLY && _uil?.add(cmsGroup));
      }
      return ((created = !0), returnName ? name : input);
    }
    async function updateGeometry(geomPath, mesh) {
      let geom = World.PLANE;
      (geomPath && geomPath.includes(["World", "SceneLayout"])
        ? ((geom = eval(geomPath)), (geomPath = null))
        : geomPath && (geom = await GeomThread.loadGeometry(geomPath + "?" + Utils.timestamp())),
        (mesh.geometry = geom));
    }
    function updateType(type, mesh) {
      switch ((mesh._gl && "mode" in mesh._gl && delete mesh._gl.mode, type)) {
        case "Points":
          ((mesh.isPoints = !0), delete mesh.isLine, delete mesh.isMesh);
          break;
        case "Line":
          ((mesh.isLine = !0), delete mesh.isPoints, delete mesh.isMesh);
          break;
        default:
          ((mesh.isMesh = !0), delete mesh.isLine, delete mesh.isPoints);
      }
    }
    async function resolveShaderRef(shaderName, layerName) {
      let shaderLayer = shaderName.split(".shader")[0],
        promise = _this.getLayer(shaderLayer);
      Hydra.LOCAL &&
        (promise = Promise.race([
          promise,
          (async () => {
            await _this.loadedAllLayers();
          })(),
        ]));
      let layer = await promise;
      if (layer) {
        let shader = layer.shader;
        return ((shader._copied = layer), shader);
      }
      Hydra.LOCAL &&
        console.error(
          `Couldn’t find shader “${shaderName}” for layer “${layerName}” in SceneLayout “${_name}”, because layer “${shaderLayer}” doesn't exist`,
        );
    }
    async function updateShader(shaderName = "", mesh, group, input) {
      let shader;
      (shaderName.includes(".shader") &&
        ((shader = await resolveShaderRef(shaderName, mesh.uilName)),
        shader || (shaderName = "SceneLayout")),
        shader ||
          (shader = shaderName.includes("PBR")
            ? _this.initClass(PBRShader, shaderName, { unique: `Element_${input.id}_${_name}` })
            : createShader(shaderName, input)),
        group.remove(mesh.shader.UILPrefix));
      for (let key in mesh.shader.uniforms) {
        if ("t" === mesh.shader.uniforms[key].type)
          try {
            mesh.shader.shaderUIL.copyTexture(key, shader);
          } catch (e) {
            console.error(e);
          }
      }
      ((mesh.shader = shader),
        "SceneLayout" !== shaderName &&
          window[shaderName] &&
          (mesh.shaderClass = _this.initClass(window[shaderName], mesh, shader, group, input)),
        ShaderUIL.add(shader, group).setLabel("Shader"));
    }
    function updateLighting(bool, mesh) {
      ((mesh.shader.customCompile = Utils.uuid()),
        (mesh.shader.receiveLight = bool),
        mesh.shader.resetProgram(),
        mesh.shader.upload());
    }
    function updateShadow(bool, mesh) {
      ((mesh.shader.customCompile = Utils.uuid()),
        (mesh.shader.receiveShadow = bool),
        mesh.shader.resetProgram(),
        mesh.shader.upload());
    }
    function updateBillboard(bool, mesh) {
      bool
        ? ((mesh._billboardLoop = (_) => Utils3D.billboard(mesh)),
          _this.startRender(mesh._billboardLoop))
        : (mesh.rotation.set(0, 0, 0), _this.stopRender(mesh._billboardLoop));
    }
    function updateScriptClass(scriptClass, mesh, group, input) {
      scriptClass &&
        (scriptClass.includes(",")
          ? (scriptClass = scriptClass.replace(/ /g, "").split(",")).forEach((script) => {
              window[script]
                ? ((mesh.scriptClass = mesh.scriptClass || []),
                  mesh.scriptClass.push(
                    _this.initClass(window[script], mesh, mesh.shader, group, input),
                  ))
                : console.warn(`scriptClass ${script} not found`);
            })
          : window[scriptClass]
            ? (mesh.scriptClass = _this.initClass(
                window[scriptClass],
                mesh,
                mesh.shader,
                group,
                input,
              ))
            : console.warn(`scriptClass ${scriptClass} not found`));
    }
    function addListeners() {
      _this.events.sub(SceneLayout.BREAKPOINT, (e) =>
        _this.localBreakpoint ? null : setBreakpoint(e),
      );
    }
    function setBreakpoint({ value: value }) {
      value != _breakpoint &&
        ((_breakpoint = value),
        _breakpoints.forEach((mesh) => {
          if (!mesh.prefix) return;
          ((mesh.prefix = mesh.prefix.split("-")[0] + "-" + _breakpoint),
            "-" == mesh.prefix.charAt(mesh.prefix.length - 1) &&
              (mesh.prefix = mesh.prefix.slice(0, -1)));
          let meshUIL = new MeshUILConfig(mesh);
          UIL.global && (mesh._meshUIL = meshUIL);
        }));
    }
    async function ready() {
      (await _this.wait(_this, "loaded"), UIL.sidebar && UIL.sidebar.toolbar.hideAll());
    }
    function copyFolderProps(from, to) {
      let mesh, params, shader;
      to.forEachFolder((child) => {
        switch (child.label) {
          case "Parameters":
            params = child;
            break;
          case "Mesh":
            mesh = child;
            break;
          case "Shader":
            shader = child;
        }
      });
      let allowed = ["Parameters", "Mesh", "Shader"];
      from.forEachFolder((child) => {
        if (!(allowed.indexOf(child.label) < 0))
          switch ((child.toClipboard(), child.label)) {
            case "Parameters":
              params.fromClipboard();
              break;
            case "Mesh":
              mesh.fromClipboard();
              break;
            case "Shader":
              shader.fromClipboard();
          }
      });
    }
    ((this.isSceneLayout = !0),
      (this.name = _name),
      (async function () {
        (window.Physics && (_options.physics = !0),
          (_this.group.sceneLayout = _this),
          initialize(_this.wait("loaded")),
          await initialize(defer()),
          SceneLayout.getTexture || (SceneLayout.getTexture = Utils3D.getTexture),
          initGraph(),
          initParams(),
          initialize(initConfig()),
          initData(),
          addListeners(),
          ready(),
          UIL?.loaded && initGizmo());
      })(),
      (this.ready = async function (early) {
        if ((await _this.wait(_this, "loaded"), await _this.wait(_this, "configured"), early))
          return !0;
        (await defer(), await defer());
      }),
      (this.getLayer = async function (name) {
        let timer;
        return (
          Hydra.LOCAL &&
            (timer = _this.delayedCall((_) => {
              _exists[name] || console.warn(`${name} doesn't exist in SceneLayout ${_name}`);
            }, 1e3)),
          await _this.wait(_layers, name),
          timer && clearTimeout(timer),
          _layers[name]
        );
      }),
      (this.getLayers = async function () {
        let array = [];
        for (let i = 0; i < arguments.length; i++) array.push(_this.getLayer(arguments[i]));
        return Promise.all(array);
      }),
      (this.getAllLayers = async function () {
        return (await this.ready(), await this.loadedAllLayers(), _layers);
      }),
      (this.getAllMatching = async function (label) {
        let layers = await _this.getAllLayers(),
          array = [];
        for (let key in layers)
          key.includes(label) && ((layers[key].layerName = key), array.push(layers[key]));
        return array;
      }),
      (this.exists = function (name) {
        return _exists[name];
      }),
      (this._createLayer = function (parentId, returnName = !1) {
        return createLayer(null, parentId, returnName);
      }),
      (this._createGroup = function () {
        return (getGroup(`group_${_groupIndex}`), _groupIndex);
      }),
      (this._deleteGroup = function () {}),
      (this._getGroup = function (name, index) {
        return getGroup(name, index);
      }),
      (this._rename = function (id, name, value) {
        let folder = _folders[id] || _folders[`sl_${_name}_${id}`];
        folder &&
          (folder.setLabel(value),
          folder.params && folder.params.setValue("name", value),
          [_groups, _custom, _meshes, _exists, _layers].forEach(function (store) {
            store[name] && ((store[value] = store[name]), (store[name] = null), delete store[name]);
          }));
      }),
      (this._deleteLayer = function (id, name, coded) {
        id.includes("_") && (id = (id = id.split("_"))[id.length - 1]);
        let folder = _folders[id] || _folders[`sl_${_name}_${id}`],
          layer = _layers[id] || _layers[name];
        return layer && layer.isGroup && layer.length > 1
          ? (alert("Can't delete a group that has nested layers."), !1)
          : !(!coded && !confirm("Are you sure you want to delete this layer?")) &&
              (layer && layer._parent && (layer._parent.remove(layer), (layer._parent = null)),
              folder && folder.parent && folder.parent.remove(folder),
              UILStorage.set(`sl_${_name}_${id}_deleted`, !0),
              !0);
      }),
      (this._changeParent = function (childId, childName, parentId, parentName) {
        let child = _layers[childId] || _layers[childName],
          parent = _layers[parentId] || _layers[parentName] || _this;
        if (!child) return;
        let folder = _folders[childId] || _folders[`sl_${_name}_${childName}`];
        folder && folder.params && folder.params.setValue("group", parentName || null);
        let parentObject = parent.group || parent,
          childObject = child.group || child;
        (parentObject.isObject3D && childObject.isObject3D && parentObject.add(childObject),
          child.updateMatrix && child.updateMatrix());
      }),
      (this._visible = function (name, visible) {
        let mesh = _layers[name];
        mesh && (mesh.group && (mesh = mesh.group), (mesh.visible = visible));
      }),
      (this._focus = function (name) {
        UIL.sidebar.toolbar.filterSingle(name);
      }),
      (this._blur = function (name) {
        let folder = _folders[name] || _folders[`sl_${_name}_${name}`];
        folder && folder.forEachFolder && (folder.forEachFolder((f) => f.close()), folder.close());
      }),
      (this._sort = function (order) {
        order.forEach((label, index) => {
          label.children &&
            label.children.forEach(function (child, j, all) {
              let folder = _folders[child];
              if (!folder || !folder.params) return;
              let renderOrder = _this.baseRenderOrder + index + (j + 1) / (all.length + 1);
              folder.params.setValue("renderOrder", renderOrder - _this.baseRenderOrder);
              let mesh = _layers[child] || _layers[folder.label];
              mesh && (mesh.renderOrder = renderOrder);
            });
          let folder = _folders[label];
          if (!folder || !folder.params) return;
          let renderOrder = _this.baseRenderOrder + index;
          folder.params.setValue("renderOrder", renderOrder - _this.baseRenderOrder);
          let mesh = _layers[label] || _layers[folder.label];
          mesh && (mesh.renderOrder = renderOrder);
        });
      }),
      (this._duplicateLayer = function (id, parentId) {
        let folder = _folders[id] || _folders[`sl_${_name}_${id}`];
        if (!folder) return;
        createLayer(null, parentId);
        let copyShader,
          copy = Object.values(_folders).last();
        (folder.forEachControl((input) => {
          "shader" === input.label && (copyShader = input.value);
        }),
          copyShader &&
            (console.log(copyShader),
            copy.forEachControl((input) => {
              "shader" === input.label && input.force(copyShader);
            })),
          copyFolderProps(folder, copy));
      }),
      (this._duplicateGroup = function (id, children) {
        let folder = _folders[id] || _folders[`sl_${_name}_${id}`];
        if (!folder) return;
        let copyId = `group_${_groupIndex + 1}`;
        (getGroup(copyId),
          copyFolderProps(folder, Object.values(_folders).last()),
          children.forEach((childId) => {
            _this._duplicateLayer(childId, copyId);
          }));
      }),
      (this._getCinemaConfig = async function () {
        let _cinemaConfig = _config.get("Cinema Config").replace(".json", "");
        return await get(Assets.getPath(`assets/geometry/${_cinemaConfig}.json`));
      }),
      (this._applyCinemaConfig = function (id, params) {
        let folder = _folders[id] || _folders[`sl_${_name}_${id}`];
        if (!folder) return;
        let mesh = folder.getAll().filter((sub) => "Mesh" == sub.label)[0];
        if (
          (params.geometry &&
            folder.params.setValue("geometry", params.geometry.replace("assets/geometry/", "")),
          ["position", "quaternion", "scale"].forEach((transform) => {
            if (params[transform]) {
              let value = JSON.parse(params[transform]);
              if ("quaternion" == transform) {
                let quat = new Quaternion().fromArray(value);
                ((value = new Euler()
                  .setFromQuaternion(quat)
                  .toArray()
                  .slice(0, 3)
                  .map((angle) => (180 * angle) / Math.PI)),
                  (transform = "rotation"));
              }
              mesh
                .getAll()
                .filter((control) => control.label == transform)[0]
                .force(value);
            }
          }),
          params.visible &&
            "false" === params.visible &&
            !params.geometry &&
            (folder.params.setValue("geometry", "World.PLANE"),
            folder.params.setValue("side", "shader_double_side"),
            !Global.PLAYGROUND))
        ) {
          _meshes[folder.params.get("name")].shader.neverRender = !0;
        }
        params.shader && folder.params.setValue("shader", params.shader);
      }),
      (this.loadedAllLayers = async function () {
        return (await _this.ready(), _promisesAllSettled);
      }),
      this.set("breakpoint", (value) => {
        ((_this.localBreakpoint = !0), setBreakpoint({ value: value }));
      }),
      this.get("breakpoint", (_) => _breakpoint),
      this.get("layers", (_) => _layers),
      this.get("layerCount", (_) => _data.layers),
      (this.onDestroy = function () {
        (_graph?.destroy?.(), _stateData?.destroySceneLayout?.(_name, _this));
        for (let key in _layers) {
          let layer = _layers[key];
          layer.destroy?.();
        }
        ((_layers = null),
          (_initializers.length = 0),
          (_breakpoints.length = 0),
          _this.textures &&
            !_options.persistTextures &&
            _this.textures.forEach((t) => {
              t.destroy && t.destroy();
            }),
          _this._onDestroy && _this._onDestroy());
      }),
      (this.addInitializer = function (callback) {
        _initializers.push(callback);
      }),
      (this._completeInitialization = async function (sync) {
        if (!_initializers.length) return !0;
        for (let i = 0; i < _initializers.length; i++) await _initializers[i](sync);
        _initializers.length = 0;
      }));
  },
  (_) => {
    ((SceneLayout.BREAKPOINT = "sl_breakpoint"),
      (SceneLayout.HOTLOAD_GEOMETRY = "sl_hotload_geom"),
      (SceneLayout.HOTLOAD_SCRIPT = "sl_hotload_script"),
      (SceneLayout.setBreakpoint = function (value) {
        SceneLayout.breakpoint !== value &&
          ((SceneLayout.breakpoint = value),
          Events.emitter._fireEvent(SceneLayout.BREAKPOINT, { value: value }));
      }));
  },
);
