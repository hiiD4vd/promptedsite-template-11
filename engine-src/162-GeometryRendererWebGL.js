Class(function GeometryRendererWebGL(_gl) {
  const _this = this;
  var _cache = {},
    _isDebbugingShader = Utils.query("displayShaderError");
  const WEBGL2 = Renderer.type == Renderer.WEBGL2,
    { getGLTypeForTypedArray: getGLTypeForTypedArray } = require("GLTypes");
  function updateBuffer(attrib, geom, attributeName) {
    if (!attrib._gl) return;
    ((attrib.needsUpdate = !1),
      _gl.bindBuffer(_gl.ARRAY_BUFFER, attrib._gl.buffer),
      RenderStats.update("BufferUpdates"));
    let array = attrib.array;
    if (checkAttributeArray(array, geom, attributeName)) {
      let updateRange = attrib.updateRange;
      if (-1 === updateRange.count)
        (attrib.needsNewBuffer
          ? (_gl.bufferData(_gl.ARRAY_BUFFER, attrib.array, _gl.DYNAMIC_DRAW),
            (attrib.needsNewBuffer = !1))
          : _gl.bufferSubData(_gl.ARRAY_BUFFER, 0, array),
          maybeDestroyAttributeData(geom, attributeName));
      else if (Array.isArray(updateRange)) {
        for (let i = updateRange.length - 1; i > -1; i--) {
          let { offset: offset, count: count } = updateRange[i];
          _gl.bufferSubData(
            _gl.ARRAY_BUFFER,
            offset * array.BYTES_PER_ELEMENT,
            array.subarray(offset, offset + count),
          );
        }
        updateRange.length = 0;
      } else
        _gl.bufferSubData(
          _gl.ARRAY_BUFFER,
          updateRange.offset * array.BYTES_PER_ELEMENT,
          array.subarray(updateRange.offset, updateRange.offset + updateRange.count),
        );
    }
    _gl.bindBuffer(_gl.ARRAY_BUFFER, null);
  }
  function renderingCount(count, mode, instanceCount = 1) {
    if (RenderStats.active)
      switch (mode) {
        case _gl.TRIANGLES:
          RenderStats.update("Triangles", instanceCount * (count / 3));
          break;
        case _gl.LINES:
          RenderStats.update("Lines", instanceCount * (count / 2));
          break;
        case _gl.LINE_STRIP:
          RenderStats.update("LineStrip", instanceCount * (count - 1));
          break;
        case _gl.LINE_LOOP:
          RenderStats.update("LineLoop", instanceCount * count);
          break;
        case _gl.POINTS:
          RenderStats.update("Points", instanceCount * count);
      }
  }
  function releaseVAO(mesh) {
    if (!(mesh && mesh._gl && mesh._gl.vao)) return;
    let cache = _cache[mesh._gl.lookup];
    (cache
      ? (cache.count--, 0 == cache.count && (cache.vao.destroy(), delete _cache[mesh._gl.lookup]))
      : mesh._gl.vao.destroy(),
      delete mesh._gl.vao);
  }
  function maybeDestroyAttributeData(geom, key) {
    if (!1 !== geom.destroyDataAfterUpload)
      if ("index" === key)
        (geom.index.destroyDataAfterUpload || geom.destroyDataAfterUpload) &&
          ((geom.index = geom.index.slice(0, 0)), (geom.index.deleted = !0));
      else {
        let attrib = geom.attributes[key];
        if (
          (attrib.dynamic && (attrib.destroyDataAfterUpload = !1),
          !attrib.destroyDataAfterUpload && !geom.destroyDataAfterUpload)
        )
          return;
        ("position" === key &&
          (geom.boundingSphere || geom.computeBoundingSphere(),
          geom.boundingBox || geom.computeBoundingBox()),
          attrib.releaseData());
      }
  }
  function checkAttributeArray(array, geom, attributeName) {
    return (
      !(array.deleted && !array.length) ||
      (array.hasWarned ||
        (console.error(`Attempt to update deleted geometry attribute ${attributeName}`, geom),
        (array.hasWarned = !0)),
      !1)
    );
  }
  ((this.draw = function (geom, mesh, shader, isQuery) {
    ((geom._gl && !geom.needsUpdate && mesh._gl && mesh._gl.geomInit) ||
      this.upload(geom, mesh, shader),
      RenderStats.active &&
        RenderStats.update("DrawCalls", 1, shader.vsName + "|" + shader.fsName, mesh));
    let hasInterleavedBuffers = !1;
    for (let i = geom._attributeKeys.length - 1; i > -1; i--) {
      let key = geom._attributeKeys[i],
        attrib = geom._attributeValues[i];
      if (
        ((mesh._gl.program == shader._gl.program && void 0 !== mesh._gl[key]) ||
          (mesh._gl[key] = _gl.getAttribLocation(shader._gl.program, key)),
        -1 !== mesh._gl[key])
      ) {
        if (attrib.isInterleaved && !hasInterleavedBuffers) {
          hasInterleavedBuffers = !0;
          for (let j = geom._attributeKeys.length - 1; j > -1; j--) {
            let attrib = geom._attributeValues[j];
            attrib.isInterleaved && attrib.data.dynamic && (attrib.data.needsUpdate = !0);
          }
        }
        attrib.isInterleaved && attrib.data.needsUpdate
          ? updateBuffer(attrib.data, geom, key)
          : (attrib.needsUpdate || attrib.dynamic) && updateBuffer(attrib, geom, key);
      }
    }
    if (((mesh._gl.program = shader._gl.program), geom.indexNeedsUpdate)) {
      if (checkAttributeArray(geom.index, geom, "index")) {
        if (
          ((geom._gl.indexType =
            geom.index instanceof Uint16Array ? _gl.UNSIGNED_SHORT : _gl.UNSIGNED_INT),
          (geom._gl.indexLength = geom.index.length),
          _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, geom._gl.index),
          geom.indexUpdateRange)
        ) {
          let updateRange = geom.indexUpdateRange;
          _gl.bufferSubData(
            _gl.ELEMENT_ARRAY_BUFFER,
            updateRange.offset * geom.index.BYTES_PER_ELEMENT,
            geom.index.subarray(updateRange.offset, updateRange.offset + updateRange.count),
          );
        } else _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, geom.index, _gl.STATIC_DRAW);
        (_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null), maybeDestroyAttributeData(geom, "index"));
      }
      geom.indexNeedsUpdate = !1;
    }
    mesh._gl.vao.bind();
    let mode = mesh._gl.mode;
    mode ||
      (mesh._gl.mode = mode =
        (function getMode(mesh, shader) {
          return mesh.isPoints
            ? _gl.POINTS
            : mesh.isLine
              ? _gl.LINE_STRIP
              : shader.wireframe
                ? _gl.LINE_LOOP
                : _gl.TRIANGLES;
        })(mesh, shader));
    let drawStart = geom.drawRange.start || 0,
      drawEnd =
        geom.drawRange.end || (geom.index ? geom._gl.indexLength : geom.attributes.position.count);
    if (
      (geom.index && (drawStart *= geom._gl.indexType === _gl.UNSIGNED_SHORT ? 2 : 4),
      isQuery && WEBGL2)
    ) {
      let queryMesh = mesh._queryMesh;
      void 0 !== queryMesh._gl &&
        (queryMesh._gl.queryInProgress &&
          _gl.getQueryParameter(queryMesh._gl.query, _gl.QUERY_RESULT_AVAILABLE) &&
          ((queryMesh._gl.occluded = !_gl.getQueryParameter(queryMesh._gl.query, _gl.QUERY_RESULT)),
          (queryMesh._gl.queryInProgress = !1)),
        queryMesh._gl.queryInProgress ||
          (_gl.beginQuery(_gl.ANY_SAMPLES_PASSED_CONSERVATIVE, queryMesh._gl.query),
          _gl.colorMask(!1, !1, !1, !1),
          _gl.depthMask(!1),
          geom.index
            ? (_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, geom._gl.index),
              _gl.drawElements(mode, drawEnd, geom._gl.indexType, drawStart))
            : _gl.drawArrays(mode, drawStart, drawEnd),
          _gl.colorMask(!0, !0, !0, !0),
          _gl.depthMask(!0),
          _gl.endQuery(_gl.ANY_SAMPLES_PASSED_CONSERVATIVE),
          (queryMesh._gl.queryInProgress = !0)));
    } else {
      if (geom.isInstanced) {
        let maxInstancedCount = mesh.maxInstancedCount
          ? Math.min(mesh.maxInstancedCount, geom.maxInstancedCount)
          : geom.maxInstancedCount;
        (shader.maxInstancedCount &&
          (maxInstancedCount = Math.min(maxInstancedCount || 9999, shader.maxInstancedCount)),
          WEBGL2
            ? geom.index
              ? _gl.drawElementsInstanced(
                  mode,
                  drawEnd,
                  geom._gl.indexType,
                  drawStart,
                  maxInstancedCount,
                )
              : _gl.drawArraysInstanced(mode, drawStart, drawEnd, maxInstancedCount)
            : geom.index
              ? Renderer.extensions.instancedArrays.drawElementsInstancedANGLE(
                  mode,
                  drawEnd,
                  geom._gl.indexType,
                  drawStart,
                  maxInstancedCount,
                )
              : Renderer.extensions.instancedArrays.drawArraysInstancedANGLE(
                  mode,
                  drawStart,
                  drawEnd,
                  maxInstancedCount,
                ),
          renderingCount(geom.index ? geom._gl.indexLength : drawEnd, mode, maxInstancedCount));
      } else
        mesh.hideByOcclusion ||
          (geom.index
            ? _gl.drawElements(mode, drawEnd, geom._gl.indexType, drawStart)
            : _gl.drawArrays(mode, drawStart, drawEnd),
          renderingCount(geom.index ? geom._gl.indexLength : drawEnd, mode, 1));
      (_isDebbugingShader && _gl.getError() != _gl.NO_ERROR && console.log(mesh, shader),
        mesh._gl.vao.unbind(),
        WEBGL2 &&
          "undefined" != typeof RenderMonitor &&
          RenderMonitor.active &&
          shader?.renderTimeQuery?.endTest?.());
    }
  }),
    (this.upload = function (geom, mesh, shader, hotload) {
      if (!mesh) return;
      (geom._gl || (geom._gl = { id: Utils.timestamp() }),
        mesh._gl || (mesh._gl = {}),
        (mesh._gl.geomInit = !0),
        (geom.uploaded = !0),
        !mesh.isOcclusionMesh &&
          WEBGL2 &&
          ((mesh._gl.query = _gl.createQuery()),
          (mesh._gl.queryInProgress = !1),
          (mesh._gl.occluded = !1)));
      const KEY = `${geom._gl.id}_${shader._gl._id}`;
      let cached = _cache[KEY];
      if (cached && !hotload)
        return (cached.count++, (mesh._gl.vao = cached.vao), void (mesh._gl.lookup = KEY));
      (Utils.query("debugUpload") && console.log("?debugUpload – upload geometry", geom),
        RenderCount.add("geometry"),
        releaseVAO(mesh),
        (mesh._gl.vao = new VAO(_gl)),
        geom.distributeBufferData || RenderCount.add("geom_upload", geom));
      for (let i = geom._attributeKeys.length - 1; i > -1; i--) {
        let key = geom._attributeKeys[i],
          attrib = geom._attributeValues[i],
          location =
            (mesh._gl.program === shader._gl.program && mesh._gl[key]) ||
            _gl.getAttribLocation(shader._gl.program, key);
        if (((mesh._gl[key] = location), attrib._gl)) continue;
        attrib._gl = {};
        let { array: array, dynamic: dynamic } = attrib;
        (attrib.isInterleaved &&
          (attrib.data._gl || (attrib.data._gl = attrib._gl),
          (attrib._gl = attrib.data._gl),
          (array = attrib.data.array),
          (dynamic = attrib.data.dynamic)),
          checkAttributeArray(array, geom, key) &&
            (attrib._gl.buffer ||
              ((attrib._gl.buffer = _gl.createBuffer()),
              (attrib._gl.bufferUploaded = !geom.distributeBufferData),
              checkAttributeArray(array, geom, key) &&
                (_gl.bindBuffer(_gl.ARRAY_BUFFER, attrib._gl.buffer),
                _gl.bufferData(
                  _gl.ARRAY_BUFFER,
                  geom.distributeBufferData ? array.length * array.BYTES_PER_ELEMENT : array,
                  dynamic ? _gl.DYNAMIC_DRAW : _gl.STATIC_DRAW,
                ),
                _gl.bindBuffer(_gl.ARRAY_BUFFER, null),
                attrib.needsNewBuffer && (attrib.needsNewBuffer = !1)),
              geom.distributeBufferData || maybeDestroyAttributeData(geom, key)),
            (attrib.needsUpdate = !1)));
      }
      (geom.index &&
        (geom._gl.index ||
          (checkAttributeArray(geom.index, geom, "index") &&
            ((geom._gl.index = _gl.createBuffer()),
            (geom._gl.indexType =
              geom.index instanceof Uint16Array ? _gl.UNSIGNED_SHORT : _gl.UNSIGNED_INT),
            (geom._gl.indexLength = geom.index.length),
            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, geom._gl.index),
            _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, geom.index, _gl.STATIC_DRAW),
            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null),
            maybeDestroyAttributeData(geom, "index")))),
        mesh._gl.vao.bind());
      for (let i = geom._attributeKeys.length - 1; i > -1; i--) {
        let array,
          key = geom._attributeKeys[i],
          attrib = geom._attributeValues[i],
          location = mesh._gl[key];
        if (-1 == location) continue;
        let stride = 0,
          offset = 0;
        if (attrib.isInterleaved) {
          array = attrib.data.array;
          let bytes = array.BYTES_PER_ELEMENT;
          ((stride = attrib.data.stride * bytes), (offset = attrib.offset * bytes));
        } else array = attrib.array;
        (_gl.bindBuffer(_gl.ARRAY_BUFFER, attrib._gl.buffer),
          array instanceof Float32Array
            ? _gl.vertexAttribPointer(location, attrib.itemSize, _gl.FLOAT, !1, stride, offset)
            : _gl.vertexAttribIPointer(
                location,
                attrib.itemSize,
                getGLTypeForTypedArray(array),
                !1,
                stride,
                offset,
              ),
          _gl.enableVertexAttribArray(location),
          geom.isInstanced &&
            (WEBGL2
              ? _gl.vertexAttribDivisor(location, attrib.meshPerAttribute)
              : Renderer.extensions.instancedArrays.vertexAttribDivisorANGLE(
                  location,
                  attrib.meshPerAttribute,
                )));
      }
      (geom.index && _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, geom._gl.index),
        mesh._gl.vao.unbind(),
        (_cache[KEY] = { count: 1, vao: mesh._gl.vao }),
        (mesh._gl.lookup = KEY));
    }),
    (this.destroy = function (geom, mesh) {
      if (!geom.keepAlive) {
        for (let i = geom._attributeKeys.length - 1; i > -1; i--) {
          geom._attributeKeys[i];
          let attrib = geom._attributeValues[i];
          attrib._gl && (_gl.deleteBuffer(attrib._gl.buffer), (attrib._gl = null));
        }
        (geom._gl?.index && _gl.deleteBuffer(geom._gl.index),
          delete geom._gl,
          (geom.uploaded = !1),
          RenderCount.remove("geometry"));
      }
      releaseVAO(mesh);
    }),
    (this.resetMeshGeom = function (mesh) {
      mesh._gl && (mesh._gl.geomInit = !1);
    }),
    (this.getUploadBuffersStepper = function (geom) {
      let uploadedSome;
      geom.distributeBufferData = !0;
      let chunk,
        i,
        amt,
        attributeIndex = 0,
        isUploadingAttribute = !1;
      return function () {
        if (geom._gl && geom._gl.uploadedAsync) return !0;
        if (attributeIndex > geom._attributeKeys.length - 1) return !0;
        let key = geom._attributeKeys[attributeIndex],
          attrib = geom._attributeValues[attributeIndex];
        if (isUploadingAttribute) {
          let array = attrib.array,
            buffer = attrib._gl.buffer,
            offset = i * chunk,
            subarray = array.subarray(offset, offset + chunk);
          if (!attrib._gl) return !0;
          if (
            (subarray.length &&
              (_gl.bindBuffer(_gl.ARRAY_BUFFER, buffer),
              _gl.bufferSubData(_gl.ARRAY_BUFFER, offset * array.BYTES_PER_ELEMENT, subarray),
              _gl.bindBuffer(_gl.ARRAY_BUFFER, null)),
            ++i === amt)
          ) {
            if (
              ((attrib.needsUpdate = !1),
              maybeDestroyAttributeData(geom, key),
              attributeIndex === geom._attributeKeys.length - 1)
            )
              return (
                (geom._gl.uploadedAsync = !0),
                uploadedSome && RenderCount.add("geom_uploadAsync", geom),
                !0
              );
            (attributeIndex++, (isUploadingAttribute = !1));
          }
        } else {
          if (!attrib._gl) {
            let { array: array, dynamic: dynamic } = attrib;
            ((attrib._gl = {}),
              attrib.isInterleaved &&
                (attrib.data._gl || (attrib.data._gl = attrib._gl),
                (attrib._gl = attrib.data._gl),
                (array = attrib.data.array),
                (dynamic = attrib.data.dynamic)),
              attrib._gl.buffer ||
                ((attrib._gl.buffer = _gl.createBuffer()),
                (attrib._gl.bufferUploaded = !geom.distributeBufferData),
                checkAttributeArray(array, geom, key) &&
                  (_gl.bindBuffer(_gl.ARRAY_BUFFER, attrib._gl.buffer),
                  _gl.bufferData(
                    _gl.ARRAY_BUFFER,
                    array.length * array.BYTES_PER_ELEMENT,
                    dynamic ? _gl.DYNAMIC_DRAW : _gl.STATIC_DRAW,
                  ),
                  _gl.bindBuffer(_gl.ARRAY_BUFFER, null))),
              (attrib.needsUpdate = !1),
              (geom.needsUpdate = !0));
          }
          if (attrib._gl.bufferUploaded)
            return attributeIndex === geom._attributeKeys.length - 1
              ? ((geom._gl.uploadedAsync = !0),
                uploadedSome && RenderCount.add("geom_uploadAsync", geom),
                !0)
              : void attributeIndex++;
          ((attrib._gl.bufferUploaded = !0), (uploadedSome = !0));
          let array = attrib.array;
          amt = 4;
          for (; amt--, array.length % amt != 0;);
          ((chunk = array.length / amt), (i = 0), (isUploadingAttribute = !0));
        }
      };
    }),
    (this.uploadBuffersAsync = async function (geom) {
      let stepper = _this.getUploadBuffersStepper(geom),
        promise = Promise.create(),
        worker = new Render.Worker(function () {
          stepper() && (promise.resolve(), worker.stop());
        });
      return promise;
    }));
});
