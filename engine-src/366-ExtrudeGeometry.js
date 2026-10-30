class ExtrudeGeometry extends Geometry {
  constructor(shapes, options = {}) {
    super();
    var WorldUVGenerator = {
      generateTopUV: function (geometry, vertices, indexA, indexB, indexC) {
        var a_x = vertices[3 * indexA],
          a_y = vertices[3 * indexA + 1],
          b_x = vertices[3 * indexB],
          b_y = vertices[3 * indexB + 1],
          c_x = vertices[3 * indexC],
          c_y = vertices[3 * indexC + 1];
        return [new Vector2(a_x, a_y), new Vector2(b_x, b_y), new Vector2(c_x, c_y)];
      },
      generateSideWallUV: function (geometry, vertices, indexA, indexB, indexC, indexD) {
        var a_x = vertices[3 * indexA],
          a_y = vertices[3 * indexA + 1],
          a_z = vertices[3 * indexA + 2],
          b_x = vertices[3 * indexB],
          b_y = vertices[3 * indexB + 1],
          b_z = vertices[3 * indexB + 2],
          c_x = vertices[3 * indexC],
          c_y = vertices[3 * indexC + 1],
          c_z = vertices[3 * indexC + 2],
          d_x = vertices[3 * indexD],
          d_y = vertices[3 * indexD + 1],
          d_z = vertices[3 * indexD + 2];
        return Math.abs(a_y - b_y) < 0.01
          ? [
              new Vector2(a_x, 1 - a_z),
              new Vector2(b_x, 1 - b_z),
              new Vector2(c_x, 1 - c_z),
              new Vector2(d_x, 1 - d_z),
            ]
          : [
              new Vector2(a_y, 1 - a_z),
              new Vector2(b_y, 1 - b_z),
              new Vector2(c_y, 1 - c_z),
              new Vector2(d_y, 1 - d_z),
            ];
      },
    };
    shapes = Array.isArray(shapes) ? shapes : [shapes];
    for (var scope = this, verticesArray = [], uvArray = [], i = 0, l = shapes.length; i < l; i++) {
      addShape(shapes[i]);
    }
    function addShape(shape) {
      var extrudePts,
        splineTube,
        binormal,
        normal,
        position2,
        ahole,
        h,
        hl,
        placeholder = [],
        curveSegments = void 0 !== options.curveSegments ? options.curveSegments : 12,
        steps = void 0 !== options.steps ? options.steps : 1,
        depth = void 0 !== options.depth ? options.depth : 100,
        bevelEnabled = void 0 === options.bevelEnabled || options.bevelEnabled,
        bevelThickness = void 0 !== options.bevelThickness ? options.bevelThickness : 6,
        bevelSize = void 0 !== options.bevelSize ? options.bevelSize : bevelThickness - 2,
        bevelOffset = void 0 !== options.bevelOffset ? options.bevelOffset : 0,
        bevelSegments = void 0 !== options.bevelSegments ? options.bevelSegments : 3,
        extrudePath = options.extrudePath,
        uvgen = void 0 !== options.UVGenerator ? options.UVGenerator : WorldUVGenerator,
        extrudeByPath = !1;
      (extrudePath &&
        ((extrudePts = extrudePath.getSpacedPoints(steps)),
        (extrudeByPath = !0),
        (bevelEnabled = !1),
        (splineTube = extrudePath.computeFrenetFrames(steps, !1)),
        (binormal = new Vector3()),
        (normal = new Vector3()),
        (position2 = new Vector3())),
        bevelEnabled ||
          ((bevelSegments = 0), (bevelThickness = 0), (bevelSize = 0), (bevelOffset = 0)));
      var shapePoints = shape.extractPoints(curveSegments),
        vertices = shapePoints.shape,
        holes = shapePoints.holes;
      if (!ExtrudeUtils.isClockWise(vertices))
        for (vertices = vertices.reverse(), h = 0, hl = holes.length; h < hl; h++)
          ((ahole = holes[h]), ExtrudeUtils.isClockWise(ahole) && (holes[h] = ahole.reverse()));
      var faces = ExtrudeUtils.triangulateShape(vertices, holes),
        contour = vertices;
      for (h = 0, hl = holes.length; h < hl; h++)
        ((ahole = holes[h]), (vertices = vertices.concat(ahole)));
      function scalePt2(pt, vec, size) {
        return (
          vec || console.error("ExtrudeGeometry: vec does not exist"),
          vec.clone().multiplyScalar(size).add(pt)
        );
      }
      var b,
        bs,
        t,
        z,
        vert,
        face,
        vlen = vertices.length,
        flen = faces.length;
      function getBevelVec(inPt, inPrev, inNext) {
        var v_trans_x,
          v_trans_y,
          shrink_by,
          v_prev_x = inPt.x - inPrev.x,
          v_prev_y = inPt.y - inPrev.y,
          v_next_x = inNext.x - inPt.x,
          v_next_y = inNext.y - inPt.y,
          v_prev_lensq = v_prev_x * v_prev_x + v_prev_y * v_prev_y,
          collinear0 = v_prev_x * v_next_y - v_prev_y * v_next_x;
        if (Math.abs(collinear0) > Number.EPSILON) {
          var v_prev_len = Math.sqrt(v_prev_lensq),
            v_next_len = Math.sqrt(v_next_x * v_next_x + v_next_y * v_next_y),
            ptPrevShift_x = inPrev.x - v_prev_y / v_prev_len,
            ptPrevShift_y = inPrev.y + v_prev_x / v_prev_len,
            sf =
              ((inNext.x - v_next_y / v_next_len - ptPrevShift_x) * v_next_y -
                (inNext.y + v_next_x / v_next_len - ptPrevShift_y) * v_next_x) /
              (v_prev_x * v_next_y - v_prev_y * v_next_x),
            v_trans_lensq =
              (v_trans_x = ptPrevShift_x + v_prev_x * sf - inPt.x) * v_trans_x +
              (v_trans_y = ptPrevShift_y + v_prev_y * sf - inPt.y) * v_trans_y;
          if (v_trans_lensq <= 2) return new Vector2(v_trans_x, v_trans_y);
          shrink_by = Math.sqrt(v_trans_lensq / 2);
        } else {
          var direction_eq = !1;
          (v_prev_x > Number.EPSILON
            ? v_next_x > Number.EPSILON && (direction_eq = !0)
            : v_prev_x < -Number.EPSILON
              ? v_next_x < -Number.EPSILON && (direction_eq = !0)
              : Math.sign(v_prev_y) === Math.sign(v_next_y) && (direction_eq = !0),
            direction_eq
              ? ((v_trans_x = -v_prev_y),
                (v_trans_y = v_prev_x),
                (shrink_by = Math.sqrt(v_prev_lensq)))
              : ((v_trans_x = v_prev_x),
                (v_trans_y = v_prev_y),
                (shrink_by = Math.sqrt(v_prev_lensq / 2))));
        }
        return new Vector2(v_trans_x / shrink_by, v_trans_y / shrink_by);
      }
      for (
        var contourMovements = [], i = 0, il = contour.length, j = il - 1, k = i + 1;
        i < il;
        i++, j++, k++
      )
        (j === il && (j = 0),
          k === il && (k = 0),
          (contourMovements[i] = getBevelVec(contour[i], contour[j], contour[k])));
      var oneHoleMovements,
        s,
        holesMovements = [],
        verticesMovements = contourMovements.concat();
      for (h = 0, hl = holes.length; h < hl; h++) {
        for (
          ahole = holes[h], oneHoleMovements = [], i = 0, j = (il = ahole.length) - 1, k = i + 1;
          i < il;
          i++, j++, k++
        )
          (j === il && (j = 0),
            k === il && (k = 0),
            (oneHoleMovements[i] = getBevelVec(ahole[i], ahole[j], ahole[k])));
        (holesMovements.push(oneHoleMovements),
          (verticesMovements = verticesMovements.concat(oneHoleMovements)));
      }
      for (b = 0; b < bevelSegments; b++) {
        for (
          t = b / bevelSegments,
            z = bevelThickness * Math.cos((t * Math.PI) / 2),
            bs = bevelSize * Math.sin((t * Math.PI) / 2) + bevelOffset,
            i = 0,
            il = contour.length;
          i < il;
          i++
        )
          v((vert = scalePt2(contour[i], contourMovements[i], bs)).x, vert.y, -z);
        for (h = 0, hl = holes.length; h < hl; h++)
          for (
            ahole = holes[h], oneHoleMovements = holesMovements[h], i = 0, il = ahole.length;
            i < il;
            i++
          )
            v((vert = scalePt2(ahole[i], oneHoleMovements[i], bs)).x, vert.y, -z);
      }
      for (bs = bevelSize + bevelOffset, i = 0; i < vlen; i++)
        ((vert = bevelEnabled ? scalePt2(vertices[i], verticesMovements[i], bs) : vertices[i]),
          extrudeByPath
            ? (normal.copy(splineTube.normals[0]).multiplyScalar(vert.x),
              binormal.copy(splineTube.binormals[0]).multiplyScalar(vert.y),
              position2.copy(extrudePts[0]).add(normal).add(binormal),
              v(position2.x, position2.y, position2.z))
            : v(vert.x, vert.y, 0));
      for (s = 1; s <= steps; s++)
        for (i = 0; i < vlen; i++)
          ((vert = bevelEnabled ? scalePt2(vertices[i], verticesMovements[i], bs) : vertices[i]),
            extrudeByPath
              ? (normal.copy(splineTube.normals[s]).multiplyScalar(vert.x),
                binormal.copy(splineTube.binormals[s]).multiplyScalar(vert.y),
                position2.copy(extrudePts[s]).add(normal).add(binormal),
                v(position2.x, position2.y, position2.z))
              : v(vert.x, vert.y, (depth / steps) * s));
      for (b = bevelSegments - 1; b >= 0; b--) {
        for (
          t = b / bevelSegments,
            z = bevelThickness * Math.cos((t * Math.PI) / 2),
            bs = bevelSize * Math.sin((t * Math.PI) / 2) + bevelOffset,
            i = 0,
            il = contour.length;
          i < il;
          i++
        )
          v((vert = scalePt2(contour[i], contourMovements[i], bs)).x, vert.y, depth + z);
        for (h = 0, hl = holes.length; h < hl; h++)
          for (
            ahole = holes[h], oneHoleMovements = holesMovements[h], i = 0, il = ahole.length;
            i < il;
            i++
          )
            ((vert = scalePt2(ahole[i], oneHoleMovements[i], bs)),
              extrudeByPath
                ? v(vert.x, vert.y + extrudePts[steps - 1].y, extrudePts[steps - 1].x + z)
                : v(vert.x, vert.y, depth + z));
      }
      function sidewalls(contour, layeroffset) {
        var j, k;
        for (i = contour.length; --i >= 0;) {
          ((j = i), (k = i - 1) < 0 && (k = contour.length - 1));
          var s = 0,
            sl = steps + 2 * bevelSegments;
          for (s = 0; s < sl; s++) {
            var slen1 = vlen * s,
              slen2 = vlen * (s + 1);
            f4(
              layeroffset + j + slen1,
              layeroffset + k + slen1,
              layeroffset + k + slen2,
              layeroffset + j + slen2,
            );
          }
        }
      }
      function v(x, y, z) {
        (placeholder.push(x), placeholder.push(y), placeholder.push(z));
      }
      function f3(a, b, c) {
        (addVertex(a), addVertex(b), addVertex(c));
        var nextIndex = verticesArray.length / 3,
          uvs = uvgen.generateTopUV(
            scope,
            verticesArray,
            nextIndex - 3,
            nextIndex - 2,
            nextIndex - 1,
          );
        (addUV(uvs[0]), addUV(uvs[1]), addUV(uvs[2]));
      }
      function f4(a, b, c, d) {
        (addVertex(a), addVertex(b), addVertex(d), addVertex(b), addVertex(c), addVertex(d));
        var nextIndex = verticesArray.length / 3,
          uvs = uvgen.generateSideWallUV(
            scope,
            verticesArray,
            nextIndex - 6,
            nextIndex - 3,
            nextIndex - 2,
            nextIndex - 1,
          );
        (addUV(uvs[0]), addUV(uvs[1]), addUV(uvs[3]), addUV(uvs[1]), addUV(uvs[2]), addUV(uvs[3]));
      }
      function addVertex(index) {
        (verticesArray.push(placeholder[3 * index + 0]),
          verticesArray.push(placeholder[3 * index + 1]),
          verticesArray.push(placeholder[3 * index + 2]));
      }
      function addUV(vector2) {
        (uvArray.push(vector2.x), uvArray.push(vector2.y));
      }
      (!(function buildLidFaces() {
        verticesArray.length;
        if (bevelEnabled) {
          var layer = 0,
            offset = vlen * layer;
          for (i = 0; i < flen; i++)
            f3((face = faces[i])[2] + offset, face[1] + offset, face[0] + offset);
          for (offset = vlen * (layer = steps + 2 * bevelSegments), i = 0; i < flen; i++)
            f3((face = faces[i])[0] + offset, face[1] + offset, face[2] + offset);
        } else {
          for (i = 0; i < flen; i++) f3((face = faces[i])[2], face[1], face[0]);
          for (i = 0; i < flen; i++)
            f3((face = faces[i])[0] + vlen * steps, face[1] + vlen * steps, face[2] + vlen * steps);
        }
      })(),
        (function buildSideFaces() {
          verticesArray.length;
          var layeroffset = 0;
          for (
            sidewalls(contour, layeroffset),
              layeroffset += contour.length,
              h = 0,
              hl = holes.length;
            h < hl;
            h++
          )
            (sidewalls((ahole = holes[h]), layeroffset), (layeroffset += ahole.length));
        })());
    }
    (this.addAttribute("position", new GeometryAttribute(new Float32Array(verticesArray), 3)),
      this.addAttribute("uv", new GeometryAttribute(new Float32Array(uvArray), 2)),
      !0 === options.computeNormals && this.computeVertexNormals());
  }
}
