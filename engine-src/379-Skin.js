class Skin extends Mesh {
  constructor(geometry, shader, bones = geometry.bones) {
    (super(geometry, shader),
      (this.isSkin = !0),
      (this.autoUpdateBoneTexture = !0),
      this.createBones(bones),
      this.createBoneTexture(),
      (this.animations = []),
      (this.pingPong = -1),
      Object.assign(this.shader.uniforms, {
        boneTexture: { value: this.boneTexture, ignoreUIL: !0 },
        boneTextureSize: { value: this.boneTextureSize, ignoreUIL: !0 },
      }));
  }
  createBones(bonesData) {
    ((this.root = new Base3D()),
      (this.bones = []),
      bonesData.forEach((data) => {
        const bone = new Base3D();
        ((bone.name = data.name),
          bone.position.set(...data.pos),
          bone.quaternion.set(...data.rot),
          bone.quaternion.normalize(),
          bone.scale.set(...data.scl),
          this.bones.push(bone));
      }),
      bonesData.forEach((data, i) => {
        if (-1 === data.parent) return this.root.add(this.bones[i]);
        this.bones[data.parent].add(this.bones[i]);
      }),
      this.root.updateMatrixWorld(!0),
      this.bones.forEach((bone) => {
        ((bone.bindInverse = new Matrix4().copy(bone.matrixWorld)),
          (bone.bindInverse = bone.bindInverse.getInverse(bone.bindInverse)));
      }));
  }
  createBoneTexture() {
    const size = Math.max(
      4,
      Math.pow(2, Math.ceil(Math.log(Math.sqrt(4 * this.bones.length)) / Math.LN2)),
    );
    ((this.boneMatrices = new Float32Array(size * size * 4)),
      (this.boneTextureSize = size),
      (this.boneTextureA = new DataTexture(this.boneMatrices, size, size)),
      (this.boneTextureA.destroyDataAfterUpload = !1),
      this.boneTextureA.upload(),
      Skin.tripleBuffered && (this.isTripleBuffered = !0),
      (this.boneTexture = this.boneTextureA));
  }
  addAnimation(data) {
    const animation = new SkinAnimation(this, data);
    return (this.animations.push(animation), animation);
  }
  async loadAnimation(path) {
    (path.includes("http") ||
      path.includes("assets/geometry/") ||
      (path = "assets/geometry/" + path),
      path.includes(".") || (path += ".json"),
      (path = Thread.absolutePath(Assets.getPath(path))));
    const data = await GeomThread.loadSkinAnimation(path);
    return this.addAnimation(data);
  }
  update() {
    let total = 0;
    (this.animations.forEach((animation) => (total += animation.weight)),
      this.animations.forEach((animation, i) => {
        animation.update(total || 1, 0 === i);
      }),
      this.autoUpdateBoneTexture || this.updateBoneTexture());
  }
  updateBoneTexture() {
    if (
      (this.bones.forEach((bone, i) => {
        (Skin.tempMat4.multiplyMatrices(bone.matrixWorld, bone.bindInverse),
          this.boneMatrices.set(Skin.tempMat4.elements, 16 * i));
      }),
      this.isTripleBuffered)
    )
      switch ((this.pingPong++, this.pingPong > 2 && (this.pingPong = 0), this.pingPong)) {
        case 0:
          ((this.boneTexture = this.boneTextureA),
            Texture.renderer.manualUpdateDynamic(this.boneTextureB));
          break;
        case 1:
          ((this.boneTexture = this.boneTextureB),
            Texture.renderer.manualUpdateDynamic(this.boneTextureC));
          break;
        case 2:
          ((this.boneTexture = this.boneTextureC),
            Texture.renderer.manualUpdateDynamic(this.boneTextureA));
      }
    else
      ((this.boneTexture = this.boneTextureA),
        Texture.renderer.manualUpdateDynamic(this.boneTexture));
    this.shader.uniforms.boneTexture.value = this.boneTexture;
  }
  updateMatrixWorld(force) {
    (super.updateMatrixWorld(force),
      this.root.updateMatrixWorld(!0),
      this.autoUpdateBoneTexture && this.updateBoneTexture());
  }
  get isTripleBuffered() {
    return !!this.boneTextureB;
  }
  set isTripleBuffered(isTripleBuffered) {
    if (!!isTripleBuffered !== this.isTripleBuffered) {
      if (isTripleBuffered) {
        let size = this.boneTextureSize;
        ((this.boneTextureB = new DataTexture(this.boneMatrices, size, size)),
          (this.boneTextureB.destroyDataAfterUpload = !1),
          this.boneTextureB.upload(),
          (this.boneTextureC = new DataTexture(this.boneMatrices, size, size)),
          (this.boneTextureC.destroyDataAfterUpload = !1),
          this.boneTextureC.upload());
      } else
        (this.boneTextureB.destroy(),
          (this.boneTextureB = null),
          this.boneTextureC.destroy(),
          (this.boneTextureC = null),
          this.boneTexture &&
            (this.boneTexture !== this.boneTextureC &&
              Texture.renderer.manualUpdateDynamic(this.boneTextureA),
            (this.boneTexture = this.boneTextureA),
            (this.shader.uniforms.boneTexture.value = this.boneTexture)));
      this.pingPong = -1;
    }
  }
}
