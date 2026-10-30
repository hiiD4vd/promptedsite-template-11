class Geometry {
  constructor() {
    ((this.attributes = Geometry.createAttributes(this)),
      (this.drawRange = { start: 0, end: 0 }),
      (this.boundingBox = null),
      (this.boundingSphere = null),
      (this.index = null),
      (this.maxInstancedCount = void 0),
      (this.keepAlive = !1),
      (this.id = Utils.timestamp()));
  }
  draw(mesh, shader, isQuery = !1) {
    Geometry.renderer.draw(this, mesh, shader, isQuery);
  }
  upload(mesh, shader) {
    Geometry.renderer.upload(this, mesh, shader);
  }
  destroy(mesh) {
    Geometry.renderer.destroy(this, mesh);
  }
  addAttribute(name, attribute) {
    (attribute.meshPerAttribute >= 1 &&
      ((this.isInstanced = !0), (this.maxInstancedCount = attribute.count)),
      "position" === name && (attribute.destroyDataAfterUpload = !1),
      (this.attributes[name] = attribute));
  }
  setIndex(attribute) {
    this.index = attribute.array || attribute;
  }
  toNonIndexed() {
    let geometry2 = new Geometry(),
      indices = this.index,
      attributes = this.attributes;
    for (let name in attributes) {
      let attribute = attributes[name],
        array = attribute.array,
        itemSize = attribute.itemSize,
        array2 = new array.constructor(indices.length * itemSize),
        index = 0,
        index2 = 0;
      for (let i = 0, l = indices.length; i < l; i++) {
        index = indices[i] * itemSize;
        for (let j = 0; j < itemSize; j++) array2[index2++] = array[index++];
      }
      geometry2.addAttribute(name, new GeometryAttribute(array2, itemSize));
    }
    return geometry2;
  }
  normalizeNormals() {
    let vector = this._V1 || new Vector3();
    this._V1 = vector;
    let x,
      y,
      z,
      normals = this.attributes.normal;
    for (let i = 0, il = normals.count; i < il; i++)
      ((x = 3 * i + 0),
        (y = 3 * i + 1),
        (z = 3 * i + 2),
        (vector.x = normals.array[x]),
        (vector.y = normals.array[y]),
        (vector.z = normals.array[z]),
        vector.normalize(),
        (normals.array[x] = vector.x),
        (normals.array[y] = vector.y),
        (normals.array[z] = vector.z));
  }
  computeFaceNormals() {
    let cb = new Vector3(),
      ab = new Vector3();
    for (let f = 0, fl = this.faces.length; f < fl; f++) {
      let face = this.faces[f],
        vA = this.vertices[face.a],
        vB = this.vertices[face.b],
        vC = this.vertices[face.c];
      (cb.subVectors(vC, vB),
        ab.subVectors(vA, vB),
        cb.cross(ab),
        cb.normalize(),
        face.normal.copy(cb));
    }
  }
  computeVertexNormals() {
    let index = this.index,
      attributes = this.attributes,
      groups = this.groups || [];
    if (attributes.position) {
      let positions = attributes.position.array;
      if (void 0 === attributes.normal)
        this.addAttribute("normal", new GeometryAttribute(new Float32Array(positions.length), 3));
      else {
        let array = attributes.normal.array;
        for (let i = 0, il = array.length; i < il; i++) array[i] = 0;
      }
      let vA,
        vB,
        vC,
        normals = attributes.normal.array,
        pA = new Vector3(),
        pB = new Vector3(),
        pC = new Vector3(),
        cb = new Vector3(),
        ab = new Vector3();
      if (index) {
        let indices = index.array;
        0 === groups.length && this.addGroup(0, indices.length);
        for (let j = 0, jl = groups.length; j < jl; ++j) {
          let group = groups[j],
            start = group.start;
          for (let i = start, il = start + group.count; i < il; i += 3)
            ((vA = 3 * indices[i + 0]),
              (vB = 3 * indices[i + 1]),
              (vC = 3 * indices[i + 2]),
              pA.fromArray(positions, vA),
              pB.fromArray(positions, vB),
              pC.fromArray(positions, vC),
              cb.subVectors(pC, pB),
              ab.subVectors(pA, pB),
              cb.cross(ab),
              (normals[vA] += cb.x),
              (normals[vA + 1] += cb.y),
              (normals[vA + 2] += cb.z),
              (normals[vB] += cb.x),
              (normals[vB + 1] += cb.y),
              (normals[vB + 2] += cb.z),
              (normals[vC] += cb.x),
              (normals[vC + 1] += cb.y),
              (normals[vC + 2] += cb.z));
        }
      } else
        for (let i = 0, il = positions.length; i < il; i += 9)
          (pA.fromArray(positions, i),
            pB.fromArray(positions, i + 3),
            pC.fromArray(positions, i + 6),
            cb.subVectors(pC, pB),
            ab.subVectors(pA, pB),
            cb.cross(ab),
            (normals[i] = cb.x),
            (normals[i + 1] = cb.y),
            (normals[i + 2] = cb.z),
            (normals[i + 3] = cb.x),
            (normals[i + 4] = cb.y),
            (normals[i + 5] = cb.z),
            (normals[i + 6] = cb.x),
            (normals[i + 7] = cb.y),
            (normals[i + 8] = cb.z));
      (this.normalizeNormals(), (attributes.normal.needsUpdate = !0));
    }
  }
  computeBoundingBox() {
    this.boundingBox || (this.boundingBox = new Box3());
    let position = this.attributes.position;
    position ? this.boundingBox.setFromBufferAttribute(position) : this.boundingBox.makeEmpty();
  }
  computeBoundingSphere() {
    let box = new Box3(),
      vector = new Vector3();
    this.boundingSphere || (this.boundingSphere = new Sphere());
    let position = this.attributes.position;
    if (position) {
      let center = this.boundingSphere.center;
      (box.setFromBufferAttribute(position), box.getCenter(center));
      let maxRadiusSq = 0;
      for (let i = 0, il = position.count; i < il; i++)
        (vector.fromBufferAttribute(position, i),
          (maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector))));
      ((this.boundingSphere.radius = Math.sqrt(maxRadiusSq)),
        isNaN(this.boundingSphere.radius) &&
          console.error("Bounding Sphere came up NaN, broken position buffer.", this));
    }
  }
  merge(geometry) {
    let Float32ArrayConcat = (first, second) => {
        let firstLength = first.length,
          result = new Float32Array(firstLength + second.length);
        return (result.set(first), result.set(second, firstLength), result);
      },
      attributes = this.attributes;
    if (this.index) {
      let indices = geometry.index,
        offset = attributes.position.count;
      for (let i = 0, il = indices.length; i < il; i++) indices[i] = offset + indices[i];
      this.index = ((first, second) => {
        let firstLength = first.length,
          result = new (Geometry.arrayNeedsUint32(second) ? Uint32Array : Uint16Array)(
            firstLength + second.length,
          );
        return (result.set(first), result.set(second, firstLength), result);
      })(this.index, indices);
    }
    for (let key in attributes)
      void 0 !== geometry.attributes[key] &&
        ((attributes[key].array = Float32ArrayConcat(
          attributes[key].array,
          geometry.attributes[key].array,
        )),
        (attributes[key].count = attributes[key].array.length / attributes[key].itemSize));
    return this;
  }
  clone(noCopy) {
    return new Geometry().copy(this, noCopy);
  }
  copy(source, noCopy) {
    ((this.index = null),
      (this.boundingBox = null),
      (this.boundingSphere = null),
      (this.index = source.index));
    let attributes = source.attributes;
    for (let name in attributes) {
      let attribute = attributes[name];
      (attribute.array.deleted &&
        !attribute.array.length &&
        (attribute.array.copyHasWarned ||
          (console.error(`Attempt to copy/clone a deleted geometry attribute ${name}`, this),
          (attribute.array.copyHasWarned = !0))),
        this.addAttribute(name, attributes[name].clone(noCopy)));
    }
    let boundingBox = source.boundingBox;
    boundingBox && boundingBox.clone && (this.boundingBox = boundingBox.clone());
    let boundingSphere = source.boundingSphere;
    return (
      boundingSphere && boundingSphere.clone && (this.boundingSphere = boundingSphere.clone()),
      this
    );
  }
  center() {
    let offset = new Vector3();
    return (
      this.computeBoundingBox(),
      this.boundingBox.getCenter(offset).negate(),
      this.applyMatrix(new Matrix4().makeTranslation(offset.x, offset.y, offset.z)),
      this
    );
  }
  applyMatrix(matrix) {
    let position = this.attributes.position;
    position && (matrix.applyToBufferAttribute(position), (position.needsUpdate = !0));
    let normal = this.attributes.normal;
    if (normal) {
      (new Matrix3().getNormalMatrix(matrix).applyToBufferAttribute(normal),
        (normal.needsUpdate = !0));
    }
    return (
      this.boundingBox && this.computeBoundingBox(),
      this.boundingSphere && this.computeBoundingSphere(),
      this
    );
  }
  scale(x, y, z) {
    this.applyMatrix(new Matrix4().makeScale(x, y, z));
  }
  setFromPoints(points) {
    let position = [];
    for (let i = 0, l = points.length; i < l; i++) {
      let point = points[i];
      position.push(point.x, point.y, point.z || 0);
    }
    return (
      this.addAttribute("position", new GeometryAttribute(new Float32Array(position), 3)),
      this
    );
  }
  instanceFrom(geom) {
    return geom.clone();
  }
  uploadBuffersAsync() {
    return Geometry.renderer.uploadBuffersAsync(this);
  }
  toJSON() {
    let attributes = {};
    for (let key in this.attributes) {
      let attribute = this.attributes[key];
      attributes[key] = {
        type: "Float32Array",
        itemSize: attribute.itemSize,
        array: Array.from(attribute.array),
      };
    }
    let json = { metadata: { type: "BufferGeometry" }, data: { attributes: attributes } };
    return (
      this.index &&
        (json.data.index = {
          type: Utils.getConstructorName(this.index),
          array: Array.from(this.index),
        }),
      json
    );
  }
}
