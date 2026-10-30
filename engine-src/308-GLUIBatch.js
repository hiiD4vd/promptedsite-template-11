Class(function GLUIBatch(globalUniforms = {}, _useWorldCoords, cacheSuffix = "") {
  Inherit(this, Component);
  const _this = this;
  var _timer,
    _geometry,
    _shader,
    _objects = [];
  function loop() {
    if (!_geometry) return;
    let parent = _this.group._parent;
    for (; parent;) {
      if (parent.isRenderingCheck && !parent.isRenderingCheck()) return;
      parent = parent._parent;
    }
    let len = _objects.length;
    for (let i = 0; i < len; i++) {
      let obj = _objects[i];
      if (obj._buffers) {
        (obj.mesh.onBeforeRender(),
          _useWorldCoords &&
            (obj.group.updateMatrixWorld(),
            obj.mesh.getWorldPosition(obj.worldPosition),
            obj.worldRotation.setFromQuaternion(obj.mesh.getWorldQuaternion()),
            obj.mesh.getWorldScale(obj.worldScale)));
        for (let j = obj._buffers.length - 1; j > -1; j--) {
          let buffer = obj._buffers[j],
            dirty = !1;
          if (
            ((dirty = !buffer.value.equals(buffer.lookup)),
            buffer.value.copy(buffer.lookup),
            buffer.lookup2 &&
              ((dirty = dirty || !buffer.value2.equals(buffer.lookup2)),
              buffer.value2.copy(buffer.lookup2)),
            dirty)
          ) {
            let attribute = _geometry.attributes[buffer.key],
              array = attribute.array;
            switch (buffer.key) {
              case "scale":
                ((array[2 * i + 0] = buffer.lookup.x),
                  (array[2 * i + 1] = buffer.lookup.y),
                  buffer.lookup2 &&
                    ((array[2 * i + 0] *= buffer.lookup2.x),
                    (array[2 * i + 1] *= buffer.lookup2.y)));
                break;
              case "rotation":
                array[i] = buffer.lookup.z;
                break;
              default:
                ((array[3 * i + 0] = buffer.lookup.x),
                  (array[3 * i + 1] = buffer.lookup.y),
                  (array[3 * i + 2] = obj.mesh.renderOrder));
            }
            attribute.needsUpdate = !0;
          }
        }
        for (let j = obj._uniforms.length - 1; j > -1; j--) {
          let uniform = obj._uniforms[j],
            dirty = !1;
          if (
            ("f" == uniform.type
              ? ((dirty = obj.mesh.shader.uniforms[uniform.key].value != uniform.value),
                (uniform.value = obj.mesh.shader.uniforms[uniform.key].value))
              : ((dirty = !obj.mesh.shader.uniforms[uniform.key].value.equals(uniform.value)),
                uniform.value.copy(obj.mesh.shader.uniforms[uniform.key].value)),
            dirty)
          ) {
            let attribute = _geometry.attributes["a_" + uniform.key],
              array = attribute.array;
            ("f" == uniform.type
              ? (array[i] = uniform.value)
              : uniform.value.toArray(array, i * uniform.components),
              (attribute.needsUpdate = !0));
          }
        }
      }
    }
  }
  function getTypeFromSize(size) {
    switch (size) {
      case 1:
        return "float";
      case 2:
        return "vec2";
      case 3:
        return "vec3";
      case 4:
        return "vec4";
    }
  }
  function createMesh() {
    let shader = _objects[0].mesh.shader;
    _geometry = new Geometry().instanceFrom(_objects[0].mesh.geometry.clone());
    let map = {},
      arrays = {};
    _objects.forEach((obj, i) => {
      obj.mesh.onBeforeRender();
      let buffers = [],
        uniforms = [];
      for (let key in shader.uniforms) {
        let uniform = shader.uniforms[key];
        uniform &&
          (uniform.value instanceof Color && uniforms.push({ key: key, type: "c", components: 3 }),
          uniform.value instanceof Vector4 &&
            uniforms.push({ key: key, type: "v4", components: 4 }),
          uniform.value instanceof Vector3 &&
            uniforms.push({ key: key, type: "v3", components: 3 }),
          uniform.value instanceof Vector2 && uniforms.push({ key: key, type: "v", components: 2 }),
          "number" == typeof uniform.value &&
            uniforms.push({ key: key, type: "f", components: 1 }));
      }
      (_useWorldCoords &&
        ((obj.worldScale = new Vector3()),
        (obj.worldRotation = new Euler()),
        (obj.worldPosition = new Vector3())),
        buffers.push({
          key: "scale",
          lookup: _useWorldCoords ? obj.worldScale : obj.group.scale,
          lookup2: !_useWorldCoords && obj.mesh.scale,
          components: 2,
        }),
        buffers.push({
          key: "rotation",
          lookup: _useWorldCoords ? obj.worldRotation : obj.group.rotation,
          components: 1,
        }),
        buffers.push({
          key: "offset",
          lookup: _useWorldCoords ? obj.worldPosition : obj.group.position,
          components: 3,
        }),
        uniforms.forEach((uniform) => {
          (arrays["a_" + uniform.key] || (arrays["a_" + uniform.key] = []),
            map["a_" + uniform.key] || (map["a_" + uniform.key] = uniform));
          let value = shader.uniforms[uniform.key].value;
          "object" == typeof value
            ? ((uniform.value = value.clone()),
              uniform.value.toArray(arrays["a_" + uniform.key], i * uniform.components))
            : ((uniform.value = shader.uniforms[uniform.key].value),
              arrays["a_" + uniform.key].push(uniform.value));
        }),
        buffers.forEach((buffer) => {
          switch (
            (arrays[buffer.key] || (arrays[buffer.key] = []),
            map[buffer.key] || (map[buffer.key] = buffer),
            (buffer.value = buffer.lookup.clone()),
            buffer.lookup2 && (buffer.value2 = buffer.lookup2.clone()),
            buffer.key)
          ) {
            case "scale":
              arrays[buffer.key].push(
                _useWorldCoords ? buffer.lookup.x : buffer.lookup.x * buffer.lookup2.x,
                _useWorldCoords ? buffer.lookup.y : buffer.lookup.y * buffer.lookup2.y,
              );
              break;
            case "rotation":
              arrays[buffer.key].push(buffer.lookup.z);
              break;
            default:
              arrays[buffer.key].push(buffer.lookup.x, buffer.lookup.y, obj.mesh.renderOrder);
          }
        }),
        (obj._buffers = buffers),
        (obj._uniforms = uniforms),
        (obj.shader.neverRender = !0));
    });
    let attributes = [],
      defines = [];
    for (let key in map)
      key.includes("a_") &&
        (attributes.push(`% ${getTypeFromSize(map[key].components)} ${key};`),
        defines.push(`${key.replace("a_", "v_")} = ${key};`));
    ((attributes = attributes.join("\n")), (defines = defines.join("\n")));
    for (let key in arrays)
      _geometry.addAttribute(
        key,
        new GeometryAttribute(new Float32Array(arrays[key]), map[key].components, 1),
      );
    let cacheKey = shader.fsName + cacheSuffix;
    if (GLUIBatch.cache[cacheKey]) _shader = GLUIBatch.cache[cacheKey];
    else {
      (_shader = _this.initClass(
        Shader,
        "GLUIBatch",
        shader.fsName,
        Object.assign(
          {},
          { transparent: !0, depthWrite: !1, depthTest: !1, customCompile: Utils.uuid() },
          globalUniforms,
        ),
      )).vertexShader || _shader.resetProgram();
      let vsSplit = _shader.vertexShader.split("__ACTIVE_THEORY_LIGHTS__"),
        fsSplit = _shader.fragmentShader.split("__ACTIVE_THEORY_LIGHTS__"),
        definitions = [];
      (fsSplit[1].split("\n").forEach((line) => {
        if (line.includes("uniform")) {
          if (line.includes("sampler2D")) return;
          let data = line.split(" ");
          (definitions.push(`${data[2].replace(";", "")} = a_${data[2]}`),
            (vsSplit[1] =
              `\nattribute ${data[1]} a_${data[2]}\nvarying ${data[1]} ${data[2]}` + vsSplit[1]),
            (vsSplit[1] = vsSplit[1].replace(line, "")),
            (fsSplit[1] = fsSplit[1].replace(line, `varying ${data[1]} ${data[2]}`)));
        }
      }),
        (vsSplit[1] = vsSplit[1].replace("//vdefines", "\n" + definitions.join("\n"))),
        (_shader.vertexShader = vsSplit.join("__ACTIVE_THEORY_LIGHTS__")),
        (_shader.fragmentShader = fsSplit.join("__ACTIVE_THEORY_LIGHTS__")),
        (GLUIBatch.cache[cacheKey] = _shader));
    }
    (shader.replicateUniformsTo(_shader),
      (_this.mesh = new Mesh(_geometry, _shader)),
      (_this.mesh.frustumCulled = !1),
      _this.group.add(_this.mesh));
  }
  ((this.group = new Group()),
    "boolean" == typeof globalUniforms &&
      ((_useWorldCoords = globalUniforms), (globalUniforms = {})),
    GLUIBatch.cache || (GLUIBatch.cache = {}),
    _this.startRender(loop),
    (this.add = function (obj) {
      if ((clearTimeout(_timer), (_timer = _this.delayedCall(createMesh, 50)), _useWorldCoords)) {
        let getAlpha = obj.getAlpha;
        getAlpha &&
          (obj.getAlpha = () => (_this.parent ? _this.parent.getAlpha() : 1) * getAlpha.call(obj));
      } else _this.parent?.add?.(obj);
      _objects.push(obj);
    }),
    (this.setZ = async function (z) {
      (await _this.wait("mesh"), (_this.mesh.renderOrder = z));
    }),
    (this.onDestroy = function () {
      _this.mesh && _this.mesh.destroy();
    }));
});
