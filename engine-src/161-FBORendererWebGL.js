Class(function FBORendererWebGL(_gl) {
  const WEBGL2 = Renderer.type == Renderer.WEBGL2;
  let _maxSamples = WEBGL2 && _gl.getParameter(_gl.MAX_SAMPLES);
  const {
    getFormat: getFormat,
    getInternalFormat: getInternalFormat,
    getProperty: getProperty,
    getType: getType,
    getFloatParams: getFloatParams,
  } = require("GLTypes");
  function prepareTexture(texture) {
    ((texture._gl = _gl.createTexture()),
      _gl.bindTexture(_gl.TEXTURE_2D, texture._gl),
      _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, getProperty(texture.wrapS)),
      _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, getProperty(texture.wrapT)),
      _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, getProperty(texture.magFilter)),
      _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, getProperty(texture.minFilter)),
      (texture.needsUpdate = !1));
  }
  function texImageDB(rt, texture) {
    if (texture.type.includes("float")) {
      let { internalformat: internalformat, format: format, type: type } = getFloatParams(texture);
      _gl.texImage2D(_gl.TEXTURE_2D, 0, internalformat, rt.width, rt.height, 0, format, type, null);
    } else
      _gl.texImage2D(
        _gl.TEXTURE_2D,
        0,
        getFormat(texture),
        rt.width,
        rt.height,
        0,
        getFormat(texture),
        getType(texture),
        null,
      );
    _gl.bindTexture(_gl.TEXTURE_2D, null);
  }
  function getRenderBufferInternalFormat(texture) {
    return texture.type.includes("float")
      ? getFloatParams(texture).internalformat
      : getInternalFormat(texture);
  }
  ((this.upload = function (rt) {
    if (!rt._gl) {
      if (rt.cube)
        return (function uploadCube(rt) {
          ((rt._gl = _gl.createFramebuffer()), _gl.bindFramebuffer(_gl.FRAMEBUFFER, rt._gl));
          let texture = rt.texture;
          ((texture._gl = _gl.createTexture()),
            (texture.cube = !0),
            (texture.needsUpdate = !1),
            _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, texture._gl));
          for (let i = 0; i < 6; i++)
            _gl.texImage2D(
              _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
              0,
              getFormat(texture),
              rt.width,
              rt.height,
              0,
              getFormat(texture),
              _gl.UNSIGNED_BYTE,
              null,
            );
          (_gl.texParameteri(_gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_S, getProperty(texture.wrapS)),
            _gl.texParameteri(_gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_T, getProperty(texture.wrapT)),
            _gl.texParameteri(
              _gl.TEXTURE_CUBE_MAP,
              _gl.TEXTURE_MAG_FILTER,
              getProperty(texture.magFilter),
            ),
            _gl.texParameteri(
              _gl.TEXTURE_CUBE_MAP,
              _gl.TEXTURE_MIN_FILTER,
              getProperty(texture.minFilter),
            ),
            (rt._depthBuffer = _gl.createRenderbuffer()),
            _gl.bindRenderbuffer(_gl.RENDERBUFFER, rt._depthBuffer),
            _gl.renderbufferStorage(_gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, rt.width, rt.height),
            _gl.framebufferRenderbuffer(
              _gl.FRAMEBUFFER,
              _gl.DEPTH_ATTACHMENT,
              _gl.RENDERBUFFER,
              rt._depthBuffer,
            ),
            _gl.bindFramebuffer(_gl.FRAMEBUFFER, null),
            _gl.bindTexture(_gl.TEXTURE_2D, null),
            _gl.bindRenderbuffer(_gl.RENDERBUFFER, null));
        })(rt);
      if (rt.texture.isTexture3D)
        return (function upload3DTexture(rt) {
          rt.texture.upload();
          let colorAttachments = [];
          ((rt._gl = _gl.createFramebuffer()), _gl.bindFramebuffer(_gl.FRAMEBUFFER, rt._gl));
          for (let i = 0; i < rt.indices.length; i++) {
            let key = "COLOR_ATTACHMENT" + i;
            (colorAttachments.push(_gl[key]),
              _gl.framebufferTextureLayer(
                _gl.FRAMEBUFFER,
                _gl[key],
                rt.texture._gl,
                0,
                rt.indices[i],
              ));
          }
          (_gl.drawBuffers(colorAttachments), _gl.bindFramebuffer(_gl.FRAMEBUFFER, null));
        })(rt);
      if (((rt._gl = _gl.createFramebuffer()), !rt.depth && !rt.disableDepth))
        if (
          ((rt._depthBuffer = _gl.createRenderbuffer()),
          _gl.bindRenderbuffer(_gl.RENDERBUFFER, rt._depthBuffer),
          rt.internalMultisample)
        ) {
          let samples = Math.min(_maxSamples, rt._samplesAmount);
          _gl.renderbufferStorageMultisample(
            _gl.RENDERBUFFER,
            samples,
            rt.stencil ? _gl.DEPTH24_STENCIL8 : _gl.DEPTH_COMPONENT24,
            rt.width,
            rt.height,
          );
        } else
          _gl.renderbufferStorage(
            _gl.RENDERBUFFER,
            rt.stencil
              ? WEBGL2
                ? _gl.DEPTH24_STENCIL8
                : _gl.DEPTH_STENCIL
              : WEBGL2
                ? _gl.DEPTH_COMPONENT24
                : _gl.DEPTH_COMPONENT16,
            rt.width,
            rt.height,
          );
      if (
        (RenderCount.add(`fbo_${Math.round(rt.width)}x${Math.round(rt.height)}`, rt),
        _gl.bindFramebuffer(_gl.FRAMEBUFFER, rt._gl),
        rt.multi)
      )
        if (WEBGL2) {
          let colorAttachments = [];
          for (let i = 0; i < rt.attachments.length; i++) {
            let key = "COLOR_ATTACHMENT" + i,
              texture = rt.attachments[i];
            (colorAttachments.push(_gl[key]),
              prepareTexture(texture),
              texImageDB(rt, texture),
              _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl[key], _gl.TEXTURE_2D, texture._gl, 0),
              rt.multisample &&
                i > 0 &&
                ((texture._blitFramebuffer = _gl.createFramebuffer()),
                _gl.bindFramebuffer(_gl.FRAMEBUFFER, texture._blitFramebuffer),
                _gl.framebufferTexture2D(
                  _gl.FRAMEBUFFER,
                  _gl.COLOR_ATTACHMENT0,
                  _gl.TEXTURE_2D,
                  texture._gl,
                  0,
                )));
          }
          _gl.drawBuffers(colorAttachments);
        } else {
          let ext = Renderer.extensions.drawBuffers,
            colorAttachments = [];
          for (let i = 0; i < rt.attachments.length; i++) {
            let key = "COLOR_ATTACHMENT" + i + "_WEBGL",
              texture = rt.attachments[i];
            (colorAttachments.push(ext[key]),
              prepareTexture(texture),
              texImageDB(rt, texture),
              _gl.framebufferTexture2D(_gl.FRAMEBUFFER, ext[key], _gl.TEXTURE_2D, texture._gl, 0));
          }
          ext.drawBuffersWEBGL(colorAttachments);
        }
      else if (rt.internalMultisample) {
        let samples = Math.min(_maxSamples, rt._samplesAmount);
        if (rt.parent.multi) {
          let colorAttachments = [],
            attachments = rt.parent.attachments;
          for (let i = 0; i < attachments.length; i++) {
            let key = "COLOR_ATTACHMENT" + i,
              texture = attachments[i];
            (colorAttachments.push(_gl[key]),
              (texture._colorBuffer = _gl.createRenderbuffer()),
              _gl.bindRenderbuffer(_gl.RENDERBUFFER, texture._colorBuffer),
              _gl.renderbufferStorageMultisample(
                _gl.RENDERBUFFER,
                samples,
                getRenderBufferInternalFormat(texture),
                rt.width,
                rt.height,
              ),
              _gl.framebufferRenderbuffer(
                _gl.FRAMEBUFFER,
                _gl[key],
                _gl.RENDERBUFFER,
                texture._colorBuffer,
              ),
              _gl.bindRenderbuffer(_gl.RENDERBUFFER, null));
          }
          _gl.drawBuffers(colorAttachments);
        } else
          ((rt._colorBuffer = _gl.createRenderbuffer()),
            _gl.bindRenderbuffer(_gl.RENDERBUFFER, rt._colorBuffer),
            _gl.renderbufferStorageMultisample(
              _gl.RENDERBUFFER,
              samples,
              getRenderBufferInternalFormat(rt.texture),
              rt.width,
              rt.height,
            ),
            _gl.framebufferRenderbuffer(
              _gl.FRAMEBUFFER,
              _gl.COLOR_ATTACHMENT0,
              _gl.RENDERBUFFER,
              rt._colorBuffer,
            ));
      } else {
        if ((prepareTexture(rt.texture), rt.texture.type.includes("float"))) {
          let {
            internalformat: internalformat,
            format: format,
            type: type,
          } = getFloatParams(rt.texture);
          _gl.texImage2D(
            _gl.TEXTURE_2D,
            0,
            internalformat,
            rt.width,
            rt.height,
            0,
            format,
            type,
            null,
          );
        } else
          _gl.texImage2D(
            _gl.TEXTURE_2D,
            0,
            getFormat(rt.texture),
            rt.width,
            rt.height,
            0,
            getFormat(rt.texture),
            getType(rt.texture),
            null,
          );
        _gl.framebufferTexture2D(
          _gl.FRAMEBUFFER,
          _gl.COLOR_ATTACHMENT0,
          _gl.TEXTURE_2D,
          rt.texture._gl,
          0,
        );
      }
      if (rt.depth) {
        prepareTexture(rt.depth);
        let iformat = rt.stencil
            ? WEBGL2
              ? _gl.DEPTH24_STENCIL8
              : _gl.DEPTH_STENCIL
            : WEBGL2
              ? _gl.DEPTH_COMPONENT24
              : _gl.DEPTH_COMPONENT,
          type = rt.stencil
            ? WEBGL2
              ? _gl.UNSIGNED_INT_24_8
              : Renderer.extensions.depthTextures.UNSIGNED_INT_24_8_WEBGL
            : _gl.UNSIGNED_INT;
        (_gl.texImage2D(
          _gl.TEXTURE_2D,
          0,
          iformat,
          rt.width,
          rt.height,
          0,
          rt.stencil ? _gl.DEPTH_STENCIL : _gl.DEPTH_COMPONENT,
          type,
          null,
        ),
          _gl.framebufferTexture2D(
            _gl.FRAMEBUFFER,
            rt.stencil ? _gl.DEPTH_STENCIL_ATTACHMENT : _gl.DEPTH_ATTACHMENT,
            _gl.TEXTURE_2D,
            rt.depth._gl,
            0,
          ));
      } else
        rt.disableDepth ||
          (rt.internalMultisample,
          _gl.framebufferRenderbuffer(
            _gl.FRAMEBUFFER,
            rt.stencil ? _gl.DEPTH_STENCIL_ATTACHMENT : _gl.DEPTH_ATTACHMENT,
            _gl.RENDERBUFFER,
            rt._depthBuffer,
          ));
      (_gl.bindFramebuffer(_gl.FRAMEBUFFER, null),
        _gl.bindTexture(_gl.TEXTURE_2D, null),
        _gl.bindRenderbuffer(_gl.RENDERBUFFER, null));
    }
  }),
    (this.bind = function (rt) {
      (rt._gl || this.upload(rt),
        _gl.bindFramebuffer(_gl.FRAMEBUFFER, rt._gl),
        rt.cube &&
          _gl.framebufferTexture2D(
            _gl.FRAMEBUFFER,
            _gl.COLOR_ATTACHMENT0,
            _gl.TEXTURE_CUBE_MAP_POSITIVE_X + rt.activeFace,
            rt.texture._gl,
            0,
          ),
        rt.scissor &&
          (_gl.enable(_gl.SCISSOR_TEST),
          _gl.scissor(rt.scissor.x, rt.scissor.y, rt.scissor.width, rt.scissor.height)),
        _gl.viewport(rt.viewport.x, rt.viewport.y, rt.width, rt.height),
        rt.customViewport &&
          _gl.viewport(
            rt.customViewport.x,
            rt.customViewport.y,
            rt.customViewport.z,
            rt.customViewport.w,
          ),
        Renderer.instance.autoClear &&
          (_gl.clearColor(
            Renderer.CLEAR[0],
            Renderer.CLEAR[1],
            Renderer.CLEAR[2],
            Renderer.CLEAR[3],
          ),
          rt.sharedRenderbuffer
            ? rt.clearDepth
              ? _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT)
              : _gl.clear(_gl.COLOR_BUFFER_BIT)
            : _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT | _gl.STENCIL_BUFFER_BIT)));
    }),
    (this.unbind = function (rt) {
      (rt.scissor && _gl.disable(_gl.SCISSOR_TEST), _gl.bindFramebuffer(_gl.FRAMEBUFFER, null));
    }),
    (this.resize = function (rt) {
      if (rt.texture._gl && rt._gl) {
        if ((_gl.bindFramebuffer(_gl.FRAMEBUFFER, rt._gl), rt.multi))
          for (let i = 0; i < rt.attachments.length; i++) {
            let texture = rt.attachments[i];
            if ((_gl.bindTexture(_gl.TEXTURE_2D, texture._gl), texture.type.includes("float"))) {
              let {
                internalformat: internalformat,
                format: format,
                type: type,
              } = getFloatParams(texture);
              _gl.texImage2D(
                _gl.TEXTURE_2D,
                0,
                internalformat,
                rt.width,
                rt.height,
                0,
                format,
                type,
                null,
              );
            } else
              _gl.texImage2D(
                _gl.TEXTURE_2D,
                0,
                getFormat(texture),
                rt.width,
                rt.height,
                0,
                getFormat(texture),
                getType(texture),
                null,
              );
          }
        else if (rt.internalMultisample) {
          let samples = Math.min(_maxSamples, rt._samplesAmount);
          if (rt.parent.multi) {
            let attachments = rt.parent.attachments;
            for (let i = 0; i < attachments.length; i++) {
              let texture = attachments[i];
              (_gl.bindRenderbuffer(_gl.RENDERBUFFER, texture._colorBuffer),
                _gl.renderbufferStorageMultisample(
                  _gl.RENDERBUFFER,
                  samples,
                  getRenderBufferInternalFormat(texture),
                  rt.width,
                  rt.height,
                ),
                _gl.bindRenderbuffer(_gl.RENDERBUFFER, null));
            }
          } else
            (_gl.bindRenderbuffer(_gl.RENDERBUFFER, rt._colorBuffer),
              _gl.renderbufferStorageMultisample(
                _gl.RENDERBUFFER,
                samples,
                getRenderBufferInternalFormat(rt.texture),
                rt.width,
                rt.height,
              ),
              _gl.framebufferRenderbuffer(
                _gl.FRAMEBUFFER,
                _gl.COLOR_ATTACHMENT0,
                _gl.RENDERBUFFER,
                rt._colorBuffer,
              ));
        } else if (
          (_gl.bindTexture(_gl.TEXTURE_2D, rt.texture._gl), rt.texture.type.includes("float"))
        ) {
          let {
            internalformat: internalformat,
            format: format,
            type: type,
          } = getFloatParams(rt.texture);
          _gl.texImage2D(
            _gl.TEXTURE_2D,
            0,
            internalformat,
            rt.width,
            rt.height,
            0,
            format,
            type,
            null,
          );
        } else
          _gl.texImage2D(
            _gl.TEXTURE_2D,
            0,
            getFormat(rt.texture),
            rt.width,
            rt.height,
            0,
            getFormat(rt.texture),
            getType(rt.texture),
            null,
          );
        if (rt.depth) {
          _gl.bindTexture(_gl.TEXTURE_2D, rt.depth._gl);
          let iformat = rt.stencil
              ? WEBGL2
                ? _gl.DEPTH24_STENCIL8
                : _gl.DEPTH_STENCIL
              : WEBGL2
                ? _gl.DEPTH_COMPONENT24
                : _gl.DEPTH_COMPONENT,
            type = rt.stencil
              ? WEBGL2
                ? _gl.UNSIGNED_INT_24_8
                : Renderer.extensions.depthTextures.UNSIGNED_INT_24_8_WEBGL
              : _gl.UNSIGNED_INT;
          (_gl.texImage2D(
            _gl.TEXTURE_2D,
            0,
            iformat,
            rt.width,
            rt.height,
            0,
            rt.stencil ? _gl.DEPTH_STENCIL : _gl.DEPTH_COMPONENT,
            type,
            null,
          ),
            _gl.framebufferTexture2D(
              _gl.FRAMEBUFFER,
              rt.stencil ? _gl.DEPTH_STENCIL_ATTACHMENT : _gl.DEPTH_ATTACHMENT,
              _gl.TEXTURE_2D,
              rt.depth._gl,
              0,
            ));
        } else if (!rt.disableDepth)
          if ((_gl.bindRenderbuffer(_gl.RENDERBUFFER, rt._depthBuffer), rt.internalMultisample)) {
            let samples = Math.min(_maxSamples, rt._samplesAmount);
            _gl.renderbufferStorageMultisample(
              _gl.RENDERBUFFER,
              samples,
              rt.stencil ? _gl.DEPTH24_STENCIL8 : _gl.DEPTH_COMPONENT24,
              rt.width,
              rt.height,
            );
          } else
            _gl.renderbufferStorage(
              _gl.RENDERBUFFER,
              rt.stencil
                ? WEBGL2
                  ? _gl.DEPTH24_STENCIL8
                  : _gl.DEPTH_STENCIL
                : WEBGL2
                  ? _gl.DEPTH_COMPONENT24
                  : _gl.DEPTH_COMPONENT16,
              rt.width,
              rt.height,
            );
        (_gl.bindTexture(_gl.TEXTURE_2D, null),
          _gl.bindFramebuffer(_gl.FRAMEBUFFER, null),
          _gl.bindRenderbuffer(_gl.RENDERBUFFER, null));
      }
    }),
    (this.destroy = function (rt) {
      (rt._gl && _gl.deleteFramebuffer(rt._gl),
        rt._depthBuffer && _gl.deleteRenderbuffer(rt._depthBuffer),
        Texture.renderer.destroy(rt.texture),
        rt._gl && RenderCount.remove(`fbo_${Math.round(rt.width)}x${Math.round(rt.height)}`),
        rt.multi &&
          rt.attachments.forEach((t) => {
            (t._colorBuffer && _gl.deleteRenderbuffer(t._colorBuffer),
              t._blitFramebuffer && _gl.deleteFramebuffer(t._blitFramebuffer),
              Texture.renderer.destroy(t));
          }),
        (rt._gl = null),
        (rt._depthBuffer = null));
    }));
});
