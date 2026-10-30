Class(function LineGeometry({
  index: index = 0,
  points: points = [],
  taperFunction: taperFunction = () => 1,
  defaultCount: defaultCount = 512,
  dynamic: dynamic = !1,
}) {
  Inherit(this, Component);
  const _this = this;
  ((_this.index = index), (_this.points = points), (_this.taperFunction = taperFunction));
  const _geometry = (_this.geometry = new Geometry()),
    _attr = _geometry.attributes;
  let _prev = new Vector3(),
    _curr = new Vector3(),
    _length = 0,
    _count = 0,
    _defaultPoints = [];
  function initBuffers(count) {
    (_geometry.addAttribute(
      "position",
      new GeometryAttribute(new Float32Array(3 * count * 2), 3, !1, dynamic),
    ),
      _geometry.addAttribute(
        "previous",
        new GeometryAttribute(new Float32Array(3 * count * 2), 3, !1, dynamic),
      ),
      _geometry.addAttribute(
        "next",
        new GeometryAttribute(new Float32Array(3 * count * 2), 3, !1, dynamic),
      ),
      _geometry.addAttribute(
        "side",
        new GeometryAttribute(new Float32Array(1 * count * 2), 1, !1, dynamic),
      ),
      _geometry.addAttribute(
        "lineIndex",
        new GeometryAttribute(new Float32Array(1 * count * 2), 1, !1, dynamic),
      ),
      _geometry.addAttribute(
        "width",
        new GeometryAttribute(new Float32Array(1 * count * 2), 1, !1, dynamic),
      ),
      _geometry.addAttribute(
        "uv",
        new GeometryAttribute(new Float32Array(2 * count * 2), 2, !1, dynamic),
      ),
      _geometry.addAttribute(
        "uv2",
        new GeometryAttribute(new Float32Array(2 * count * 2), 2, !1, dynamic),
      ),
      _geometry.setIndex(
        new GeometryAttribute(new Uint16Array(3 * (count - 1) * 2), 1, !1, dynamic),
      ),
      (_geometry.drawRange.end = 0),
      (_length = 0),
      (_count = 0),
      (function setStaticBuffers(count) {
        for (let i = 0; i < count; i++) {
          if (
            (_attr.side.setXY(2 * i, 1, -1),
            _attr.lineIndex.setXY(2 * i, _this.index, _this.index),
            i === count - 1)
          )
            continue;
          let ind = 2 * i;
          ((_geometry.index[3 * (ind + 0) + 0] = ind + 0),
            (_geometry.index[3 * (ind + 0) + 1] = ind + 1),
            (_geometry.index[3 * (ind + 0) + 2] = ind + 2),
            (_geometry.index[3 * (ind + 1) + 0] = ind + 2),
            (_geometry.index[3 * (ind + 1) + 1] = ind + 1),
            (_geometry.index[3 * (ind + 1) + 2] = ind + 3));
        }
      })(count));
  }
  function getPos(index) {
    let i = 3 * index;
    return [points[i], points[i + 1], points[i + 2]];
  }
  function update(p = points, force = !1) {
    if (_this.points == p && !force) return;
    _this.points = points = p;
    let newLength = points.length / 3;
    2 * newLength > _attr.position.count &&
      (function increaseBuffers() {
        initBuffers(_attr.position.count / 2 + defaultCount);
      })();
    let oldLength = _count;
    if (oldLength && !force) {
      let nxt = getPos(oldLength);
      (_attr.next.setXYZ(2 * (oldLength - 1) + 0, nxt[0], nxt[1], nxt[2]),
        _attr.next.setXYZ(2 * (oldLength - 1) + 1, nxt[0], nxt[1], nxt[2]));
    } else _length = 0;
    for (let i = force ? 0 : oldLength; i < newLength; i++) {
      (_attr.position.setXYZ(2 * i + 0, points[3 * i + 0], points[3 * i + 1], points[3 * i + 2]),
        _attr.position.setXYZ(2 * i + 1, points[3 * i + 0], points[3 * i + 1], points[3 * i + 2]));
      let prv = getPos(Math.max(0, i - 1));
      (_attr.previous.setXYZ(2 * i + 0, prv[0], prv[1], prv[2]),
        _attr.previous.setXYZ(2 * i + 1, prv[0], prv[1], prv[2]));
      let nxt = getPos(Math.min(newLength - 1, i + 1));
      (_attr.next.setXYZ(2 * i + 0, nxt[0], nxt[1], nxt[2]),
        _attr.next.setXYZ(2 * i + 1, nxt[0], nxt[1], nxt[2]),
        _prev.fromArray(prv),
        _curr.fromArray(getPos(i)),
        (_length += _prev.distanceTo(_curr)),
        _attr.uv2.setX(2 * i + 0, _length),
        _attr.uv2.setX(2 * i + 1, _length));
    }
    for (let i = 0; i < newLength; i++) {
      (_attr.uv.setXY(2 * i + 0, i / newLength, 0),
        _attr.uv.setXY(2 * i + 1, i / newLength, 1),
        _attr.uv2.setY(2 * i + 0, _length),
        _attr.uv2.setY(2 * i + 1, _length));
      let w = _this.taperFunction(i / (newLength - 1), i, newLength);
      _attr.width.setXY(2 * i, w, w);
    }
    ((_attr.position.needsUpdate = !0),
      (_attr.previous.needsUpdate = !0),
      (_attr.next.needsUpdate = !0),
      (_attr.width.needsUpdate = !0),
      (_attr.uv.needsUpdate = !0),
      (_attr.uv2.needsUpdate = !0),
      (_geometry.drawRange.end = 6 * (newLength - 1)),
      (_count = newLength),
      (_this.points = points));
  }
  (!(function () {
    initBuffers(points.length ? points.length / 3 : defaultCount);
    for (let i = 0; i < defaultCount; i++) _defaultPoints.push(0, 0, 0);
    points.length && update(points, !0);
  })(),
    (this.update = update),
    (this.clear = function clear() {
      (update(_defaultPoints, !0), (_length = 0), (_count = 0));
    }));
});
