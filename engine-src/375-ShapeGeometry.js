class ShapeGeometry extends Geometry {
  constructor(shapes, curveSegments) {
    (super(),
      (this.type = "ShapeGeometry"),
      (this.parameters = { shapes: shapes, curveSegments: curveSegments }));
    let indices = [],
      vertices = [];
    if (!1 === Array.isArray(shapes)) addShape(shapes);
    else for (let i = 0; i < shapes.length; i++) addShape(shapes[i]);
    function addShape(shape) {
      let i,
        l,
        shapeHole,
        indexOffset = vertices.length / 3,
        points = shape.extractPoints(curveSegments),
        shapeVertices = points.shape,
        shapeHoles = points.holes;
      for (
        !1 === ShapeUtils.isClockWise(shapeVertices) && (shapeVertices = shapeVertices.reverse()),
          i = 0,
          l = shapeHoles.length;
        i < l;
        i++
      )
        ((shapeHole = shapeHoles[i]),
          !0 === ShapeUtils.isClockWise(shapeHole) && (shapeHoles[i] = shapeHole.reverse()));
      let faces = ShapeUtils.triangulateShape(shapeVertices, shapeHoles);
      for (i = 0, l = shapeHoles.length; i < l; i++)
        ((shapeHole = shapeHoles[i]), (shapeVertices = shapeVertices.concat(shapeHole)));
      for (i = 0, l = shapeVertices.length; i < l; i++) {
        let vertex = shapeVertices[i];
        vertices.push(vertex.x, vertex.y, 0);
      }
      for (i = 0, l = faces.length; i < l; i++) {
        let face = faces[i],
          a = face[0] + indexOffset,
          b = face[1] + indexOffset,
          c = face[2] + indexOffset;
        indices.push(a, b, c);
      }
    }
    ((this.index = new (Geometry.arrayNeedsUint32(indices) ? Uint32Array : Uint16Array)(indices)),
      this.addAttribute("position", new GeometryAttribute(new Float32Array(vertices), 3)));
  }
}
