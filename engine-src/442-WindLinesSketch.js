Class(function WindLinesSketch(_path) {
  Inherit(this, Object3D);
  const _this = this,
    _currPos = new Vector3(),
    _nextPos = new Vector3(),
    _prevPos = new Vector3(),
    _tangent = new Vector3();
  ((_this.positionBuffer = []),
    (_this.uvBuffer = []),
    (_this.currPosBuffer = []),
    (_this.nextPosBuffer = []),
    (_this.prevPosBuffer = []),
    (_this.indexBuffer = []),
    (_this.randomBuffer = []),
    (async function () {
      const {
        positionBuffer: positionBuffer,
        uvBuffer: uvBuffer,
        currPosBuffer: currPosBuffer,
        prevPosBuffer: prevPosBuffer,
        nextPosBuffer: nextPosBuffer,
        indexBuffer: indexBuffer,
        randomBuffer: randomBuffer,
      } = _this;
      let counter = 0,
        curves = [];
      if ("object" == typeof _path) curves = _path.curves;
      else {
        const data = await fetch(Assets.getPath(_path));
        curves = (await data.json()).data.curves;
      }
      curves.forEach((curve, idx) => {
        const { position: position } = curve,
          pointCount = position.length / 3,
          rand = Math.random();
        for (let j = 0; j < 2 * pointCount; j++) randomBuffer.push(rand);
        for (let i = 0; i < pointCount; i++) {
          const progress = i / (pointCount - 1);
          (positionBuffer.push(0, 0, 0),
            positionBuffer.push(0, 0, 0),
            uvBuffer.push(1, progress),
            uvBuffer.push(0, progress),
            currPosBuffer.push(position[3 * i + 0], position[3 * i + 1], position[3 * i + 2]),
            currPosBuffer.push(position[3 * i + 0], position[3 * i + 1], position[3 * i + 2]),
            i === pointCount - 1
              ? (_currPos.set(position[3 * i + 0], position[3 * i + 1], position[3 * i + 2]),
                _prevPos.set(
                  position[3 * (i - 1) + 0],
                  position[3 * (i - 1) + 1],
                  position[3 * (i - 1) + 2],
                ),
                _tangent.subVectors(_currPos, _prevPos),
                _nextPos.copy(_currPos).add(_tangent))
              : _nextPos.set(
                  position[3 * (i + 1) + 0],
                  position[3 * (i + 1) + 1],
                  position[3 * (i + 1) + 2],
                ),
            nextPosBuffer.push(_nextPos.x, _nextPos.y, _nextPos.z),
            nextPosBuffer.push(_nextPos.x, _nextPos.y, _nextPos.z),
            0 === i
              ? (_currPos.set(position[3 * i + 0], position[3 * i + 1], position[3 * i + 2]),
                _nextPos.set(
                  position[3 * (i + 1) + 0],
                  position[3 * (i + 1) + 1],
                  position[3 * (i + 1) + 2],
                ),
                _tangent.subVectors(_currPos, _nextPos),
                _prevPos.copy(_currPos).add(_tangent))
              : _prevPos.set(
                  position[3 * (i - 1) + 0],
                  position[3 * (i - 1) + 1],
                  position[3 * (i - 1) + 2],
                ),
            prevPosBuffer.push(_prevPos.x, _prevPos.y, _prevPos.z),
            prevPosBuffer.push(_prevPos.x, _prevPos.y, _prevPos.z));
        }
        const triangleCount = 2 * pointCount - 2;
        for (let i = 0; i < triangleCount; i++)
          i % 2 == 0
            ? (indexBuffer.push(counter + i + 0),
              indexBuffer.push(counter + i + 1),
              indexBuffer.push(counter + i + 2))
            : (indexBuffer.push(counter + i + 0),
              indexBuffer.push(counter + i + 2),
              indexBuffer.push(counter + i + 1));
        counter += 2 * pointCount;
      });
      const geometry = new Geometry();
      (geometry.addAttribute(
        "position",
        new GeometryAttribute(new Float32Array(positionBuffer), 3),
      ),
        geometry.addAttribute("random", new GeometryAttribute(new Float32Array(randomBuffer), 1)),
        geometry.addAttribute("currpos", new GeometryAttribute(new Float32Array(currPosBuffer), 3)),
        geometry.addAttribute("nextpos", new GeometryAttribute(new Float32Array(nextPosBuffer), 3)),
        geometry.addAttribute("prevpos", new GeometryAttribute(new Float32Array(prevPosBuffer), 3)),
        geometry.addAttribute("uv", new GeometryAttribute(new Float32Array(uvBuffer), 2)),
        geometry.setIndex(new GeometryAttribute(new Uint16Array(indexBuffer), 1)));
      const shader = _this.initClass(Shader, "WindLinesSketchShader", {
        tMap: { value: Utils3D.getRepeatTexture("assets/images/story/clouds_noise.png") },
        uScroll: { value: 0 },
        uThreshold: { value: 0.4 },
        uSpeed: { value: 0 },
        uAnimatePosition: { value: 0 },
        uTile: { value: 1 },
        uTime: { value: 0 },
        uFrameRate: { value: 60 },
        uDiscardBottom: { value: 0, ignoreUIL: !0 },
        uDiscardTop: { value: 1, ignoreUIL: !0 },
      });
      ((shader.transparent = !0),
        (_this.mesh = new Mesh(geometry, shader)),
        _this.flag("isReady", !0));
    })());
});
