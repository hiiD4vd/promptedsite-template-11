Class(function Ktx2Transcoder() {
  Inherit(this, Component);
  const _this = this;
  var _transcoderReady,
    _basisAssets = ["~assets/js/lib/basis_transcoder.js", "~assets/js/lib/basis_transcoder.wasm"]
      .map(Assets.getPath)
      .map(Thread.absolutePath);
  async function initBasisTranscoder() {
    if (_transcoderReady) await _transcoderReady;
    else {
      _transcoderReady = Promise.create();
      let [js, wasmBinary] = await Promise.all(
          _basisAssets.map(async (path, i) => {
            let response = await fetch(path);
            return 0 === i ? response.text() : response.arrayBuffer();
          }),
        ),
        formats = (function getSupportedFormats() {
          let supported = {
            astc: !!Renderer.extensions.astc,
            etc1: !!Renderer.extensions.etc1,
            etc2: !!Renderer.extensions.etc,
            dxt: !!Renderer.extensions.s3tc,
            bptc: !!Renderer.extensions.bptc,
            pvrtc: !!Renderer.extensions.pvrtc,
            uncompressed: !0,
          };
          Renderer.type === Renderer.WEBGL2 && (supported.etc1 = !1);
          let formats = {};
          return (
            Object.keys(supported)
              .filter((id) => supported[id])
              .forEach((id) => {
                let format = { id: id, needsPowerOfTwo: !1 };
                switch (((formats[id] = format), id)) {
                  case "astc":
                    format.gliFormat = [
                      Renderer.extensions.astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                      Renderer.extensions.astc.COMPRESSED_RGBA_ASTC_4x4_KHR,
                    ];
                    break;
                  case "bptc":
                    format.gliFormat = [
                      Renderer.extensions.bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT,
                      Renderer.extensions.bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT,
                    ];
                    break;
                  case "dxt":
                    format.gliFormat = [
                      Renderer.extensions.s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT,
                      Renderer.extensions.s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT,
                    ];
                    break;
                  case "etc2":
                    format.gliFormat = [
                      Renderer.extensions.etc.COMPRESSED_RGB8_ETC2,
                      Renderer.extensions.etc.COMPRESSED_RGBA8_ETC2_EAC,
                    ];
                    break;
                  case "etc1":
                    format.gliFormat = [Renderer.extensions.etc.COMPRESSED_RGB_ETC1_WEBGL];
                    break;
                  case "pvrtc":
                    ((format.gliFormat = [
                      Renderer.extensions.pvrtc.COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
                      Renderer.extensions.pvrtc.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
                    ]),
                      (format.needsPowerOfTwo = !0));
                    break;
                  case "uncompressed":
                    format.gliFormat = [Renderer.context.RGBA, Renderer.context.RGBA];
                }
              }),
            formats
          );
        })(),
        threads = Thread.shared(!0).array;
      (await Promise.all(
        threads.map(async (thread) => {
          (thread.importCode(js),
            thread.loadFunction(initKtx2TranscoderThread),
            thread.loadFunction(function transcodeKtx2() {}),
            thread.loadFunction(function fetchAndMergeKtx2TextureArrays() {}),
            await thread.initKtx2TranscoderThread({ wasmBinary: wasmBinary, formats: formats }));
        }),
      ),
        _transcoderReady.resolve(),
        _this.flag("transcoderLoaded", !0));
    }
  }
  function initKtx2TranscoderThread(e, id) {
    var _formats;
    const KHR_DF_FLAG_ALPHA_PREMULTIPLIED = 1;
    async function transcodeKtx2({ path: path, params: params }, id) {
      try {
        let { buffers: buffers, ...result } = await fetchAndTranscodeKtx2(path, params);
        resolve({ path: path, ...result }, id, buffers);
      } catch (e) {
        (console.log(e.toString()),
          resolve({ fail: `${path} could not be decoded: ${e.message || e}` }, id));
      }
    }
    async function fetchAndMergeKtx2TextureArrays({ paths: paths, params: params }, id) {
      try {
        let results = await Promise.all(
          paths.map(async (path) => fetchAndTranscodeKtx2(path, params)),
        );
        for (let i = 1; i < results.length; ++i) {
          let result = results[i];
          ["width", "height", "gliFormat", "cube"].forEach((prop) => {
            if (result[prop] !== results[0][prop])
              throw new Error(`Layer ${prop} mismatch between ${paths[i]} and ${paths[0]}`);
          });
        }
        let {
          buffers: buffers,
          layers: layers,
          compressedData: compressedData,
          ...result
        } = results[0];
        ((buffers.length = 0), (layers = 0));
        for (let i = 0; i < compressedData.length; ++i) {
          let totalLength = 0;
          for (let j = 0; j < results.length; ++j)
            ((totalLength += results[j].compressedData[i].byteLength),
              0 === i && (layers += results[j].layers));
          let combined = new Uint8Array(totalLength),
            offset = 0;
          for (let j = 0; j < results.length; ++j) {
            let data = results[j].compressedData[i];
            (combined.set(data, offset), (offset += data.byteLength));
          }
          ((compressedData[i] = combined), (buffers[i] = combined.buffer));
        }
        resolve(
          {
            path: paths[0],
            paths: paths,
            ...result,
            layers: layers,
            compressedData: compressedData,
            isTextureArray: !0,
          },
          id,
          buffers,
        );
      } catch (e) {
        (console.log(e.toString()),
          resolve({ fail: `${paths[0]} could not be decoded: ${e.message || e}` }, id));
      }
    }
    async function fetchAndTranscodeKtx2(path, params) {
      let ktx2File;
      try {
        let response = await fetch(path);
        if (200 !== response.status) throw new Error(`Image not found :: ${path}`);
        let arrayBuffer = await response.arrayBuffer();
        if (
          ((ktx2File = new BasisModule.KTX2File(new Uint8Array(arrayBuffer))), !ktx2File.isValid())
        )
          throw new Error("Invalid or unsupported .ktx2 file");
        let ktxheader = ktx2File.getHeader(),
          basisFormat = ktx2File.isUASTC() ? "uastc" : "etc1s",
          baseWidth = ktx2File.getWidth(),
          baseHeight = ktx2File.getHeight(),
          baseDepth = ktxheader.pixelDepth,
          layers = Math.max(1, ktx2File.getLayers() || 1),
          levels = ktx2File.getLevels(),
          faceCount = ktx2File.getFaces(),
          hasAlpha = ktx2File.getHasAlpha(),
          premultiplyAlpha = !!(ktx2File.getDFDFlags() & KHR_DF_FLAG_ALPHA_PREMULTIPLIED);
        if (!baseWidth || !baseHeight || !levels) throw new Error("Invalid texture");
        let isLUT = params.isTexture3D && ktxheader.vkFormat && baseDepth;
        if (levels > 1 && !isLUT) {
          let level0Info = ktx2File.getImageLevelInfo(0, 0, 0);
          (level0Info.origWidth % 4 != 0 || level0Info.origHeight % 4 != 0) &&
            (console.warn(
              `${path} should use multiple-of-four dimensions. Falling back to uncompressed RGBA.`,
            ),
            (params.uncompressed = !0));
        }
        let {
          transcoderFormat: transcoderFormat,
          gliFormat: gliFormat,
          uncompressed: uncompressed,
        } = (function getTranscoderFormat(basisFormat, width, height, hasAlpha, params) {
          let format;
          format = params.uncompressed
            ? _formats.uncompressed
            : _formats[basisFormat].find(
                (format) =>
                  !(
                    (hasAlpha && format.transcoderFormat.length < 2) ||
                    (format.needsPowerOfTwo && !Math.isPowerOf2(width, height))
                  ),
              );
          let uncompressed = "uncompressed" === format.id;
          uncompressed &&
            !params.uncompressed &&
            console.warn("No suitable compressed texture format found. Decoding to RGBA32.");
          let which = hasAlpha ? 1 : 0;
          return {
            transcoderFormat: format.transcoderFormat[which],
            gliFormat: format.gliFormat[which],
            uncompressed: uncompressed,
          };
        })(basisFormat, baseWidth, baseHeight, hasAlpha, params);
        if (!ktx2File.startTranscoding()) throw new Error("startTranscoding failed");
        let buffers = [],
          compressedData = [],
          sizes = [],
          cube = 6 === faceCount;
        if (isLUT) {
          const channelCount = 4;
          let data = new Uint8Array(
            arrayBuffer.slice(
              baseWidth * baseHeight * baseDepth * ktxheader.typeSize * channelCount * -1,
            ),
          );
          (compressedData.push(data),
            buffers.push(data.buffer),
            sizes.push({ baseWidth: baseWidth, baseHeight: baseHeight, baseDepth: baseDepth }));
        } else
          for (let level = 0; level < levels; level++) {
            let totalLength = 0,
              transcodedSizes = [],
              levelInfo = ktx2File.getImageLevelInfo(level, 0, 0),
              width = levelInfo.origWidth,
              height = levelInfo.origHeight;
            0 !== level ||
              uncompressed ||
              ((width = levelInfo.width),
              (height = levelInfo.height),
              (baseWidth = width),
              (baseHeight = height));
            for (let layer = 0; layer < layers; ++layer)
              for (let faceIndex = 0; faceIndex < faceCount; ++faceIndex) {
                let byteLength = ktx2File.getImageTranscodedSizeInBytes(
                  level,
                  layer,
                  faceIndex,
                  transcoderFormat,
                );
                (transcodedSizes.push(byteLength), (totalLength += byteLength));
              }
            let data = new Uint8Array(totalLength),
              dataIndex = 0,
              dataOffset = 0;
            for (let layer = 0; layer < layers; ++layer)
              for (let faceIndex = 0; faceIndex < faceCount; ++faceIndex) {
                let byteLength = transcodedSizes[dataIndex],
                  faceData = data.subarray(dataOffset, dataOffset + byteLength);
                if (
                  !ktx2File.transcodeImage(
                    faceData,
                    level,
                    layer,
                    faceIndex,
                    transcoderFormat,
                    0,
                    -1,
                    -1,
                  )
                )
                  throw new Error("transcodeImage failed");
                ((dataIndex += 1), (dataOffset += byteLength));
              }
            (compressedData.push(data),
              buffers.push(data.buffer),
              sizes.push({ width: width, height: height }));
          }
        return {
          gliFormat: gliFormat,
          compressedData: compressedData,
          sizes: sizes,
          width: baseWidth,
          height: baseHeight,
          depth: baseDepth,
          layers: layers,
          isTextureArray: layers > 1 || ktx2File.getLayers() > 0,
          cube: cube,
          premultiplyAlpha: premultiplyAlpha,
          uncompressed: uncompressed,
          buffers: buffers,
        };
      } finally {
        ktx2File && (ktx2File.close(), ktx2File.delete());
      }
    }
    var BasisModule = {
      wasmBinary: e.wasmBinary,
      onRuntimeInitialized: function () {
        (BasisModule.initializeBasis(),
          (function initFormats(formats) {
            (Object.keys(formats).forEach((id) => {
              let format = formats[id];
              switch (id) {
                case "astc":
                  format.transcoderFormat = [
                    BasisModule.transcoder_texture_format.cTFASTC_4x4_RGBA.value,
                    BasisModule.transcoder_texture_format.cTFASTC_4x4_RGBA.value,
                  ];
                  break;
                case "bptc":
                  format.transcoderFormat = [
                    BasisModule.transcoder_texture_format.cTFBC7_RGBA.value,
                    BasisModule.transcoder_texture_format.cTFBC7_RGBA.value,
                  ];
                  break;
                case "dxt":
                  format.transcoderFormat = [
                    BasisModule.transcoder_texture_format.cTFBC1_RGB.value,
                    BasisModule.transcoder_texture_format.cTFBC3_RGBA.value,
                  ];
                  break;
                case "etc2":
                  format.transcoderFormat = [
                    BasisModule.transcoder_texture_format.cTFETC1_RGB.value,
                    BasisModule.transcoder_texture_format.cTFETC2_RGBA.value,
                  ];
                  break;
                case "etc1":
                  format.transcoderFormat = [
                    BasisModule.transcoder_texture_format.cTFETC1_RGB.value,
                  ];
                  break;
                case "pvrtc":
                  format.transcoderFormat = [
                    BasisModule.transcoder_texture_format.cTFPVRTC1_4_RGB.value,
                    BasisModule.transcoder_texture_format.cTFPVRTC1_4_RGBA.value,
                  ];
                  break;
                case "uncompressed":
                  format.transcoderFormat = [
                    BasisModule.transcoder_texture_format.cTFRGBA32.value,
                    BasisModule.transcoder_texture_format.cTFRGBA32.value,
                  ];
              }
            }),
              (_formats = {
                uastc: [
                  formats.astc,
                  formats.bptc,
                  formats.etc2,
                  formats.etc1,
                  formats.dxt,
                  formats.pvrtc,
                  formats.uncompressed,
                ].filter(Boolean),
                etc1s: [
                  formats.etc2,
                  formats.etc1,
                  formats.bptc,
                  formats.dxt,
                  formats.pvrtc,
                  formats.uncompressed,
                ].filter(Boolean),
                uncompressed: formats.uncompressed,
              }));
          })(e.formats),
          (self.transcodeKtx2 = transcodeKtx2),
          (self.fetchAndTranscodeKtx2 = fetchAndTranscodeKtx2),
          (self.fetchAndMergeKtx2TextureArrays = fetchAndMergeKtx2TextureArrays),
          delete self.initKtx2TranscoderThread,
          resolve(id));
      },
    };
    BASIS(BasisModule);
  }
  ((_this.transcode = async function ({ path: path, params: params }) {
    _this.flag("transcoderLoaded") || (await initBasisTranscoder());
    let result = await Thread.shared().transcodeKtx2({ path: path, params: params });
    if (result.fail) throw new Error(result.fail);
    return result;
  }),
    (_this.transcodeAndMergeTextureArrays = async function ({ paths: paths, params: params }) {
      _this.flag("transcoderLoaded") || (await initBasisTranscoder());
      let result = await Thread.shared().fetchAndMergeKtx2TextureArrays({
        paths: paths,
        params: params,
      });
      if (result.fail) throw new Error(result.fail);
      return result;
    }));
}, "static");
