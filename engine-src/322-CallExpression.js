Module(function iOSGPUTest() {
  function hash3d() {
    var gl,
      program,
      canvas,
      mat4 = {
        create: function () {
          for (var result = new Array(16), i = 0; i < 16; i++) result[i] = i % 5 == 0 ? 1 : 0;
          return result;
        },
        perspective: function (out, fovy, aspect, near, far) {
          var nf,
            f = 1 / Math.tan(fovy / 2);
          return (
            (out[0] = f / aspect),
            (out[1] = 0),
            (out[2] = 0),
            (out[3] = 0),
            (out[4] = 0),
            (out[5] = f),
            (out[6] = 0),
            (out[7] = 0),
            (out[8] = 0),
            (out[9] = 0),
            (out[11] = -1),
            (out[12] = 0),
            (out[13] = 0),
            (out[15] = 0),
            null != far && far !== 1 / 0
              ? ((nf = 1 / (near - far)),
                (out[10] = (far + near) * nf),
                (out[14] = 2 * far * near * nf))
              : ((out[10] = -1), (out[14] = -2 * near)),
            out
          );
        },
        lookAt: function (out, eye, center, up) {
          var x0,
            x1,
            x2,
            y0,
            y1,
            y2,
            z0,
            z1,
            z2,
            len,
            eyex = eye[0],
            eyey = eye[1],
            eyez = eye[2],
            upx = up[0],
            upy = up[1],
            upz = up[2],
            centerx = center[0],
            centery = center[1],
            centerz = center[2];
          return Math.abs(eyex - centerx) < 1e-6 &&
            Math.abs(eyey - centery) < 1e-6 &&
            Math.abs(eyez - centerz) < 1e-6
            ? mat4.identity(out)
            : ((z0 = eyex - centerx),
              (z1 = eyey - centery),
              (z2 = eyez - centerz),
              (x0 = upy * (z2 *= len = 1 / Math.hypot(z0, z1, z2)) - upz * (z1 *= len)),
              (x1 = upz * (z0 *= len) - upx * z2),
              (x2 = upx * z1 - upy * z0),
              (len = Math.hypot(x0, x1, x2))
                ? ((x0 *= len = 1 / len), (x1 *= len), (x2 *= len))
                : ((x0 = 0), (x1 = 0), (x2 = 0)),
              (y0 = z1 * x2 - z2 * x1),
              (y1 = z2 * x0 - z0 * x2),
              (y2 = z0 * x1 - z1 * x0),
              (len = Math.hypot(y0, y1, y2))
                ? ((y0 *= len = 1 / len), (y1 *= len), (y2 *= len))
                : ((y0 = 0), (y1 = 0), (y2 = 0)),
              (out[0] = x0),
              (out[1] = y0),
              (out[2] = z0),
              (out[3] = 0),
              (out[4] = x1),
              (out[5] = y1),
              (out[6] = z1),
              (out[7] = 0),
              (out[8] = x2),
              (out[9] = y2),
              (out[10] = z2),
              (out[11] = 0),
              (out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez)),
              (out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez)),
              (out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez)),
              (out[15] = 1),
              out);
        },
        multiply: function (out, a, b) {
          var a00 = a[0],
            a01 = a[1],
            a02 = a[2],
            a03 = a[3],
            a10 = a[4],
            a11 = a[5],
            a12 = a[6],
            a13 = a[7],
            a20 = a[8],
            a21 = a[9],
            a22 = a[10],
            a23 = a[11],
            a30 = a[12],
            a31 = a[13],
            a32 = a[14],
            a33 = a[15],
            b0 = b[0],
            b1 = b[1],
            b2 = b[2],
            b3 = b[3];
          return (
            (out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30),
            (out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31),
            (out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32),
            (out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33),
            (b0 = b[4]),
            (b1 = b[5]),
            (b2 = b[6]),
            (b3 = b[7]),
            (out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30),
            (out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31),
            (out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32),
            (out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33),
            (b0 = b[8]),
            (b1 = b[9]),
            (b2 = b[10]),
            (b3 = b[11]),
            (out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30),
            (out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31),
            (out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32),
            (out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33),
            (b0 = b[12]),
            (b1 = b[13]),
            (b2 = b[14]),
            (b3 = b[15]),
            (out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30),
            (out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31),
            (out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32),
            (out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33),
            out
          );
        },
        identity: function (out) {
          return (
            (out[0] = 1),
            (out[1] = 0),
            (out[2] = 0),
            (out[3] = 0),
            (out[4] = 0),
            (out[5] = 1),
            (out[6] = 0),
            (out[7] = 0),
            (out[8] = 0),
            (out[9] = 0),
            (out[10] = 1),
            (out[11] = 0),
            (out[12] = 0),
            (out[13] = 0),
            (out[14] = 0),
            (out[15] = 1),
            out
          );
        },
      };
    var imageHash = 0;
    if (null != (canvas = document.createElement("canvas"))) {
      var imageData = (function generate() {
        if (
          (gl = (function getRenderingContext() {
            ((canvas.width = 67), (canvas.height = 67));
            var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            return (
              gl &&
                (gl.viewport(0, 0, 67, 67),
                gl.clearColor(0, 0, 0, 1),
                gl.clear(gl.COLOR_BUFFER_BIT)),
              gl
            );
          })())
        ) {
          var vertexShader = gl.createShader(gl.VERTEX_SHADER);
          (gl.shaderSource(
            vertexShader,
            "attribute vec3 c,d; uniform vec4 e; uniform vec3 f,g;uniform mat4 h,i;varying vec3 j;void main(){vec3 a=normalize(d);vec4 b=h*vec4(c,1.);vec3 k=normalize(vec3(e-b));j=g*f*max(dot(k,a),0.),gl_Position=i*vec4(c,1.);}",
          ),
            gl.compileShader(vertexShader));
          var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
          (gl.shaderSource(
            fragmentShader,
            "#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec3 j;void main(){gl_FragColor = vec4(j, 1.0);}",
          ),
            gl.compileShader(fragmentShader),
            (program = gl.createProgram()),
            gl.attachShader(program, vertexShader),
            gl.attachShader(program, fragmentShader),
            gl.linkProgram(program),
            gl.detachShader(program, vertexShader),
            gl.detachShader(program, fragmentShader),
            gl.deleteShader(vertexShader),
            gl.deleteShader(fragmentShader),
            gl.useProgram(program));
          var n = (function initVertexBuffers(gl) {
            var latNumber,
              longNumber,
              vertexPositionData = [],
              normalData = [],
              textureCoordData = [],
              indexData = [];
            for (latNumber = 0; latNumber <= 50; ++latNumber) {
              var theta = (latNumber * Math.PI) / 50,
                sinTheta = Math.sin(theta),
                cosTheta = Math.cos(theta);
              for (longNumber = 0; longNumber <= 50; ++longNumber) {
                var phi = (2 * longNumber * Math.PI) / 50,
                  sinPhi = Math.sin(phi),
                  x = Math.cos(phi) * sinTheta,
                  y = cosTheta,
                  z = sinPhi * sinTheta,
                  u = 1 - longNumber / 50,
                  v = 1 - latNumber / 50;
                (vertexPositionData.push(2 * x),
                  vertexPositionData.push(2 * y),
                  vertexPositionData.push(2 * z),
                  normalData.push(x),
                  normalData.push(y),
                  normalData.push(z),
                  textureCoordData.push(u),
                  textureCoordData.push(v));
              }
            }
            for (latNumber = 0; latNumber < 50; ++latNumber)
              for (longNumber = 0; longNumber < 50; ++longNumber) {
                var first = 51 * latNumber + longNumber,
                  second = first + 50 + 1;
                (indexData.push(first),
                  indexData.push(second),
                  indexData.push(first + 1),
                  indexData.push(second),
                  indexData.push(second + 1),
                  indexData.push(first + 1));
              }
            ((vertexPositionData = new Float32Array(vertexPositionData)),
              (normalData = new Float32Array(normalData)),
              (textureCoordData = new Float32Array(textureCoordData)),
              (indexData = new Uint16Array(indexData)));
            var vertexPositionBuffer = gl.createBuffer(),
              vertexNormalBuffer = gl.createBuffer(),
              indexBuffer = gl.createBuffer();
            (gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer),
              gl.bufferData(gl.ARRAY_BUFFER, vertexPositionData, gl.STATIC_DRAW));
            var VertexPosition = gl.getAttribLocation(program, "c");
            (gl.vertexAttribPointer(VertexPosition, 3, gl.FLOAT, !1, 0, 0),
              gl.enableVertexAttribArray(VertexPosition),
              gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer),
              gl.bufferData(gl.ARRAY_BUFFER, normalData, gl.STATIC_DRAW));
            var VertexNormal = gl.getAttribLocation(program, "d");
            return (
              gl.vertexAttribPointer(VertexNormal, 3, gl.FLOAT, !1, 0, 0),
              gl.enableVertexAttribArray(VertexNormal),
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer),
              gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW),
              indexData.length
            );
          })(gl);
          (gl.clearColor(0, 0, 0, 1), gl.enable(gl.DEPTH_TEST));
          var projection = mat4.create();
          mat4.perspective(projection, Math.PI / 6, 1, 0.1, 100);
          var modelView = mat4.create();
          mat4.lookAt(modelView, [0, 0, 10], [0, 0, 0], [0, 1, 0]);
          var mvpMatrix = mat4.create();
          mat4.multiply(mvpMatrix, projection, modelView);
          var ModelViewMatrix = gl.getUniformLocation(program, "h");
          gl.uniformMatrix4fv(ModelViewMatrix, !1, modelView);
          var MVP = gl.getUniformLocation(program, "i");
          gl.uniformMatrix4fv(MVP, !1, mvpMatrix);
          var LightPosition = gl.getUniformLocation(program, "e");
          gl.uniform4fv(LightPosition, [10, 10, 10, 1]);
          var Kd = gl.getUniformLocation(program, "f");
          gl.uniform3fv(Kd, [0.9, 0.5, 0.3]);
          var Ld = gl.getUniformLocation(program, "g");
          return (
            gl.uniform3fv(Ld, [1, 1, 1]),
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT),
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0),
            (function cleanup() {
              (gl.useProgram(null), program && gl.deleteProgram(program));
            })(),
            canvas.toDataURL()
          );
        }
      })();
      imageData &&
        (imageHash = (function fnvHash(str) {
          for (var h = 2166136261, i = 0; i < str.length; ++i)
            ((h ^= str.charCodeAt(i)),
              (h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)));
          return h >>> 0;
        })(imageData));
    }
    return ((Global.iOSGPUHASH3D = imageHash), imageHash);
  }
  const { hash: hash, primeTest: primeTest } = require("GPUCalculations");
  function getRenderer(complete) {
    var maxRetries = 3,
      decisionTree = {
        Version: "1.657943",
        PublishDate: "2025-11-27T03:52:57.209Z",
        Data: [
          { x: "Unknown", m: () => family(), n: [108, 3, 2, 1] },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A8X GPU|Apple A9 GPU|Apple A9X GPU|Apple A10 GPU|Apple A10X GPU|Apple A11 GPU|Apple A12 GPU|Apple A12X GPU|Apple A12Z GPU|Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple A16 GPU|Apple A17 Pro GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => height(),
            n: [109, 63, 60, 61, 62, 47, 45, 46, 33, 36, 32, 34, 35, 23, 18, 19, 11, 6, 7, 5],
            v: ["Macintosh"],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU|Apple A12 GPU|Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple A16 GPU|Apple A17 Pro GPU",
            m: () => height(),
            n: [60, 61, 62, 44, 45, 46, 30, 31, 23, 17, 12, 6, 7],
            v: ["iPhone"],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A8X GPU|Apple A9 GPU|Apple A9X GPU|Apple A10 GPU|Apple A10X GPU|Apple A12 GPU|Apple A12X GPU|Apple A12Z GPU|Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => height(),
            n: [109, 110, 63, 47, 33, 32, 18, 4],
            v: ["iPad"],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A8X GPU|Apple A9 GPU|Apple A9X GPU|Apple A10 GPU|Apple A10X GPU|Apple A12 GPU|Apple A12X GPU|Apple A12Z GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => mediacolorgamut(),
            n: [16, 13],
            v: [2048],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A8X GPU|Apple A9 GPU|Apple A9X GPU|Apple A10 GPU|Apple A10X GPU|Apple A12 GPU|Apple A12X GPU|Apple A12Z GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => mediacolorgamut(),
            n: [16, 14],
            v: [2048],
          },
          {
            x: "Apple A11 GPU|Apple A12 GPU|Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple A16 GPU|Apple A17 Pro GPU",
            m: () => hash3d(),
            n: [114, 73, 74, 72, 75, 21, 26, 20, 8],
            v: [2436],
          },
          {
            x: "Apple A11 GPU|Apple A12 GPU|Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple A16 GPU|Apple A17 Pro GPU",
            m: () => hash3d(),
            n: [121, 120, 115, 50, 27, 28, 21, 9],
            v: [2079],
          },
          {
            x: "Apple A12 GPU|Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple A16 GPU|Apple A17 Pro GPU",
            m: () => hash(),
            n: [43, 15],
            v: [3711606621],
          },
          {
            x: "Apple A12 GPU|Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple A16 GPU|Apple A17 Pro GPU",
            m: () => hash(),
            n: [103, 10],
            v: [3711606621],
          },
          { x: "Apple A14 GPU|Apple A15 GPU|Apple A16 GPU|Apple A17 Pro GPU", v: [235283973] },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU|Apple A13 GPU|Apple A15 GPU",
            m: () => mediacolorgamut(),
            n: [38, 25],
            v: [1136],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU|Apple A13 GPU|Apple A15 GPU",
            m: () => mediacolorgamut(),
            n: [37, 38],
            v: [1136],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A8X GPU|Apple A9 GPU|Apple A9X GPU|Apple A10 GPU",
            m: () => hash(),
            n: [149, 148, 89, 90, 91, 92, 55, 56, 58, 54, 57],
            v: ["srgb"],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A8X GPU|Apple A9 GPU|Apple A9X GPU|Apple A10 GPU",
            m: () => hash(),
            n: [149, 153, 97, 98, 92, 55, 56, 58, 54],
            v: ["srgb"],
          },
          { x: "Apple A14 GPU|Apple A15 GPU|Apple A16 GPU|Apple A17 Pro GPU", v: [235283973] },
          {
            x: "Apple A9X GPU|Apple A10X GPU|Apple A12 GPU|Apple A12X GPU|Apple A12Z GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => hash3d(),
            n: [150, 126, 127, 94, 93, 95, 79],
            v: ["p3"],
          },
          {
            x: "Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU|Apple A13 GPU|Apple A15 GPU",
            m: () => mediacolorgamut(),
            n: [68, 39],
            v: [1334],
          },
          {
            x: "Apple A9X GPU|Apple A10X GPU|Apple A12X GPU|Apple A12Z GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => mediacolorgamut(),
            n: [111, 24],
            v: [2732],
          },
          {
            x: "Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU|Apple A13 GPU|Apple A15 GPU",
            m: () => mediacolorgamut(),
            n: [70, 39],
            v: [1334],
          },
          {
            x: "Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple A16 GPU",
            m: () => hash(),
            n: [157, 100, 42],
            v: [3403189785],
          },
          { x: "Apple A14 GPU|Apple A15 GPU", m: () => hash(), n: [22], v: [2364051618] },
          { x: "Apple A14 GPU|Apple A15 GPU", v: [2775654583] },
          {
            x: "Apple A14 GPU|Apple A15 GPU",
            m: () => hash3d(),
            n: [74, 51, 40, 21, 29, 179],
            v: [2532],
          },
          {
            x: "Apple A10X GPU|Apple A12X GPU|Apple A12Z GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => hash3d(),
            n: [152, 151, 150, 126, 127, 41],
            v: ["p3"],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A9 GPU|Apple A10 GPU",
            m: () => hash3d(),
            n: [155, 156, 99],
            v: ["srgb"],
          },
          { x: "Apple A14 GPU|Apple A15 GPU|Apple A16 GPU", v: [46273595] },
          {
            x: "Apple A13 GPU|Apple A14 GPU|Apple A15 GPU|Apple A16 GPU",
            m: () => hash(),
            n: [157, 101, 102],
            v: [3403189785],
          },
          { x: "Apple A14 GPU|Apple A15 GPU|Apple A16 GPU", v: [46273595] },
          { x: "Apple A14 GPU|Apple A15 GPU", m: () => hash(), n: [178, 179], v: [3711606621] },
          {
            x: "Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU",
            m: () => mediacolorgamut(),
            n: [64, 65],
            v: [2001],
          },
          {
            x: "Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU",
            m: () => mediacolorgamut(),
            n: [66, 67],
            v: [2208],
          },
          {
            x: "Apple A12X GPU|Apple A12Z GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => hash3d(),
            n: [126, 127, 79, 78],
            v: [2388],
          },
          { x: "Apple A14 GPU|Apple M1 GPU", m: () => mediacolorgamut(), n: [112, 48], v: [2360] },
          {
            x: "Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU",
            m: () => mediacolorgamut(),
            n: [69, 67],
            v: [2208],
          },
          {
            x: "Apple A8 GPU|Apple A9 GPU|Apple A10 GPU|Apple A11 GPU",
            m: () => mediacolorgamut(),
            n: [71, 65],
            v: [2001],
          },
          {
            x: "Apple A14 GPU|Apple A15 GPU|Apple M2 GPU",
            m: () => ratio(),
            n: [113, 49],
            v: [2778],
          },
          {
            x: "Apple A7 GPU|Apple A8 GPU|Apple A9 GPU",
            m: () => hash(),
            n: [130, 131, 82, 83, 84],
            v: ["srgb"],
          },
          {
            x: "Apple A10 GPU|Apple A11 GPU|Apple A13 GPU|Apple A15 GPU",
            m: () => hash3d(),
            n: [132, 133, 118, 134, 85, 86],
            v: ["p3"],
          },
          {
            x: "Apple A10 GPU|Apple A11 GPU|Apple A13 GPU|Apple A15 GPU",
            m: () => hash(),
            n: [144, 145, 147, 146, 87, 88],
            v: ["p3"],
          },
          { x: "Apple A14 GPU|Apple A15 GPU", m: () => hash(), n: [100, 104], v: [3403189785] },
          {
            x: "Apple A10X GPU|Apple A12Z GPU|Apple M1 GPU|Apple M2 GPU",
            m: () => hash(),
            n: [174, 107, 159, 106],
            v: [3403189785],
          },
          { x: "Apple A14 GPU|Apple A15 GPU|Apple A16 GPU", v: [2775654583] },
          { x: "Apple A12 GPU|Apple A13 GPU", v: [3565683531] },
          {
            x: "Apple A14 GPU|Apple A15 GPU",
            m: () => hash3d(),
            n: [74, 122, 77, 52, 29],
            v: [2778],
          },
          { x: "Apple A16 GPU|Apple A17 Pro GPU", m: () => hash3d(), n: [123], v: [2796] },
          { x: "Apple A16 GPU|Apple A17 Pro GPU", m: () => hash3d(), n: [123, 177, 53], v: [2556] },
          {
            x: "Apple A10 GPU|Apple A12 GPU|Apple A13 GPU",
            m: () => hash(),
            n: [128, 129, 80, 81],
            v: [2160],
          },
          { x: "Apple A14 GPU|Apple M1 GPU", m: () => hash3d(), n: [74, 96, 59], v: ["p3"] },
          { x: "Apple A14 GPU|Apple A15 GPU", m: () => hash3d(), n: [74, 122, 77, 52, 29], v: [3] },
          { x: "Apple A14 GPU", v: [105985484, 679860869] },
          { x: "Apple A15 GPU", v: [46273595, 679860869] },
          { x: "Apple A14 GPU|Apple A15 GPU", m: () => hash(), n: [22], v: [3403189785] },
          { x: "Apple A16 GPU|Apple A17 Pro GPU", v: [3711606621] },
          { x: "Apple A7 GPU", v: [1915583345] },
          { x: "Apple A9 GPU|Apple A9X GPU|Apple A10 GPU", v: [3129316290, 3249312110] },
          {
            x: "Apple A9 GPU|Apple A9X GPU|Apple A10 GPU",
            m: () => hash3d(),
            n: [168, 105],
            v: [2114570256],
          },
          { x: "Apple A7 GPU", v: [857422828] },
          {
            x: "Apple A9 GPU|Apple A9X GPU|Apple A10 GPU",
            m: () => hash3d(),
            n: [171],
            v: [63583436],
          },
          { x: "Apple A14 GPU|Apple M1 GPU", m: () => hash(), n: [175, 107], v: [3403189785] },
          { x: "Apple A12 GPU|Apple A13 GPU", m: () => hash3d(), n: [116, 115, 76], v: [2688] },
          { x: "Apple A12 GPU|Apple A13 GPU", m: () => hash3d(), n: [118, 117, 76], v: [1624] },
          { x: "Apple A12 GPU|Apple A13 GPU", m: () => hash3d(), n: [118, 119, 76], v: [1792] },
          { x: "Apple A10X GPU|Apple A12 GPU", m: () => hash(), n: [125, 124], v: [2224] },
          { x: "Apple A8 GPU|Apple A9 GPU", m: () => hash(), n: [135, 136], v: ["srgb"] },
          { x: "Apple A10 GPU|Apple A11 GPU", m: () => hash(), n: [137, 138], v: ["p3"] },
          { x: "Apple A8 GPU|Apple A9 GPU", m: () => hash(), n: [139, 140], v: ["srgb"] },
          { x: "Apple A10 GPU|Apple A11 GPU", m: () => hash(), n: [137, 141], v: ["p3"] },
          { x: "Apple A8 GPU|Apple A9 GPU", m: () => hash(), n: [142, 143], v: ["srgb"] },
          { x: "Apple A8 GPU|Apple A9 GPU", m: () => hash(), n: [154, 140], v: ["srgb"] },
          { x: "Apple A8 GPU|Apple A9 GPU", m: () => hash(), n: [154, 143], v: ["srgb"] },
          { x: "Apple A8 GPU|Apple A9 GPU", m: () => hash(), n: [154, 136], v: ["srgb"] },
          { x: "Apple A12 GPU", v: [958581112, 4085158452] },
          { x: "Apple A13 GPU", v: [1278953537, 3335845976, 4193218782] },
          { x: "Apple A14 GPU", v: [105985484] },
          { x: "Apple A12 GPU", v: [2301174800] },
          { x: "Apple A12 GPU|Apple A13 GPU", v: [3711606621] },
          { x: "Apple A14 GPU|Apple A15 GPU", m: () => hash(), n: [104], v: [2364051618] },
          { x: "Apple A12X GPU|Apple A12Z GPU", v: [4085158452] },
          { x: "Apple M1 GPU|Apple M2 GPU", m: () => hash(), n: [158, 159], v: [3403189785] },
          { x: "Apple A12 GPU|Apple A13 GPU", m: () => hash3d(), n: [160, 75], v: [2206992415] },
          { x: "Apple A12 GPU|Apple A13 GPU", m: () => hash3d(), n: [160, 75], v: [2866949877] },
          { x: "Apple A9 GPU", v: [46663968, 3129316290] },
          { x: "Apple A9 GPU", v: [2114570256] },
          { x: "Apple A9 GPU", v: [63583436] },
          { x: "Apple A13 GPU|Apple A15 GPU", m: () => hash(), n: [161, 162], v: [3403189785] },
          { x: "Apple A13 GPU|Apple A15 GPU", m: () => hash(), n: [163, 164], v: [3711606621] },
          { x: "Apple A11 GPU|Apple A13 GPU", m: () => hash3d(), n: [165, 166], v: [1349146759] },
          { x: "Apple A11 GPU|Apple A13 GPU", m: () => hash3d(), n: [167, 160], v: [2206992415] },
          { x: "Apple A8 GPU|Apple A8X GPU", v: [1361285941, 3816812018, 4125234388] },
          { x: "Apple A8 GPU|Apple A8X GPU", m: () => hash3d(), n: [169, 170], v: [4005673483] },
          { x: "Apple A8 GPU|Apple A8X GPU", m: () => hash3d(), n: [169], v: [1350183384] },
          { x: "Apple A8 GPU|Apple A8X GPU", m: () => hash3d(), n: [173, 172], v: [2870741841] },
          { x: "Apple A9X GPU|Apple A10X GPU", v: [583354101, 3458129248] },
          { x: "Apple A12 GPU|Apple A12X GPU", v: [4085158452] },
          { x: "Apple A9X GPU|Apple A10X GPU", v: [3928876783] },
          { x: "Apple M1 GPU", v: [2364051618] },
          { x: "Apple A8 GPU|Apple A8X GPU", m: () => hash3d(), n: [176, 170], v: [4005673483] },
          { x: "Apple A8 GPU|Apple A8X GPU", v: [1361285941] },
          { x: "Apple A9 GPU", v: [583354101, 3403189785, 3458129248, 3928876783] },
          { x: "Apple A14 GPU", v: [1349146759, 1444462398] },
          { x: "Apple A14 GPU", v: [1444462398] },
          { x: "Apple A15 GPU|Apple A16 GPU", v: [2775654583] },
          { x: "Apple A12 GPU|Apple A13 GPU", v: [3565683531] },
          { x: "Apple A15 GPU", v: [2775654583] },
          { x: "Apple A9X GPU|Apple A10 GPU", v: [3458129248] },
          { x: "Apple A12Z GPU|Apple M1 GPU", v: [1349146759] },
          { x: "Apple M1 GPU", v: [1444462398] },
          { x: "Apple A10 GPU", v: ["iPod Touch"] },
          { x: "Apple A15 GPU", v: [2266] },
          { x: "Apple M2 GPU", v: [2778] },
          { x: "Apple A9X GPU", v: ["srgb"] },
          { x: "Apple A14 GPU", v: ["srgb"] },
          { x: "Apple M2 GPU", v: [2] },
          { x: "Apple A11 GPU", v: [367695777, 411650080, 1220644697] },
          { x: "Apple A12 GPU", v: [958581112, 2301174800, 4085158452] },
          { x: "Apple A13 GPU", v: [352823931, 1278953537, 3335845976, 4193218782] },
          { x: "Apple A12 GPU", v: [0, 958581112, 2301174800, 3403189785, 4085158452] },
          { x: "Apple A13 GPU", v: [352823931, 3335845976, 4193218782] },
          { x: "Apple A12 GPU", v: [958581112, 2301174800, 3403189785, 4085158452] },
          { x: "Apple A11 GPU", v: [367695777, 411650080] },
          { x: "Apple A13 GPU", v: [352823931, 1278953537, 3335845976] },
          { x: "Apple A15 GPU", v: [1407135659] },
          { x: "Apple A16 GPU", v: [46273595, 3403189785] },
          { x: "Apple A10X GPU", v: [63583436, 2114570256, 3129316290, 3249312110] },
          { x: "Apple A12 GPU", v: [1349146759, 2917249763] },
          { x: "Apple M1 GPU", v: [105985484, 2364051618] },
          { x: "Apple M2 GPU", v: [46273595] },
          { x: "Apple A10 GPU", v: [2114570256] },
          { x: "Apple A12 GPU", v: [1349146759] },
          { x: "Apple A7 GPU", v: [857422828, 1915583345] },
          { x: "Apple A8 GPU", v: [839732043, 3816812018, 4125234388] },
          { x: "Apple A10 GPU", v: [583354101, 3458129248, 3928876783] },
          { x: "Apple A11 GPU", v: [367695777, 411650080, 1220644697, 1804407534] },
          { x: "Apple A15 GPU", v: [2364051618] },
          { x: "Apple A8 GPU", v: [1411440593, 1924197914, 4125234388] },
          { x: "Apple A9 GPU", v: [2114570256, 3129316290] },
          { x: "Apple A10 GPU", v: [63583436, 2114570256, 3129316290] },
          { x: "Apple A11 GPU", v: [1349146759, 2206992415, 2917249763, 2946940121] },
          { x: "Apple A8 GPU", v: [1411440593, 1913250432, 3074367344, 4125234388] },
          { x: "Apple A9 GPU", v: [46663968, 2114570256, 3129316290] },
          { x: "Apple A11 GPU", v: [2206992415, 2917249763, 2946940121, 3237505312] },
          { x: "Apple A8 GPU", v: [3128296539, 3816812018, 4125234388] },
          { x: "Apple A9 GPU", v: [46663968, 63583436, 2114570256, 3129316290] },
          { x: "Apple A10 GPU", v: [46663968, 63583436, 2114570256, 3129316290] },
          { x: "Apple A11 GPU", v: [2917249763, 2946940121, 3237505312] },
          { x: "Apple A15 GPU", v: [235283973, 1444462398, 2775654583] },
          { x: "Apple A13 GPU", v: [2866949877, 3565683531] },
          { x: "Apple A8 GPU", v: [2656686317, 3710391565] },
          { x: "Apple A10 GPU", v: [46663968] },
          { x: "Apple A12Z GPU", v: [958581112, 2301174800, 2487400911] },
          { x: "Apple A12X GPU", v: [4085158452] },
          { x: "Apple A10X GPU", v: [583354101, 3458129248, 3928876783] },
          { x: "Apple A8X GPU", v: [1350183384, 3816812018, 4125234388] },
          { x: "Apple A8 GPU", v: [4125234388] },
          { x: "Apple A7 GPU", v: [1966062736] },
          { x: "Apple A8 GPU", v: [2998196247] },
          { x: "Apple A13 GPU", v: [2866949877] },
          { x: "Apple M1 GPU", v: [1349146759, 1444462398] },
          { x: "Apple M2 GPU", v: [2775654583] },
          { x: "Apple A13 GPU", v: [3335845976] },
          { x: "Apple A13 GPU", v: [1349146759] },
          { x: "Apple A15 GPU", v: [1444462398] },
          { x: "Apple A13 GPU", v: [3565683531] },
          { x: "Apple A15 GPU", v: [235283973] },
          { x: "Apple A11 GPU", v: [411650080, 1220644697] },
          { x: "Apple A13 GPU", v: [352823931, 3403189785, 4193218782] },
          { x: "Apple A11 GPU", v: [367695777] },
          { x: "Apple A10 GPU", v: [3403189785] },
          { x: "Apple A8X GPU", v: [1783160115] },
          { x: "Apple A8 GPU", v: [3928382683] },
          { x: "Apple A10 GPU", v: [1058363647, 2015944978] },
          { x: "Apple A8 GPU", v: [3312905059, 3928382683] },
          { x: "Apple A8X GPU", v: [1480368425, 1783160115, 3403189785] },
          { x: "Apple A10X GPU", v: [2114570256] },
          { x: "Apple A14 GPU", v: [1349146759] },
          { x: "Apple A8X GPU", v: [1783160115, 3403189785] },
          { x: "Apple A17 Pro GPU", v: [256903246] },
          { x: "Apple A14 GPU", v: [235283973] },
          { x: "Apple A15 GPU", v: [256903246, 2370695082] },
        ],
      };
    /*! VERSION = 1.657943 */ function evaluateNode(node, iterations) {
      if (node.m) {
        var result = node.m(node);
        result || "" === result
          ? result.then ||
            (function resolveNode(node, value, iterations) {
              for (var i = 0; i < node.n.length; i++) {
                var child = decisionTree.Data[node.n[i]];
                if (child.r)
                  for (var c = 0; c < child.r.length; c++) {
                    var range = child.r[c];
                    if (
                      (null === range.a || value >= range.a) &&
                      (null === range.b || value <= range.b)
                    )
                      return void evaluateNode(child, 0);
                  }
                else if (child.v && -1 != child.v.indexOf(value))
                  return void evaluateNode(child, 0);
              }
              node.n.length > 0 && iterations < maxRetries
                ? setTimeout(function () {
                    evaluateNode(node, iterations + 1);
                  }, 10)
                : complete(node.x);
            })(node, result, iterations)
          : node.x && complete(node.x);
      } else complete(node.x);
    }
    evaluateNode(decisionTree.Data[0], 0);
  }
  function height() {
    return window.screen.height * window.devicePixelRatio;
  }
  function ratio() {
    return window.devicePixelRatio;
  }
  function mediacolorgamut() {
    return (function getMediaSingleValue(name, possibleValues) {
      for (var i = 0; i < possibleValues.length; i++)
        if (
          ((query = "(" + name + ": " + possibleValues[i] + ")"), window.matchMedia(query).matches)
        )
          return possibleValues[i];
      var query;
      return "n/a";
    })("color-gamut", ["p3", "srgb"]);
  }
  function family() {
    var segments = /iPhone|iPad|Macintosh/.exec(navigator.userAgent);
    return segments && segments.length > 0 ? segments[0] : "";
  }
  this.exports = {
    async getRenderer() {
      let rendererPromise = Promise.create();
      getRenderer(rendererPromise.resolve);
      let result = await rendererPromise;
      if ("Unknown" !== result) {
        if (result.includes("|")) {
          let gpus = result.split("|");
          result = gpus.last();
        }
        return result;
      }
    },
    fallbackTest: function fallbackTest(time = primeTest()) {
      let res = Math.min(screen.width, screen.height) + "x" + Math.max(screen.width, screen.height);
      if (((Global.iOSGPUFALLBACKTEST = time), time < 100)) return "apple a18";
      switch (res) {
        case "320x480":
          return "legacy";
        case "320x568":
          return time <= 400 ? "apple a8" : time <= 500 ? "apple a7" : "legacy";
        case "375x812":
        case "414x896":
          return time <= 150 ? "apple a13" : time <= 180 ? "apple a12" : "apple a11";
        case "414x736":
        case "375x667":
          return time <= 220
            ? "apple a11"
            : time <= 250
              ? "apple a10"
              : time <= 360
                ? "apple a9"
                : time <= 400
                  ? "apple a8"
                  : time <= 600
                    ? "apple a7"
                    : "legacy";
        default:
        case "768x1024":
          return time <= 140
            ? "apple a14"
            : time <= 160
              ? "apple a13"
              : time <= 180
                ? "apple a12"
                : time <= 220
                  ? "apple a11"
                  : time <= 250
                    ? "apple a10"
                    : time <= 360
                      ? "apple a9"
                      : time <= 400
                        ? "apple a8"
                        : time <= 600
                          ? "apple a7"
                          : "legacy";
        case "834x1112":
          return time <= 160
            ? "apple a13"
            : time <= 180
              ? "apple a12"
              : time <= 220
                ? "apple a11"
                : "apple a10";
        case "834x1194":
          if (time <= 140) return "apple m1 gpu";
          if (time <= 160) return "apple a13";
          if (time <= 180) return "apple a12";
          break;
        case "810x1080":
          if (time <= 160) return "apple a13";
          if (time <= 220) return "apple a11";
          if (time <= 250) return "apple a10";
          break;
        case "820x1180":
          return "apple a14";
        case "428x926":
        case "390x844":
          return "apple a15";
        case "1024x1366":
          return time <= 140
            ? "apple m1 gpu"
            : time <= 160
              ? "apple a13"
              : time <= 180
                ? "apple a12"
                : time <= 220
                  ? "apple a11"
                  : time <= 250
                    ? "apple a10"
                    : "apple a9";
      }
    },
    primeTest: primeTest,
    family: family,
    width: function width() {
      return window.screen.width * window.devicePixelRatio;
    },
    height: height,
    mediacolorgamut: mediacolorgamut,
    hash3d: hash3d,
    hash: hash,
    ratio: ratio,
  };
});
