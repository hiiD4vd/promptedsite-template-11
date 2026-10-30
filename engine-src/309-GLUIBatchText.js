Class(function GLUIBatchText(globalUniforms = {}, _useWorldCoords, _shaderName) {
  Inherit(this, Component);
  const _this = this;
  var _geometry,
    _shader,
    _timer,
    _forceUpdate,
    _promises = [],
    _toSplice = [],
    _objects = [],
    _offset = 0;
  function loop() {
    if (!_geometry) return;
    let updated = !1;
    for (let key in _geometry.attributes) {
      let attrib = _geometry.attributes[key];
      attrib.updateRange.length && (attrib.updateRange.length = 0);
    }
    let len = _objects.length;
    for (let i = 0; i < len; i++) {
      let obj = _objects[i];
      (obj.mesh.onBeforeRender(),
        _useWorldCoords &&
          (obj.group.updateMatrixWorld(),
          obj.mesh.getWorldPosition(obj.worldPosition),
          obj.worldRotation.setFromQuaternion(obj.mesh.getWorldQuaternion()),
          obj.mesh.getWorldScale(obj.worldScale)));
      let offset = obj._offset,
        count = obj._count,
        end = offset + count;
      (obj._buffers.forEach((buffer) => {
        let dirty = !1;
        if (
          ((dirty = !buffer.value.equals(buffer.lookup)), buffer.value.copy(buffer.lookup), dirty)
        ) {
          let array = _geometry.attributes[buffer.key].array;
          for (let j = offset; j < end; j++)
            switch (buffer.components) {
              case 4:
                ((array[4 * j + 0] = buffer.lookup.x),
                  (array[4 * j + 1] = buffer.lookup.y),
                  (array[4 * j + 2] = buffer.lookup.z),
                  (array[4 * j + 3] = buffer.lookup.w));
                break;
              case 3:
                ((array[3 * j + 0] = buffer.lookup.x),
                  (array[3 * j + 1] = buffer.lookup.y),
                  (array[3 * j + 2] = buffer.lookup.z));
                break;
              case 2:
                ((array[2 * j + 0] = buffer.lookup.x), (array[2 * j + 1] = buffer.lookup.y));
                break;
              case 1:
                array[j] = buffer.lookup.z;
            }
          ((updated = !0),
            (buffer.updateRange.offset = offset * buffer.components),
            (buffer.updateRange.count = count * buffer.components),
            _geometry.attributes[buffer.key].updateRange.push(buffer.updateRange),
            (_geometry.attributes[buffer.key].needsUpdate = !0));
        }
      }),
        obj._uniforms.forEach((uniform) => {
          let dirty = !1;
          if (
            ("f" == uniform.type
              ? ((dirty = obj.mesh.shader.uniforms[uniform.key].value != uniform.value),
                (uniform.value = obj.mesh.shader.uniforms[uniform.key].value))
              : ((dirty = !obj.mesh.shader.uniforms[uniform.key].value.equals(uniform.value)),
                uniform.value.copy(obj.mesh.shader.uniforms[uniform.key].value)),
            dirty || _forceUpdate)
          ) {
            let array = _geometry.attributes["a_" + uniform.key].array;
            for (let j = offset; j < end; j++)
              "f" == uniform.type
                ? (array[j] = obj.mesh.shader.uniforms[uniform.key].value)
                : obj.mesh.shader.uniforms[uniform.key].value.toArray(
                    array,
                    j * uniform.components,
                  );
            ((updated = !0),
              (uniform.updateRange.offset = offset * uniform.components),
              (uniform.updateRange.count = count * uniform.components),
              _geometry.attributes["a_" + uniform.key].updateRange.push(uniform.updateRange),
              (_geometry.attributes["a_" + uniform.key].needsUpdate = !0));
          }
        }));
    }
    if (updated)
      for (let key in _geometry.attributes) {
        let bottom,
          attrib = _geometry.attributes[key];
        if (!attrib.updateRange.length) continue;
        let toSplice = _toSplice;
        toSplice.length = 0;
        for (let i = 0; i < attrib.updateRange.length; i++) {
          let current = attrib.updateRange[i],
            prev = attrib.updateRange[i - 1];
          prev
            ? prev.offset + prev.count == current.offset
              ? ((bottom.count += current.count), toSplice.push(i))
              : (bottom = current)
            : (bottom = current);
        }
        for (let i = toSplice.length - 1; i > -1; i--) attrib.updateRange.splice(toSplice[i], 1);
      }
    _forceUpdate = !1;
  }
  async function createMesh() {
    if (_this.flag("mesh")) return;
    (_this.flag("mesh", !0), await Promise.all(_promises), await _this.wait(100));
    let mesh = new Mesh(_geometry, _shader);
    ((_this.mesh = mesh), (mesh.frustumCulled = !1), _this.group.add(mesh));
  }
  ((this.group = new Group()),
    (this.enable3D = () => {}),
    "boolean" == typeof globalUniforms &&
      ((_useWorldCoords = globalUniforms), (globalUniforms = {})),
    _this.flag("canLoad", !0),
    _this.startRender(loop),
    (_this.add = async function (obj) {
      if ((await _this.flag("canLoad"), _this.destroy)) {
        if (
          (_this.flag("canLoad", !1),
          await obj.loaded(),
          (obj.mesh.shader.neverRender = !0),
          _promises.push(obj.loaded()),
          (function addAttributes(obj, mesh) {
            let { geometry: geometry, shader: shader } = mesh,
              count = geometry.attributes.uv.count;
            mesh.onBeforeRender();
            let buffers = [],
              uniforms = [];
            for (let key in shader.uniforms) {
              let uniform = shader.uniforms[key];
              (uniform.value instanceof Color &&
                uniforms.push({ key: key, type: "c", components: 3 }),
                uniform.value instanceof Vector3 &&
                  uniforms.push({ key: key, type: "v3", components: 3 }),
                uniform.value instanceof Vector4 &&
                  uniforms.push({ key: key, type: "v4", components: 4 }),
                uniform.value instanceof Vector2 &&
                  uniforms.push({ key: key, type: "v", components: 2 }),
                "number" == typeof uniform.value &&
                  uniforms.push({ key: key, type: "f", components: 1 }));
            }
            (_useWorldCoords &&
              ((obj.worldScale = new Vector3()),
              (obj.worldRotation = new Euler()),
              (obj.worldPosition = new Vector3())),
              buffers.push({
                key: "offset",
                lookup: _useWorldCoords ? obj.worldPosition : obj.group.position,
                components: 3,
              }),
              buffers.push({
                key: "scale",
                lookup: _useWorldCoords ? obj.worldScale : obj.group.scale,
                components: 2,
              }),
              buffers.push({
                key: "rotation",
                lookup: _useWorldCoords ? obj.worldRotation : obj.group.rotation,
                components: 1,
              }),
              uniforms.forEach((uniform) => {
                ((uniform.updateRange = {}),
                  (uniform.value = shader.uniforms[uniform.key].value),
                  "object" == typeof uniform.value && (uniform.value = uniform.value.clone()),
                  (uniform.buffer = new Float32Array(count * uniform.components)));
              }),
              buffers.forEach((buffer) => {
                ((buffer.updateRange = {}),
                  (buffer.value = buffer.lookup.clone()),
                  (buffer.buffer = new Float32Array(count * buffer.components)));
              }));
            for (let i = 0; i < count; i++)
              (buffers.forEach((buffer) => {
                switch (buffer.components) {
                  case 4:
                    ((buffer.buffer[4 * i + 0] = buffer.lookup.x),
                      (buffer.buffer[4 * i + 1] = buffer.lookup.y),
                      (buffer.buffer[4 * i + 2] = buffer.lookup.z),
                      (buffer.buffer[4 * i + 3] = buffer.lookup.w));
                    break;
                  case 3:
                    ((buffer.buffer[3 * i + 0] = buffer.lookup.x),
                      (buffer.buffer[3 * i + 1] = buffer.lookup.y),
                      (buffer.buffer[3 * i + 2] = buffer.lookup.z));
                    break;
                  case 2:
                    ((buffer.buffer[2 * i + 0] = buffer.lookup.x),
                      (buffer.buffer[2 * i + 1] = buffer.lookup.y));
                    break;
                  case 1:
                    buffer.buffer[i] = buffer.lookup.z;
                }
              }),
                uniforms.forEach((uniform) => {
                  "f" == uniform.type
                    ? (uniform.buffer[i] = shader.uniforms[uniform.key].value)
                    : shader.uniforms[uniform.key].value.toArray(
                        uniform.buffer,
                        i * uniform.components,
                      );
                }));
            (buffers.forEach((buffer) => {
              geometry.addAttribute(
                buffer.key,
                new GeometryAttribute(buffer.buffer, buffer.components),
              );
            }),
              uniforms.forEach((uniform) => {
                geometry.addAttribute(
                  "a_" + uniform.key,
                  new GeometryAttribute(uniform.buffer, uniform.components),
                );
              }),
              (obj._offset = _offset),
              (obj._count = count),
              (obj._uniforms = uniforms),
              (obj._buffers = buffers),
              _objects.push(obj),
              (_offset += count));
          })(obj, obj.mesh),
          _useWorldCoords)
        ) {
          let getAlpha = obj.getAlpha;
          getAlpha &&
            (obj.getAlpha = () =>
              (_this.parent ? _this.parent.getAlpha() : 1) * getAlpha.call(obj));
        } else _this.parent.add(obj);
        (_geometry
          ? _geometry.merge(obj.mesh.geometry)
          : (function initGeometry(mesh) {
              (_shader = _this.initClass(
                Shader,
                _shaderName || "GLUIBatchText",
                _shaderName || mesh.shader.fsName,
                Object.assign(
                  {},
                  {
                    transparent: !0,
                    depthWrite: !1,
                    customCompile: `${mesh.shader.vsName}|${mesh.shader.fsName}|instance`,
                  },
                  globalUniforms,
                ),
              )).vertexShader || _shader.resetProgram();
              let vsSplit = _shader.vertexShader.split("__ACTIVE_THEORY_LIGHTS__"),
                fsSplit = _shader.fragmentShader.split("__ACTIVE_THEORY_LIGHTS__"),
                definitions = [],
                definitionSplit = [];
              (fsSplit[1].split("\n").forEach((line) => {
                if (line.includes("uniform")) {
                  if (line.includes("sampler2D")) return;
                  let data = line.split(" ");
                  (definitions.push(`${data[2].replace(";", "")} = a_${data[2]}`),
                    (vsSplit[1] =
                      `\nattribute ${data[1]} a_${data[2]}\nvarying ${data[1]} ${data[2]}` +
                      vsSplit[1]),
                    (vsSplit[1] = vsSplit[1].replace(line, "")),
                    (fsSplit[1] = fsSplit[1].replace(line, `varying ${data[1]} ${data[2]}`)));
                }
              }),
                definitions.forEach((def) => definitionSplit.push(def.split(" =")[0].trim())));
              let baseVS = Shaders.getShader(mesh.shader.vsName + ".vs");
              if (baseVS.includes("//start batch main")) {
                let main = baseVS.split("//start batch main")[1].split("//end batch main")[0];
                vsSplit[1] = vsSplit[1].replace("//custommain", main);
                let beforeMain = baseVS.split("void main() {")[0];
                ((beforeMain = beforeMain.replace("uniform sampler2D tMap;", "")),
                  (beforeMain = beforeMain.replace("varying vec2 vUv;", "")),
                  beforeMain.split("\n").forEach((line) => {
                    definitionSplit.forEach((def) => {
                      line.includes(def) &&
                        line.includes(["uniform", "varying"]) &&
                        (beforeMain = beforeMain.replace(line, ""));
                    });
                  }),
                  (vsSplit[0] += beforeMain));
              }
              ((vsSplit[1] = vsSplit[1].replace("//vdefines", "\n" + definitions.join("\n"))),
                (_shader.vertexShader = vsSplit.join("__ACTIVE_THEORY_LIGHTS__")),
                (_shader.fragmentShader = fsSplit.join("__ACTIVE_THEORY_LIGHTS__")),
                mesh.shader.copyUniformsTo(_shader),
                (_geometry = mesh.geometry.clone()));
              for (let key in _geometry.attributes) _geometry.attributes[key].updateRange = [];
            })(obj.mesh),
          _this.flag("canLoad", !0),
          clearTimeout(_timer),
          (_timer = _this.delayedCall(createMesh, 50)),
          (obj.isDirty = !0));
      }
    }),
    (_this.forceUpdate = function () {
      _forceUpdate = !0;
    }),
    (_this.onDestroy = function () {
      _this.mesh && _this.mesh.destroy();
    }));
});
