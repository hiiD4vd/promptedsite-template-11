Class(function ShapeUtils() {
  Inherit(this, Component);
  const _this = this;
  function getShapeGeom({ commands: commands, holes: holes, subdivisions: subdivisions }, id) {
    let geom = commandsToShapeGeom(commands, holes, subdivisions),
      position = geom.attributes.position.array,
      index = geom.index,
      bb = geom.boundingBox;
    resolve({ position: position, index: index, bb: bb }, id, [position.buffer, index.buffer]);
  }
  function commandsToShapeGeom(commands, holes, curveSegments) {
    let shape = new Shape();
    commands.forEach((array) => {
      let cmd = array.shift();
      shape[cmd].apply(shape, array);
    });
    let path = new Path();
    (holes.forEach((array) => {
      let cmd = array.shift();
      "endPath" === cmd
        ? (shape.holes.push(path), (path = new Path()))
        : path[cmd].apply(path, array);
    }),
      path.curves.length && shape.holes.push(path));
    let geom = new ShapeGeometry(shape, curveSegments);
    return (geom.computeBoundingBox(), geom);
  }
  function removeDupEndPts(points) {
    let l = points.length;
    l > 2 && points[l - 1].equals(points[0]) && points.pop();
  }
  function addContour(vertices, contour) {
    for (let i = 0; i < contour.length; i++)
      (vertices.push(contour[i].x), vertices.push(contour[i].y));
  }
  (!(async function () {
    window.THREAD ||
      (await Hydra.ready(),
      Thread.shared(!0).array.forEach((thread) => {
        (thread.loadFunction(commandsToShapeGeom),
          thread.importModule("Shape2DInterpolations"),
          [
            "ShapeGeometry",
            "Curve3D",
            "CurvePath",
            "EllipseCurve",
            "Path",
            "CubicBezierCurve2D",
            "LineCurve",
            "Shape",
            "SplineCurve",
          ].forEach((name) => {
            thread.importES6Class(name);
          }),
          thread.importCode(`Class(${_this.constructor.toString()}, 'static')`),
          thread.importCode(`Class(${Earcut.constructor.toString()}, 'static')`));
      }),
      Thread.upload(getShapeGeom));
  })(),
    (this.area = function (contour) {
      let n = contour.length,
        a = 0;
      for (let p = n - 1, q = 0; q < n; p = q++)
        a += contour[p].x * contour[q].y - contour[q].x * contour[p].y;
      return 0.5 * a;
    }),
    (this.isClockWise = function (pts) {
      return _this.area(pts) < 0;
    }),
    (this.triangulateShape = function (contour, holes) {
      let vertices = [],
        holeIndices = [],
        faces = [];
      (removeDupEndPts(contour), addContour(vertices, contour));
      let holeIndex = contour.length;
      holes.forEach(removeDupEndPts);
      for (let i = 0; i < holes.length; i++)
        (holeIndices.push(holeIndex),
          (holeIndex += holes[i].length),
          addContour(vertices, holes[i]));
      let triangles = Earcut.triangulate(vertices, holeIndices);
      for (let i = 0; i < triangles.length; i += 3) faces.push(triangles.slice(i, i + 3));
      return faces;
    }),
    (this.process = async function (shape) {
      let { geom: geom, commands: commands, subdivisions: subdivisions } = shape,
        holes = shape.holes.commands,
        data = await Thread.shared().getShapeGeom({
          commands: commands,
          holes: holes,
          subdivisions: subdivisions,
        });
      ((geom.attributes.position.array = data.position),
        (geom.attributes.position.needsUpdate = !0),
        (geom.attributes.position.needsNewBuffer = !0),
        (geom.attributes.position.count = data.position.length / 3),
        (geom.boundingBox = data.bb),
        geom.setIndex(data.index),
        (geom.indexNeedsUpdate = !0));
    }),
    (window.$glShape = function () {
      return new GLUIShape();
    }));
}, "static");
