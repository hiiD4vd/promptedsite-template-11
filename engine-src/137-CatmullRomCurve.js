class CatmullRomCurve extends Curve3D {
  constructor(points = []) {
    if (
      (super(),
      (this.tmp = new Vector3()),
      (this.px = new CubicPoly()),
      (this.py = new CubicPoly()),
      (this.pz = new CubicPoly()),
      points.length < 2)
    )
      throw "CatmullRomCurve: Points array needs at least two entries.";
    ((this.points = points), (this.closed = !1));
  }
  getLength() {
    const tmp = this.tmp;
    let length = 0;
    return (
      this.points.forEach((p, i) => {
        0 !== i && (tmp.subVectors(p, this.points[i - 1]), (length += tmp.length()));
      }),
      length
    );
  }
  getPoint(t, target) {
    let p0,
      p1,
      p2,
      p3,
      tmp = this.tmp,
      px = this.px,
      py = this.py,
      pz = this.pz,
      points = this.points,
      l = points.length,
      point = (l - (this.closed ? 0 : 1)) * t,
      intPoint = Math.floor(point),
      weight = point - intPoint;
    if (
      (this.closed
        ? (intPoint +=
            intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / points.length) + 1) * points.length)
        : 0 === weight && intPoint === l - 1 && ((intPoint = l - 2), (weight = 1)),
      this.closed || intPoint > 0
        ? (p0 = points[(intPoint - 1) % l])
        : (tmp.subVectors(points[0], points[1]).add(points[0]), (p0 = tmp)),
      (p1 = points[intPoint % l]),
      (p2 = points[(intPoint + 1) % l]),
      this.closed || intPoint + 2 < l
        ? (p3 = points[(intPoint + 2) % l])
        : (tmp.subVectors(points[l - 1], points[l - 2]).add(points[l - 1]), (p3 = tmp)),
      void 0 === this.type || "centripetal" === this.type || "chordal" === this.type)
    ) {
      let pow = "chordal" === this.type ? 0.5 : 0.25,
        dt0 = Math.pow(p0.distanceToSquared(p1), pow),
        dt1 = Math.pow(p1.distanceToSquared(p2), pow),
        dt2 = Math.pow(p2.distanceToSquared(p3), pow);
      (dt1 < 1e-4 && (dt1 = 1),
        dt0 < 1e-4 && (dt0 = dt1),
        dt2 < 1e-4 && (dt2 = dt1),
        px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2),
        py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2),
        pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2));
    } else if ("catmullrom" === this.type) {
      let tension = void 0 !== this.tension ? this.tension : 0.5;
      (px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, tension),
        py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, tension),
        pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, tension));
    }
    if (!target) return new Vector3(px.calc(weight), py.calc(weight), pz.calc(weight));
    target.set(px.calc(weight), py.calc(weight), pz.calc(weight));
  }
  dispose() {
    (this.points && ((this.points.length = 0), (this.points = null)),
      (this.tmp = null),
      (this.px = null),
      (this.py = null),
      (this.pz = null),
      (this.closed = !1),
      (this.type = void 0),
      (this.tension = void 0));
  }
}
