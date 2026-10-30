class Curve3D {
  constructor() {
    this.arcLengthDivisions = 200;
  }
  getPointAt(u) {
    let t = this.getUtoTmapping(u);
    return this.getPoint(t);
  }
  getPoints(divisions = 5) {
    let points = [];
    for (let d = 0; d <= divisions; d++) points.push(this.getPoint(d / divisions));
    return points;
  }
  getSpacedPoints(divisions = 5) {
    let points = [];
    for (let d = 0; d <= divisions; d++) points.push(this.getPointAt(d / divisions));
    return points;
  }
  getLength() {
    let lengths = this.getLengths();
    return lengths[lengths.length - 1];
  }
  getLengths(divisions = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === divisions + 1 && !this.needsUpdate)
      return this.cacheArcLengths;
    this.needsUpdate = !1;
    let current,
      p,
      cache = [],
      last = this.getPoint(0),
      sum = 0;
    for (cache.push(0), p = 1; p <= divisions; p++)
      ((current = this.getPoint(p / divisions)),
        (sum += current.distanceTo(last)),
        cache.push(sum),
        (last = current));
    return ((this.cacheArcLengths = cache), cache);
  }
  updateArtLengths() {
    ((this.needsUpdate = !0), this.getLengths());
  }
  getUtoTmapping(u, distance) {
    let targetArcLength,
      arcLengths = this.getLengths(),
      i = 0,
      il = arcLengths.length;
    targetArcLength = distance || u * arcLengths[il - 1];
    let comparison,
      low = 0,
      high = il - 1;
    for (; low <= high;)
      if (
        ((i = Math.floor(low + (high - low) / 2)),
        (comparison = arcLengths[i] - targetArcLength),
        comparison < 0)
      )
        low = i + 1;
      else {
        if (!(comparison > 0)) {
          high = i;
          break;
        }
        high = i - 1;
      }
    if (((i = high), arcLengths[i] === targetArcLength)) return i / (il - 1);
    let lengthBefore = arcLengths[i];
    return (i + (targetArcLength - lengthBefore) / (arcLengths[i + 1] - lengthBefore)) / (il - 1);
  }
  getTangent(t) {
    let t1 = t - 1e-4,
      t2 = t + 1e-4;
    (t1 < 0 && (t1 = 0), t2 > 1 && (t2 = 1));
    let pt1 = this.getPoint(t1);
    return this.getPoint(t2).clone().sub(pt1).normalize();
  }
  getTangentAt(u) {
    let t = this.getUtoTmapping(u);
    return this.getTangent(t);
  }
  computeFrenetFrames(segments, closed) {
    let i,
      u,
      theta,
      normal = new Vector3(),
      tangents = [],
      normals = [],
      binormals = [],
      vec = new Vector3(),
      mat = new Matrix4();
    for (i = 0; i <= segments; i++)
      ((u = i / segments), (tangents[i] = this.getTangentAt(u)), tangents[i].normalize());
    ((normals[0] = new Vector3()), (binormals[0] = new Vector3()));
    let min = Number.MAX_VALUE,
      tx = Math.abs(tangents[0].x),
      ty = Math.abs(tangents[0].y),
      tz = Math.abs(tangents[0].z);
    for (
      tx <= min && ((min = tx), normal.set(1, 0, 0)),
        ty <= min && ((min = ty), normal.set(0, 1, 0)),
        tz <= min && normal.set(0, 0, 1),
        vec.crossVectors(tangents[0], normal).normalize(),
        normals[0].crossVectors(tangents[0], vec),
        binormals[0].crossVectors(tangents[0], normals[0]),
        i = 1;
      i <= segments;
      i++
    )
      ((normals[i] = normals[i - 1].clone()),
        (binormals[i] = binormals[i - 1].clone()),
        vec.crossVectors(tangents[i - 1], tangents[i]),
        vec.length() > Number.EPSILON &&
          (vec.normalize(),
          (theta = Math.acos(Math.clamp(tangents[i - 1].dot(tangents[i]), -1, 1))),
          normals[i].applyMatrix4(mat.makeRotationAxis(vec, theta))),
        binormals[i].crossVectors(tangents[i], normals[i]));
    if (!0 === closed)
      for (
        theta = Math.acos(Math.clamp(normals[0].dot(normals[segments]), -1, 1)),
          theta /= segments,
          tangents[0].dot(vec.crossVectors(normals[0], normals[segments])) > 0 && (theta = -theta),
          i = 1;
        i <= segments;
        i++
      )
        (normals[i].applyMatrix4(mat.makeRotationAxis(tangents[i], theta * i)),
          binormals[i].crossVectors(tangents[i], normals[i]));
    return { tangents: tangents, normals: normals, binormals: binormals };
  }
}
