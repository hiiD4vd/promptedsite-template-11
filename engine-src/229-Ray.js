class Ray {
  constructor(origin = new Vector3(), direction = new Vector3()) {
    ((this.origin = origin), (this.direction = direction));
  }
  set(origin, direction) {
    return (this.origin.copy(origin), this.direction.copy(direction), this);
  }
  clone() {
    return new Ray().copy(this);
  }
  copy(ray) {
    return (this.origin.copy(ray.origin), this.direction.copy(ray.direction), this);
  }
  at(t, target = new Vector3()) {
    return target.copy(this.direction).multiplyScalar(t).add(this.origin);
  }
  lookAt(v) {
    return (this.direction.copy(v).sub(this.origin).normalize(), this);
  }
  recast(t) {
    let v1 = this.V1 || new Vector3();
    ((this.V1 = v1), this.origin.copy(this.at(t, v1)));
  }
  closestPointToPoint(point, target = new Vector3()) {
    target.subVectors(point, this.origin);
    let directionDistance = target.dot(this.direction);
    return directionDistance < 0
      ? target.copy(this.origin)
      : target.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
  }
  distanceToPoint(point) {
    return Math.sqrt(this.distanceSqToPoint(point));
  }
  distanceSqToPoint(point) {
    let v1 = this.V1 || new Vector3();
    this.V1 = v1;
    let directionDistance = v1.subVectors(point, this.origin).dot(this.direction);
    return directionDistance < 0
      ? this.origin.distanceToSquared(point)
      : (v1.copy(this.direction).multiplyScalar(directionDistance).add(this.origin),
        v1.distanceToSquared(point));
  }
  distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
    let segCenter = this.V1 || new Vector3(),
      segDir = this.V2 || new Vector3(),
      diff = this.V3 || new Vector3();
    ((this.V1 = segCenter),
      (this.V2 = segDir),
      (this.V3 = diff),
      segCenter.copy(v0).add(v1).multiplyScalar(0.5),
      segDir.copy(v1).sub(v0).normalize(),
      diff.copy(this.origin).sub(segCenter));
    let s0,
      s1,
      sqrDist,
      extDet,
      segExtent = 0.5 * v0.distanceTo(v1),
      a01 = -this.direction.dot(segDir),
      b0 = diff.dot(this.direction),
      b1 = -diff.dot(segDir),
      c = diff.lengthSq(),
      det = Math.abs(1 - a01 * a01);
    if (det > 0)
      if (((s0 = a01 * b1 - b0), (s1 = a01 * b0 - b1), (extDet = segExtent * det), s0 >= 0))
        if (s1 >= -extDet)
          if (s1 <= extDet) {
            let invDet = 1 / det;
            ((s0 *= invDet),
              (s1 *= invDet),
              (sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c));
          } else
            ((s1 = segExtent),
              (s0 = Math.max(0, -(a01 * s1 + b0))),
              (sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c));
        else
          ((s1 = -segExtent),
            (s0 = Math.max(0, -(a01 * s1 + b0))),
            (sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c));
      else
        s1 <= -extDet
          ? ((s0 = Math.max(0, -(-a01 * segExtent + b0))),
            (s1 = s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent)),
            (sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c))
          : s1 <= extDet
            ? ((s0 = 0),
              (s1 = Math.min(Math.max(-segExtent, -b1), segExtent)),
              (sqrDist = s1 * (s1 + 2 * b1) + c))
            : ((s0 = Math.max(0, -(a01 * segExtent + b0))),
              (s1 = s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent)),
              (sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c));
    else
      ((s1 = a01 > 0 ? -segExtent : segExtent),
        (s0 = Math.max(0, -(a01 * s1 + b0))),
        (sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c));
    return (
      optionalPointOnRay &&
        optionalPointOnRay.copy(this.direction).multiplyScalar(s0).add(this.origin),
      optionalPointOnSegment &&
        optionalPointOnSegment.copy(segDir).multiplyScalar(s1).add(segCenter),
      sqrDist
    );
  }
  intersectSphere(sphere, target) {
    let v1 = this.V1 || new Vector3();
    ((this.V1 = v1), v1.subVectors(sphere.center, this.origin));
    let tca = v1.dot(this.direction),
      d2 = v1.dot(v1) - tca * tca,
      radius2 = sphere.radius * sphere.radius;
    if (d2 > radius2) return null;
    let thc = Math.sqrt(radius2 - d2),
      t0 = tca - thc,
      t1 = tca + thc;
    return t0 < 0 && t1 < 0 ? null : t0 < 0 ? this.at(t1, target) : this.at(t0, target);
  }
  intersectsSphere(sphere) {
    return this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius;
  }
  distanceToPlane(plane) {
    let denominator = plane.normal.dot(this.direction);
    if (0 === denominator) return 0 === plane.distanceToPoint(this.origin) ? 0 : null;
    let t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;
    return t >= 0 ? t : null;
  }
  intersectPlane(plane, target) {
    let t = this.distanceToPlane(plane);
    return null === t ? null : this.at(t, target);
  }
  intersectsPlane(plane) {
    let distToPoint = plane.distanceToPoint(this.origin);
    return 0 === distToPoint || plane.normal.dot(this.direction) * distToPoint < 0;
  }
  intersectBox(box, target) {
    let tmin,
      tmax,
      tymin,
      tymax,
      tzmin,
      tzmax,
      invdirx = 1 / this.direction.x,
      invdiry = 1 / this.direction.y,
      invdirz = 1 / this.direction.z,
      origin = this.origin;
    return (
      invdirx >= 0
        ? ((tmin = (box.min.x - origin.x) * invdirx), (tmax = (box.max.x - origin.x) * invdirx))
        : ((tmin = (box.max.x - origin.x) * invdirx), (tmax = (box.min.x - origin.x) * invdirx)),
      invdiry >= 0
        ? ((tymin = (box.min.y - origin.y) * invdiry), (tymax = (box.max.y - origin.y) * invdiry))
        : ((tymin = (box.max.y - origin.y) * invdiry), (tymax = (box.min.y - origin.y) * invdiry)),
      tmin > tymax || tymin > tmax
        ? null
        : ((tymin > tmin || tmin != tmin) && (tmin = tymin),
          (tymax < tmax || tmax != tmax) && (tmax = tymax),
          invdirz >= 0
            ? ((tzmin = (box.min.z - origin.z) * invdirz),
              (tzmax = (box.max.z - origin.z) * invdirz))
            : ((tzmin = (box.max.z - origin.z) * invdirz),
              (tzmax = (box.min.z - origin.z) * invdirz)),
          tmin > tzmax || tzmin > tmax
            ? null
            : ((tzmin > tmin || tmin != tmin) && (tmin = tzmin),
              (tzmax < tmax || tmax != tmax) && (tmax = tzmax),
              tmax < 0 ? null : this.at(tmin >= 0 ? tmin : tmax, target)))
    );
  }
  intersectsBox(box) {
    let v = this.V1 || new Vector3();
    return ((this.V1 = v), null !== this.intersectBox(box, v));
  }
  intersectsTriangle(a, b, c, backfaceCulling, target) {
    let diff = this.V1 || new Vector3(),
      edge1 = this.V2 || new Vector3(),
      edge2 = this.V3 || new Vector3(),
      normal = this.V4 || new Vector3();
    ((this.V1 = diff),
      (this.V2 = edge1),
      (this.V3 = edge2),
      (this.V4 = normal),
      edge1.subVectors(b, a),
      edge2.subVectors(c, a),
      normal.crossVectors(edge1, edge2));
    let sign,
      DdN = this.direction.dot(normal);
    if (DdN > 0) {
      if (backfaceCulling) return null;
      sign = 1;
    } else {
      if (!(DdN < 0)) return null;
      ((sign = -1), (DdN = -DdN));
    }
    diff.subVectors(this.origin, a);
    let DdQxE2 = sign * this.direction.dot(edge2.crossVectors(diff, edge2));
    if (DdQxE2 < 0) return null;
    let DdE1xQ = sign * this.direction.dot(edge1.cross(diff));
    if (DdE1xQ < 0) return null;
    if (DdQxE2 + DdE1xQ > DdN) return null;
    let QdN = -sign * diff.dot(normal);
    return QdN < 0 ? null : this.at(QdN / DdN, target);
  }
  applyMatrix4(matrix4) {
    return (this.origin.applyMatrix4(matrix4), this.direction.transformDirection(matrix4), this);
  }
  equals(ray) {
    return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
  }
}
