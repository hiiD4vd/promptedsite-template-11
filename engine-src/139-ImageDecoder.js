Class(function ImageDecoder() {
  Inherit(this, Component);
  var _ktx1Settings,
    _this = this;
  ((this.scale = 1), (this.disableFallbackImage = !1));
  var _offscreen = {},
    doDecodeImage =
      "createImageBitmap" in window
        ? (path, params) => Thread.shared().decodeImage({ path: path, params: params })
        : (path, params) => Assets.decodeImage(path, params);
  function decodeImage(data, id) {
    (async () => {
      try {
        let e = await fetch(data.path, { mode: "cors" });
        if (200 != e.status) throw `Image not found: ${data.path}`;
        let blob = await e.blob(),
          obj = { imageOrientation: "flipY", crossOrigin: "anonymous" };
        (data.params && !1 === data.params.premultiplyAlpha && (obj.premultiplyAlpha = "none"),
          (obj.imageOrientation = data.params && !1 === data.params.flipY ? void 0 : "flipY"));
        let bitmap = await createImageBitmap(blob, obj),
          message = { post: !0, id: id, message: bitmap };
        self.postMessage(message, [bitmap]);
      } catch (e) {
        resolve({ fail: `${data.path} could not be decoded: ${e.message || e}` }, id);
      }
    })();
  }
  function decodeCubeLUT(data, id) {
    (async () => {
      try {
        let cube = await get(data.path, { mode: "cors" });
        cube = cube
          .replace(/^#.*?(\n|\r)/gm, "")
          .replace(/^\s*?(\n|\r)/gm, "")
          .trim();
        let cubesize = findNumberAfterString(cube, "LUT_3D_SIZE", !0),
          domain_min = findNumberAfterString(cube, "DOMAIN_MIN"),
          domain_max = findNumberAfterString(cube, "DOMAIN_MAX");
        ((cube = removeCubeHeader(cube, "TITLE")),
          (cube = removeCubeHeader(cube, "LUT_3D_SIZE")),
          (cube = removeCubeHeader(cube, "DOMAIN_MIN")),
          (cube = removeCubeHeader(cube, "DOMAIN_MAX")));
        let rgba = [];
        if (
          (cube
            .split(/\s+/)
            .filter((substr) => substr.length > 0)
            .forEach((element, index) => {
              (rgba.push(+element),
                (index + 1) % 3 == 0 && index !== 4 * Math.pow(cubesize, 3) - 1 && rgba.push(1));
            }),
          rgba.forEach((e, i) => {
            (domain_min &&
              domain_max &&
              (rgba[i] = Math.map(rgba[i], domain_min, domain_max, 0, 1)),
              (rgba[i] = Math.clamp(Math.round(255 * rgba[i]), 0, 255)));
          }),
          rgba.length !== cubesize ** 3 * 4)
        )
          throw `LUT .cube at ${data.path} has length mismatch: claims cube size of ${cubesize} but has ${rgba.length} elements.`;
        let imgBmp = new Uint8Array(rgba);
        resolve({ imgBmp: imgBmp, cubesize: cubesize }, id);
      } catch (e) {
        resolve({ fail: `${data.path} could not be decoded: ${e.message || e}` }, id);
      }
    })();
  }
  function decodeKtx1CompressedImage(data, id) {
    (async () => {
      let ext;
      data.settings.dxt
        ? (ext = "dxt")
        : data.settings.etc
          ? (ext = "astc")
          : data.settings.pvrtc
            ? (ext = "pvrtc")
            : data.settings.astc && (ext = "astc");
      let fileName = data.path.split("/");
      fileName = fileName[fileName.length - 1];
      let e = await fetch(`${data.path}/${fileName}-${ext}.ktx`);
      if (200 != e.status) throw `Image not found :: ${data.path}`;
      let arrayBuffer = await e.arrayBuffer(),
        header = new Int32Array(arrayBuffer, 12, 13),
        gliFormat = (header[1], header[2], header[3], header[4]),
        baseWidth = (header[5], header[6]),
        baseHeight = header[7],
        width = baseWidth,
        height = baseHeight,
        numberOfArrayElements = header[9],
        numberOfFaces = header[10],
        miplevels = header[11],
        buffers = [],
        compressedData = [],
        sizes = [],
        cube = 6 === numberOfFaces && 0 === numberOfArrayElements,
        dataOffset = 64 + header[12];
      for (let level = 0; level < miplevels; level++) {
        let imageSize = new Int32Array(arrayBuffer, dataOffset, 1)[0];
        ((dataOffset += 4), cube && (imageSize *= 6));
        let byteArray = new Uint8Array(arrayBuffer, dataOffset, imageSize);
        ((dataOffset += imageSize),
          (dataOffset += 3 - ((imageSize + 3) % 4)),
          sizes.push(width),
          (width = Math.max(1, 0.5 * width)),
          (height = Math.max(1, 0.5 * height)));
        let clone = new Uint8Array(byteArray);
        (compressedData.push(clone), buffers.push(clone.buffer));
      }
      resolve(
        {
          gliFormat: gliFormat,
          compressedData: compressedData,
          sizes: sizes,
          width: baseWidth,
          height: baseHeight,
          cube: cube,
        },
        id,
        buffers,
      );
    })().catch((e) => {
      (console.log(e.toString()),
        resolve({ fail: `${data.path} could not be decoded: ${e.message || e}` }, id));
    });
  }
  function renderOnQuad(image, compressionExtensions) {
    let aspect = image.width / image.height,
      width = Math.round(aspect > 1 ? 128 : 128 * aspect),
      height = Math.round(aspect > 1 ? 128 / aspect : 128);
    const gl = new OffscreenCanvas(width, height).getContext("webgl");
    if (!gl) throw new Error("Unable to initialize offscreen WebGL canvas");
    function loadShader(gl, shaderSource, shaderType) {
      const shader = gl.createShader(shaderType);
      (gl.shaderSource(shader, shaderSource), gl.compileShader(shader));
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const lastError = gl.getShaderInfoLog(shader);
        throw (gl.deleteShader(shader), new Error("Shader compile error: " + lastError));
      }
      return shader;
    }
    let vs = loadShader(
        gl,
        "\nattribute vec4 a_position;\nvarying vec2 v_texcoord;\n\nvoid main() {\n    gl_Position = a_position;\n    v_texcoord = a_position.xy * 0.5 + 0.5;\n}",
        gl.VERTEX_SHADER,
      ),
      fs = loadShader(
        gl,
        "\nprecision mediump float;\nvarying vec2 v_texcoord;\nuniform sampler2D u_texture;\n\nvoid main() {\n    gl_FragColor = texture2D(u_texture, v_texcoord);\n}",
        gl.FRAGMENT_SHADER,
      ),
      program = (function createProgram(gl, shaders) {
        const program = gl.createProgram();
        if (
          (shaders.forEach(function (shader) {
            gl.attachShader(program, shader);
          }),
          gl.linkProgram(program),
          !gl.getProgramParameter(program, gl.LINK_STATUS))
        ) {
          const lastError = gl.getProgramInfoLog(program);
          throw (
            gl.deleteProgram(program),
            shaders.forEach(function (shader) {
              gl.deleteShader(shader);
            }),
            new Error("Shader link error:" + lastError)
          );
        }
        return program;
      })(gl, [vs, fs]);
    var positionLocation = gl.getAttribLocation(program, "a_position"),
      positionBuffer = gl.createBuffer();
    (gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer),
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW),
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height),
      gl.clear(gl.COLOR_BUFFER_BIT));
    const tex = gl.createTexture();
    (gl.bindTexture(gl.TEXTURE_2D, tex),
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR),
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR),
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !0));
    let ext = {};
    compressionExtensions.forEach((str) => {
      switch (str) {
        case "astc":
          ext.astc = gl.getExtension("WEBGL_compressed_texture_astc");
          break;
        case "atc":
          ext.atc = gl.getExtension("WEBGL_compressed_texture_atc");
          break;
        case "etc":
          ext.etc = gl.getExtension("WEBGL_compressed_texture_etc");
          break;
        case "etc1":
          ext.etc1 = gl.getExtension("WEBGL_compressed_texture_etc1");
          break;
        case "pvrtc":
          ext.pvrtc =
            gl.getExtension("WEBGL_compressed_texture_pvrtc") ||
            gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
          break;
        case "s3tc":
          ext.s3tc =
            gl.getExtension("WEBGL_compressed_texture_s3tc") ||
            gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
          break;
        case "bptc":
          ext.bptc = gl.getExtension("EXT_texture_compression_bptc");
          break;
        case "s3tc_srgb":
          ext.s3tc_srgb = gl.getExtension("WEBGL_compressed_texture_s3tc_srgb");
      }
    });
    let index = image.sizes.findIndex((e) => e.width <= 128 && e.height <= 128);
    (gl.compressedTexImage2D(
      gl.TEXTURE_2D,
      0,
      image.gliFormat,
      image.sizes[index].width,
      image.sizes[index].height,
      0,
      image.compressedData[index],
    ),
      gl.useProgram(program),
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer),
      gl.enableVertexAttribArray(positionLocation),
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, !1, 0, 0),
      gl.drawArrays(gl.TRIANGLES, 0, 3),
      gl.useProgram(null));
    let data = new Uint8Array(65536);
    return (gl.readPixels(0, 0, 128, 128, gl.RGBA, gl.UNSIGNED_BYTE, data), data);
  }
  function findDominantColors(e, id) {
    function calculateCenterColor(colors) {
      let center = new ColorLAB();
      return (
        colors.forEach((color) => {
          ((center.l += color.l), (center.a += color.a), (center.b += color.b));
        }),
        colors.length &&
          ((center.l /= colors.length), (center.a /= colors.length), (center.b /= colors.length)),
        center
      );
    }
    try {
      let data;
      if (e.compressionExtensions) data = renderOnQuad(e.image, e.compressionExtensions);
      else if (e.image) {
        let aspect = e.image.width / e.image.height,
          max = 128,
          width = Math.round(aspect > 1 ? max : max * aspect),
          height = Math.round(aspect > 1 ? max / aspect : max),
          ctx = new OffscreenCanvas(width, height).getContext("2d");
        (ctx.drawImage(e.image, 0, 0, width, height),
          (data = ctx.getImageData(0, 0, width, height).data));
      } else data = e.data;
      let count = data.length / 4,
        colors = [],
        j = 0;
      for (let i = 0; i < count; ++i)
        (data[j + 3] > 25 &&
          colors.push(new ColorLAB().setRGB(data[j] / 255, data[j + 1] / 255, data[j + 2] / 255)),
          (j += 4));
      let results = (function kmeans(colors, k, minDiff) {
        let clusters = (function getInitialClusters(colors, k) {
          const sums = colors.map((color) => [color.l + color.a + color.b, color]);
          sums.sort((a, b) => a[0] - b[0]);
          const centroids = [...Array(k)].map((_, i) => {
            const shardSize = Math.floor(sums.length / k);
            return calculateCenterColor(
              sums
                .slice(shardSize * i, i === k - 1 ? sums.length : shardSize * (i + 1))
                .map((sum) => sum[1]),
            );
          });
          for (let i = 0; i < centroids.length - 1; ++i) {
            const color = centroids[i],
              nextColor = centroids[i + 1];
            color.l === nextColor.l &&
              color.a === nextColor.a &&
              color.b === nextColor.b &&
              (centroids.splice(i + 1, 1), (i -= 1));
          }
          return centroids.map((color) => [color, []]);
        })(colors, k);
        k = clusters.length;
        for (let i = 1; ; i++) {
          let lists = [...Array(k)].map(() => []);
          for (let j = 0; j < colors.length; j++) {
            let c = colors[j],
              smallestDistance = 1 / 0,
              idx = 0;
            for (let i = 0; i < k; i++) {
              let distance = c.deltaECIE94(clusters[i][0]);
              distance < smallestDistance && ((smallestDistance = distance), (idx = i));
            }
            lists[idx].push(c);
          }
          let diff = 0;
          for (let i = 0; i < k; i++) {
            let old = clusters[i],
              center = calculateCenterColor(lists[i]),
              newCluster = [center, lists[i]],
              dist = old[0].deltaECIE94(center);
            ((clusters[i] = newCluster), (diff = diff > dist ? diff : dist));
          }
          if (diff < minDiff || 50 === i) break;
        }
        return clusters;
      })(colors, "number" == typeof e.numColors ? e.numColors : 4, 1 / 255).filter(
        (cluster) => cluster[1].length,
      );
      (results.sort((a, b) => b[1].length - a[1].length),
        (results = results.map((result) => result[0].getRGB())),
        resolve({ colors: results }, id));
    } catch (e) {
      throw (resolve({ fail: e.message || e }, id), e);
    }
  }
  function findNumberAfterString(source, str, toInt = !1) {
    const regex = new RegExp(str + "\\D*([0-9]*\\.?[0-9]+)"),
      num = source.match(regex);
    return num && num[1] ? (toInt ? parseInt(num[1]) : parseFloat(num[1])) : null;
  }
  function removeCubeHeader(source, str) {
    const regex = new RegExp(str + "[\\s\\S]*?(\\n+)"),
      match = source.match(regex);
    if (match) {
      const newlineIndex = match.index + match[0].length - 1;
      return source.slice(newlineIndex + 1);
    }
    return source;
  }
  function checkCapabilities() {
    if (
      (void 0 === _offscreen["2d"] &&
        (_offscreen["2d"] =
          "OffscreenCanvas" in window && !!new OffscreenCanvas(1, 1).getContext("2d")),
      void 0 === _offscreen.webgl &&
        ((_offscreen.webgl =
          "OffscreenCanvas" in window && !!new OffscreenCanvas(1, 1).getContext("webgl")),
        _offscreen.webgl))
    ) {
      let compressionExtensions = ["compressed_texture", "texture_compression"],
        enabledExtensions = Device.graphics.webgl?.extensions || [],
        dedupe = {};
      _offscreen.compressionExtensions = enabledExtensions
        .map((ext) =>
          compressionExtensions
            .map((name) => {
              let index = ext.indexOf(name);
              if (!(index < 0))
                return (
                  (index += name.length),
                  "_" === ext.charAt(index) && (index += 1),
                  ext.substring(index)
                );
            })
            .find(Boolean),
        )
        .filter((ext) => !(!ext || dedupe[ext]) && (dedupe[ext] = !0));
    }
  }
  (!(async function () {
    (await Hydra.ready(),
      Thread.upload(decodeImage),
      Thread.upload(decodeCubeLUT),
      Thread.upload(findNumberAfterString),
      Thread.upload(removeCubeHeader),
      Thread.upload(renderOnQuad),
      Thread.upload(findDominantColors),
      Thread.upload(decodeKtx1CompressedImage));
  })(),
    (this.decode = async function (path, params = {}) {
      let fallback = Thread.absolutePath(Assets.getPath("assets/images/_scenelayout/uv.jpg"));
      if (((path = Thread.absolutePath(Assets.getPath(path))), void 0 === _ktx1Settings)) {
        _ktx1Settings = {
          dxt: !!Renderer.extensions.s3tc,
          etc: !!Renderer.extensions.etc1,
          pvrtc: !!Renderer.extensions.pvrtc,
          astc: !!Renderer.extensions.astc,
        };
        let found = !1;
        for (let key in _ktx1Settings) !0 === _ktx1Settings[key] && (found = !0);
        found || (_ktx1Settings = null);
      }
      let bitmap,
        compressedIdentifier = /-compressedKtx2?/.exec(path)?.[0],
        compressed =
          !!compressedIdentifier && (compressedIdentifier.endsWith("2") ? "ktx2" : "ktx1");
      if (
        ((Utils.query("noKtx") || (!_ktx1Settings && "ktx1" === compressed)) &&
          ((path = path.replace(compressedIdentifier, "")), (compressed = !1)),
        /\.ktx2(?:\?|#|$)/.test(path) &&
          ((compressed = "ktx2"), Utils.query("noKtx") && (params.uncompressed = !0)),
        compressed &&
          params.hintUsingPixelData &&
          (checkCapabilities(),
          _offscreen.webgl ||
            ("ktx2" === compressed
              ? (params.uncompressed = !0)
              : ((path = path.replace(compressedIdentifier, "")), (compressed = !1)))),
        compressed)
      )
        try {
          if (
            ((path = path.substring(0, path.lastIndexOf("."))),
            (bitmap =
              "ktx1" === compressed
                ? await Thread.shared().decodeKtx1CompressedImage({
                    path: path,
                    params: params,
                    settings: _ktx1Settings,
                  })
                : await Ktx2Transcoder.transcode({ path: `${path}.ktx2`, params: params })),
            !bitmap.fail)
          )
            return bitmap;
        } catch (e) {
          bitmap = { fail: e.message };
        }
      else bitmap = await doDecodeImage(path, params);
      if (bitmap.fail && !this.disableFallbackImage) {
        const fallbackBitmap = await doDecodeImage(fallback, params);
        fallbackBitmap.fail || (bitmap = fallbackBitmap);
      }
      if (bitmap.fail) throw new Error(bitmap.fail);
      return (function process(bitmap, scale) {
        if (1 == scale * _this.scale) return bitmap;
        let pow2 = Math.isPowerOf2(bitmap.width, bitmap.height),
          canvas = document.createElement("canvas");
        return (
          (canvas.context = canvas.getContext("2d")),
          (canvas.width = Math.round(bitmap.width * _this.scale * scale)),
          (canvas.height = Math.round(bitmap.height * _this.scale * scale)),
          pow2 &&
            scale * _this.scale < 1 &&
            (canvas.width = canvas.height =
              Math.floorPowerOf2(Math.max(canvas.width, canvas.height))),
          canvas.context.drawImage(bitmap, 0, 0, canvas.width, canvas.height),
          canvas
        );
      })(bitmap, params.scale || 1);
    }),
    (this.decodeCubeLUT = async function (path, params) {
      let fallback = Thread.absolutePath(Assets.getPath("assets/images/_scenelayout/invert.cube"));
      path = Thread.absolutePath(Assets.getPath(path));
      try {
        let bitmap = await Thread.shared().decodeCubeLUT({ path: path, params: params });
        if (
          bitmap.fail &&
          !this.disableFallbackImage &&
          ((bitmap = await Thread.shared().decodeCubeLUT({ path: fallback, params: params })),
          bitmap.fail)
        )
          throw "could not decode " + path;
        return { imgBmp: bitmap.imgBmp, cubesize: bitmap.cubesize };
      } catch (e) {
        throw "could not decode " + path;
      }
    }),
    (this.decodeAndMergeTextureArrays = async function (paths, params) {
      ((paths = paths.map((path) => Thread.absolutePath(Assets.getPath(path)))),
        Utils.query("noKtx") && (params.uncompressed = !0));
      let bitmap = await Ktx2Transcoder.transcodeAndMergeTextureArrays({
        paths: paths,
        params: params,
      });
      if (bitmap.fail) throw new Error(bitmap.fail);
      return bitmap;
    }),
    (this.parseColors = async function (image, numColors = 4) {
      let result;
      if ((checkCapabilities(), image.sizes))
        if (_offscreen.webgl)
          result = await Thread.shared().findDominantColors({
            image: image,
            numColors: numColors,
            compressionExtensions: _offscreen.compressionExtensions,
          });
        else {
          let index = image.sizes.findIndex((e) => e.width <= 128 && e.height <= 128);
          index = Math.max(0, index);
          let data = (image = await _this.decode(image.path + "-compressedKtx2", {
            uncompressed: !0,
          })).compressedData[index];
          result = await Thread.shared().findDominantColors({ data: data, numColors: numColors }, [
            data.buffer,
          ]);
        }
      else if (_offscreen["2d"]) {
        let buffers = [];
        (image instanceof HTMLImageElement &&
          ((image = await createImageBitmap(image)), buffers.push(image)),
          (result = await Thread.shared().findDominantColors(
            { image: image, numColors: numColors },
            buffers,
          )));
      } else {
        let canvas = document.createElement("canvas");
        canvas.context = canvas.getContext("2d");
        let aspect = image.width / image.height,
          max = 128;
        ((canvas.width = Math.round(aspect > 1 ? max : max * aspect)),
          (canvas.height = Math.round(aspect > 1 ? max / aspect : max)),
          canvas.context.drawImage(image, 0, 0, canvas.width, canvas.height));
        let data = canvas.context.getImageData(0, 0, canvas.width, canvas.height).data;
        result = await Thread.shared().findDominantColors({ data: data, numColors: numColors }, [
          data.buffer,
        ]);
      }
      if (result.fail) throw new Error(result.fail);
      return result.colors.map((color) => new Color().copy(color));
    }));
}, "static");
