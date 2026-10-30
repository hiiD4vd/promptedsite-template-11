Class(
  function MeshMerge(_input, _dynamic) {
    Inherit(this, Object3D);
    const _this = this;
    var _mesh,
      _geom,
      _texture,
      _shaderKey,
      _meshes = [],
      _pending = [],
      _index = 0;
    function initDynamic() {
      let array = new Float32Array(16384);
      (((_texture = new DataTexture(array, 64, 64, Texture.RGBAFormat, Texture.FLOAT)).dynamic =
        !0),
        (_texture.promise = Promise.resolve()),
        (function updateShader(shader, textureSize) {
          ((shader.customCompile = `${shader.vsName}|${shader.fsName}|dynamicMerge`),
            shader.addUniforms({ tDynamicMerge: { value: _texture } }));
          let cached = MeshMerge.shaders[`${shader.vsName}|${shader.fsName}`];
          if (cached)
            return (
              shader.resetProgram(),
              void (shader.vertexShader = shader.restoreVS = cached.vertex)
            );
          shader.resetProgram();
          let vsSplit = shader.vertexShader.split("__ACTIVE_THEORY_LIGHTS__");
          if (!vsSplit[1].includes("vec3 pos = position;"))
            throw `Shader ${shader.vsName} needs to have "vec3 pos = position;" in order for dynamic merging to work`;
          ((vsSplit[0] += "attribute float mIndex;\n"),
            (vsSplit[0] += "uniform sampler2D tDynamicMerge;\n"),
            (vsSplit[0] += "vec3 offset;\n"),
            (vsSplit[0] += "vec3 scale;\n"),
            (vsSplit[0] += "vec4 orientation;\n"),
            shader.vertexShader.includes("vec3 transformPosition") ||
              (vsSplit[0] += Shaders.getShader("instance.vs") + "\n"));
          ((vsSplit[0] += `\n        vec2 getDMUV(float index, float offset) {\n            float pixel = (index*3.0) + offset;\n        \n            float size = ${textureSize}.0;\n            float p0 = pixel / size;\n            float y = floor(p0);\n            float x = p0 - y;\n        \n            vec2 uv = vec2(0.0);\n            uv.x = x;\n            uv.y = y / size;\n            return uv;\n        }\n        \n`),
            (vsSplit[1] = vsSplit[1].replace(
              /vec3 pos = position;/g,
              "vec3 pos = transformPosition(position, offset, scale, orientation);",
            )),
            (vsSplit[1] = vsSplit[1].replace(
              /vNormal = normalMatrix \* normal;/g,
              "vNormal = normalMatrix * transformNormal(normal, orientation);",
            )),
            (vsSplit[1] = vsSplit[1].replace(
              /vec3 transformedNormal = normal;/g,
              "vec3 transformedNormal = transformNormal(normal, orientation);",
            )));
          let oso =
              "\n        offset = texture2D(tDynamicMerge, getDMUV(mIndex, 0.0)).xyz;\n        scale = texture2D(tDynamicMerge, getDMUV(mIndex, 1.0)).xyz;\n        orientation = texture2D(tDynamicMerge, getDMUV(mIndex, 2.0));\n        ",
            main = vsSplit[1].split("main() {");
          ((main[1] = "\n" + oso + main[1]),
            (vsSplit[1] = main.join("main() {")),
            (vsSplit = vsSplit.join("__ACTIVE_THEORY_LIGHTS__")),
            (shader.vertexShader = shader.restoreVS = vsSplit),
            (_shaderKey = `${shader.vsName}|${shader.fsName}`),
            (MeshMerge.shaders[_shaderKey] = { vertex: shader.vertexShader }));
        })(_mesh.shader, 64));
      let loop = (_) => {
        for (let i = _meshes.length - 1; i > -1; i--) {
          let mesh = _meshes[i],
            index = mesh.mergeIndex;
          ((array[12 * index + 0] = mesh.position.x),
            (array[12 * index + 1] = mesh.position.y),
            (array[12 * index + 2] = mesh.position.z),
            (array[12 * index + 3] = 1),
            (array[12 * index + 4] = mesh.scale.x),
            (array[12 * index + 5] = mesh.scale.y),
            (array[12 * index + 6] = mesh.scale.z),
            (array[12 * index + 7] = 1),
            (array[12 * index + 8] = mesh.quaternion.x),
            (array[12 * index + 9] = mesh.quaternion.y),
            (array[12 * index + 10] = mesh.quaternion.z),
            (array[12 * index + 11] = mesh.quaternion.w));
        }
      };
      (defer(loop), _this.startRender(loop));
    }
    function completeMerge() {
      ((_mesh.geometry = _geom),
        _mesh.asyncPromise.resolve(),
        _this.onMeshCreated && _this.onMeshCreated(_mesh),
        (_this.mesh = _mesh));
    }
    async function initFromSceneLayout() {
      let wildcard = _input.get("wildcard");
      if (!wildcard || !wildcard.length) return;
      let [groupName, dynamic] = wildcard.split("|");
      await _this.parent.loadedAllLayers();
      let group = await _this.parent.getLayer(groupName);
      _dynamic = "dynamic" == dynamic;
      let children = [...group.children];
      (children.sort((a, b) => a.renderOrder - b.renderOrder),
        children.forEach((mesh) => _this.add(mesh)),
        group.add(_this.group),
        MeshMerge.cache[_input.prefix] || (MeshMerge.cache[_input.prefix] = Promise.create()));
    }
    (!(function () {
      if ("object" == typeof _input) {
        if (!1 === _input.get("visible")) return;
        _this.parent.ready().then(initFromSceneLayout);
      } else "boolean" == typeof _input && (_dynamic = _input);
    })(),
      (this.onDestroy = function () {
        (_mesh.destroy(),
          delete MeshBatch.shaders[_shaderKey],
          _input?.prefix && delete MeshMerge.cache[_input.prefix],
          _this._onDestroy && _this._onDestroy());
      }),
      (this.ready = function () {
        return _this.wait("mesh");
      }),
      (this.add = function (mesh) {
        if (((mesh.uploadIgnore = !0), !mesh.visible)) return;
        if (
          ((mesh.merge = _this),
          mesh.updateMatrixWorld(!0),
          _mesh ||
            (async function initMesh(mesh) {
              if (
                (((_mesh = new Mesh(World.QUAD, mesh.shader)).asyncPromise = Promise.create()),
                _this.group.add(_mesh),
                _input?.get &&
                  ((_mesh.castShadow = _input.get("castShadow")),
                  (_mesh.shader.receiveShadow = _input.get("receiveShadow"))),
                _dynamic && initDynamic(),
                _input?.prefix)
              ) {
                let cached = MeshMerge.cache[_input.prefix];
                if (cached) return ((_geom = await cached), void completeMerge());
              }
              await defer();
              let data = await Promise.all(_pending),
                buffers = [];
              data.forEach((obj) => {
                for (let key in obj) obj[key].buffer && buffers.push(obj[key].buffer);
              });
              let merged = await Thread.shared().meshMergeComplete({ data: data }, buffers);
              _geom = new Geometry();
              for (let key in merged)
                "components" !== key &&
                  "indexBuffer" !== key &&
                  _geom.addAttribute(
                    key,
                    new GeometryAttribute(merged[key], merged.components[key]),
                  );
              (merged.indexBuffer && _geom.setIndex(merged.indexBuffer),
                _input?.prefix && MeshMerge.cache[_input.prefix].resolve(_geom),
                completeMerge());
            })(mesh),
          _input?.prefix)
        ) {
          if (MeshMerge.cache[_input.prefix])
            return ((mesh.visible = !1), _meshes.push(mesh), void (mesh.mergeIndex = _index++));
        }
        let geom = mesh.geometry;
        if (mesh.attributes)
          for (let key in mesh.attributes) {
            let attr = mesh.attributes[key];
            (attr instanceof Vector4 && (attr.isVector4 = !0),
              attr instanceof Vector3 && (attr.isVector3 = !0),
              attr instanceof Vector2 && (attr.isVector2 = !0),
              attr instanceof Color && (attr.isColor = !0));
          }
        let data = {},
          components = {},
          buffers = [];
        for (let key in geom.attributes)
          ((data[key] = new Float32Array(geom.attributes[key].array)),
            buffers.push(data[key].buffer),
            (components[key] = geom.attributes[key].itemSize));
        (geom.index &&
          ((data.indexBuffer = new Uint32Array(geom.index)), buffers.push(data.indexBuffer.buffer)),
          (data.attributes = mesh.attributes),
          (data.components = components),
          (data.matrix = "world" == _input ? mesh.matrixWorld.elements : mesh.matrix.elements),
          _dynamic && (data.matrix = null),
          (data.dynamic = _dynamic),
          (data.index = mesh.mergeIndex = _index++),
          (mesh.visible = !1),
          _meshes.push(mesh),
          _pending.push(Thread.shared().meshMergeTransform(data, buffers)));
      }),
      (this.toJSON = function () {
        return {
          metadata: { type: "MeshMerge" },
          data: {
            geometry: _mesh.geometry.toJSON(),
            offset: {
              type: "Float32Array",
              itemSize: 3,
              array: _meshes.map((mesh) => mesh.position.toArray()).flat(),
            },
            orientation: {
              type: "Float32Array",
              itemSize: 4,
              array: _meshes.map((mesh) => mesh.quaternion.toArray()).flat(),
            },
            scale: {
              type: "Float32Array",
              itemSize: 3,
              array: _meshes.map((mesh) => mesh.scale.toArray()).flat(),
            },
          },
        };
      }),
      (this.loadMerged = function (mergedGeometry, shader, meshes) {
        (meshes.forEach((mesh) => {
          ((mesh.merge = _this),
            (mesh.uploadIgnore = !0),
            mesh.updateMatrixWorld(!0),
            "number" == typeof mesh.mergeIndex
              ? ((_index = Math.max(mesh.mergeIndex, _index)), (_meshes[mesh.mergeIndex] = mesh))
              : ((mesh.mergeIndex = _index++), _meshes.push(mesh)));
        }),
          ((_mesh = new Mesh(World.QUAD, shader)).asyncPromise = Promise.create()),
          _this.group.add(_mesh),
          _dynamic && initDynamic(),
          (_geom = mergedGeometry),
          completeMerge());
      }));
  },
  (_) => {
    (Thread.upload(function meshMergeTransform(e, id) {
      let geom = new Geometry();
      for (let key in e)
        !key.includes(["components", "matrix"]) &&
          e[key] instanceof Float32Array &&
          geom.addAttribute(key, new GeometryAttribute(e[key], e.components[key]));
      if ((e.indexBuffer && (geom.index = e.indexBuffer), e.attributes))
        for (let key in e.attributes) {
          let components = 1,
            attr = e.attributes[key];
          attr.isVector4
            ? (components = 4)
            : attr.isVector3 || attr.isColor
              ? (components = 3)
              : attr.isVector2 && (components = 2);
          let buffer = new Float32Array(geom.attributes.position.count * components),
            step = buffer.length / components;
          for (let i = 0; i < step; i++)
            4 == components
              ? ((buffer[4 * i + 0] = attr.x),
                (buffer[4 * i + 1] = attr.y),
                (buffer[4 * i + 2] = attr.z),
                (buffer[4 * i + 3] = attr.w))
              : 3 == components
                ? ((buffer[3 * i + 0] = attr.x || attr.r || 0),
                  (buffer[3 * i + 1] = attr.y || attr.g || 0),
                  (buffer[3 * i + 2] = attr.z || attr.b || 0))
                : 2 == components
                  ? ((buffer[2 * i + 0] = attr.x), (buffer[2 * i + 1] = attr.y))
                  : (buffer[i] = attr);
          geom.addAttribute(key, new GeometryAttribute(buffer, components));
        }
      e.matrix && geom.applyMatrix(new Matrix4().fromArray(e.matrix));
      let indexBuffer = new Float32Array(geom.attributes.position.count);
      for (let i = 0; i < indexBuffer.length; i++) indexBuffer[i] = e.index;
      geom.addAttribute("mIndex", new GeometryAttribute(indexBuffer, 1));
      let data = {},
        buffers = [],
        components = {};
      for (let key in geom.attributes)
        ((data[key] = geom.attributes[key].array),
          (components[key] = geom.attributes[key].itemSize),
          buffers.push(data[key].buffer));
      (geom.index && ((data.indexBuffer = geom.index), buffers.push(data.indexBuffer.buffer)),
        (data.components = components),
        resolve(data, id, buffers));
    }),
      Thread.upload(function meshMergeComplete({ data: data }, id) {
        let _geom;
        data.forEach((data) => {
          let geom = new Geometry();
          for (let key in data)
            "components" != key &&
              ("indexBuffer" == key
                ? (geom.index = data[key])
                : geom.addAttribute(key, new GeometryAttribute(data[key], data.components[key])));
          _geom ? _geom.merge(geom) : (_geom = geom);
        });
        let result = {},
          components = {},
          buffers = [];
        for (let key in _geom.attributes)
          ((result[key] = _geom.attributes[key].array),
            (components[key] = _geom.attributes[key].itemSize),
            buffers.push(result[key].buffer));
        (_geom.index &&
          ((result.indexBuffer = _geom.index), buffers.push(result.indexBuffer.buffer)),
          (result.components = components),
          resolve(result, id, buffers));
      }),
      (MeshMerge.shaders = {}),
      (MeshMerge.cache = {}));
  },
);
