class PlaneGeometry extends Geometry {
  constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
    super();
    let ix,
      iy,
      width_half = width / 2,
      height_half = height / 2,
      gridX = Math.floor(widthSegments) || 1,
      gridY = Math.floor(heightSegments) || 1,
      gridX1 = gridX + 1,
      gridY1 = gridY + 1,
      segment_width = width / gridX,
      segment_height = height / gridY,
      indices = [],
      vertices = [],
      normals = [],
      uvs = [];
    for (iy = 0; iy < gridY1; iy++) {
      let y = iy * segment_height - height_half;
      for (ix = 0; ix < gridX1; ix++) {
        let x = ix * segment_width - width_half;
        (vertices.push(x, -y, 0),
          normals.push(0, 0, 1),
          uvs.push(ix / gridX),
          uvs.push(1 - iy / gridY));
      }
    }
    for (iy = 0; iy < gridY; iy++)
      for (ix = 0; ix < gridX; ix++) {
        let a = ix + gridX1 * iy,
          b = ix + gridX1 * (iy + 1),
          c = ix + 1 + gridX1 * (iy + 1),
          d = ix + 1 + gridX1 * iy;
        (indices.push(a, b, d), indices.push(b, c, d));
      }
    (this.setIndex(new (Geometry.arrayNeedsUint32(indices) ? Uint32Array : Uint16Array)(indices)),
      this.addAttribute("position", new GeometryAttribute(new Float32Array(vertices), 3)),
      this.addAttribute("normal", new GeometryAttribute(new Float32Array(normals), 3)),
      this.addAttribute("uv", new GeometryAttribute(new Float32Array(uvs), 2)));
  }
}
