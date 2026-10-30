Class(function Initializer3D() {
  Inherit(this, Component);
  const _this = this;
  let _loader,
    _working,
    _promiseCount = 0,
    _queue = [],
    _resolved = Promise.create();
  async function workQueue() {
    (clearTimeout(_this.warningTimer), (_working = !0));
    let promise = _queue.shift();
    if (!promise) return (_working = !1);
    (promise.resolve(workQueue),
      Hydra.LOCAL &&
        (_this.warningTimer = _this.delayedCall((_) => {
          console.warn("Long running queue has taken more than 5 seconds.");
        }, 5e3)));
  }
  ((this.READY = "initializer_ready"),
    (this.bundle = function () {
      return new (function PromiseBundler() {
        const promises = [],
          ready = Promise.create();
        let timer;
        function run() {
          (clearTimeout(timer),
            (timer = _this.delayedCall((_) => {
              Promise.all(promises).then((_) => ready.resolve());
            }, 100)));
        }
        ((this.capture = function (promise) {
          (promises.push(promise), run());
        }),
          (this.ready = function () {
            return (run(), ready);
          }));
      })();
    }),
    (this.promise = this.capture =
      function (promise) {
        return (
          _loader && _loader.add(1),
          (async function wrapPromise(promise) {
            try {
              ((_promiseCount += 1), await promise);
            } finally {
              (_loader && _loader.trigger(1),
                (_promiseCount -= 1),
                0 === _promiseCount &&
                  (clearTimeout(_this.fire),
                  (_this.fire = _this.delayedCall((_) => {
                    (_this.events.fire(_this.READY),
                      _resolved.resolve(),
                      (_this.resolved = !0),
                      (Utils3D.onTextureCreated = null),
                      _loader && _loader.trigger(50));
                  }, 100))));
            }
          })(promise),
          promise
        );
      }),
    (this.ready = this.loaded =
      function () {
        return _resolved;
      }),
    (this.createWorld = async function () {
      (await Promise.all([
        AssetLoader.waitForLib("zUtils3D"),
        Shaders.ready(),
        GPU.ready(),
        UILStorage.ready(),
      ]),
        await MatrixWasm.ready(),
        World.instance());
    }),
    (this.linkSceneLayout = function (loader) {
      (_this.captureTextures(), (SceneLayout.initializer = _this.capture), (_loader = loader));
    }),
    (this.queue = function (immediate) {
      if (immediate) return Promise.resolve((_) => {});
      let promise = Promise.create();
      return (_queue.push(promise), _working || workQueue(), promise);
    }),
    (this.captureTextures = function () {
      Utils3D.onTextureCreated = (texture) => {
        _this.promise(texture.promise);
      };
    }),
    (this.uploadAll = async function (group) {
      if (!group) throw "Undefined passed to uploadAll";
      let sceneLayout;
      if (
        (group.layout && (group = group.layout),
        group instanceof SceneLayout || (window.StageLayout && group instanceof StageLayout))
      ) {
        if (((sceneLayout = group), sceneLayout.uploaded)) return;
        ((sceneLayout.uploaded = !0), await sceneLayout.loadedAllLayers(), (group = group.group));
      }
      let promises = [],
        layouts = [],
        textures = [];
      if (sceneLayout) {
        sceneLayout.textures = textures;
        for (let key in sceneLayout.layers) {
          let layer = sceneLayout.layers[key];
          layer.uploadSync && layer.uploadSync();
        }
      }
      if (sceneLayout?.parent) {
        for (let key in sceneLayout.parent.classes) {
          let clss = sceneLayout.parent.classes[key];
          (clss.upload && clss.upload(), clss.uploadSync && clss.uploadSync());
        }
        sceneLayout.parent.nuke && _this.uploadNuke(sceneLayout.parent.nuke);
      }
      let seen = new Set();
      (group.traverse((obj) => {
        if (
          !seen.has(obj) &&
          (seen.add(obj),
          obj.sceneLayout && obj != group && layouts.push(obj.sceneLayout),
          obj.stageLayout && obj != group && layouts.push(obj.stageLayout),
          !obj.uploadIgnore && 0 != obj.visible)
        ) {
          if (obj.shader)
            for (let key in obj.shader.uniforms) {
              let uniform = obj.shader.uniforms[key],
                val = uniform?.value;
              if (val) {
                if (seen.has(val)) continue;
                (seen.add(val),
                  val.promise &&
                    !val.uploadIgnore &&
                    (textures.push(val),
                    promises.push(val.promise.then(val.upload.bind(val)).catch((e) => {}))),
                  val.scene && layouts.push(val.scene),
                  val.layout && layouts.push(val.layout));
              }
            }
          (obj.shader && obj.shader.shadow && obj.shader.shadow.upload(),
            obj.classRef && obj.classRef.upload && obj.classRef.upload(),
            obj.asyncPromise
              ? promises.push(obj.asyncPromise.then(obj.upload.bind(obj)))
              : obj.upload && obj.upload());
        }
      }),
        await Promise.catchAll(promises),
        textures.forEach((t) => t.upload()));
      for (let i = 0; i < layouts.length; i++) await _this.uploadAll(layouts[i]);
      (sceneLayout &&
        sceneLayout._completeInitialization &&
        sceneLayout._completeInitialization(!0),
        sceneLayout && delete sceneLayout.textures);
    }),
    (this.uploadAllDistributed = this.uploadAllAsync =
      async function (group, releaseQueue) {
        if (!group) throw "Undefined passed to uploadAllDistributed";
        let sceneLayout;
        if (
          (group.layout && (group = group.layout),
          releaseQueue || "boolean" == typeof releaseQueue || (releaseQueue = await _this.queue()),
          group instanceof SceneLayout || (window.StageLayout && group instanceof StageLayout))
        ) {
          if (((sceneLayout = group), sceneLayout.uploaded))
            return "function" == typeof releaseQueue ? releaseQueue() : void 0;
          ((sceneLayout.uploaded = !0), await sceneLayout.loadedAllLayers(), (group = group.group));
        }
        let steppers = [],
          promises = [],
          layouts = [],
          textures = [];
        if (sceneLayout) {
          sceneLayout.textures = textures;
          for (let key in sceneLayout.layers) {
            let layer = sceneLayout.layers[key];
            layer.upload && !layer.uploadIgnore && !1 !== layer.visible && layer.upload();
          }
        }
        if (sceneLayout?.parent) {
          for (let key in sceneLayout.parent.classes) {
            let clss = sceneLayout.parent.classes[key];
            clss.upload && steppers.push(() => (clss.upload(), !0));
          }
          sceneLayout.parent.nuke && _this.uploadNukeAsync(sceneLayout.parent.nuke);
        }
        let seen = new Set(),
          pushUpload = (obj) => {
            steppers.push(() => (obj.upload(), !0));
          },
          pushGeometry = (geometry) => {
            seen.has(geometry) ||
              (steppers.push(Geometry.renderer.getUploadBuffersStepper(geometry)),
              seen.add(geometry));
          };
        group.traverse((obj) => {
          if (
            !seen.has(obj) &&
            (seen.add(obj),
            obj.sceneLayout && obj != group && layouts.push(obj.sceneLayout),
            obj.stageLayout && obj != group && layouts.push(obj.stageLayout),
            !obj.uploadIgnore && 0 != obj.visible)
          ) {
            if (obj.shader)
              for (let key in obj.shader.uniforms) {
                let uniform = obj.shader.uniforms[key],
                  val = uniform?.value;
                if (val) {
                  if (seen.has(val)) continue;
                  (seen.add(val),
                    val.promise &&
                      !val.uploadIgnore &&
                      (textures.push(val),
                      promises.push(val.promise.then((_) => pushUpload(val)).catch((e) => {}))),
                    val.scene && layouts.push(val.scene),
                    val.layout && layouts.push(val.layout));
                }
              }
            if (obj.asyncPromise)
              promises.push(
                obj.asyncPromise.then((_) => {
                  (obj.geometry && (obj.geometry.distributeBufferData = !0),
                    pushUpload(obj),
                    obj.geometry && pushGeometry(obj.geometry));
                }),
              );
            else if (obj.upload) {
              if (obj.geometry) {
                if (obj.geometry.uploaded) return;
                obj.geometry.distributeBufferData = !0;
              }
              (pushUpload(obj), obj.geometry && pushGeometry(obj.geometry));
            }
            (obj.shader && obj.shader.shadow && pushUpload(obj.shader.shadow),
              obj.classRef && obj.classRef.upload && pushUpload(obj.classRef));
          }
        });
        let canFinish = !1,
          promise = Promise.create(),
          stepperIndex = 0,
          worker = new Render.Worker((_) => {
            let stepper = steppers[stepperIndex];
            stepper
              ? stepper() && stepperIndex++
              : canFinish
                ? ((async () => {
                    for (let i = 0; i < layouts.length; i++)
                      await _this.uploadAllAsync(layouts[i], !!releaseQueue);
                    ("function" == typeof releaseQueue && releaseQueue(), promise.resolve());
                  })(),
                  worker.stop())
                : worker.pause();
          }, 2);
        return (
          Promise.catchAll(promises).then((_) => {
            (worker.resume(), (canFinish = !0));
          }),
          sceneLayout &&
            sceneLayout._completeInitialization &&
            sceneLayout._completeInitialization(!1),
          sceneLayout &&
            promise.then((_) => {
              delete sceneLayout.textures;
            }),
          promise
        );
      }),
    (this.detectUploadAll = function (group, sync, releaseQueue) {
      return sync ? _this.uploadAll(group) : _this.uploadAllDistributed(group, releaseQueue);
    }),
    (this.detectUploadNuke = function (nuke, sync) {
      return sync ? _this.uploadNuke(nuke) : _this.uploadNukeAsync(nuke);
    }),
    (this.uploadNuke = async function (nuke) {
      if (nuke && nuke.enabled) {
        for (let i = 0; i < nuke.passes.length; i++) {
          let pass = nuke.passes[i],
            uniforms = pass.uniforms;
          for (let key in uniforms)
            (uniforms[key].value &&
              uniforms[key].value.promise &&
              (await uniforms[key].value.promise),
              uniforms[key].value && uniforms[key].value.upload && uniforms[key].value.upload());
          pass.upload();
        }
        (Nuke.defaultPass.uploaded || Nuke.defaultPass.upload(), nuke.render());
      }
    }),
    (this.uploadNukeAsync = async function (nuke) {
      let queue = await _this.queue(),
        calls = [];
      for (let i = 0; i < nuke.passes.length; i++) {
        let pass = nuke.passes[i],
          uniforms = pass.uniforms;
        for (let key in uniforms)
          (uniforms[key].value &&
            uniforms[key].value.promise &&
            (await uniforms[key].value.promise),
            uniforms[key].value &&
              uniforms[key].value.upload &&
              calls.push(uniforms[key].value.upload.bind(uniforms[key].value)));
        calls.push(pass.upload.bind(pass));
      }
      (Nuke.defaultPass.uploaded || calls.push(Nuke.defaultPass.upload.bind(Nuke.defaultPass)),
        calls.push(nuke.render.bind(nuke)));
      let promise = Promise.create(),
        worker = new Render.Worker(function uploadBuffersAsync() {
          let cb = calls.shift();
          cb ? cb() : (promise.resolve(), worker.stop());
        });
      (await promise, queue());
    }),
    (this.destroyAll = function (scene) {
      scene.traverse((obj) => {
        if (obj.geometry && obj.shader) {
          for (let key in obj.shader.uniforms) {
            let uniform = obj.shader.uniforms[key];
            uniform && uniform.value instanceof Texture && uniform.value.destroy();
          }
          obj.destroy();
        }
      });
    }),
    this.set("loader", (loader) => {
      _loader = loader;
    }));
}, "static");
