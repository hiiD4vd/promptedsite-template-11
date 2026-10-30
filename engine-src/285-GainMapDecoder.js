Class(function GainMapDecoder(_path) {
  Inherit(this, Component);
  const _this = this;
  ((_this.IS_DEBUG = !1),
    (_this.load = async function (path) {
      const supportsWebp = Assets.supportsWebP(),
        sdrPath = path.replace(".hdr", supportsWebp ? "_sdr.webp" : "_sdr.jpeg"),
        gainMapPath = path.replace(".hdr", supportsWebp ? "_gainmap.webp" : "_gainmap.jpeg"),
        metadataPath = path.replace(".hdr", "_metadata.json"),
        sdr = Utils3D.getTexture(sdrPath, {
          type: Texture.UNSIGNED_BYTE,
          format: Texture.RGBAFormat,
          flipY: !1,
        }),
        gainMap = Utils3D.getTexture(gainMapPath, {
          type: Texture.UNSIGNED_BYTE,
          format: Texture.RGBAFormat,
          flipY: !1,
        }),
        metadata = await get(metadataPath);
      await _this.wait(
        () =>
          sdr.dimensions?.width &&
          sdr.dimensions?.height &&
          gainMap.dimensions?.width &&
          gainMap.dimensions?.height,
      );
      const maxDisplayBoost = Math.max(1, Math.min(65504, Math.pow(2, metadata.hdrCapacityMax))),
        weightFactor =
          (Math.log2(maxDisplayBoost) - metadata.hdrCapacityMin) /
          (metadata.hdrCapacityMax - metadata.hdrCapacityMin),
        quadRenderer = new QuadRenderer(sdr, {
          shaderName: "GainMapDecoderShader",
          width: sdr.dimensions.width,
          height: sdr.dimensions.height,
          uniforms: {
            tGainMap: { value: gainMap },
            uGamma: { value: new Vector3().fromArray(metadata.gamma) },
            uOffsetHdr: { value: new Vector3().fromArray(metadata.offsetHdr) },
            uOffsetSdr: { value: new Vector3().fromArray(metadata.offsetSdr) },
            uGainMapMin: { value: new Vector3().fromArray(metadata.gainMapMin) },
            uGainMapMax: { value: new Vector3().fromArray(metadata.gainMapMax) },
            uWeightFactor: { value: weightFactor },
          },
          type: Texture.HALF_FLOAT,
          format: Texture.RGBAFormat,
          depthBuffer: !1,
          stencilBuffer: !1,
        });
      return (
        quadRenderer.render(),
        _this.IS_DEBUG &&
          FBOHelper.instance().attach(quadRenderer.rt, { name: "Gainmap Decoder / Gainmap" }),
        quadRenderer.rt
      );
    }));
}, "static");
