Class(function GainMapEncoder() {
  Inherit(this, Events);
  const _this = this,
    { getType: getType } = require("GLTypes");
  function fboToArray(fbo, width = 1, height = 1) {
    return (
      (function setFBOBufferType(fbo, width = 1, height = 1) {
        const possibleTypes = {};
        ((possibleTypes[Texture.UNSIGNED_BYTE] = Uint8ClampedArray),
          (possibleTypes[Texture.FLOAT] = Float32Array),
          (possibleTypes[Texture.HALF_FLOAT] = Uint16Array));
        const Type = possibleTypes[fbo.texture ? fbo.texture.type : fbo.type];
        Type || console.warn(`Can't find texture type ${fbo.texture.type}`);
        fbo.__pixelBuffer = new Type(width * height * 4);
      })(fbo, width, height),
      World.RENDERER.readPixels(
        fbo,
        0,
        0,
        width,
        height,
        fbo.__pixelBuffer,
        getType(fbo.texture) || World.RENDERER.context.FLOAT,
      )
    );
  }
  ((_this.IS_DEBUG = !1),
    (_this.encode = async function (path) {
      const texture = await HDRLoader.load(path, {
          format: Texture.RGBAFormat,
          type: Texture.FLOAT,
        }),
        textureMax = (function findTextureMax(texture) {
          const cellSize = 2,
            shader = new Shader("FindTextureMinMaxShader", {
              tMap: { value: texture },
              uCellSize: { value: cellSize },
              uSize: { value: new Vector2(texture.width, texture.height) },
              depthWrite: !1,
            }),
            mesh = new Mesh(World.QUAD, shader);
          mesh.frustumCulled = !1;
          const frameBuffers = [];
          let w = texture.width,
            h = texture.height;
          for (; w > 1 || h > 1;) {
            ((w = Math.max(1, ((w + cellSize - 1) / cellSize) | 0)),
              (h = Math.max(1, ((h + cellSize - 1) / cellSize) | 0)));
            const fb = new RenderTarget(w, h, {
              format: texture.format,
              minFilter: Texture.NEAREST,
              magFilter: Texture.NEAREST,
              type: texture.type,
              generateMipmaps: !1,
              depthBuffer: !1,
              stencilBuffer: !1,
            });
            frameBuffers.push(fb);
          }
          ((w = texture.width),
            (h = texture.height),
            frameBuffers.forEach((fbi) => {
              ((w = Math.max(1, ((w + cellSize - 1) / cellSize) | 0)),
                (h = Math.max(1, ((h + cellSize - 1) / cellSize) | 0)),
                World.RENDERER.renderSingle(mesh, World.NUKE.camera, fbi),
                (shader.uniforms.tMap.value = fbi),
                (shader.uniforms.uSize.value.x = w),
                (shader.uniforms.uSize.value.y = h));
            }));
          const fbo = frameBuffers[frameBuffers.length - 1],
            out = fboToArray(fbo);
          _this.IS_DEBUG &&
            FBOHelper.instance().attach(fbo, { name: "Gainmap Encoder / Find Texture Min Max" });
          return (
            mesh.destroy(),
            frameBuffers.forEach((fb, i, arr) => {
              (_this.IS_DEBUG && i === arr.length - 1) || fb.destroy();
            }),
            [out[0], out[1], out[2]]
          );
        })(texture),
        maxContentBoost = Math.max.apply(this, textureMax),
        sdr = (function getSDRRendition(texture) {
          const quadRenderer = new QuadRenderer(texture, {
            shaderName: "ScreenQuad",
            width: texture.width,
            height: texture.height,
          });
          (quadRenderer.render(),
            _this.IS_DEBUG &&
              FBOHelper.instance().attach(quadRenderer.rt, { name: "Gainmap Encoder / SDR" }));
          return quadRenderer.rt;
        })(texture),
        { gainMap: gainMap, metadata: metadata } = (function getGainMap({
          sdr: sdr,
          hdr: hdr,
          offsetSdr: offsetSdr,
          offsetHdr: offsetHdr,
          maxContentBoost: maxContentBoost,
          minContentBoost: minContentBoost,
          gamma: gamma,
        }) {
          const _gamma = gamma || [1, 1, 1],
            _offsetSdr = offsetSdr || [1 / 64, 1 / 64, 1 / 64],
            _offsetHdr = offsetHdr || [1 / 64, 1 / 64, 1 / 64],
            _maxContentBoost = Math.max(maxContentBoost, 1.0001),
            _minContentBoost = minContentBoost || 1,
            minLog2 = Math.log2(_minContentBoost),
            maxLog2 = Math.log2(_maxContentBoost),
            gainMapMin = [minLog2, minLog2, minLog2],
            gainMapMax = [maxLog2, maxLog2, maxLog2],
            hdrCapacityMin = Math.min(
              Math.max(0, gainMapMin[0]),
              Math.max(0, gainMapMin[1]),
              Math.max(0, gainMapMin[2]),
            ),
            hdrCapacityMax = Math.max(
              Math.max(1, gainMapMax[0]),
              Math.max(1, gainMapMax[1]),
              Math.max(1, gainMapMax[2]),
            ),
            quadRenderer = new QuadRenderer(sdr, {
              shaderName: "GainMapEncoderShader",
              width: sdr.width,
              height: sdr.height,
              uniforms: {
                tHDR: { value: hdr },
                uGamma: { value: new Vector3().fromArray(_gamma) },
                uOffsetSDR: { value: new Vector3().fromArray(_offsetSdr) },
                uOffsetHDR: { value: new Vector3().fromArray(_offsetHdr) },
                uMinLog2: { value: minLog2 },
                uMaxLog2: { value: maxLog2 },
              },
              type: Texture.UNSIGNED_BYTE,
            });
          (quadRenderer.render(),
            _this.IS_DEBUG &&
              FBOHelper.instance().attach(quadRenderer.rt, { name: "Gainmap Encoder / Gainmap" }));
          return {
            gainMap: quadRenderer.rt,
            metadata: {
              gainMapMax: gainMapMax,
              gainMapMin: gainMapMin,
              gamma: _gamma,
              hdrCapacityMax: hdrCapacityMax,
              hdrCapacityMin: hdrCapacityMin,
              offsetSdr: _offsetSdr,
              offsetHdr: _offsetHdr,
            },
          };
        })({ sdr: sdr, hdr: texture, maxContentBoost: maxContentBoost }),
        sdrData = fboToArray(sdr, sdr.width, sdr.height),
        gainMapData = fboToArray(gainMap, gainMap.width, gainMap.height);
      return {
        sdr: new ImageData(sdrData, sdr.width, sdr.height),
        gainMap: new ImageData(gainMapData, gainMap.width, gainMap.height),
        metadata: metadata,
      };
    }));
}, "static");
