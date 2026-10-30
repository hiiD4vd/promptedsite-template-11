class Base3D {
  constructor() {
    ((this.position = new Vector3D()),
      (this.rotation = new Euler()),
      (this.quaternion = new Quaternion()),
      (this.scale = new Vector3D(1, 1, 1)),
      (this._parent = null),
      (this.up = new Vector3(0, 1, 0)),
      (this.isObject3D = !0),
      (this.children = []),
      (this.childrenLength = 0),
      (this.modelViewMatrix = new Matrix4()),
      (this.normalMatrix = new Matrix3()),
      (this.normalMatrixWorld = new Matrix3()),
      (this.matrix = new Matrix4()),
      (this.matrixWorld = new Matrix4()),
      (this.matrixAutoUpdate = !0),
      (this.matrixWorldNeedsUpdate = !1),
      (this.matrixDirty = !0),
      (this.decomposeDirty = !0),
      (this.visible = !0),
      (this.hidden = !1),
      (this.castShadow = !1),
      (this.frustumCulled = !0),
      (this.occlusionCulled = !1),
      (this._renderOrder = 0),
      (this.worldPos = new Vector3()),
      (this.worldQuat = new Quaternion()));
    const _this = this;
    (this.quaternion.onChange((_) => {
      ((_this.matrixDirty = !0),
        (_this.decomposeDirty = !0),
        _this.onMatrixDirty && _this.onMatrixDirty(),
        _this.rotation.setFromQuaternion(_this.quaternion, void 0, !1));
    }),
      this.rotation.onChange((_) => {
        ((_this.matrixDirty = !0),
          (_this.decomposeDirty = !0),
          _this.onMatrixDirty && _this.onMatrixDirty(),
          _this.quaternion.setFromEuler(_this.rotation, !1));
      }),
      this.scale.onChange((_) => {
        ((_this.matrixDirty = !0),
          (_this.decomposeDirty = !0),
          _this.onMatrixDirty && _this.onMatrixDirty());
      }),
      this.position.onChange((_) => {
        ((_this.matrixDirty = !0),
          (_this.decomposeDirty = !0),
          _this.onMatrixDirty && _this.onMatrixDirty());
      }));
  }
  get renderOrder() {
    return this._renderOrder;
  }
  set renderOrder(value) {
    this._renderOrder = value;
    let p = this._parent;
    for (; p;) (p instanceof Scene && (p.displayNeedsUpdate = !0), (p = p._parent));
    for (let i = 0; i < this.children.length; i++) this.children[i].renderOrder += value;
  }
  applyMatrix(matrix) {
    return (
      this.matrix.multiplyMatrices(matrix, this.matrix),
      this.matrix.decompose(this.position, this.quaternion, this.scale),
      this
    );
  }
  applyQuaternion(q) {
    return (this.quaternion.premultiply(q), this);
  }
  setRotationFromAxisAngle(axis, angle) {
    this.quaternion.setFromAxisAngle(axis, angle);
  }
  setRotationFromMatrix(m) {
    this.quaternion.setFromRotationMatrix(m);
  }
  setRotationFromQuaternion(q) {
    this.quaternion.copy(q);
  }
  localToWorld(v) {
    return v.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(v) {
    let m1 = this.M1 || new Matrix4();
    return ((this.M1 = m1), v.applyMatrix4(m1.getInverse(this.matrixWorld)));
  }
  lookAt(x, y, z) {
    let m1 = this.M1 || new Matrix4();
    this.M1 = m1;
    let v = this.V1 || new Vector3();
    ((this.V1 = v),
      x.isVector3 ? v.copy(x) : v.set(x, y, z),
      this.isCamera ? m1.lookAt(this.position, v, this.up) : m1.lookAt(v, this.position, this.up),
      this.quaternion.setFromRotationMatrix(m1));
  }
  add(object) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) this.add(arguments[i]);
      return this;
    }
    if (object === this) return this;
    if (object && object.isScene) throw "You can't add a scene to a group";
    if (
      (object && object.isObject3D
        ? (null !== object._parent && object._parent.remove(object),
          (object._parent = this),
          this.children.push(object),
          (this.childrenLength = this.children.length))
        : console.error("Object is not instance of Object3D", object),
      this.isScene)
    )
      this.displayNeedsUpdate = !0;
    else {
      let p = this._parent;
      for (; p;) (p instanceof Scene && (p.displayNeedsUpdate = !0), (p = p._parent));
    }
    return this;
  }
  attach(object) {
    this.updateMatrixWorld(!0);
    let m1 = this.M1 || new Matrix4();
    this.M1 = m1;
    const worldInverse = this.M1.getInverse(this.matrixWorld);
    (null !== object._parent &&
      (object._parent.updateMatrixWorld(!0), worldInverse.multiply(object._parent.matrixWorld)),
      object.applyMatrix(worldInverse),
      this.add(object),
      object.updateMatrixWorld(!0));
  }
  remove(object) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) this.remove(arguments[i]);
      return this;
    }
    if (this.isScene) this.displayNeedsUpdate = !0;
    else {
      let p = this._parent;
      for (; p;) (p instanceof Scene && (p.displayNeedsUpdate = !0), (p = p._parent));
    }
    (this.children.remove(object), (this.childrenLength = this.children.length));
  }
  getWorldPosition(target, sleep) {
    let v = this.V1 || new Vector3();
    ((this.V1 = v), target || (target = v), sleep || this.updateMatrixWorld());
    let el = this.matrixWorld.elements;
    return ((target.x = el[12]), (target.y = el[13]), (target.z = el[14]), target);
  }
  getWorldScale(target) {
    let v = this.V1S || new Vector3();
    this.V1S = v;
    let v2 = this.V12 || new Vector3();
    this.V2 = v2;
    let q = this.Q1 || new Quaternion();
    return (
      (this.Q1 = q),
      target || (target = v2),
      this.updateMatrixWorld(),
      this.matrixWorld.decompose(v, q, target),
      target
    );
  }
  getWorldQuaternion(target) {
    let v = this.V1Q || new Vector3();
    this.V1Q = v;
    let q = this.Q1 || new Quaternion();
    return (
      (this.Q1 = q),
      target || (target = q),
      this.updateMatrixWorld(),
      this.matrixWorld.decompose(v, target, v),
      target
    );
  }
  traverse(callback) {
    callback(this);
    let children = this.children;
    for (let i = 0; i < children.length; i++) children[i].traverse(callback);
  }
  updateMatrix() {
    if (!1 !== this.matrixAutoUpdate) {
      if ((this.matrix.compose(this.position, this.quaternion, this.scale), this.pivot)) {
        var px = this.pivot.x,
          py = this.pivot.y,
          pz = this.pivot.z,
          te = this.matrix.elements;
        ((te[12] += px - te[0] * px - te[4] * py - te[8] * pz),
          (te[13] += py - te[1] * px - te[5] * py - te[9] * pz),
          (te[14] += pz - te[2] * px - te[6] * py - te[10] * pz));
      }
      this.matrixWorldNeedsUpdate = !0;
    }
  }
  updateMatrixWorld(force) {
    if (!1 === this.matrixAutoUpdate) return;
    if (!force && !this.determineVisible()) return;
    ((this.determineDirty() || force) && !0 === this.matrixAutoUpdate && this.updateMatrix(),
      (!0 !== this.matrixWorldNeedsUpdate && !0 !== force) ||
        (null === this._parent || this.determineNoTransform()
          ? this.matrixWorld.copy(this.matrix)
          : (this.matrixWorld.multiplyMatrices(this._parent.matrixWorld, this.matrix),
            RenderStats.active && RenderStats.update("updateMatrixWorld")),
        (this.decomposeDirty = !0),
        (this.matrixWorldNeedsUpdate = !1)));
    const children = this.children;
    for (let i = this.childrenLength - 1; i > -1; i--) children[i].updateMatrixWorld(force);
    this.matrixDirty = !1;
  }
  clone(recursive) {
    return new this.constructor().copy(this, recursive);
  }
  copy(source, recursive) {
    if (
      ((this.name = source.name),
      this.up.copy(source.up),
      this.position.copy(source.position),
      this.quaternion.copy(source.quaternion),
      this.scale.copy(source.scale),
      this.matrix.copy(source.matrix),
      this.matrixWorld.copy(source.matrixWorld),
      (this.matrixAutoUpdate = source.matrixAutoUpdate),
      (this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate),
      (this.visible = source.visible),
      (this.castShadow = source.castShadow),
      (this.receiveShadow = source.receiveShadow),
      (this.frustumCulled = source.frustumCulled),
      (this.renderOrder = source.renderOrder),
      !0 === recursive)
    )
      for (let i = 0; i < source.children.length; i++) {
        let child = source.children[i];
        this.add(child.clone());
      }
    return this;
  }
  render() {}
  determineVisible() {
    if (!this.visible || this.hidden) return !1;
    let p = this._parent;
    for (; p;) {
      if (!p.visible || p.hidden) return !1;
      p = p._parent;
    }
    return !0;
  }
  determineDirty() {
    let p = this._parent;
    for (; p;) {
      if (p.matrixDirty) return !0;
      p = p._parent;
    }
    return this.matrixDirty;
  }
  determineNoTransform() {
    return this._parent
      ? this._parent.determineNoTransform() && this.matrix.isIdentity()
      : this.matrix.isIdentity();
  }
  translateX(distance) {
    (this.xAxis || (this.xAxis = new Vector3(1, 0, 0)), this.translateOnAxis(this.xAxis, distance));
  }
  translateY(distance) {
    (this.yAxis || (this.yAxis = new Vector3(0, 1, 0)), this.translateOnAxis(this.yAxis, distance));
  }
  translateZ(distance) {
    (this.zAxis || (this.zAxis = new Vector3(0, 0, 1)), this.translateOnAxis(this.zAxis, distance));
  }
  translateOnAxis(axis, distance) {
    let v = this.V1 || new Vector3();
    return (
      (this.V1 = v),
      v.copy(axis).applyQuaternion(this.quaternion),
      this.position.add(v.multiplyScalar(distance)),
      this
    );
  }
  upload() {
    (this.shader &&
      (this.shader.upload(this, this.geometry),
      this.shader.shadow && this.shader.shadow.upload(this, this.geometry)),
      this.geometry && this.geometry.upload(this, this.shader));
  }
  destroy() {
    let i = 0;
    for (; i < this.children.length;) {
      let child = this.children[i];
      child.deleted ? (i += 1) : (child.destroy(), (child.deleted = !0));
    }
    (this.geometry && this.geometry.destroy && this.geometry.destroy(this),
      this.shader && this.shader.destroy && this.shader.destroy(this),
      this.hitDestroy && this.hitDestroy(),
      this.physics?.destroy && this.physics.destroy(),
      this._gl && this._gl.ubo && this._gl.ubo.destroy(),
      this._gl && this._gl.vao && this._gl.vao.destroy(),
      this._gl && (this._gl = null),
      this._parent && this._parent.remove(this),
      this.parent && this.parent.__destroyChild && this.parent.__destroyChild(this.__id),
      (this.deleted = !0));
  }
}
