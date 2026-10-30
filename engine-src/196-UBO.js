class UBO {
  constructor(location, gl = Renderer.context) {
    ((this.gl = gl), (this.arrays = []));
    for (let i = 0; i < 30; i++) this.arrays.push([]);
    ((this.arrayIndex = 0),
      (this.objects = []),
      (this.location = location),
      (this.data = null),
      (this.lastUpdate = 0));
  }
  _getSize(uniform) {
    let obj = uniform.value;
    return Array.isArray(obj)
      ? uniform.components
        ? (obj.length / uniform.components) * 16
        : 16 * obj.length
      : obj instanceof Vector2
        ? 8
        : obj instanceof Vector3 || obj instanceof Vector4 || obj instanceof Color
          ? 16
          : obj instanceof Matrix4
            ? 64
            : obj instanceof Matrix3
              ? 48
              : obj instanceof Quaternion
                ? 16
                : 4;
  }
  _getValues(uniform) {
    let obj = uniform.value;
    return Array.isArray(obj)
      ? obj
      : obj instanceof Vector2
        ? this._array(obj.x, obj.y)
        : obj instanceof Vector3
          ? this._array(obj.x, obj.y, obj.z)
          : obj instanceof Matrix4 || obj instanceof Matrix3
            ? obj.elements
            : obj instanceof Color
              ? this._array(obj.r, obj.g, obj.b)
              : obj instanceof Quaternion
                ? this._array(obj.x, obj.y, obj.z, obj.w)
                : this._array(obj);
  }
  _array() {
    this.arrayIndex++ >= this.arrays.length - 1 && (this.arrayIndex = 0);
    let array = this.arrays[this.arrayIndex];
    return ((array.length = 0), array.push.apply(array, arguments), array);
  }
  clear() {
    for (let i = 0; i < this.arrays.length; i++) this.arrays[i].length = 0;
  }
  calculate() {
    let len = this.objects.length,
      chunk = 16,
      tsize = 0,
      offset = 0,
      size = 0;
    for (let i = 0; i < len; i++) {
      let obj = this.objects[i];
      ((size = this._getSize(obj)),
        (tsize = chunk - size),
        tsize < 0 && chunk < 16
          ? ((offset += chunk), i > 0 && (this.objects[i - 1].chunkLen += chunk), (chunk = 16))
          : (tsize < 0 && 16 == chunk) || (0 == tsize ? (chunk = 16) : (chunk -= size)),
        (obj.offset = offset / 4),
        (obj.chunkLen = size / 4),
        (obj.dataLen = size / 4),
        (offset += size));
    }
    return (
      offset % 16 != 0 &&
        ((this.objects[this.objects.length - 1].chunkLen += chunk / 4), (offset += chunk)),
      offset / 4
    );
  }
  compileData() {
    let i,
      array = this._array(),
      len = this.calculate();
    for (i = 0; i < len; i++) array[i] = 0;
    for (i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i],
        values = this._getValues(obj);
      for (let j = 0; j < values.length; j++) array[obj.offset + j] = values[j];
    }
    return array;
  }
  upload() {
    if (this.data) return;
    let gl = Renderer.context,
      array = this.compileData();
    array.length &&
      ((this.data = new Float32Array(array)),
      (this.buffer = gl.createBuffer()),
      gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer),
      gl.bufferData(gl.UNIFORM_BUFFER, this.data, gl.DYNAMIC_DRAW),
      gl.bindBuffer(gl.UNIFORM_BUFFER, null),
      gl.bindBufferBase(gl.UNIFORM_BUFFER, this.location, this.buffer));
  }
  bind(program, name) {
    (this.data || this.upload(), this.needsUpdate && this.update());
    let location,
      gl = Renderer.context;
    ((location =
      program == this.lastProgram && name == this.lastName && void 0 !== this.lastLocation
        ? this.lastLocation
        : gl.getUniformBlockIndex(program, name)),
      location > 99999 ||
        -1 == location ||
        (gl.uniformBlockBinding(program, location, this.location),
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.location, this.buffer),
        (this.lastProgram = program),
        (this.lastName = name),
        (this.lastLocation = location)));
  }
  update() {
    if ((this.data || this.upload(), !this.data)) return;
    let gl = Renderer.context,
      array = this.compileData();
    (array.length != this.data.length && ((this.data = new Float32Array(array)), this.upload()),
      this.data.set(array),
      gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer),
      gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.data),
      gl.bindBuffer(gl.UNIFORM_BUFFER, null),
      (this.needsUpdate = !1));
  }
  unbind() {}
  push() {
    if (this.data) throw "Can't modify UBO after initial upload!";
    for (let i = 0; i < arguments.length; i++) this.objects.push(arguments[i]);
  }
  destroy() {
    this.gl.deleteBuffer(this.buffer);
  }
}
