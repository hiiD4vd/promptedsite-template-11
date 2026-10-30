Class(
  function TweenUILConfig(_name, _config, _group, _noCache) {
    Inherit(this, Component);
    const _this = this;
    var _input,
      _editor,
      _promise,
      _project,
      _meshes,
      _keyframes,
      _pathVisualization,
      _projectInstanceId,
      _objectsWithTracks,
      _savedState,
      _rafDriver,
      _layersWithWarnings = {},
      _flatMap = {},
      _sheets = {},
      _duration = 0,
      _manualRender = !1,
      _changedKeys = {},
      _cameras = [],
      _audioFile = !1;
    function loop() {
      (_this.events.fire(TweenUIL.BEFORE_UPDATE),
        Object.keys(_flatMap).forEach((key) => (_changedKeys[key] = !1)),
        _rafDriver.tick(Render.TIME),
        _this.events.fire(TweenUIL.UPDATED, { changed: _changedKeys }),
        _cameras.forEach((camera) => camera.update()));
    }
    function initObjectsWithTracks(state) {
      (_objectsWithTracks || (_objectsWithTracks = {}),
        [state.staticOverrides?.byObject, state.sequence?.tracksByObject]
          .filter(Boolean)
          .forEach((table) => {
            Object.keys(table).forEach((key) => {
              let parts = key.split(" » "),
                name = parts.length > 1 ? parts.last() : key,
                matches = /(.*)_(shader|behavior)$/.exec(name);
              (matches && (name = matches[1]), (_objectsWithTracks[name] = !0));
            });
          }));
    }
    function ignoreObject(name, layoutName) {
      return !!_objectsWithTracks && !_objectsWithTracks[name];
    }
    function findTrueDuration(sequence) {
      let duration = 0,
        tracks = sequence.tracksByObject;
      for (let k1 in tracks) {
        let obj = tracks[k1];
        "tween_anchor" == k1 && findAnchorKeyframes(obj);
        for (let k2 in obj.trackData) {
          let trackData = obj.trackData[k2];
          for (let k3 in trackData.keyframes) {
            let keyframe = trackData.keyframes[k3];
            keyframe.position && (duration = Math.max(duration, keyframe.position));
          }
        }
      }
      return duration;
    }
    function checkDuration() {
      if (0 === _duration)
        for (let key in _sheets) _duration = Math.max(_duration, _sheets[key].length);
    }
    function findAnchorKeyframes(obj) {
      for (let k1 in obj)
        for (let k2 in obj[k1]) {
          let keyframes = obj[k1][k2].keyframes;
          keyframes && (_keyframes = keyframes);
        }
    }
    async function play(options = {}) {
      (_config.sheets || (await prepareConfig(), linkLocally()), checkDuration());
      for (let key in _sheets)
        (options.disableAutoPosition ||
          (_sheets[key].sequence.position = "reverse" === options?.direction ? _duration : 0),
          _sheets[key].sequence.play({ ...options, rafDriver: _rafDriver }));
      return (_promise = _this.wait(1e3 * _duration));
    }
    function linkLocally() {
      makeSendable().sheets.forEach((obj) => {
        const sheet = _sheets[_config.mergedSheetName];
        if (sheet)
          for (let key in obj) {
            for (let key2 in obj[key]) {
              let finalObj = obj[key][key2];
              "number" == typeof finalObj.r &&
                "number" == typeof finalObj.g &&
                "number" == typeof finalObj.b &&
                Object.assign(finalObj, Theatre.core.types.rgba(finalObj));
            }
            sheet.object(getTrackNameFromKey(key), obj[key]).onValuesChange((newValue) => {
              ((_changedKeys[key] = !0), completeDataLink(newValue, _flatMap[key]));
            }, _rafDriver);
          }
      });
    }
    function getTrackNameFromKey(key, disambiguate = !1) {
      let name = key.split("&"),
        prefix = name[0];
      return (
        name.shift(),
        (name = name.join("_")),
        disambiguate && (name = `${prefix} » ${name}`),
        name
      );
    }
    async function prepareConfig() {
      let array = Array.isArray(_config) ? _config : [_config];
      ((_config = {}),
        _audioFile && (_config.audioFile = _audioFile),
        (_config.nudgeMultiplier = 0.05));
      let sheet = {};
      _config.sheets = [sheet];
      for (let i = 0; i < array.length; i++) {
        let layoutName,
          objects = array[i],
          options = {};
        if (objects instanceof SceneLayout)
          ((layoutName = objects.name),
            (options.isSceneLayout = !0),
            (objects = await getObjectsFromLayout(objects)));
        else {
          if ("object" != typeof objects) throw "TweenUIL :: Type not supported";
          if (0 === i) {
            let obj0 = objects[Object.keys(objects)[0]];
            obj0 instanceof Mesh
              ? (layoutName = "Scene")
              : obj0.uniforms
                ? (layoutName = "Shader")
                : isElement(obj0) && (layoutName = "Elements");
          }
        }
        (layoutName || (layoutName = `Scene${i + 1}`),
          mergeSheets(sheet, createSheetFromObjects(objects, layoutName, options)),
          0 === i && (_config.mergedSheetName = layoutName));
      }
      _this.flag("isLoaded", !0);
    }
    function mergeSheets(sheet1, sheet2) {
      let usedNames = {};
      return (
        Object.keys(sheet1).forEach((key) => {
          usedNames[getTrackNameFromKey(key)] = !0;
        }),
        Object.keys(sheet2).forEach((key) => {
          let name = getTrackNameFromKey(key),
            newKey = key;
          (usedNames[name] &&
            ((name = getTrackNameFromKey(key, !0)),
            (newKey = `${key.split("&")[0]}&${name}`),
            (_flatMap[newKey] = _flatMap[key]),
            delete _flatMap[key]),
            (usedNames[name] = !0),
            (sheet1[newKey] = sheet2[key]));
        }),
        sheet1
      );
    }
    function makeEulerLink(layer, key) {
      return {
        copy: (obj) => {
          layer[key].set(Math.radians(obj.x), Math.radians(obj.y), Math.radians(obj.z));
        },
        get x() {
          return Math.degrees(layer[key].x);
        },
        get y() {
          return Math.degrees(layer[key].y);
        },
        get z() {
          return Math.degrees(layer[key].z);
        },
      };
    }
    function getMeshObject(layer, parent, layerName) {
      if (parent?.isTweenAnchor) {
        let obj = {};
        return ((obj.anchor = { anchor: 0, link: { copy() {} } }), obj);
      }
      layer.rotationLink = makeEulerLink(layer, "rotation");
      let obj = {
        position: {
          x: layer.position.x,
          y: layer.position.y,
          z: layer.position.z,
          link: layer.position,
        },
        scale: { x: layer.scale.x, y: layer.scale.y, z: layer.scale.z, link: layer.scale },
        rotation: {
          x: Math.degrees(layer.rotation.x),
          y: Math.degrees(layer.rotation.y),
          z: Math.degrees(layer.rotation.z),
          link: layer.rotationLink,
        },
      };
      if (layer._cameraUIL) {
        (parent.position &&
          (obj.cameraPos = {
            x: parent.position.x,
            y: parent.position.y,
            z: parent.position.z,
            link: {
              copy(from) {
                parent.move(from);
              },
            },
          }),
          (obj.projection = {
            zoom: parent.zoom,
            near: parent.near,
            far: parent.far,
            link: {
              copy(from) {
                parent.setProjectionProperties(from);
              },
            },
          }));
        let fov = parent.getFOV();
        (void 0 !== fov && (obj.projection.fov = fov),
          parent.lookAt &&
            (obj.lookAt = {
              x: parent.lookAt.x,
              y: parent.lookAt.y,
              z: parent.lookAt.z,
              link: parent.lookAt,
            }),
          parent.moveXY &&
            (obj.moveXY = { x: parent.moveXY.x, y: parent.moveXY.y, link: parent.moveXY }),
          parent.cameraRotation &&
            (obj.cameraRotation = {
              x: Math.degrees(parent.cameraRotation.x),
              y: Math.degrees(parent.cameraRotation.y),
              z: Math.degrees(parent.cameraRotation.z),
              link: makeEulerLink(parent, "cameraRotation"),
            }),
          parent.viewportFocus &&
            (obj.viewportFocus = {
              x: parent.viewportFocus.x,
              y: parent.viewportFocus.y,
              link: parent.viewportFocus,
            }));
        let camera = layer.classRef;
        ((camera.manualRender = !0), _cameras.push(camera));
      }
      return (
        UIL.global &&
          (_meshes || (_meshes = []), (layer._uilLayerName = layerName), _meshes.push(layer)),
        parent?.tweenToggle &&
          (obj.toggle = {
            on: 0,
            link: {
              copy: (e) => {
                0 == e.on && parent.flag("tweenToggle")
                  ? (parent.flag("tweenToggle", !1),
                    parent.events.fire(TweenUIL.TOGGLE, { on: !1 }))
                  : 1 != e.on ||
                    parent.flag("tweenToggle") ||
                    (parent.events.fire(TweenUIL.TOGGLE, { on: !0 }),
                    parent.flag("tweenToggle", !0));
              },
            },
          }),
        obj
      );
    }
    function getShaderObject(shader) {
      let obj = {};
      for (let key in shader.uniforms) {
        let uniform = shader.uniforms[key],
          value = uniform.value;
        void 0 === value ||
          (uniform.ignoreUIL && !uniform.enableTweenUIL) ||
          "HZ" == key ||
          ("number" == typeof value
            ? (obj[key] = { value: value, link: uniform })
            : value instanceof Vector2
              ? (obj[key] = { x: value.x, y: value.y, link: value })
              : value instanceof Vector3
                ? (obj[key] = { x: value.x, y: value.y, z: value.z, link: value })
                : value instanceof Vector4
                  ? (obj[key] = { x: value.x, y: value.y, z: value.z, w: value.w, link: value })
                  : value instanceof Color &&
                    (obj[key] = { r: value.r, g: value.g, b: value.b, a: 1, link: value }));
      }
      return obj;
    }
    function isElement(object) {
      return (
        !!object?.div?.hydraObject ||
        (void 0 !== GLUIObject && (object instanceof GLUIObject || object instanceof GLUIText))
      );
    }
    function getElementObject($element) {
      let obj = { _config: { nudgeMultiplier: 1 } };
      return (
        void 0 !== $element.x && (obj.x = { value: $element.x, link: $element }),
        void 0 !== $element.y && (obj.y = { value: $element.y, link: $element }),
        void 0 !== $element.z && (obj.z = { value: $element.z, link: $element }),
        void 0 !== $element.scale && (obj.scale = { value: $element.scale, link: $element }),
        void 0 !== $element.scaleX && (obj.scaleX = { value: $element.scaleX, link: $element }),
        void 0 !== $element.scaleY && (obj.scaleY = { value: $element.scaleY, link: $element }),
        void 0 !== $element.rotation &&
          (obj.rotation = { value: $element.rotation, link: $element }),
        void 0 !== $element.rotationX &&
          (obj.rotationX = { value: $element.rotationX, link: $element }),
        void 0 !== $element.rotationY &&
          (obj.rotationY = { value: $element.rotationY, link: $element }),
        void 0 !== $element.rotationZ &&
          (obj.rotationZ = { value: $element.rotationZ, link: $element }),
        void 0 !== $element.alpha && (obj.alpha = { value: $element.alpha, link: $element }),
        obj
      );
    }
    function getPlainObject(object) {
      let obj = {};
      for (let key in object) {
        let value = object[key];
        "number" == typeof value
          ? (obj[key] = { value: value, link: object })
          : value instanceof Vector2
            ? (obj[key] = { x: value.x, y: value.y, link: value })
            : value instanceof Vector3
              ? (obj[key] = { x: value.x, y: value.y, z: value.z, link: value })
              : value instanceof Vector4
                ? (obj[key] = { x: value.x, y: value.y, z: value.z, w: value.w, link: value })
                : value instanceof Color &&
                  (obj[key] = { r: value.r, g: value.g, b: value.b, a: 1, link: value });
      }
      if (Object.keys(obj).length) return obj;
    }
    async function getObjectsFromLayout(layout) {
      let layers = await layout.getAllLayers(),
        objects = {};
      for (let key in layers) {
        let layer = layers[key];
        ignoreObject(key, layout.name) ||
          (!1 !== layer.animates &&
            (layer.ready && !layer.disabled && (await layer.ready()), (objects[key] = layer)));
      }
      return objects;
    }
    function createSheetFromObjects(objects, layoutName, { isSceneLayout: isSceneLayout }) {
      let sheet = {};
      for (let name in objects) {
        let object = objects[name],
          key = `${layoutName}&${name}`;
        if (ignoreObject(name)) continue;
        let matched = !1;
        if (object.uniforms) _flatMap[key] = sheet[key] = getShaderObject(object);
        else if (isElement(object)) _flatMap[key] = sheet[key] = getElementObject(object);
        else {
          if (
            ((object instanceof Mesh || object instanceof Group) &&
              ((_flatMap[key] = sheet[key] = getMeshObject(object, null, key)), (matched = !0)),
            object.shader &&
              ((_flatMap[`${key}&shader`] = sheet[`${key}&shader`] =
                getShaderObject(object.shader)),
              (matched = !0)),
            object.behavior &&
              ((_flatMap[`${key}&behavior`] = sheet[`${key}&behavior`] =
                getShaderObject(object.behavior)),
              (matched = !0)),
            object.lifeBehavior &&
              ((_flatMap[`${key}&lifeBehavior`] = sheet[`${key}&lifeBehavior`] =
                getShaderObject(object.lifeBehavior)),
              (matched = !0)),
            object.group)
          ) {
            try {
              _flatMap[key] = sheet[key] = getMeshObject(object.group, object, key);
            } catch (e) {
              console.warn(e);
            }
            matched = !0;
          }
          if (!matched && !isSceneLayout) {
            let obj = getPlainObject(object);
            obj
              ? (_flatMap[key] = sheet[key] = obj)
              : console.warn(`Unclear how to animate object ${key}`, object);
          }
        }
      }
      return sheet;
    }
    function makeSendable() {
      const cleanObject = (obj) => {
        let newObj = {};
        for (let key in obj) "link" != key && (newObj[key] = obj[key]);
        return newObj;
      };
      let obj = { sheets: [], nudgeMultiplier: _config.nudgeMultiplier };
      return (
        _audioFile && (obj.audioFile = _audioFile),
        (obj.filePath = Assets.getPath(`assets/data/timeline-${_name}.json`)),
        obj.filePath.includes("http") || (obj.filePath = Hydra.absolutePath(obj.filePath)),
        _config.sheets.forEach((sheet) => {
          let newSheet = {};
          for (let key in sheet) {
            let top = sheet[key];
            newSheet[key] = {};
            for (let key2 in top) newSheet[key][key2] = cleanObject(top[key2]);
          }
          obj.sheets.push(newSheet);
        }),
        obj
      );
    }
    function completeDataLink(dataObj, realObj) {
      let transform;
      for (let key2 in realObj) {
        if ("_config" === key2) continue;
        let valueObj = dataObj[key2],
          link = realObj[key2].link;
        void 0 !== valueObj.value
          ? (!Object.prototype.hasOwnProperty.call(link, key2) &&
            Object.prototype.hasOwnProperty.call(link, "value")
              ? (link.value = valueObj.value)
              : (link[key2] = valueObj.value),
            (transform = link.transform),
            transform && "alpha" == key2 && link.css("opacity", valueObj.value))
          : link.copy(valueObj);
      }
      transform && transform();
    }
    function linkData(data) {
      for (let key in data) {
        let dataObj = data[key],
          realObj = _flatMap[key];
        ((_changedKeys[key] = !0), completeDataLink(dataObj, realObj));
      }
    }
    async function openEditor() {
      (_config.sheets || (await prepareConfig()),
        _editor && _editor.close(),
        ((_editor = new UILExternalTimeline(_name, 800, 1200, makeSendable())).onMessage =
          linkData),
        (_editor.onVisualizePath = handleVisualizePath),
        (_editor.onPositionChange = onPositionChange),
        (_this.state.editorOpen = !0),
        (_editor.onDestroy = (_) => {
          ((_editor = null),
            (_this.state.editorOpen = !1),
            handleVisualizePath({}),
            _meshes?.forEach((mesh) => {
              (mesh._cameraUIL &&
                ((mesh._cameraUIL.tweenUIL_groupPos = null),
                (mesh._cameraUIL.tweenUIL_scale = null),
                (mesh._cameraUIL.tweenUIL_rotation = null),
                (mesh._cameraUIL.tweenUIL_position = null),
                (mesh._cameraUIL.tweenUIL_zoom = null),
                (mesh._cameraUIL.tweenUIL_fov = null),
                (mesh._cameraUIL.tweenUIL_near = null),
                (mesh._cameraUIL.tweenUIL_far = null),
                (mesh._cameraUIL.tweenUIL_lookAt = null),
                (mesh._cameraUIL.tweenUIL_cameraRotation = null),
                (mesh._cameraUIL.tweenUIL_viewportFocus = null)),
                mesh._meshUIL &&
                  ((mesh._meshUIL.tweenUIL_scale = null),
                  (mesh._meshUIL.tweenUIL_position = null),
                  (mesh._meshUIL.tweenUIL_rotation = null)));
            }));
        }),
        _meshes?.forEach((mesh) => {
          mesh._cameraUIL
            ? ((mesh._cameraUIL.tweenUIL_groupPos = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "position")),
              (mesh._cameraUIL.tweenUIL_scale = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "scale")),
              (mesh._cameraUIL.tweenUIL_rotation = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "rotation")),
              (mesh._cameraUIL.tweenUIL_position = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "cameraPos")),
              (mesh._cameraUIL.tweenUIL_zoom = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, { zoom: value }, "projection")),
              (mesh._cameraUIL.tweenUIL_fov = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, { fov: value }, "projection")),
              (mesh._cameraUIL.tweenUIL_near = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, { near: value }, "projection")),
              (mesh._cameraUIL.tweenUIL_far = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, { far: value }, "projection")),
              (mesh._cameraUIL.tweenUIL_lookAt = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "lookAt")),
              (mesh._cameraUIL.tweenUIL_cameraRotation = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "cameraRotation")),
              (mesh._cameraUIL.tweenUIL_viewportFocus = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "viewportFocus")))
            : mesh._meshUIL &&
              ((mesh._meshUIL.tweenUIL_position = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "position")),
              (mesh._meshUIL.tweenUIL_scale = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "scale")),
              (mesh._meshUIL.tweenUIL_rotation = (value) =>
                _editor.sendUpdate(mesh._uilLayerName, value, "rotation")));
        }));
    }
    function updateKeyframeData() {
      for (let key in _sheets)
        _this.keyframeTotalProgress = _keyframes.positionObject.position / _sheets[key].length;
      ((_this.keyframeIndex = _keyframes.current),
        (_this.keyframeLocalProgress = Math.fract(_keyframes.positionObject.position)));
    }
    function updateKeyframeLoop(hz) {
      _keyframes.positionObject.position = Math.lerp(
        _keyframes.positionObject.target,
        _keyframes.positionObject.position,
        0.07 * hz,
        !1,
      );
      for (let key in _sheets) _sheets[key].sequence.position = _keyframes.positionObject.position;
      updateKeyframeData();
    }
    function onPositionChange(position) {
      _this.state.editorPosition = position;
    }
    function handleVisualizePath(data) {
      if (!_pathVisualization && !data.position) return;
      let object;
      if (
        (_pathVisualization || (_pathVisualization = _this.initClass(TweenUILPathVisualization)),
        data.sheetId)
      ) {
        let parts = data.objectKey.split(" » "),
          prefix = parts.length > 1 ? parts[0] : data.sheetId,
          objectKey = parts.length > 1 ? parts.last() : data.objectKey,
          key = `${prefix}&${objectKey}`;
        ((object = _meshes.find(({ _uilLayerName: _uilLayerName }) => _uilLayerName === key)),
          !object &&
            parts.length <= 1 &&
            (object = _meshes.find(
              ({ _uilLayerName: _uilLayerName }) => _uilLayerName?.split("&")?.[1] === objectKey,
            )),
          object ||
            _layersWithWarnings[key] ||
            (console.warn(`Couldn’t find mesh for object “${key}”.`),
            (_layersWithWarnings[key] = !0)));
      }
      ((_pathVisualization.object = object), _pathVisualization.update(data));
    }
    (!(async function () {
      ((_this.state = AppState.createLocal({ editorOpen: !1, editorPosition: 0 })),
        TheatreJSLoader.loaded ||
          (!Hydra.LOCAL ||
            Global.PLAYGROUND ||
            TheatreJSLoader.warned ||
            (console.warn(
              "TheatreJS was not loaded in a preload step, so it will be loaded now.\n\nTo optimize, call `await TheatreJSLoader.load()` in a preload step. A good spot to add this is in Container.js -> loadView() -> add it to the array of promises being awaited.",
            ),
            (TheatreJSLoader.warned = !0)),
          await TheatreJSLoader.load()),
        (function initRafDriver() {
          ((_rafDriver = Theatre.core.createRafDriver({
            name: ["TweenUIL", _name, _noCache].filter(Boolean).join("_"),
          })),
            _this.startRender(loop));
        })(),
        (_input = InputUIL.create(_name + "_tween", _group)).setLabel(_name),
        _input.addButton("edit", {
          label: "Edit",
          actions: [{ title: "Editor", callback: openEditor }],
        }));
      try {
        if (
          ((_savedState = TweenUIL.jsons[_name]),
          _savedState?.then && (_savedState = await _savedState),
          !_savedState)
        ) {
          let promise = get(Assets.getPath(`assets/data/timeline-${_name}.json`));
          if (
            (_noCache && (TweenUIL.jsons[_name] = promise),
            "string" == typeof (_savedState = await promise))
          )
            throw new Error("Malformed TweenUIL timeline");
        }
        _noCache &&
          ((_projectInstanceId = `instance_${_noCache}`), (TweenUIL.jsons[_name] = _savedState));
      } catch {
        (Hydra.LOCAL &&
          console.warn(
            `No saved TweenUIL timeline “timeline-${_name}.json”, create one with the Editor`,
          ),
          (_savedState = { sheetsById: {}, definitionVersion: "0.4.0", revisionHistory: [] }));
      }
      ((_project = Theatre.core.getProject(_name, { state: _savedState })),
        _this._bindOnDestroy((_) => {
          _project.destroy();
        }),
        await _project.ready);
      for (let key in _savedState.sheetsById) {
        _sheets[key] = _project.sheet(key, { instanceId: _projectInstanceId });
        let state = _savedState.sheetsById[key];
        (_group || initObjectsWithTracks(state),
          (_sheets[key].length = findTrueDuration(state.sequence)));
      }
      (_input.addButton("play", { label: "Play", actions: [{ title: "Play", callback: play }] }),
        _input.addRange("Scrub", 0, { min: 0, max: 1, step: 5e-4 }),
        (_input.onUpdate = async (key) => {
          if ("Scrub" == key) {
            _config.sheets || (await play());
            let value = _input.getNumber("Scrub");
            _this.seek(value);
          }
        }),
        _this.flag("ready", !0));
    })(),
      (this.play = async function (options) {
        return (await _this.wait("ready"), play(options));
      }),
      (this.seek = function (value) {
        if (_this.flag("ready")) {
          checkDuration();
          for (let key in _sheets)
            _sheets[key].sequence.position = Math.min(_sheets[key].length, _duration * value);
        }
      }),
      (this.seekTime = function (value) {
        if (_this.flag("ready")) {
          checkDuration();
          for (let key in _sheets)
            _sheets[key].sequence.position = Math.min(_sheets[key].length, value);
          loop();
        }
      }),
      (this.seekImmediate = function (value) {
        (_this.seek(value), loop());
      }),
      (this.promise = async function () {
        return (await _this.wait("ready"), _promise);
      }),
      (this.setLabel = function (label) {
        _input && _input.setLabel(label);
      }),
      (this.preload = async function () {
        if ((await _this.wait("ready"), _config.sheets)) {
          if (!_this.flag("isLoaded")) return _this.wait("isLoaded");
        } else (await prepareConfig(), linkLocally());
        _this.seek(0);
      }),
      (this.loaded = async function () {
        if (!_this.flag("isLoaded") && _config.sheets) return _this.wait("isLoaded");
        await _this.preload();
      }),
      (this.seekToKeyframe = async function (index) {
        if ((_this.flag("isLoaded") || (await _this.preload()), !_keyframes))
          return console.warn("TweenUILConfig :: Missing keyframes! Add tween_anchor layer");
        ((_keyframes.current = index),
          (_keyframes.positionObject = {
            position: _keyframes[index].position,
            target: _keyframes[index].position,
          }),
          _this.seek(_keyframes[index].position),
          updateKeyframeData(),
          _this.startRender(updateKeyframeLoop, RenderManager.NATIVE_FRAMERATE));
      }),
      (this.playToKeyframe = async function (index, time, ease = "linear", delay) {
        (await _this.wait("ready"), _keyframes.positionObject || (await _this.seekToKeyframe(0)));
        let nextKeyframe = _keyframes[index],
          currentKeyframe = _keyframes[_keyframes.current];
        if (!nextKeyframe) return;
        let position = nextKeyframe.position;
        return (
          time || (time = 1e3 * Math.abs(nextKeyframe.position - currentKeyframe.position)),
          _keyframes.tween && (_keyframes.tween = clearTween(_keyframes.tween)),
          (_keyframes.current = index),
          _this.flag("playingToKeyframe", !0, time + 50),
          (_keyframes.tween = tween(
            _keyframes.positionObject,
            { target: position },
            time,
            ease,
            delay,
          )),
          _keyframes.tween.promise()
        );
      }),
      (this.peekInKeyframeDirection = function (dir, percent) {
        if (!_keyframes || _this.flag("playingToKeyframe")) return;
        let currentKeyframe = _keyframes[_keyframes.current],
          nextKeyframe = _keyframes[_keyframes.current + dir];
        nextKeyframe &&
          (_keyframes.positionObject.target = Math.mix(
            currentKeyframe.position,
            nextKeyframe.position,
            percent,
          ));
      }),
      (this.playToNextKeyframe = async function (time, ease, delay) {
        return this.playToKeyframe(_keyframes.current + 1, time, ease, delay);
      }),
      (this.playToPrevKeyframe = async function (time, ease, delay) {
        return this.playToKeyframe(_keyframes.current - 1, time, ease, delay);
      }),
      (this.playToDirKeyframe = async function (dir, time, ease, delay) {
        return this.playToKeyframe(_keyframes.current + dir, time, ease, delay);
      }),
      this.get("position", (_) => {
        let position = 0;
        for (let key in _sheets)
          position = Math.max(position, _sheets[key]?.sequence?.position || 0);
        return (_this.state.editorOpen && (position = _this.state.editorPosition), position);
      }),
      this.get("progress", (_) => (checkDuration(), _this.position / _duration)),
      _this.get("duration", () => _duration),
      this.get("totalKeyframes", (_) => (_keyframes ? _keyframes.length : 0)),
      this.get("currentKeyframe", (_) => (_keyframes ? _keyframes.current : 0)),
      this.get("keyframeValue", (_) => {
        if (!_keyframes) return 0;
        let position = _this.position;
        for (let i = 0; i < _keyframes.length; ++i) {
          let keyframe = _keyframes[i];
          if (position >= keyframe.position) {
            let nextKeyframe = _keyframes[i + 1];
            if (!nextKeyframe) return keyframe.value;
            if (position < nextKeyframe.position)
              return Math.range(
                position,
                keyframe.position,
                nextKeyframe.position,
                keyframe.value,
                nextKeyframe.value,
                !0,
              );
          }
        }
        return _keyframes[0]?.value || 0;
      }),
      _this.get("keyframeSection", (_) => Math.fract(_this.keyframeValue)),
      (_this.getPositionAtKeyframeValue = (keyframeValue) => {
        let index = Math.floor(keyframeValue),
          position = _keyframes[index]?.position || 0,
          progress = Math.fract(keyframeValue);
        if (progress) {
          let nextPosition = _keyframes[index + 1]?.position;
          nextPosition && (position = Math.mix(position, nextPosition, progress));
        }
        return position;
      }),
      (_this.getProgressAtKeyframeValue = (keyframeValue) => (
        checkDuration(),
        _this.getPositionAtKeyframeValue(keyframeValue) / _duration
      )),
      (_this.getTrackData = function (objectName) {
        for (let key in _savedState.sheetsById) {
          let tracks = _savedState.sheetsById[key].sequence.tracksByObject;
          if (tracks[objectName]) return tracks[objectName];
        }
      }),
      this.get("manualRender", () => _manualRender),
      this.set("manualRender", (value) => {
        (value = !!value) !== _manualRender &&
          ((_manualRender = value) ? _this.stopRender(loop) : _this.startRender(loop));
      }),
      this.get("sheets", () => _sheets),
      (_this.update = () => {
        (_manualRender ||
          !Hydra.LOCAL ||
          _this.flag("manualRenderWarned") ||
          (console.warn("Set manualRender to true if using TweenUIL.update()"),
          _this.flag("manualRenderWarned", !0)),
          loop());
      }),
      (_this.setAudio = async function (path) {
        await _this.loaded();
        let source = Assets.getPath(path);
        for (let sheet in _this.sheets)
          _this.sheets[sheet].sequence.attachAudio({ source: source });
        ((_audioFile = source), _config && (_config.audioFile = source));
      }));
  },
  () => {
    ((TweenUIL.BEFORE_UPDATE = "TweenUIL.BEFORE_UPDATE"), (TweenUIL.UPDATED = "TweenUIL.UPDATED"));
  },
);
