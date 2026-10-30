Class(function zUtils3D() {
  function createHelpers() {
    var diff, edge1, edge2, normal, v1, v0;
    ((Ray.prototype.intersectTriangle =
      ((diff = new Vector3()),
      (edge1 = new Vector3()),
      (edge2 = new Vector3()),
      (normal = new Vector3()),
      function intersectTriangle(a, b, c, backfaceCulling, target) {
        (edge1.subVectors(b, a), edge2.subVectors(c, a), normal.crossVectors(edge1, edge2));
        var sign,
          DdN = this.direction.dot(normal);
        if (DdN > 0) {
          if (backfaceCulling) return null;
          sign = 1;
        } else {
          if (!(DdN < 0)) return null;
          ((sign = -1), (DdN = -DdN));
        }
        diff.subVectors(this.origin, a);
        var DdQxE2 = sign * this.direction.dot(edge2.crossVectors(diff, edge2));
        if (DdQxE2 < 0) return null;
        var DdE1xQ = sign * this.direction.dot(edge1.cross(diff));
        if (DdE1xQ < 0) return null;
        if (DdQxE2 + DdE1xQ > DdN) return null;
        var QdN = -sign * diff.dot(normal);
        return QdN < 0 ? null : this.at(QdN / DdN, target);
      })),
      (Mesh.prototype.raycast = (function () {
        let inverseMatrix = new Matrix4(),
          ray = new Ray(),
          sphere = new Sphere(),
          vA = new Vector3(),
          vB = new Vector3(),
          vC = new Vector3(),
          uvA = (new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector2()),
          uvB = new Vector2(),
          uvC = new Vector2(),
          barycoord = new Vector3(),
          intersectionPoint = new Vector3(),
          intersectionPointWorld = new Vector3();
        function checkBufferGeometryIntersection(object, raycaster, ray, position, uv, a, b, c) {
          if (
            (vA.fromBufferAttribute(position, a),
            vB.fromBufferAttribute(position, b),
            vC.fromBufferAttribute(position, c),
            object.raycastLimit)
          ) {
            let { radiusSq: radiusSq, position: position } = object.raycastLimit;
            if (vA.distanceToSquared(position) > radiusSq) return;
          }
          let intersection = (function checkIntersection(
            object,
            shader,
            raycaster,
            ray,
            pA,
            pB,
            pC,
            point,
          ) {
            let intersect;
            if (
              ((intersect =
                shader.side === Shader.BACK_SIDE
                  ? ray.intersectTriangle(pC, pB, pA, !0, point)
                  : ray.intersectTriangle(pA, pB, pC, shader.side !== Shader.DOUBLE_SIDE, point)),
              null === intersect)
            )
              return null;
            (intersectionPointWorld.copy(point),
              intersectionPointWorld.applyMatrix4(object.matrixWorld));
            let distance = raycaster.ray.origin.distanceTo(intersectionPointWorld);
            return distance < raycaster.near || distance > raycaster.far
              ? null
              : { distance: distance, point: intersectionPointWorld.clone(), object: object };
          })(object, object.shader, raycaster, ray, vA, vB, vC, intersectionPoint);
          if (intersection) {
            uv &&
              (uvA.fromBufferAttribute(uv, a),
              uvB.fromBufferAttribute(uv, b),
              uvC.fromBufferAttribute(uv, c),
              (intersection.uv = (function uvIntersection(point, p1, p2, p3, uv1, uv2, uv3) {
                return (
                  Triangle.getBarycoord(point, p1, p2, p3, barycoord),
                  uv1.multiplyScalar(barycoord.x),
                  uv2.multiplyScalar(barycoord.y),
                  uv3.multiplyScalar(barycoord.z),
                  uv1.add(uv2).add(uv3),
                  uv1.clone()
                );
              })(intersectionPoint, vA, vB, vC, uvA, uvB, uvC)));
            let face = new Face3(a, b, c);
            (Triangle.getNormal(vA, vB, vC, face.normal), (intersection.face = face));
          }
          return intersection;
        }
        return function raycast(raycaster, intersects) {
          let intersection,
            a,
            b,
            c,
            geometry = this.geometry,
            shader = this.shader,
            matrixWorld = this.matrixWorld;
          if (void 0 === shader) return;
          if (
            (null === geometry.boundingSphere && geometry.computeBoundingSphere(),
            0 == this.scale.x)
          )
            return;
          if (this.staticRaycast) {
            if (
              (this.raySphere ||
                ((this.raySphere = new Sphere()),
                this.raySphere.copy(geometry.boundingSphere),
                this.raySphere.applyMatrix4(matrixWorld)),
              this.raycastNeedsUpdate &&
                (this.raySphere.copy(geometry.boundingSphere),
                this.raySphere.applyMatrix4(matrixWorld),
                (this.raycastNeedsUpdate = !1)),
              !1 === raycaster.ray.intersectsSphere(this.raySphere))
            )
              return;
          } else if (
            (sphere.copy(geometry.boundingSphere),
            sphere.applyMatrix4(matrixWorld),
            !1 === raycaster.ray.intersectsSphere(sphere))
          )
            return;
          if (
            (inverseMatrix.getInverse(matrixWorld),
            ray.copy(raycaster.ray).applyMatrix4(inverseMatrix),
            null !== geometry.boundingBox && !1 === ray.intersectsBox(geometry.boundingBox))
          )
            return;
          let i,
            l,
            index = geometry.index,
            position = geometry.attributes.position,
            uv = geometry.attributes.uv;
          if (null !== index)
            for (i = 0, l = index.length; i < l; i += 3)
              ((a = index[i]),
                (b = index[i + 1]),
                (c = index[i + 2]),
                (intersection = checkBufferGeometryIntersection(
                  this,
                  raycaster,
                  ray,
                  position,
                  uv,
                  a,
                  b,
                  c,
                )),
                intersection &&
                  ((intersection.faceIndex = Math.floor(i / 3)), intersects.push(intersection)));
          else if (void 0 !== position)
            for (i = 0, l = position.count; i < l; i += 3)
              ((a = i),
                (b = i + 1),
                (c = i + 2),
                (intersection = checkBufferGeometryIntersection(
                  this,
                  raycaster,
                  ray,
                  position,
                  uv,
                  a,
                  b,
                  c,
                )),
                intersection &&
                  ((intersection.faceIndex = Math.floor(i / 3)), intersects.push(intersection)));
        };
      })()),
      (Triangle.prototype.closestPointToPoint = (function () {
        let plane = new Plane(),
          edgeList = [new Line3(), new Line3(), new Line3()],
          projectedPoint = new Vector3(),
          closestPoint = new Vector3();
        return function closestPointToPoint(point, target = new Vector3()) {
          let minDistance = 1 / 0;
          if (
            (plane.setFromCoplanarPoints(this.a, this.b, this.c),
            plane.projectPoint(point, projectedPoint),
            !0 === this.containsPoint(projectedPoint))
          )
            target.copy(projectedPoint);
          else {
            (edgeList[0].set(this.a, this.b),
              edgeList[1].set(this.b, this.c),
              edgeList[2].set(this.c, this.a));
            for (let i = 0; i < edgeList.length; i++) {
              edgeList[i].closestPointToPoint(projectedPoint, !0, closestPoint);
              let distance = projectedPoint.distanceToSquared(closestPoint);
              distance < minDistance && ((minDistance = distance), target.copy(closestPoint));
            }
          }
          return target;
        };
      })()),
      (Points.prototype.raycast = (function () {
        let inverseMatrix = new Matrix4(),
          ray = new Ray(),
          sphere = new Sphere();
        return function raycast(raycaster, intersects) {
          let object = this,
            geometry = this.geometry,
            matrixWorld = this.matrixWorld,
            threshold = raycaster.params.Points.threshold;
          if (
            (null === geometry.boundingSphere && geometry.computeBoundingSphere(),
            sphere.copy(geometry.boundingSphere),
            sphere.applyMatrix4(matrixWorld),
            (sphere.radius += threshold),
            !1 === raycaster.ray.intersectsSphere(sphere))
          )
            return;
          (inverseMatrix.getInverse(matrixWorld),
            ray.copy(raycaster.ray).applyMatrix4(inverseMatrix));
          let localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3),
            localThresholdSq = localThreshold * localThreshold,
            position = new Vector3(),
            intersectPoint = new Vector3();
          function testPoint(point, index) {
            let rayPointDistanceSq = ray.distanceSqToPoint(point);
            if (rayPointDistanceSq < localThresholdSq) {
              (ray.closestPointToPoint(point, intersectPoint),
                intersectPoint.applyMatrix4(matrixWorld));
              let distance = raycaster.ray.origin.distanceTo(intersectPoint);
              if (distance < raycaster.near || distance > raycaster.far) return;
              intersects.push({
                distance: distance,
                distanceToRay: Math.sqrt(rayPointDistanceSq),
                point: intersectPoint.clone(),
                index: index,
                face: null,
                object: object,
              });
            }
          }
          let index = geometry.index,
            positions = geometry.attributes.position.array;
          if (null !== index) {
            let indices = index.array;
            for (let i = 0, il = indices.length; i < il; i++) {
              let a = indices[i];
              (position.fromArray(positions, 3 * a), testPoint(position, a));
            }
          } else
            for (let i = 0, l = positions.length / 3; i < l; i++)
              (position.fromArray(positions, 3 * i), testPoint(position, i));
        };
      })()),
      Object.assign(Triangle, {
        getNormal:
          ((v0 = new Vector3()),
          function getNormal(a, b, c, target = new Vector3()) {
            (target.subVectors(c, b), v0.subVectors(a, b), target.cross(v0));
            var targetLengthSq = target.lengthSq();
            return targetLengthSq > 0
              ? target.multiplyScalar(1 / Math.sqrt(targetLengthSq))
              : target.set(0, 0, 0);
          }),
        getBarycoord: (function () {
          var v0 = new Vector3(),
            v1 = new Vector3(),
            v2 = new Vector3();
          return function getBarycoord(point, a, b, c, target = new Vector3()) {
            (v0.subVectors(c, a), v1.subVectors(b, a), v2.subVectors(point, a));
            var dot00 = v0.dot(v0),
              dot01 = v0.dot(v1),
              dot02 = v0.dot(v2),
              dot11 = v1.dot(v1),
              dot12 = v1.dot(v2),
              denom = dot00 * dot11 - dot01 * dot01;
            if (0 === denom) return target.set(-2, -1, -1);
            var invDenom = 1 / denom,
              u = (dot11 * dot02 - dot01 * dot12) * invDenom,
              v = (dot00 * dot12 - dot01 * dot02) * invDenom;
            return target.set(1 - u - v, v, u);
          };
        })(),
        getUV: (function () {
          let _v3 = new Vector3();
          return function getUV(point, p1, p2, p3, uv1, uv2, uv3, target) {
            return (
              this.getBarycoord(point, p1, p2, p3, _v3),
              target.set(0, 0),
              target.addScaledVector(uv1, _v3.x),
              target.addScaledVector(uv2, _v3.y),
              target.addScaledVector(uv3, _v3.z),
              target
            );
          };
        })(),
        containsPoint:
          ((v1 = new Vector3()),
          function containsPoint(point, a, b, c) {
            return (
              Triangle.getBarycoord(point, a, b, c, v1),
              v1.x >= 0 && v1.y >= 0 && v1.x + v1.y <= 1
            );
          }),
      }));
  }
  ((Math.euclideanModulo = function (n, m) {
    return ((n % m) + m) % m;
  }),
    (Math.isPowerOf2 = function (w, h) {
      let test = (value) => !(value & (value - 1));
      return test(w) && test(h);
    }),
    (Math.floorPowerOf2 = function (value) {
      return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
    }),
    (Math.ceilPowerOf2 = function (value) {
      return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
    }),
    (this.LOCAL = window.Hydra && Hydra.LOCAL),
    (Geometry.createAttributes = function (geom) {
      let attributes = {},
        handler = {
          set(target, property, value) {
            ((target[property] = value),
              (geom._attributeKeys.length = 0),
              (geom._attributeValues.length = 0));
            for (let key in attributes)
              (geom._attributeKeys.push(key), geom._attributeValues.push(attributes[key]));
            return !0;
          },
        };
      return (
        (geom._attributeKeys = []),
        (geom._attributeValues = []),
        new Proxy(attributes, handler)
      );
    }),
    (Geometry.TYPED_ARRAYS = {
      Int8Array: Int8Array,
      Uint8Array: Uint8Array,
      Uint8ClampedArray: Uint8ClampedArray,
      Int16Array: Int16Array,
      Uint16Array: Uint16Array,
      Int32Array: Int32Array,
      Uint32Array: Uint32Array,
      Float32Array: Float32Array,
      Float64Array: Float64Array,
    }),
    (Geometry.arrayNeedsUint32 = function (array) {
      for (let i = array.length - 1; i >= 0; --i) if (array[i] > 65535) return !0;
      return !1;
    }),
    (Geometry.TYPES = {
      SphereGeometry: SphereGeometry,
      IcosahedronGeometry: IcosahedronGeometry,
      BoxGeometry: BoxGeometry,
      PlaneGeometry: PlaneGeometry,
      CylinderGeometry: CylinderGeometry,
    }),
    (Matrix4.prototype.isMatrix4 = !0),
    (Matrix3.prototype.isMatrix3 = !0),
    (Vector3.prototype.isVector3 = !0),
    (Vector3D.prototype.isVector3 = !0),
    (Vector2.prototype.isVector2 = !0),
    (CameraBase3D.prototype.isCamera = !0),
    (PerspectiveCamera.prototype.isPerspective = !0),
    (Scene.FRONT_TO_BACK = "sort_front_to_back"),
    (Scene.FRONT_TO_BACK_BOUNDING = "sort_front_to_back_bounding"),
    window.THREAD &&
      (Shader = {
        FRONT_SIDE: "shader_front_side",
        BACK_SIDE: "shader_back_side",
        DOUBLE_SIDE: "shader_double_side",
      }),
    window.MatrixWasm ? MatrixWasm.ready().then(createHelpers) : createHelpers());
}, "static");
