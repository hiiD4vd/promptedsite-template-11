class CylinderGeometry extends Geometry {
  constructor(
    radiusTop = 1,
    radiusBottom = 1,
    height = 1,
    radialSegments = 8,
    heightSegments = 1,
    openEnded = !1,
    thetaStart = 0,
    thetaLength = 2 * Math.PI,
    planarMapping = !1,
  ) {
    (super(),
      (radialSegments = Math.floor(radialSegments)),
      (heightSegments = Math.floor(heightSegments)));
    let indices = [],
      vertices = [],
      normals = [],
      uvs = [],
      index = 0,
      indexArray = [],
      halfHeight = height / 2;
    function generateCap(top) {
      let x,
        centerIndexStart,
        centerIndexEnd,
        uv = new Vector2(),
        vertex = new Vector3(),
        radius = !0 === top ? radiusTop : radiusBottom,
        sign = !0 === top ? 1 : -1,
        signV = planarMapping ? 1 : sign;
      for (centerIndexStart = index, x = 1; x <= radialSegments; x++)
        (vertices.push(0, halfHeight * sign, 0),
          normals.push(0, sign, 0),
          uvs.push(0.5, 0.5),
          index++);
      for (centerIndexEnd = index, x = 0; x <= radialSegments; x++) {
        let theta = (x / radialSegments) * thetaLength + thetaStart,
          cosTheta = Math.cos(theta),
          sinTheta = Math.sin(theta);
        ((vertex.x = radius * sinTheta),
          (vertex.y = halfHeight * sign),
          (vertex.z = radius * cosTheta),
          vertices.push(vertex.x, vertex.y, vertex.z),
          normals.push(0, sign, 0),
          (uv.x = 0.5 * cosTheta + 0.5),
          (uv.y = 0.5 * sinTheta * signV + 0.5),
          uvs.push(uv.x, uv.y),
          index++);
      }
      for (x = 0; x < radialSegments; x++) {
        let c = centerIndexStart + x,
          i = centerIndexEnd + x;
        !0 === top ? indices.push(i, i + 1, c) : indices.push(i + 1, i, c);
      }
    }
    (!(function generateTorso() {
      let x,
        y,
        uv = new Vector2(),
        normal = new Vector3(),
        vertex = new Vector3(),
        slope = (radiusBottom - radiusTop) / height;
      for (y = 0; y <= heightSegments; y++) {
        let indexRow = [],
          v = y / heightSegments,
          radius = v * (radiusBottom - radiusTop) + radiusTop;
        for (x = 0; x <= radialSegments; x++) {
          let u = x / radialSegments,
            theta = u * thetaLength + thetaStart,
            sinTheta = Math.sin(theta),
            cosTheta = Math.cos(theta);
          ((vertex.x = radius * sinTheta),
            (vertex.y = -v * height + halfHeight),
            (vertex.z = radius * cosTheta),
            vertices.push(vertex.x, vertex.y, vertex.z),
            normal.set(sinTheta, slope, cosTheta).normalize(),
            normals.push(normal.x, normal.y, normal.z),
            planarMapping
              ? ((uv.x = 0.5 * cosTheta + 0.5), (uv.y = 0.5 * sinTheta + 0.5), uvs.push(uv.x, uv.y))
              : uvs.push(u, 1 - v),
            indexRow.push(index++));
        }
        indexArray.push(indexRow);
      }
      for (x = 0; x < radialSegments; x++)
        for (y = 0; y < heightSegments; y++) {
          let a = indexArray[y][x],
            b = indexArray[y + 1][x],
            c = indexArray[y + 1][x + 1],
            d = indexArray[y][x + 1];
          (indices.push(a, b, d), indices.push(b, c, d));
        }
    })(),
      !1 === openEnded && (radiusTop > 0 && generateCap(!0), radiusBottom > 0 && generateCap(!1)),
      this.setIndex(new (Geometry.arrayNeedsUint32(indices) ? Uint32Array : Uint16Array)(indices)),
      this.addAttribute("position", new GeometryAttribute(new Float32Array(vertices), 3)),
      this.addAttribute("normal", new GeometryAttribute(new Float32Array(normals), 3)),
      this.addAttribute("uv", new GeometryAttribute(new Float32Array(uvs), 2)));
  }
}
