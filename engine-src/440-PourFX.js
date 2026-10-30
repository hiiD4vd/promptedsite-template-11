Class(function PourFX(_bottleBaseBone, _bottleTipBone) {
  Inherit(this, Object3D);
  const _this = this,
    _force = new Vector3(),
    _gravity = new Vector3(0, -15, 0),
    _currPos = (new Vector3(), new Vector3()),
    _nextPos = new Vector3(),
    _prevPos = new Vector3(),
    _tangent = new Vector3();
  ((this.spawnPos = new Vector3().copy(_bottleBaseBone.getWorldPosition())),
    (this.prevSpawnPos = new Vector3()),
    (this.spawnVel = new Vector3()),
    (this.spawnScale = _bottleBaseBone.scale.y),
    (this.pointCount = 64),
    (this.points = []),
    (this.pourStrength = 0));
  const _bottleDir = new Vector3(),
    _sideVector = new Vector3(1, 0, 0);
  ((this.curves = []),
    (this.meshline = null),
    (this.positionBuffer = []),
    (this.uvBuffer = []),
    (this.currPosBuffer = []),
    (this.nextPosBuffer = []),
    (this.prevPosBuffer = []),
    (this.indexBuffer = []),
    (function createPoints() {
      for (let i = 0; i < _this.pointCount; i++) {
        const origin = [0, 0.1 - 0.005 * i, 0],
          point = {
            position: new Vector3().fromArray(origin),
            velocity: new Vector3(),
            life: i / _this.pointCount,
            index: i,
          };
        _this.points.push(point);
      }
    })(),
    (function createBasePlane() {
      const geometry = new PlaneGeometry(),
        shader = _this.initClass(Shader, "PourBasePlaneShader", {
          tNoise: {
            value: Utils3D.getRepeatTexture("assets/images/story/drinkpour/T_Noise15.png"),
          },
          uImpactPos: { value: new Vector3() },
          uSpawnPos: { value: _this.spawnPos },
          uPourStrength: { value: 1 },
          uWaterLine: { value: 1 },
          uColor: { value: new Color("#6ec0f0") },
        });
      ((shader.transparent = !0),
        (_this.basePlane = new Mesh(geometry, shader)),
        (_this.basePlane.frustumCulled = !1),
        (_this.basePlane.position.z = _this.spawnPos.z - 0.55),
        _this.basePlane.scale.setScalar(0.125 * _this.spawnScale),
        _this.add(_this.basePlane));
    })(),
    (function createMeshLine() {
      const {
        positionBuffer: positionBuffer,
        uvBuffer: uvBuffer,
        currPosBuffer: currPosBuffer,
        prevPosBuffer: prevPosBuffer,
        nextPosBuffer: nextPosBuffer,
        indexBuffer: indexBuffer,
      } = _this;
      for (let i = 0; i < _this.points.length; i++) {
        const index = i,
          position = _this.points[index].position,
          progress = i / (_this.points.length - 1);
        (positionBuffer.push(0, 0, 0),
          positionBuffer.push(0, 0, 0),
          uvBuffer.push(1, progress),
          uvBuffer.push(0, progress),
          currPosBuffer.push(position.x, position.y, position.z),
          currPosBuffer.push(position.x, position.y, position.z),
          i === _this.points.length - 1
            ? (_currPos.copy(position),
              _prevPos.copy(_this.points[index - 1].position),
              _tangent.subVectors(_currPos, _prevPos),
              _nextPos.copy(_currPos).add(_tangent))
            : _nextPos.copy(_this.points[index + 1].position),
          nextPosBuffer.push(_nextPos.x, _nextPos.y, _nextPos.z),
          nextPosBuffer.push(_nextPos.x, _nextPos.y, _nextPos.z),
          0 === i
            ? (_currPos.copy(position),
              _nextPos.copy(_this.points[index + 1].position),
              _tangent.subVectors(_currPos, _nextPos),
              _prevPos.copy(_currPos).add(_tangent))
            : _prevPos.copy(_this.points[index - 1].position),
          prevPosBuffer.push(_prevPos.x, _prevPos.y, _prevPos.z),
          prevPosBuffer.push(_prevPos.x, _prevPos.y, _prevPos.z));
      }
      const triangleCount = 2 * _this.points.length - 2;
      for (let i = 0; i < triangleCount; i++)
        i % 2 == 0
          ? (indexBuffer.push(i + 0), indexBuffer.push(i + 1), indexBuffer.push(i + 2))
          : (indexBuffer.push(i + 0), indexBuffer.push(i + 2), indexBuffer.push(i + 1));
      const geometry = new Geometry();
      (geometry.addAttribute(
        "position",
        new GeometryAttribute(new Float32Array(positionBuffer), 3),
      ),
        geometry.addAttribute("currpos", new GeometryAttribute(new Float32Array(currPosBuffer), 3)),
        geometry.addAttribute("nextpos", new GeometryAttribute(new Float32Array(nextPosBuffer), 3)),
        geometry.addAttribute("prevpos", new GeometryAttribute(new Float32Array(prevPosBuffer), 3)),
        geometry.addAttribute("uv", new GeometryAttribute(new Float32Array(uvBuffer), 2)),
        geometry.setIndex(new GeometryAttribute(new Uint16Array(indexBuffer), 1)));
      const shader = _this.initClass(Shader, "PourLineShader", {
        tNoise: { value: Utils3D.getRepeatTexture("assets/images/story/drinkpour/T_Noise15.png") },
        uPourStrength: { value: 1 },
        uClipHeight: { value: 2.8 },
        uClipAngle: { value: Math.radians(20) },
        uThickness: { value: 1 },
        uColor: { value: new Color("#6ec0f0") },
        uBasePlanePos: { value: new Vector3() },
      });
      ((shader.transparent = !0),
        (_this.meshLine = new Mesh(geometry, shader)),
        _this.meshLine.upload(),
        (_this.meshLine.frustumCulled = !1),
        _this.add(_this.meshLine));
    })(),
    (_this.meshLine.shader.uniforms.uBasePlanePos.value = _this.basePlane.getWorldPosition()),
    (_this.update = function () {
      if (!_this.meshLine || !_this.basePlane) return;
      _bottleDir
        .subVectors(_bottleTipBone.getWorldPosition(), _bottleBaseBone.getWorldPosition())
        .normalize();
      const cosTheta = _bottleDir.dot(_sideVector);
      _this.pourStrength = Math.pow(
        Math.max(0, Math.min(1, Math.range(cosTheta, 0.9, 0.995, 0, 1))),
        2,
      );
      const finalPoint = _this.points[_this.points.length - 1];
      (_this.basePlane.shader.uniforms.uImpactPos.value.copy(finalPoint.position),
        (_this.basePlane.shader.uniforms.uPourStrength.value = _this.pourStrength),
        (function updatePoints(pourStrength) {
          const dt = 0.001 * Render.DELTA,
            strength =
              1.5 * pourStrength + (0.5 * Math.sin(0.0075 * Render.TIME) + 0.5) * pourStrength;
          _this.points.forEach((point) => {
            (point.life > 1 &&
              (point.position.copy(_this.spawnPos),
              point.velocity.set(strength, 0, 0),
              (point.life = 0)),
              _force.set(0, 0, 0),
              _force.add(_gravity),
              point.velocity.addScaledVector(_force, dt),
              (point.velocity.x *= 0.95 - 0.25 * (1 - pourStrength)),
              point.position.addScaledVector(point.velocity, dt),
              (point.life += 1 / (_this.points.length - 1)));
          });
        })(_this.pourStrength),
        (function updateMeshLine(pourStrength) {
          const {
            currpos: currpos,
            prevpos: prevpos,
            nextpos: nextpos,
          } = _this.meshLine.geometry.attributes;
          _this.meshLine.shader.uniforms.uPourStrength.value = pourStrength;
          const rootScale = _this.parent?.root?.scale.length() || 1;
          ((_this.meshLine.shader.uniforms.uClipHeight.value = Math.range(
            rootScale,
            0.69,
            1.73,
            1.2,
            2.8,
          )),
            (_this.meshLine.shader.uniforms.uThickness.value = Math.range(
              rootScale,
              0.69,
              1.73,
              0.4,
              1,
            )),
            _this.points.sort((a, b) => a.life - b.life));
          for (let i = 0; i < _this.points.length; i++) {
            const index = i,
              position = _this.points[index].position;
            ((currpos.array[6 * index + 0] = position.x),
              (currpos.array[6 * index + 1] = position.y),
              (currpos.array[6 * index + 2] = position.z),
              (currpos.array[6 * index + 3] = position.x),
              (currpos.array[6 * index + 4] = position.y),
              (currpos.array[6 * index + 5] = position.z),
              i === _this.points.length - 1
                ? (_currPos.copy(position),
                  _prevPos.copy(_this.points[index - 1].position),
                  _tangent.subVectors(_currPos, _prevPos),
                  _nextPos.copy(_currPos).add(_tangent))
                : _nextPos.copy(_this.points[index + 1].position),
              (nextpos.array[6 * index + 0] = _nextPos.x),
              (nextpos.array[6 * index + 1] = _nextPos.y),
              (nextpos.array[6 * index + 2] = _nextPos.z),
              (nextpos.array[6 * index + 3] = _nextPos.x),
              (nextpos.array[6 * index + 4] = _nextPos.y),
              (nextpos.array[6 * index + 5] = _nextPos.z),
              0 === i
                ? (_currPos.copy(position),
                  _nextPos.copy(_this.points[index + 1].position),
                  _tangent.subVectors(_currPos, _nextPos),
                  _prevPos.copy(_currPos).add(_tangent))
                : _prevPos.copy(_this.points[index - 1].position),
              (prevpos.array[6 * index + 0] = _prevPos.x),
              (prevpos.array[6 * index + 1] = _prevPos.y),
              (prevpos.array[6 * index + 2] = _prevPos.z),
              (prevpos.array[6 * index + 3] = _prevPos.x),
              (prevpos.array[6 * index + 4] = _prevPos.y),
              (prevpos.array[6 * index + 5] = _prevPos.z));
          }
          ((currpos.needsUpdate = !0), (prevpos.needsUpdate = !0), (nextpos.needsUpdate = !0));
        })(_this.pourStrength));
    }),
    (_this.setSpawnPosition = function (position) {
      (_this.prevSpawnPos.copy(_this.spawnPos),
        _this.spawnPos.copy(position),
        _this.spawnVel.subVectors(_this.spawnPos, _this.prevSpawnPos));
    }),
    (_this.updateColor = function (color) {
      (_this.meshLine.shader.uniforms.uColor.value.set(color),
        _this.basePlane.shader.uniforms.uColor.value.set(color));
    }));
});
