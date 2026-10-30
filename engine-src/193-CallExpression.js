Module(function GLTypes() {
  function getFormat(texture) {
    let _gl = Renderer.context,
      integer = texture.type === Texture.UNSIGNED_INTEGER || texture.type === Texture.INTEGER;
    switch (texture.format) {
      case Texture.RGBAFormat:
        return integer ? _gl.RGBA_INTEGER : _gl.RGBA;
      case Texture.RGBFormat:
        return integer ? _gl.RGB_INTEGER : _gl.RGB;
      case Texture.RGFormat:
        return integer ? _gl.RG_INTEGER : _gl.RG;
      case Texture.RFormat:
        return integer ? _gl.RED_INTEGER : _gl.RED;
    }
  }
  function getInternalFormat(texture) {
    let _gl = Renderer.context;
    if (Renderer.type !== Renderer.WEBGL2)
      return texture.format === Texture.RGBAFormat ? _gl.RGBA : _gl.RGB;
    switch (texture.format) {
      case Texture.RGBAFormat:
        switch (texture.type) {
          case Texture.FLOAT:
            return _gl.RGBA32F;
          case Texture.HALF_FLOAT:
            return _gl.RGBA16F;
          case Texture.UNSIGNED_INTEGER:
            return _gl.RGBA32UI;
          case Texture.INTEGER:
            return _gl.RGBA32I;
          case Texture.UNSIGNED_BYTE:
            return _gl.RGBA8;
        }
        break;
      case Texture.RGBFormat:
        switch (texture.type) {
          case Texture.FLOAT:
            return _gl.RGB32F;
          case Texture.HALF_FLOAT:
            return _gl.RGB16F;
          case Texture.UNSIGNED_INTEGER:
            return _gl.RGB32UI;
          case Texture.INTEGER:
            return _gl.RGB32I;
          case Texture.UNSIGNED_BYTE:
            return _gl.RGB8;
        }
        break;
      case Texture.RGFormat:
        switch (texture.type) {
          case Texture.FLOAT:
            return _gl.RG32F;
          case Texture.HALF_FLOAT:
            return _gl.RG16F;
          case Texture.UNSIGNED_INTEGER:
            return _gl.RG32UI;
          case Texture.INTEGER:
            return _gl.RG32I;
          case Texture.UNSIGNED_BYTE:
            return _gl.RG8;
        }
        break;
      case Texture.RFormat:
        switch (texture.type) {
          case Texture.FLOAT:
            return _gl.R32F;
          case Texture.HALF_FLOAT:
            return _gl.R16F;
          case Texture.UNSIGNED_INTEGER:
            return _gl.R32UI;
          case Texture.INTEGER:
            return _gl.R32I;
          case Texture.UNSIGNED_BYTE:
            return _gl.R8;
        }
    }
  }
  function getType(texture) {
    let _gl = Renderer.context;
    switch (texture.type) {
      case Texture.FLOAT:
        return _gl.FLOAT;
      case Texture.HALF_FLOAT:
        return Renderer.type == Renderer.WEBGL2
          ? _gl.HALF_FLOAT
          : Renderer.extensions.halfFloat.HALF_FLOAT_OES;
      case Texture.UNSIGNED_INTEGER:
        return _gl.UNSIGNED_INT;
      case Texture.INTEGER:
        return _gl.INT;
      default:
        return _gl.UNSIGNED_BYTE;
    }
  }
  this.exports = {
    getFormat: getFormat,
    getInternalFormat: getInternalFormat,
    getProperty: function getProperty(property) {
      let _gl = Renderer.context;
      switch (property) {
        case Texture.NEAREST:
          return _gl.NEAREST;
        case Texture.LINEAR:
          return _gl.LINEAR;
        case Texture.LINEAR_MIPMAP:
          return _gl.LINEAR_MIPMAP_LINEAR;
        case Texture.NEAREST_MIPMAP:
          return _gl.NEAREST_MIPMAP_LINEAR;
        case Texture.LINEAR_MIPMAP_NEAREST:
          return _gl.LINEAR_MIPMAP_NEAREST;
        case Texture.CLAMP_TO_EDGE:
          return _gl.CLAMP_TO_EDGE;
        case Texture.REPEAT:
          return _gl.REPEAT;
        case Texture.MIRROR_REPEAT:
          return _gl.MIRRORED_REPEAT;
      }
    },
    getType: getType,
    getFloatParams: function getFloatParams(texture) {
      return {
        internalformat: getInternalFormat(texture),
        format: getFormat(texture),
        type: getType(texture),
      };
    },
    getGLTypeForTypedArray: function getGLTypeForTypedArray(typedArray) {
      let _gl = Renderer.context;
      return typedArray instanceof Float32Array
        ? _gl.FLOAT
        : typedArray instanceof Int32Array
          ? _gl.INT
          : typedArray instanceof Uint32Array
            ? _gl.UNSIGNED_INT
            : typedArray instanceof Int16Array
              ? _gl.SHORT
              : typedArray instanceof Uint16Array
                ? _gl.UNSIGNED_SHORT
                : typedArray instanceof Int8Array
                  ? _gl.BYTE
                  : typedArray instanceof Uint8Array || typedArray instanceof Uint8ClampedArray
                    ? _gl.UNSIGNED_BYTE
                    : _gl.FLOAT;
    },
  };
});
