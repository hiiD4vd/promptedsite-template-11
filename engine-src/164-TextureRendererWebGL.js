Class(function TextureRendererWebGL(_gl) {
  const _this = this;
  var _state = {};
  const FLOAT_DATA = new Float32Array([0, 0, 0, 0]),
    UINT_DATA = new Uint32Array([0, 0, 0, 0]),
    INT_DATA = new Int32Array([0, 0, 0, 0]),
    DATA = new Uint8Array([0, 0, 0, 0]),
    {
      getFormat: getFormat,
      getProperty: getProperty,
      getType: getType,
      getFloatParams: getFloatParams,
      getInternalFormat: getInternalFormat,
    } = require("GLTypes");
  function setTextureParams(texture, textureType = _gl.TEXTURE_2D) {
    let format = getFormat(texture),
      internalFormat = getInternalFormat(texture),
      type = getType(texture),
      data = DATA;
    switch (texture.type) {
      case Texture.FLOAT:
        data = FLOAT_DATA;
        break;
      case Texture.UNSIGNED_INTEGER:
        data = UINT_DATA;
        break;
      case Texture.INTEGER:
        data = INT_DATA;
        break;
      case Texture.HALF_FLOAT:
        data = null;
    }
    (textureType != _gl.TEXTURE_2D ||
      texture.compressed ||
      _gl.texImage2D(textureType, 0, internalFormat, 1, 1, 0, format, type, data),
      _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_S, getProperty(texture.wrapS)),
      _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_T, getProperty(texture.wrapT)),
      _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, getProperty(texture.magFilter)),
      _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, getProperty(texture.minFilter)),
      texture.data || texture.format != Texture.RGBAFormat
        ? 1 == _state.premultiply &&
          (_gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), (_state.premultiply = !1))
        : !1 === texture.premultiplyAlpha || (texture.compressed && texture.image?.uncompressed)
          ? (_gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), (_state.premultiply = !1))
          : (_gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0), (_state.premultiply = !0)),
      texture.anisotropy > 1 &&
        _gl.texParameterf(
          textureType,
          Renderer.extensions.anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
          texture.anisotropy,
        ));
  }
  function updateDynamic(texture) {
    if (texture.isDataTexture) {
      if (
        (!0 === texture.flipY
          ? _state.flipY || (_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, !0), (_state.flipY = !0))
          : _state.flipY && (_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, !1), (_state.flipY = !1)),
        _state.premultiply &&
          (_gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), (_state.premultiply = !1)),
        !texture.glFormat)
      ) {
        let {
          internalformat: internalformat,
          format: format,
          type: type,
        } = getFloatParams(texture);
        ((texture.iformat = internalformat), (texture.glFormat = format), (texture.glType = type));
      }
      _gl.texSubImage2D(
        _gl.TEXTURE_2D,
        0,
        0,
        0,
        texture.width,
        texture.height,
        texture.glFormat,
        texture.glType,
        texture.data,
      );
    } else if (
      (_state.flipY || (_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, !0), (_state.flipY = !0)),
      texture.format == Texture.RGBAFormat
        ? !1 === texture.premultiplyAlpha || (texture.compressed && texture.image?.uncompressed)
          ? (_gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), (_state.premultiply = !1))
          : (_gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0), (_state.premultiply = !0))
        : _state.premultiply &&
          (_gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), (_state.premultiply = !1)),
      texture.glFormat || (texture.glFormat = getFormat(texture)),
      texture.image && texture.compressed)
    ) {
      let data = texture.image.compressedData;
      for (let i = 0; i < data.length; i++) {
        let size = texture.image.sizes[i];
        if (texture.image.isTextureArray) {
          let layers = texture.image.layers || 1;
          texture.image.uncompressed
            ? _gl.texImage3D(
                _gl.TEXTURE_2D_ARRAY,
                i,
                _gl.RGBA,
                size.width,
                size.height,
                layers,
                0,
                _gl.RGBA,
                _gl.UNSIGNED_BYTE,
                data[i],
              )
            : _gl.compressedTexImage3D(
                _gl.TEXTURE_2D_ARRAY,
                i,
                texture.image.gliFormat,
                size.width || size,
                size.height || size,
                layers,
                0,
                data[i],
              );
        } else
          texture.image.uncompressed
            ? _gl.texImage2D(
                _gl.TEXTURE_2D,
                i,
                _gl.RGBA,
                size.width,
                size.height,
                0,
                _gl.RGBA,
                _gl.UNSIGNED_BYTE,
                data[i],
              )
            : _gl.compressedTexImage2D(
                _gl.TEXTURE_2D,
                i,
                texture.image.gliFormat,
                size.width || size,
                size.height || size,
                0,
                data[i],
              );
      }
      data.length = 0;
    } else {
      try {
        _gl.texImage2D(
          _gl.TEXTURE_2D,
          0,
          texture.glFormat,
          texture.glFormat,
          getType(texture),
          texture.image,
        );
      } catch (e) {}
      texture.generateMipmaps && !texture.compressed && _gl.generateMipmap(_gl.TEXTURE_2D);
    }
  }
  function getTextureTarget(texture, _gl) {
    return texture.cube
      ? _gl.TEXTURE_CUBE_MAP
      : texture.isTexture3D
        ? _gl.TEXTURE_3D
        : texture.isTextureArray
          ? _gl.TEXTURE_2D_ARRAY
          : texture.EXT_OES
            ? _gl.TEXTURE_EXTERNAL_OES
            : _gl.TEXTURE_2D;
  }
  ((this.draw = function (texture, loc, key, id) {
    (_gl.activeTexture(_gl[`TEXTURE${id}`]),
      (void 0 === texture._gl || texture.needsReupload) && this.upload(texture),
      _gl.bindTexture(getTextureTarget(texture, _gl), texture._gl),
      _gl.uniform1i(loc, id),
      (texture.dynamic || texture.needsUpdate) && updateDynamic(texture),
      (texture.needsUpdate = !1));
  }),
    (this.upload = function (texture) {
      if (texture._gl && !texture.needsReupload && !texture.needsUpdate) return;
      let format = getFormat(texture);
      if (
        (Utils.query("debugUpload") && console.log("?debugUpload – upload texture", texture),
        texture.cube)
      ) {
        if (texture.compressed) {
          if (1 !== texture.cube.length)
            throw "Compressed cube texture requires 1 file with 6 faces";
        } else if (6 !== texture.cube.length) throw "Cube texture requires 6 images";
        return (function uploadCube(texture) {
          if (void 0 === texture._gl) {
            ((texture._gl = _gl.createTexture()),
              _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, texture._gl));
            let needsFlipY = !0 === texture.flipY;
            (needsFlipY !== !!_state.flipY &&
              (_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, needsFlipY), (_state.flipY = needsFlipY)),
              setTextureParams(texture, _gl.TEXTURE_CUBE_MAP));
          }
          let format = getFormat(texture);
          if (texture.compressed) {
            let image = texture.cube[0];
            for (let i = 0; i < image.compressedData.length; i++) {
              let size = image.sizes[i],
                data = image.compressedData[i],
                faceLength = data.length / 6;
              for (let j = 0; j < 6; j++)
                if (image.uncompressed) {
                  let view = new Uint8Array(data.buffer, j * faceLength, faceLength);
                  _gl.texImage2D(
                    _gl.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                    i,
                    _gl.RGBA,
                    size.width,
                    size.height,
                    0,
                    _gl.RGBA,
                    _gl.UNSIGNED_BYTE,
                    view,
                  );
                } else {
                  let view = new DataView(data.buffer, j * faceLength, faceLength);
                  _gl.compressedTexImage2D(
                    _gl.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                    i,
                    image.gliFormat,
                    size.width || size,
                    size.height || size,
                    0,
                    view,
                  );
                }
            }
          } else {
            for (let i = 0; i < 6; i++)
              _gl.texImage2D(
                _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                format,
                format,
                getType(texture),
                texture.cube[i],
              );
            _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP);
          }
          ((texture.needsUpdate = texture.needsReupload = !1),
            texture.onUpdate && texture.onUpdate());
        })(texture);
      }
      if (texture.isTexture3D)
        return (function uploadTexture3D(texture) {
          if (void 0 === texture._gl) {
            let format = getFormat(texture),
              internalFormat = getInternalFormat(texture),
              type = getType(texture);
            ((texture._gl = _gl.createTexture()),
              _gl.bindTexture(_gl.TEXTURE_3D, texture._gl),
              _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, !1),
              _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1),
              _gl.texParameteri(_gl.TEXTURE_3D, _gl.TEXTURE_WRAP_S, getProperty(texture.wrapS)),
              _gl.texParameteri(_gl.TEXTURE_3D, _gl.TEXTURE_WRAP_T, getProperty(texture.wrapT)),
              _gl.texParameteri(_gl.TEXTURE_3D, _gl.TEXTURE_WRAP_R, getProperty(texture.wrapR)),
              _gl.texParameteri(
                _gl.TEXTURE_3D,
                _gl.TEXTURE_MAG_FILTER,
                getProperty(texture.magFilter),
              ),
              _gl.texParameteri(
                _gl.TEXTURE_3D,
                _gl.TEXTURE_MIN_FILTER,
                getProperty(texture.minFilter),
              ),
              _gl.texImage3D(
                _gl.TEXTURE_3D,
                0,
                internalFormat,
                texture.width,
                texture.height,
                texture.depth,
                0,
                format,
                type,
                texture.image,
              ),
              (texture.needsUpdate = texture.needsReupload = !1),
              texture.onUpdate && texture.onUpdate());
          }
        })(texture);
      let texType = getTextureTarget(texture, _gl);
      if (
        (void 0 === texture._gl
          ? ((texture._gl = _gl.createTexture()),
            RenderCount.add("texture"),
            _gl.bindTexture(texType, texture._gl),
            setTextureParams(texture, texType))
          : _gl.bindTexture(texType, texture._gl),
        texture.isDataTexture || (texture.type && texture.type.includes("float")))
      ) {
        (!0 === texture.flipY
          ? _state.flipY || (_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, !0), (_state.flipY = !0))
          : _state.flipY && (_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, !1), (_state.flipY = !1)),
          _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, 1));
        let {
          internalformat: internalformat,
          format: format,
          type: type,
        } = getFloatParams(texture);
        if ("ie" === Device.system.browser)
          try {
            _gl.texImage2D(
              _gl.TEXTURE_2D,
              0,
              internalformat,
              texture.width,
              texture.height,
              0,
              format,
              type,
              texture.distributeTextureData ? null : texture.data,
            );
          } catch (e) {
            console.log(e);
          }
        else
          _gl.texImage2D(
            _gl.TEXTURE_2D,
            0,
            internalformat,
            texture.width,
            texture.height,
            0,
            format,
            type,
            texture.distributeTextureData ? null : texture.data,
          );
        texture.destroyDataAfterUpload &&
          ((texture.data = null), delete texture.data, texture.onDataDestroyed?.());
      } else {
        let needsFlipY = !texture.compressed && !1 !== texture.flipY;
        if (
          (needsFlipY !== !!_state.flipY &&
            (_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, needsFlipY), (_state.flipY = needsFlipY)),
          texture.image && texture.compressed)
        ) {
          let data = texture.image.compressedData;
          if (texture.distributeTextureData) {
            let size = texture.image.sizes[0];
            if (texture.image.isTextureArray) {
              let layers = texture.image.layers || 1;
              _gl.texStorage3D(
                _gl.TEXTURE_2D_ARRAY,
                data.length,
                texture.image.uncompressed ? _gl.RGBA8 : texture.image.gliFormat,
                size.width || size,
                size.height || size,
                layers,
              );
            } else
              _gl.texStorage2D(
                _gl.TEXTURE_2D,
                data.length,
                texture.image.uncompressed ? _gl.RGBA8 : texture.image.gliFormat,
                size.width || size,
                size.height || size,
              );
          } else {
            for (let i = 0; i < data.length; i++) {
              let size = texture.image.sizes[i];
              if (texture.image.isTextureArray) {
                let layers = texture.image.layers || 1;
                texture.image.uncompressed
                  ? _gl.texImage3D(
                      _gl.TEXTURE_2D_ARRAY,
                      i,
                      _gl.RGBA,
                      size.width,
                      size.height,
                      layers,
                      0,
                      _gl.RGBA,
                      _gl.UNSIGNED_BYTE,
                      data[i],
                    )
                  : _gl.compressedTexImage3D(
                      _gl.TEXTURE_2D_ARRAY,
                      i,
                      texture.image.gliFormat,
                      size.width || size,
                      size.height || size,
                      layers,
                      0,
                      data[i],
                    );
              } else
                texture.image.uncompressed
                  ? _gl.texImage2D(
                      _gl.TEXTURE_2D,
                      i,
                      _gl.RGBA,
                      size.width,
                      size.height,
                      0,
                      _gl.RGBA,
                      _gl.UNSIGNED_BYTE,
                      data[i],
                    )
                  : _gl.compressedTexImage2D(
                      _gl.TEXTURE_2D,
                      i,
                      texture.image.gliFormat,
                      size.width || size,
                      size.height || size,
                      0,
                      data[i],
                    );
            }
            data.length = 0;
          }
        } else if (texture.image && !(texture.image instanceof HTMLVideoElement))
          try {
            _gl.texImage2D(_gl.TEXTURE_2D, 0, format, format, getType(texture), texture.image);
          } catch (e) {
            console.log("error loading texture", e, texture.image);
          }
        texture.distributeTextureData || RenderCount.add("tex_upload", texture);
      }
      ((texture.image || texture.data) &&
        texture.generateMipmaps &&
        !texture.compressed &&
        _gl.generateMipmap(_gl.TEXTURE_2D),
        (texture.needsUpdate = texture.needsReupload = !1),
        texture.onUpdate && texture.onUpdate());
    }),
    (this.manualUpdateDynamic = function (texture) {
      ((void 0 === texture._gl || texture.needsReupload) && this.upload(texture),
        _gl.bindTexture(getTextureTarget(texture, _gl), texture._gl),
        updateDynamic(texture));
    }),
    (this.uploadAsync = function (texture) {
      let { format: format, type: type } = getFloatParams(texture);
      if (texture._uploadAsyncPromise) return texture._uploadAsyncPromise;
      ((texture._uploadAsyncPromise = Promise.create()),
        RenderCount.add("tex_uploadAsync", texture),
        texture._gl || ((texture.distributeTextureData = !0), _this.upload(texture)));
      let rowsPerCall,
        bytesPerRow,
        bytesPerCall,
        isDataTexture = texture.isDataTexture || (texture.type && texture.type.includes("float")),
        rowIndex = 0,
        levelIndex = 0,
        layerIndex = 0;
      if (!(isDataTexture || (texture.image && texture.compressed)))
        throw new Error("uploadAsync requires data texture or compressed texture");
      if (isDataTexture) {
        let chunks = Math.ceil(texture.data.length / 1048576);
        ((rowsPerCall = Math.ceil(texture.height / chunks)),
          (bytesPerRow = Math.ceil(texture.data.length / texture.height)),
          (bytesPerCall = bytesPerRow * rowsPerCall));
      }
      let worker = new Render.Worker(function workerUploadAsync() {
        let needsFlipY;
        ((needsFlipY = isDataTexture
          ? !0 === texture.flipY
          : !texture.compressed && !1 !== texture.flipY),
          needsFlipY !== !!_state.flipY &&
            (_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, needsFlipY), (_state.flipY = needsFlipY)));
        let finished = !1,
          texType = getTextureTarget(texture, _gl);
        if ((_gl.bindTexture(texType, texture._gl), isDataTexture)) {
          let rowsThisCall = Math.min(rowsPerCall, texture.height - rowIndex),
            dataOffset = bytesPerRow * rowIndex,
            subarray = texture.data.subarray(dataOffset, dataOffset + bytesPerCall);
          (_gl.texSubImage2D(
            _gl.TEXTURE_2D,
            0,
            0,
            rowIndex,
            texture.width,
            rowsThisCall,
            format,
            type,
            subarray,
          ),
            (rowIndex += rowsPerCall),
            (finished = rowIndex >= texture.height));
        } else {
          let data = texture.image.compressedData[levelIndex],
            size = texture.image.sizes[levelIndex],
            width = size.width || size,
            height = size.height || size;
          if (texture.image.isTextureArray) {
            let layers = texture.image.layers || 1,
              bytesPerLayer = data.length / layers,
              layersPerCall = Math.clamp(
                Math.floor(1048576 / bytesPerLayer),
                1,
                layers - layerIndex,
              ),
              dataOffset = layerIndex * bytesPerLayer,
              bytesPerCall = layersPerCall * bytesPerLayer,
              subarray = data.subarray(dataOffset, dataOffset + bytesPerCall);
            (texture.image.uncompressed
              ? _gl.texSubImage3D(
                  _gl.TEXTURE_2D_ARRAY,
                  levelIndex,
                  0,
                  0,
                  layerIndex,
                  width,
                  height,
                  layersPerCall,
                  _gl.RGBA,
                  _gl.UNSIGNED_BYTE,
                  subarray,
                )
              : _gl.compressedTexSubImage3D(
                  _gl.TEXTURE_2D_ARRAY,
                  levelIndex,
                  0,
                  0,
                  layerIndex,
                  width,
                  height,
                  layersPerCall,
                  texture.image.gliFormat,
                  subarray,
                ),
              (layerIndex += layersPerCall),
              layerIndex >= layers && ((layerIndex = 0), levelIndex++));
          } else {
            let multipleOf4Height = 4 * Math.ceil(height / 4),
              bytesPerRow = data.length / multipleOf4Height,
              rowsPerCall = Math.floor(1048576 / bytesPerRow),
              rowsThisCall = Math.clamp(
                4 * Math.ceil(rowsPerCall / 4),
                0,
                multipleOf4Height - rowIndex,
              ),
              bytesThisCall = rowsThisCall * bytesPerRow,
              dataOffset = bytesPerRow * rowIndex,
              subarray = data.subarray(dataOffset, dataOffset + bytesThisCall);
            (texture.image.uncompressed
              ? _gl.texSubImage2D(
                  _gl.TEXTURE_2D,
                  levelIndex,
                  0,
                  rowIndex,
                  width,
                  rowsThisCall,
                  format,
                  type,
                  subarray,
                )
              : _gl.compressedTexSubImage2D(
                  _gl.TEXTURE_2D,
                  levelIndex,
                  0,
                  rowIndex,
                  width,
                  Math.min(height - rowIndex, rowsThisCall),
                  texture.image.gliFormat,
                  subarray,
                ),
              (rowIndex += rowsThisCall),
              rowIndex >= multipleOf4Height && ((rowIndex = 0), levelIndex++));
          }
          finished = levelIndex >= texture.image.compressedData.length;
        }
        (_gl.bindTexture(texType, null),
          finished && (worker.stop(), texture._uploadAsyncPromise.resolve()));
      });
      return texture._uploadAsyncPromise;
    }),
    (this.destroy = function (texture) {
      (texture._gl &&
        (_gl.deleteTexture(texture._gl),
        RenderCount.remove("texture"),
        RenderCount.add("tex_destroy", texture)),
        texture.data && ((texture.data = null), delete texture.data),
        delete texture._gl);
    }));
});
