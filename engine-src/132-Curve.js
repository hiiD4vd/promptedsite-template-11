Class(
  function Curve(_input, _type) {
    Inherit(this, Component);
    const _this = this;
    var _curve;
    function initFromFlatArray(array) {
      let points = [];
      for (let i = 0; i < array.length; i += 3)
        points.push(new Vector3(array[i + 0], array[i + 1], array[i + 2]));
      ((_this.points = points), initCurve(points));
    }
    function initFromVecArray(points) {
      ((_this.points = points), initCurve(points));
    }
    function initFromSplineData(data) {
      if ("bezier" === data.metadata.type) {
        _type = "cubicBezier";
        let pointsAndTangents = [];
        for (let i = 0; i < data.points.length / 3; ++i) {
          let point = new Vector3().fromArray(data.points, 3 * i),
            tangent0 = new Vector3().fromArray(data.tangents, 6 * i),
            tangent1 = new Vector3().fromArray(data.tangents, 6 * i + 3);
          (tangent0.add(point),
            tangent1.add(point),
            i > 0 && pointsAndTangents.push(tangent0),
            pointsAndTangents.push(point),
            i < data.points.length / 3 - 1 && pointsAndTangents.push(tangent1));
        }
        initFromVecArray(pointsAndTangents);
      } else {
        if ("linear" !== data.metadata.type)
          throw new Error(`Unsupported spline type "${data.metadata.type}"`);
        ((_type = "line"), initFromFlatArray(data.points));
      }
    }
    function initCurve(input) {
      switch (_type) {
        case "line":
          _curve = new CurvePath();
          for (let i = 0; i < input.length - 1; i += 1) {
            let newCurve = new LineCurve(input[i], input[i + 1]);
            _curve.add(newCurve);
          }
          break;
        case "cubicBezier":
          _curve = new CurvePath();
          for (let i = 0; i < input.length - 3; i += 3) {
            let p0 = input[i],
              p1 = input[i + 1],
              p2 = input[i + 2],
              p3 = input[i + 3],
              newCurve = new CubicBezierCurve(p0, p1, p2, p3);
            _curve.add(newCurve);
          }
          break;
        default:
          _curve = new CatmullRomCurve(input);
      }
    }
    ((this.root = new Group()),
      Array.isArray(_input) && Array.isArray(_input[0])
        ? (function initFromArray() {
            let points = [];
            for (let i = 0; i < _input.length; i++) points.push(new Vector3().fromArray(_input[i]));
            ((_this.points = points), initCurve(points));
          })()
        : Array.isArray(_input) && _input[0] instanceof Vector3
          ? initFromVecArray(_input)
          : Array.isArray(_input) && "number" == typeof _input[0]
            ? initFromFlatArray(_input)
            : _input instanceof CurvePath
              ? (_curve = _input)
              : (function initFromObj(obj) {
                  if ("string" == typeof obj) {
                    let name = obj;
                    if (!(obj = Assets.JSON[obj])) throw `No curve ${name} found`;
                    obj.curves = obj.curves[0];
                  } else {
                    if (obj.curves && Array.isArray(obj.curves) && obj.curves[0].metadata)
                      return initFromSplineData(obj.curves[0]);
                    if (obj.metadata) return initFromSplineData(obj);
                    obj.curves = Array.isArray(obj.curves[0]) ? obj.curves[0] : obj.curves;
                  }
                  for (var data = obj.curves, points = [], j = 0; j < data.length; j += 3)
                    points.push(new Vector3(data[j + 0], data[j + 1], data[j + 2]));
                  initCurve(points);
                })(_input),
      (this.debug = function () {
        let points = _curve.getPoints(50),
          geometry = new Geometry().setFromPoints(points),
          shader = Utils3D.getTestShader(4095),
          curveObject = new Line(geometry, shader);
        return (_this.root.add(curveObject), _this.root);
      }),
      (this.getPointAt = function (t) {
        ((t = Math.max(0, Math.min(1, t))),
          !window.THREAD && this.root.matrixDirty && this.root.updateMatrixWorld());
        let pos = _curve.getPointAt(t);
        return (!window.THREAD && pos.applyMatrix4 && pos.applyMatrix4(this.root.matrixWorld), pos);
      }),
      (this.getPoint = function (t) {
        ((t = Math.max(0, Math.min(1, t))),
          !window.THREAD && this.root.matrixDirty && this.root.updateMatrixWorld());
        let pos = _curve.getPoint(t);
        return (!window.THREAD && pos.applyMatrix4 && pos.applyMatrix4(this.root.matrixWorld), pos);
      }),
      (this.getTangent = function (t) {
        ((t = Math.max(0, Math.min(1, t))),
          !window.THREAD && this.root.matrixDirty && this.root.updateMatrixWorld());
        let pos = _curve.getTangent(t);
        return (!window.THREAD && pos.applyMatrix4 && pos.applyMatrix4(this.root.matrixWorld), pos);
      }),
      (this.applyDataTexture = function (shader, subdivisions) {
        if (!_this.dataTexture) {
          let size = ((num) => {
              var values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
              for (let i = 0; i < values.length; i++) {
                var p2 = values[i];
                if (p2 * p2 >= num) return p2;
              }
            })(subdivisions),
            total = size * size,
            buffer = new Float32Array(3 * total);
          for (let i = 0; i < total; i++) {
            let percent = i / (total - 1),
              pos = _this.getPoint(percent);
            ((buffer[3 * i + 0] = pos.x), (buffer[3 * i + 1] = pos.y), (buffer[3 * i + 2] = pos.z));
          }
          _this.dataTexture = new DataTexture(buffer, size, size, Texture.RGBFormat, Texture.FLOAT);
        }
        shader.addUniforms({
          tCurve: { value: _this.dataTexture },
          uCurveSize: { value: _this.dataTexture.width },
        });
      }),
      (this.onDestroy = function () {
        _this.dataTexture && _this.dataTexture.destroy();
      }),
      this.set("closed", (v) => {
        _curve.closed = v;
      }),
      this.get("curve", (_) => _curve));
  },
  (_) => {
    ((Curve.parseFile = async function (data) {
      "string" == typeof data && (data = await get(Assets.getPath(data)));
      let curves = [];
      return (
        data.curves.forEach((array) => {
          curves.push(new Curve({ curves: [array] }));
        }),
        curves
      );
    }),
      (Curve.loadOnThread = function (thread) {
        thread._curveLoaded ||
          ((thread._curveLoaded = !0),
          thread.importES6Class("CubicPoly"),
          thread.importES6Class("Curve3D"),
          thread.importES6Class("CurvePath"),
          thread.importES6Class("CatmullRomCurve"),
          thread.importES6Class("CubicBezierCurve"),
          thread.importES6Class("LineCurve"),
          thread.importClass(Curve));
      }));
  },
);
