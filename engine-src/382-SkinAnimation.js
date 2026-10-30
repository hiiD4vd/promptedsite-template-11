class SkinAnimation {
  constructor(skin, data) {
    ((this.skin = skin),
      (this.data = data),
      (this.elapsed = 0),
      (this.weight = 1),
      (this.duration = data.duration),
      data.orientationNormalized ||
        this.data.skeleton.forEach((d) => {
          for (let j = 0; j < d.keys.length; j++)
            (SkinAnimation.tempRot.set(...d.keys[j].rot),
              SkinAnimation.tempRot.normalize(),
              (d.keys[j].rot = SkinAnimation.tempRot.toArray()));
        }));
  }
  update(totalWeight, isSet) {
    const animationWeight = isSet ? 1 : this.weight / totalWeight,
      numberKeys = this.duration + 1,
      elapsed = this.elapsed % numberKeys;
    let prevKey, nextKey;
    this.data.skeleton.forEach((d, i) => {
      if (
        this.skin.bones[i].name.startsWith("sleeve_wiggle") ||
        this.skin.bones[i].name.startsWith("hand_bone_parent")
      )
        return;
      const prev = Math.floor(elapsed),
        next = Math.floor(elapsed + 1) % numberKeys,
        weight = elapsed - prev;
      ((prevKey = d.keys[prev]),
        (nextKey = d.keys[next]),
        SkinAnimation.tempPos.set(...prevKey.pos),
        SkinAnimation.tempRot.set(...prevKey.rot),
        SkinAnimation.tempScl.set(...prevKey.scl),
        SkinAnimation.tempPos2.set(...nextKey.pos),
        SkinAnimation.tempRot2.set(...nextKey.rot),
        SkinAnimation.tempScl2.set(...nextKey.scl),
        SkinAnimation.tempPos.lerp(SkinAnimation.tempPos2, weight, !1),
        SkinAnimation.tempRot.slerp(SkinAnimation.tempRot2, weight, !1),
        SkinAnimation.tempScl.lerp(SkinAnimation.tempScl2, weight, !1),
        this.skin.bones[i].position.lerp(SkinAnimation.tempPos, animationWeight, !1),
        this.skin.bones[i].quaternion.slerp(SkinAnimation.tempRot, animationWeight, !1),
        this.skin.bones[i].scale.lerp(SkinAnimation.tempScl, animationWeight, !1),
        this.extraSkins &&
          this.extraSkins.forEach((skin) => {
            (skin.bones[i].position.lerp(SkinAnimation.tempPos, animationWeight, !1),
              skin.bones[i].quaternion.slerp(SkinAnimation.tempRot, animationWeight, !1),
              skin.bones[i].scale.lerp(SkinAnimation.tempScl, animationWeight, !1));
          }));
    });
  }
  addSkin(skin) {
    (this.extraSkins || (this.extraSkins = []), this.extraSkins.push(skin));
  }
}
