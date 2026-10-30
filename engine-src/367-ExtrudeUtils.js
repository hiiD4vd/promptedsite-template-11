Class(function ExtrudeUtils() {
  Inherit(this, Component);
  const _this = this;
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
        (Curve.loadOnThread(thread),
          ["CurvePath", "Path", "Shape", "LineCurve", "ExtrudeGeometry"].forEach((name) => {
            thread.importES6Class(name);
          }),
          thread.importClass(Curve),
          thread.importClass(LinkedList),
          thread.importCode(`Class(${_this.constructor.toString()}, 'static')`),
          thread.importCode(`Class(${Earcut.constructor.toString()}, 'static')`));
      }));
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
    }));
}, "static");
