Class(
  function HydraObject(_selector, _type, _exists, _useFragment) {
    ((this._children = new LinkedList()),
      (this.__useFragment = _useFragment),
      this._initSelector(_selector, _type, _exists));
  },
  () => {
    var prototype = HydraObject.prototype;
    const svgElements = [
        "svg",
        "path",
        "rect",
        "circle",
        "filter",
        "clippath",
        "clipPath",
        "ellipse",
        "image",
        "mask",
        "polygon",
        "g",
        "animate",
        "line",
        "linearGradient",
        "marker",
        "mpath",
        "polyline",
        "set",
        "stop",
        "text",
        "defs",
        "use",
      ],
      _mountedCallbacksProp =
        "function" == typeof Symbol ? Symbol("mountedCallbacks") : "_mountedCallbacks",
      _unmountedCallbacksProp =
        "function" == typeof Symbol ? Symbol("unmountedCallbacks") : "_unmountedCallbacks",
      _onceMountedCallbacksProp =
        "function" == typeof Symbol ? Symbol("onceMountedCallbacks") : "_onceMountedCallbacks",
      _resizeCallbacksProp =
        "function" == typeof Symbol ? Symbol("resizeCallbacks") : "_resizeCallbacks",
      _skipResizeCallbacksProp =
        "function" == typeof Symbol ? Symbol("skipResizeCallbacks") : "_skipResizeCallbacks",
      _inDOMProp = "function" == typeof Symbol ? Symbol("inDOM") : "_inDOM",
      _isObservingResizeProp =
        "function" == typeof Symbol ? Symbol("isObservingResize") : "_isObservingResize",
      _initialCallbackFiredProp =
        "function" == typeof Symbol ? Symbol("initialCallbackFired") : "_initialCallbackFired",
      _currentSizeProp = "function" == typeof Symbol ? Symbol("currentSize") : "_currentSize";
    let _observerBusy = !1;
    const _observer = new ResizeObserver((entries) => {
      ((_observerBusy = !0),
        entries.forEach((entry) => {
          const target = entry.target,
            hydraObject = target.hydraObject;
          if (!hydraObject) return void _observer.unobserve(target);
          hydraObject[_currentSizeProp] = entry;
          let resizeCallbacks = hydraObject[_resizeCallbacksProp],
            skipResizeCallbacks = hydraObject[_skipResizeCallbacksProp];
          if (resizeCallbacks)
            for (let i = 0; i < resizeCallbacks.length; i++) {
              let callback = resizeCallbacks[i];
              callback
                ? skipResizeCallbacks?.has(callback) || callback(entry, hydraObject)
                : (resizeCallbacks.splice(i, 1), (i -= 0));
            }
          (skipResizeCallbacks && skipResizeCallbacks.clear(),
            (hydraObject[_initialCallbackFiredProp] = !0),
            checkInDom(target, entry.contentRect || entry.contentBoxSize),
            resizeCallbacks?.length ||
              hydraObject[_mountedCallbacksProp]?.length ||
              hydraObject[_unmountedCallbacksProp]?.length ||
              hydraObject[_onceMountedCallbacksProp]?.size ||
              (_observer.unobserve(target),
              (hydraObject[_inDOMProp] = null),
              (hydraObject[_isObservingResizeProp] = !1),
              (hydraObject[_initialCallbackFiredProp] = !1)));
        }),
        (_observerBusy = !1));
    });
    function checkInDom(target, size = target.getBoundingClientRect()) {
      const hydraObject = target.hydraObject;
      if (!hydraObject) return void _observer.unobserve(target);
      let mountedCallbacks = hydraObject[_mountedCallbacksProp],
        unmountedCallbacks = hydraObject[_unmountedCallbacksProp],
        onceMountedCallbacks = hydraObject[_onceMountedCallbacksProp],
        inDOM = !(!size.width && !size.height);
      if (!inDOM) {
        let parent = target.parentNode;
        for (; parent;) {
          if (parent === document.documentElement) {
            inDOM = !0;
            break;
          }
          (parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE && defer(() => checkInDom(target)),
            (parent = parent.parentNode));
        }
      }
      if (hydraObject[_inDOMProp] !== inDOM) {
        hydraObject[_inDOMProp] = inDOM;
        let callbacks = inDOM ? mountedCallbacks : unmountedCallbacks;
        if (callbacks)
          for (let i = 0; i < callbacks.length; i++) {
            const callback = callbacks[i];
            callback ? callback(hydraObject) : (callbacks.splice(i, 1), (i -= 1));
          }
        inDOM &&
          onceMountedCallbacks &&
          (onceMountedCallbacks.forEach((callback) => {
            callback(hydraObject);
          }),
          onceMountedCallbacks.clear());
      }
    }
    function unsubResizeObserver(prop, callback) {
      let callbacks = this[prop];
      if (!callbacks) return;
      let i = 0;
      for (; (i = callbacks.indexOf(callback, i)), !(i < 0);)
        _observerBusy ? ((callbacks[i] = null), (i += 1)) : callbacks.splice(i, 1);
      0 === callbacks.length &&
        ((this[prop] = null),
        this[_mountedCallbacksProp]?.length ||
          this[_unmountedCallbacksProp]?.length ||
          this[_resizeCallbacksProp]?.length ||
          !this[_isObservingResizeProp] ||
          (_observer.unobserve(this.div),
          (this[_inDOMProp] = null),
          (this[_isObservingResizeProp] = !1),
          (this[_initialCallbackFiredProp] = !1)));
    }
    function subResizeObserver(prop, callback, callInitial = !0) {
      let callbacks = this[prop];
      if (
        (callbacks || ((callbacks = []), (this[prop] = callbacks)),
        !(callbacks.indexOf(callback) >= 0))
      ) {
        if ((callbacks.push(callback), !callInitial && !this[_initialCallbackFiredProp])) {
          let skipResizeCallbacks = this[_skipResizeCallbacksProp];
          (skipResizeCallbacks ||
            ((skipResizeCallbacks = new Set()),
            (this[_skipResizeCallbacksProp] = skipResizeCallbacks)),
            skipResizeCallbacks.add(callback));
        }
        return (
          !!this[_isObservingResizeProp] ||
          (_observer.observe(this.div), (this[_isObservingResizeProp] = !0), !1)
        );
      }
    }
    const _wrappedProp = "function" == typeof Symbol ? Symbol("wrapped") : "_wrapped";
    function makeSizeChangeCallback(callback, dimension, callInitial = !0) {
      if (callback[_wrappedProp]?.[dimension]) return callback[_wrappedProp][dimension];
      let currentValue,
        wrapped = function (entry) {
          const value = (entry.contentRect || entry.contentBoxSize)[dimension];
          (value !== currentValue && (callInitial || void 0 !== currentValue) && callback(value),
            (currentValue = value));
        },
        callbacks = callback[_wrappedProp] || {};
      return ((callbacks[dimension] = wrapped), (callback[_wrappedProp] = callbacks), wrapped);
    }
    ((prototype._initSelector = function (_selector, _type, _exists) {
      if (_selector && "string" != typeof _selector) this.div = _selector;
      else {
        var first = _selector ? _selector.charAt(0) : null,
          name = _selector ? _selector.slice(1) : null;
        if (("." != first && "#" != first && ((name = _selector), (first = ".")), _exists)) {
          if ("#" != first) throw "Hydra Selectors Require #ID";
          this.div = document.getElementById(name);
        } else
          ((this._type = _type || "div"),
            svgElements.includes(this._type)
              ? ((this.div = document.createElementNS("http://www.w3.org/2000/svg", this._type)),
                "svg" === this._type &&
                  this.div.setAttributeNS(
                    "http://www.w3.org/2000/xmlns/",
                    "xmlns:xlink",
                    "http://www.w3.org/1999/xlink",
                  ))
              : (this.div = document.createElement(this._type)),
            first &&
              ("#" === first
                ? (this.div.id = name)
                : "unnamed" !== name &&
                  ("object" == typeof this.div.className && "baseVal" in this.div.className
                    ? (this.div.className.baseVal = name)
                    : (this.div.className = name))));
      }
      this.div.hydraObject = this;
    }),
      (prototype.add = function (child, before = null) {
        this.div;
        var _this = this,
          doInsertChild = function (childDiv) {
            (before &&
              (before.element && before.element instanceof HydraObject
                ? (before = before.element.div)
                : before.div
                  ? (before = before.div)
                  : before.nodeName || (before = null)),
              before && before.parentNode !== _this.div && (before = null),
              _this.div.insertBefore(childDiv, before));
          },
          insertChild = function (childDiv) {
            _this.__useFragment
              ? (_this._fragment ||
                  ((_this._fragment = document.createDocumentFragment()),
                  defer(function () {
                    if (!_this._fragment || !_this.div) return void delete _this._fragment;
                    const hydraObjectsWithMountedHooks = Array.prototype.map
                      .call(_this._fragment.childNodes, (childDiv) => childDiv.hydraObject)
                      .filter(($child) => $child?.onMountedHook);
                    if (
                      Array.prototype.every.call(
                        _this._fragment.childNodes,
                        (childDiv) => !childDiv._fragmentBefore,
                      )
                    )
                      _this.div.appendChild(_this._fragment);
                    else
                      for (; _this._fragment.childNodes.length;)
                        ((childDiv = _this._fragment.childNodes[0]),
                          (before = childDiv._fragmentBefore),
                          delete childDiv._fragmentBefore,
                          doInsertChild(childDiv));
                    (delete _this._fragment,
                      defer((_) => {
                        hydraObjectsWithMountedHooks.forEach(($child) => {
                          $child.onMountedHook &&
                            ($child.onMountedHook(), delete $child.onMountedHook);
                        });
                      }));
                  })),
                _this._fragment.appendChild(childDiv),
                (childDiv._fragmentBefore = before))
              : (doInsertChild(childDiv),
                childDiv.hydraObject?.onMountedHook &&
                  defer((_) => {
                    childDiv.hydraObject?.onMountedHook &&
                      (childDiv.hydraObject.onMountedHook(),
                      delete childDiv.hydraObject.onMountedHook);
                  }));
          };
        return (
          child.element && child.element instanceof HydraObject
            ? (insertChild(child.element.div),
              this._children.push(child.element),
              (child.element._parent = this),
              (child.element.div.parentNode = this.div))
            : child.div
              ? (insertChild(child.div),
                this._children.push(child),
                (child._parent = this),
                (child.div.parentNode = this.div))
              : child.nodeName && (insertChild(child), (child.parentNode = this.div)),
          this
        );
      }),
      (prototype.clone = function () {
        return $(this.div.cloneNode(!0));
      }),
      (prototype.create = function (name, type) {
        var $obj = $(name, type);
        return (this.add($obj), $obj);
      }),
      (prototype.empty = function () {
        for (var child = this._children.start(); child;) {
          var next = this._children.next();
          (child && child.remove && child.remove(), (child = next));
        }
        return ((this.div.innerHTML = ""), this);
      }),
      (prototype.parent = function () {
        return this._parent;
      }),
      (prototype.children = function (isHydraChildren = !1) {
        let children = this.div.children ? this.div.children : this.div.childNodes;
        if (isHydraChildren) {
          children = [];
          for (var child = this._children.start(); child;)
            child && (children.push(child), (child = this._children.next()));
        }
        return children;
      }),
      (prototype.removeChild = function (object, keep) {
        try {
          object.div.parentNode.removeChild(object.div);
        } catch (e) {}
        keep || this._children.remove(object);
      }),
      (prototype.remove = function (param) {
        (param &&
          console.warn(
            "HydraObject.remove removes ITSELF from its parent. use removeChild instead",
          ),
          this._onDestroy && this._onDestroy.forEach((cb) => cb()),
          (this.removed = !0),
          this.clearInteract(),
          this.clearBind());
        var parent = this._parent;
        parent && !parent.removed && parent.removeChild && parent.removeChild(this, !0);
        for (var child = this._children.start(); child;) {
          var next = this._children.next();
          (child && child.remove && child.remove(), (child = next));
        }
        (this._children.destroy(), (this.div.hydraObject = null), Utils.nullObject(this));
      }),
      (prototype.destroy = function () {
        (this[_inDOMProp] && (this[_inDOMProp] = null),
          this[_isObservingResizeProp] &&
            (_observer.unobserve(this.div), (this[_isObservingResizeProp] = !1)),
          (this[_mountedCallbacksProp] = null),
          (this[_unmountedCallbacksProp] = null),
          (this[_resizeCallbacksProp] = null),
          (this[_initialCallbackFiredProp] = !1),
          this.remove());
      }),
      (prototype._bindOnDestroy = function (cb) {
        (this._onDestroy || (this._onDestroy = []), this._onDestroy.push(cb));
      }),
      (prototype.onResize = function (callback, callInitial = !0) {
        if (subResizeObserver.call(this, _resizeCallbacksProp, callback, callInitial)) {
          if (!callInitial) return;
          let entry = this[_currentSizeProp];
          entry && callback(entry, this);
        }
      }),
      (prototype.offResize = function (callback) {
        unsubResizeObserver.call(this, _resizeCallbacksProp, callback);
      }),
      (prototype.onWidthChange = function (callback, callInitial = !0) {
        this.onResize(makeSizeChangeCallback(callback, "width", callInitial));
      }),
      (prototype.offWidthChange = function (callback) {
        let wrapped = callback[_wrappedProp]?.width;
        wrapped && (this.offResize(wrapped), (callback[_wrappedProp].width = null));
      }),
      (prototype.onHeightChange = function (callback, callInitial = !0) {
        this.onResize(makeSizeChangeCallback(callback, "height", callInitial));
      }),
      (prototype.offHeightChange = function (callback) {
        let wrapped = callback[_wrappedProp]?.height;
        wrapped && (this.offResize(wrapped), (callback[_wrappedProp].height = null));
      }),
      (prototype.onMount = function (callback) {
        (subResizeObserver.call(this, _mountedCallbacksProp, callback),
          this[_inDOMProp] && callback(this));
      }),
      (prototype.offMount = function (callback) {
        unsubResizeObserver.call(this, _mountedCallbacksProp, callback);
      }),
      (prototype.onFirstMount = function (callback) {
        if (this[_inDOMProp]) return void callback(this);
        let callbacks = this[_onceMountedCallbacksProp];
        (callbacks || ((callbacks = new Set()), (this[_onceMountedCallbacksProp] = callbacks)),
          callbacks.add(callback),
          this[_isObservingResizeProp] ||
            (_observer.observe(this.div), (this[_isObservingResizeProp] = !0)));
      }),
      (prototype.offFirstMount = function (callback) {
        let callbacks = this[_onceMountedCallbacksProp];
        callbacks && callbacks.delete(callback);
      }),
      (prototype.onUnmount = function (callback) {
        (subResizeObserver.call(this, _unmountedCallbacksProp, callback),
          this[_inDOMProp] || callback(this));
      }),
      (prototype.offUnmount = function (callback) {
        unsubResizeObserver.call(this, _unmountedCallbacksProp, callback);
      }),
      (prototype.mounted = function () {
        let promise = Promise.create();
        return (this.onFirstMount(promise.resolve), promise);
      }),
      Object.defineProperty(prototype, "inDOM", {
        get: function () {
          return this[_inDOMProp];
        },
      }),
      (window.$ = function (selector, type, exists) {
        return selector && "string" != typeof selector && selector.hydraObject
          ? selector.hydraObject
          : new HydraObject(selector, type, exists);
      }),
      ($.fn = HydraObject.prototype));
  },
);
