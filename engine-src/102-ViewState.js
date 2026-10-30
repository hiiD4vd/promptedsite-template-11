Class(
  function ViewState(ViewClass, ...rest) {
    Inherit(this, Component);
    const _this = this;
    var _stateArray,
      _params,
      _dynamicViewClass,
      _callbacks = {},
      _bindings = [],
      _removals = [];
    "object" == typeof ViewClass &&
      (ViewClass.view || ViewClass.wait_view) &&
      ((ViewClass = (_params = ViewClass).view),
      (rest = [_params]),
      delete _params.view,
      (_this.listen = function (key, callback) {
        (_bindings.push(key), (_callbacks[key] = callback));
      }),
      (_this.onAddView = _params.onAddView),
      (_this.onRemoveView = _params.onRemoveView));
    var _instances = (this.views = []);
    function remove(data) {
      _this.animating = !0;
      for (let i = 0; i < _instances.length; i++) {
        let inst = _instances[i];
        if (data == inst.data) {
          let promise = _this.onRemoveView?.(inst, i) || inst.onRemoveView?.(i);
          (promise &&
            promise.then &&
            (_removals.push(promise),
            _this.disableAutoDestroy || promise.then((_) => inst.destroy?.())),
            _instances.splice(i, 1),
            0 === _instances.length && _this.onEmpty?.(),
            (promise && promise.then) ||
              _this.disableAutoDestroy ||
              !inst.destroy ||
              inst.destroy());
          break;
        }
      }
      if ((ViewState.clearScheduled(data, _this), _removals.length)) {
        let removals = _removals.slice();
        Promise.all(removals).then((_) => {
          (removals.forEach((removal) => {
            _removals.remove(removal);
          }),
            0 === _removals.length && (_this.animating = !1));
        });
      }
    }
    async function dataUpdate(e) {
      switch (e.type) {
        case "add":
          for (; _removals.length;) await Promise.all(_removals);
          _this.dataFilter(e.state) &&
            ViewState.schedule(
              _this,
              _dynamicViewClass ? ViewClass(e.state) : ViewClass,
              e.state,
              _stateArray.indexOf(e.state),
              rest,
            );
          break;
        case "remove":
          remove(e.state);
          break;
        case "modify":
          _this.dataFilter(e.state)
            ? (function update(data, index) {
                var _exists = !1;
                for (let i = 0; i < _instances.length; i++) {
                  let inst = _instances[i];
                  if (data._uid === inst.data._uid)
                    return (_this.onUpdateView?.(_instances[i], i), void (_exists = !0));
                }
                _exists ||
                  ViewState.schedule(
                    _this,
                    _dynamicViewClass ? ViewClass(data) : ViewClass,
                    data,
                    _stateArray.indexOf(data),
                  );
              })(e.state, e.index)
            : remove(e.state);
      }
    }
    ((this.hmr = function (view) {
      for (_dynamicViewClass || (ViewClass = window[view]); _instances.length;)
        remove(_instances[0].data);
      this.setSourceData(_stateArray);
    }),
      (this.setSourceData = function (array) {
        if (
          (void 0 === _dynamicViewClass &&
            (_dynamicViewClass = "function" == typeof ViewClass && !!_this.parent.contexts),
          "string" == typeof ViewClass && (ViewClass = window[ViewClass]),
          !Array.isArray(array) || array instanceof StateArray || (array = new StateArray(array)),
          !(array instanceof StateArray || Array.isArray(array)))
        )
          throw "ViewState::setSourceData must be instance of StateArray";
        ((_stateArray = _this.stateArray = array),
          _this.events.sub(array, Events.UPDATE, dataUpdate),
          array.forEach((state) => {
            _this.dataFilter(state) &&
              ViewState.schedule(
                _this,
                _dynamicViewClass ? ViewClass(state) : ViewClass,
                state,
                _stateArray.indexOf(state),
                rest,
              );
          }));
      }),
      (this.dataFilter = function (data) {
        return !0;
      }),
      (this.onInitialize = function (instance) {
        let unfilteredIndex = _stateArray.indexOf(instance.data),
          filteredIndex = -1;
        for (let i = 0; i < _instances.length; ++i) {
          let data = _instances[i].data;
          if (_stateArray.indexOf(data) > unfilteredIndex) {
            filteredIndex = i;
            break;
          }
        }
        if (
          (filteredIndex < 0 && (filteredIndex = _instances.length),
          instance.element && _this.parent.element && _this.parent.element.add)
        ) {
          let before = null;
          (filteredIndex < _instances.length &&
            _instances[filteredIndex].element &&
            (before = _instances[filteredIndex]),
            _this.parent.element.add(instance.element, before));
        }
        (_instances.splice(filteredIndex, 0, instance),
          _this.listen &&
            instance.state &&
            _bindings.forEach((key) => {
              _this.bindState(instance.state, key, (data) => {
                _callbacks[key]?.({ target: instance, data: data });
              });
            }),
          _params?.__parent && _params.__parent.add(instance),
          (instance.group || instance.mesh) &&
            _this.parent.group?.add(instance.group || instance.mesh),
          _this.onAddView?.(instance, filteredIndex));
      }),
      _params?.data && this.setSourceData(_params.data),
      (_params?.wait_data || _params?.wait_view) &&
        Promise.all([_params.wait_data || _params.data, _params.wait_view || _params.view]).then(
          ([data, view]) => {
            ((_params.data = data),
              (_params.view = view),
              (ViewClass = view),
              _this.setSourceData(data));
          },
        ));
  },
  (_) => {
    const queue = [],
      worker = new Render.Worker((_) => {
        let obj = queue.shift();
        if (obj) {
          let {
            ref: ref,
            ViewClass: ViewClass,
            data: data,
            index: index,
            additionalArgs: additionalArgs,
          } = obj;
          if (!ref.initClass) return;
          let args = [];
          additionalArgs.forEach((arg) => {
            args.push(...arg);
          });
          let inst = ref.initClass(ViewClass, data, index, ...args, null);
          ((inst.data = data), ref.onInitialize(inst));
        } else worker.pause();
      }, 2);
    (worker.pause(),
      (ViewState.clearScheduled = function (data, ref) {
        for (let i = 0; i < queue.length; i++) {
          let obj = queue[i];
          if (obj.data === data && obj.ref == ref) return queue.splice(i, 1);
        }
      }),
      (ViewState.schedule = function (ref, ViewClass, data, index, ...rest) {
        ref.initClass &&
          (queue.push({
            ref: ref,
            ViewClass: ViewClass,
            data: data,
            index: index,
            additionalArgs: rest,
          }),
          worker.resume());
      }));
  },
);
