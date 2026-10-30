class TorusKnotGeometry extends Geometry {
  constructor(radius = 1, tube = 0.4, tubularSegments = 64, radialSegments = 8, p = 2, q = 3) {
    super();
    let i,
      j,
      indices = [],
      vertices = [],
      normals = [],
      uvs = [],
      vertex = new Vector3(),
      normal = new Vector3(),
      P1 = new Vector3(),
      P2 = new Vector3(),
      B = new Vector3(),
      T = new Vector3(),
      N = new Vector3();
    for (i = 0; i <= tubularSegments; ++i) {
      let u = (i / tubularSegments) * p * Math.PI * 2;
      for (
        calculatePositionOnCurve(u, p, q, radius, P1),
          calculatePositionOnCurve(u + 0.01, p, q, radius, P2),
          T.subVectors(P2, P1),
          N.addVectors(P2, P1),
          B.crossVectors(T, N),
          N.crossVectors(B, T),
          B.normalize(),
          N.normalize(),
          j = 0;
        j <= radialSegments;
        ++j
      ) {
        let v = (j / radialSegments) * Math.PI * 2,
          cx = -tube * Math.cos(v),
          cy = tube * Math.sin(v);
        ((vertex.x = P1.x + (cx * N.x + cy * B.x)),
          (vertex.y = P1.y + (cx * N.y + cy * B.y)),
          (vertex.z = P1.z + (cx * N.z + cy * B.z)),
          vertices.push(vertex.x, vertex.y, vertex.z),
          normal.subVectors(vertex, P1).normalize(),
          normals.push(normal.x, normal.y, normal.z),
          uvs.push(i / tubularSegments),
          uvs.push(j / radialSegments));
      }
    }
    for (j = 1; j <= tubularSegments; j++)
      for (i = 1; i <= radialSegments; i++) {
        let a = (radialSegments + 1) * (j - 1) + (i - 1),
          b = (radialSegments + 1) * j + (i - 1),
          c = (radialSegments + 1) * j + i,
          d = (radialSegments + 1) * (j - 1) + i;
        (indices.push(a, b, d), indices.push(b, c, d));
      }
    function calculatePositionOnCurve(u, p, q, radius, position) {
      let cu = Math.cos(u),
        su = Math.sin(u),
        quOverP = (q / p) * u,
        cs = Math.cos(quOverP);
      ((position.x = radius * (2 + cs) * 0.5 * cu),
        (position.y = radius * (2 + cs) * su * 0.5),
        (position.z = radius * Math.sin(quOverP) * 0.5));
    }
    (this.setIndex(new (Geometry.arrayNeedsUint32(indices) ? Uint32Array : Uint16Array)(indices)),
      this.addAttribute("position", new GeometryAttribute(new Float32Array(vertices), 3)),
      this.addAttribute("normal", new GeometryAttribute(new Float32Array(normals), 3)),
      this.addAttribute("uv", new GeometryAttribute(new Float32Array(uvs), 2)));
  }
}
