Class(function CubemapToEquirectangular(_size, _cube) {
  Inherit(this, Component);
  const _this = this;
  var _quad,
    _scene = new Scene(),
    _camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1e4, 1e4),
    _output = Utils3D.createRT(_size, _size / 2);
  ((this.rt = _output),
    (function () {
      let width = _size,
        height = _size / 2,
        shader = _this.initClass(Shader, "Cube2Equi", {
          tCube: { value: _cube.rt || _cube },
          side: Shader.DOUBLE_SIDE,
        });
      (((_quad = new Mesh(World.QUAD, shader)).frustumCulled = !1),
        _scene.add(_quad),
        _quad.scale.set(width / 2, height / 2, 1),
        (_camera.left = width / -2),
        (_camera.right = width / 2),
        (_camera.top = height / 2),
        (_camera.bottom = height / -2),
        _camera.updateProjectionMatrix());
    })(),
    (this.render = function () {
      World.RENDERER.render(_scene, _camera, _output);
    }),
    (this.toBlob = function () {
      _this.render();
      let pixels = World.RENDERER.readPixels(_output, 0, 0, _size, _size / 2),
        imageData = new ImageData(new Uint8ClampedArray(pixels), _size, _size / 2),
        canvas = document.createElement("canvas");
      ((canvas.width = _size),
        (canvas.height = _size / 2),
        canvas.getContext("2d").putImageData(imageData, 0, 0),
        canvas.toBlob(function (blob) {
          var url = URL.createObjectURL(blob),
            fileName = "pano-" + document.title + "-" + Date.now() + ".png",
            anchor = document.createElement("a");
          ((anchor.href = url),
            anchor.setAttribute("download", fileName),
            (anchor.className = "download-js-link"),
            (anchor.innerHTML = "downloading..."),
            (anchor.style.display = "none"),
            document.body.appendChild(anchor),
            setTimeout(function () {
              (anchor.click(), document.body.removeChild(anchor));
            }, 1));
        }, "image/png"));
    }));
});
