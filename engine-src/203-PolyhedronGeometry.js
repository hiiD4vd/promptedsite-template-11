class PolyhedronGeometry extends Geometry {
  constructor(vertices, indices = [], radius = 1, detail = 0) {
    super();
    let vertexBuffer = [],
      uvBuffer = [];
    function subdivideFace(a, b, c, detail) {
      var i,
        j,
        cols = Math.pow(2, detail),
        v = [];
      for (i = 0; i <= cols; i++) {
        v[i] = [];
        var aj = a.clone().lerp(c, i / cols),
          bj = b.clone().lerp(c, i / cols),
          rows = cols - i;
        for (j = 0; j <= rows; j++)
          v[i][j] = 0 === j && i === cols ? aj : aj.clone().lerp(bj, j / rows);
      }
      for (i = 0; i < cols; i++)
        for (j = 0; j < 2 * (cols - i) - 1; j++) {
          var k = Math.floor(j / 2);
          j % 2 == 0
            ? (pushVertex(v[i][k + 1]), pushVertex(v[i + 1][k]), pushVertex(v[i][k]))
            : (pushVertex(v[i][k + 1]), pushVertex(v[i + 1][k + 1]), pushVertex(v[i + 1][k]));
        }
    }
    function pushVertex(vertex) {
      vertexBuffer.push(vertex.x, vertex.y, vertex.z);
    }
    function getVertexByIndex(index, vertex) {
      let stride = 3 * index;
      ((vertex.x = vertices[stride + 0]),
        (vertex.y = vertices[stride + 1]),
        (vertex.z = vertices[stride + 2]));
    }
    function correctUV(uv, stride, vector, azimuth) {
      (azimuth < 0 && 1 === uv.x && (uvBuffer[stride] = uv.x - 1),
        0 === vector.x && 0 === vector.z && (uvBuffer[stride] = azimuth / 2 / Math.PI + 0.5));
    }
    function azimuth(vector) {
      return Math.atan2(vector.z, -vector.x);
    }
    (!(function subdivide(detail) {
      let a = new Vector3(),
        b = new Vector3(),
        c = new Vector3();
      for (let i = 0; i < indices.length; i += 3)
        (getVertexByIndex(indices[i + 0], a),
          getVertexByIndex(indices[i + 1], b),
          getVertexByIndex(indices[i + 2], c),
          subdivideFace(a, b, c, detail));
    })(detail),
      (function appplyRadius(radius) {
        for (var vertex = new Vector3(), i = 0; i < vertexBuffer.length; i += 3)
          ((vertex.x = vertexBuffer[i + 0]),
            (vertex.y = vertexBuffer[i + 1]),
            (vertex.z = vertexBuffer[i + 2]),
            vertex.normalize().multiplyScalar(radius),
            (vertexBuffer[i + 0] = vertex.x),
            (vertexBuffer[i + 1] = vertex.y),
            (vertexBuffer[i + 2] = vertex.z));
      })(radius),
      (function generateUVs() {
        let vertex = new Vector3();
        for (let i = 0; i < vertexBuffer.length; i += 3) {
          ((vertex.x = vertexBuffer[i + 0]),
            (vertex.y = vertexBuffer[i + 1]),
            (vertex.z = vertexBuffer[i + 2]));
          let u = azimuth(vertex) / 2 / Math.PI + 0.5,
            v =
              ((vector = vertex),
              Math.atan2(-vector.y, Math.sqrt(vector.x * vector.x + vector.z * vector.z)) /
                Math.PI +
                0.5);
          uvBuffer.push(u, 1 - v);
        }
        var vector;
        ((function correctUVs() {
          let a = new Vector3(),
            b = new Vector3(),
            c = new Vector3(),
            centroid = new Vector3(),
            uvA = new Vector2(),
            uvB = new Vector2(),
            uvC = new Vector2();
          for (let i = 0, j = 0; i < vertexBuffer.length; i += 9, j += 6) {
            (a.set(vertexBuffer[i + 0], vertexBuffer[i + 1], vertexBuffer[i + 2]),
              b.set(vertexBuffer[i + 3], vertexBuffer[i + 4], vertexBuffer[i + 5]),
              c.set(vertexBuffer[i + 6], vertexBuffer[i + 7], vertexBuffer[i + 8]),
              uvA.set(uvBuffer[j + 0], uvBuffer[j + 1]),
              uvB.set(uvBuffer[j + 2], uvBuffer[j + 3]),
              uvC.set(uvBuffer[j + 4], uvBuffer[j + 5]),
              centroid.copy(a).add(b).add(c).divideScalar(3));
            let azi = azimuth(centroid);
            (correctUV(uvA, j + 0, a, azi),
              correctUV(uvB, j + 2, b, azi),
              correctUV(uvC, j + 4, c, azi));
          }
        })(),
          (function correctSeam() {
            for (let i = 0; i < uvBuffer.length; i += 6) {
              let x0 = uvBuffer[i + 0],
                x1 = uvBuffer[i + 2],
                x2 = uvBuffer[i + 4],
                max = Math.max(x0, x1, x2),
                min = Math.min(x0, x1, x2);
              max > 0.9 &&
                min < 0.1 &&
                (x0 < 0.2 && (uvBuffer[i + 0] += 1),
                x1 < 0.2 && (uvBuffer[i + 2] += 1),
                x2 < 0.2 && (uvBuffer[i + 4] += 1));
            }
          })());
      })(),
      this.addAttribute("position", new GeometryAttribute(new Float32Array(vertexBuffer), 3)),
      this.addAttribute("normal", new GeometryAttribute(new Float32Array(vertexBuffer.slice()), 3)),
      this.addAttribute("uv", new GeometryAttribute(new Float32Array(uvBuffer), 2)),
      0 === detail ? this.computeVertexNormals() : this.normalizeNormals());
  }
}
