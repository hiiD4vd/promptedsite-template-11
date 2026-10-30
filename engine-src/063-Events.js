Class(
  function Events() {
    const _this = this;
    this.events = {};
    const _e = {},
      _linked = [];
    let _emitter;
    ((this.events.sub = function (obj, evt, callback) {
      if (("object" != typeof obj && ((callback = evt), (evt = obj), (obj = null)), !obj))
        return (
          Events.emitter._addEvent(evt, callback.resolve ? callback.resolve : callback, this),
          callback
        );
      let emitter = obj.events.emitter();
      return (
        emitter._addEvent(evt, callback.resolve ? callback.resolve : callback, this),
        emitter._saveLink(this),
        _linked.push(emitter),
        callback
      );
    }),
      (this.events.wait = async function (obj, evt) {
        const promise = Promise.create(),
          args = [
            obj,
            evt,
            (e) => {
              (_this.events.unsub(...args), promise.resolve(e));
            },
          ];
        return ("object" != typeof obj && args.splice(1, 1), _this.events.sub(...args), promise);
      }),
      (this.events.unsub = function (obj, evt, callback) {
        if (("object" != typeof obj && ((callback = evt), (evt = obj), (obj = null)), !obj))
          return Events.emitter._removeEvent(evt, callback.resolve ? callback.resolve : callback);
        obj.events.emitter()._removeEvent(evt, callback.resolve ? callback.resolve : callback);
      }),
      (this.events.fire = function (evt, obj, isLocalOnly) {
        (((obj = obj || _e).target = this),
          Events.emitter._check(evt),
          (_emitter && _emitter._fireEvent(evt, obj)) ||
            isLocalOnly ||
            Events.emitter._fireEvent(evt, obj));
      }),
      (this.events.bubble = function (obj, evt) {
        _this.events.sub(obj, evt, (e) => _this.events.fire(evt, e));
      }),
      (this.events.destroy = function () {
        return (
          Events.emitter._destroyEvents(this),
          _linked &&
            (_linked.forEach((emitter) => emitter._destroyEvents(this)), (_linked.length = 0)),
          _emitter &&
            _emitter.links &&
            (_emitter.links.forEach((obj) => obj.events && obj.events._unlink(_emitter)),
            (_emitter = null)),
          null
        );
      }),
      (this.events.emitter = function () {
        return (_emitter || (_emitter = Events.emitter.createLocalEmitter()), _emitter);
      }),
      (this.events._unlink = function (emitter) {
        _linked.remove(emitter);
      }));
  },
  () => {
    ((Events.emitter = new (function Emitter() {
      const prototype = Emitter.prototype;
      if (((this.events = []), void 0 !== prototype._check)) return;
      ((prototype._check = function (evt) {
        if (void 0 === evt) throw "Undefined event";
      }),
        (prototype._addEvent = function (evt, callback, object) {
          (this._check(evt), this.events.push({ evt: evt, object: object, callback: callback }));
        }),
        (prototype._removeEvent = function (eventString, callback) {
          this._check(eventString);
          for (let i = this.events.length - 1; i >= 0; i--)
            this.events[i].evt === eventString &&
              this.events[i].callback === callback &&
              this._markForDeletion(i);
        }),
        (prototype._sweepEvents = function () {
          for (let i = 0; i < this.events.length; i++)
            this.events[i].markedForDeletion &&
              (delete this.events[i].markedForDeletion, this.events.splice(i, 1), --i);
        }),
        (prototype._markForDeletion = function (i) {
          ((this.events[i].markedForDeletion = !0),
            this._sweepScheduled ||
              ((this._sweepScheduled = !0),
              defer(() => {
                ((this._sweepScheduled = !1), this._sweepEvents());
              })));
        }),
        (prototype._fireEvent = function (eventString, obj) {
          (this._check && this._check(eventString), (obj = obj || _e));
          let called = !1;
          for (let i = 0; i < this.events.length; i++) {
            let evt = this.events[i];
            evt.evt != eventString || evt.markedForDeletion || (evt.callback(obj), (called = !0));
          }
          return called;
        }),
        (prototype._destroyEvents = function (object) {
          for (var i = this.events.length - 1; i >= 0; i--)
            this.events[i].object === object && this._markForDeletion(i);
        }),
        (prototype._saveLink = function (obj) {
          (this.links || (this.links = []), ~this.links.indexOf(obj) || this.links.push(obj));
        }),
        (prototype.createLocalEmitter = function () {
          return new Emitter();
        }));
    })()),
      (Events.broadcast = Events.emitter._fireEvent),
      (Events.VISIBILITY = "hydra_visibility"),
      (Events.HASH_UPDATE = "hydra_hash_update"),
      (Events.COMPLETE = "hydra_complete"),
      (Events.PROGRESS = "hydra_progress"),
      (Events.CONNECTIVITY = "hydra_connectivity"),
      (Events.UPDATE = "hydra_update"),
      (Events.LOADED = "hydra_loaded"),
      (Events.END = "hydra_end"),
      (Events.FAIL = "hydra_fail"),
      (Events.SELECT = "hydra_select"),
      (Events.ERROR = "hydra_error"),
      (Events.READY = "hydra_ready"),
      (Events.RESIZE = "hydra_resize"),
      (Events.CLICK = "hydra_click"),
      (Events.HOVER = "hydra_hover"),
      (Events.MESSAGE = "hydra_message"),
      (Events.ORIENTATION = "orientation"),
      (Events.BACKGROUND = "background"),
      (Events.BACK = "hydra_back"),
      (Events.PREVIOUS = "hydra_previous"),
      (Events.NEXT = "hydra_next"),
      (Events.RELOAD = "hydra_reload"),
      (Events.UNLOAD = "hydra_unload"),
      (Events.FULLSCREEN = "hydra_fullscreen"),
      (Events.WEBGL_CONTEXT_LOSS = "hydra_webgl_context_loss"));
    const _e = {};
    Hydra.ready(() => {
      let timer;
      function handleResize() {
        (clearTimeout(timer),
          (timer = setTimeout((_) => {
            Events.emitter._fireEvent(Events.RESIZE);
          }, 16)));
      }
      (!(function () {
        let _last,
          _lastTime = performance.now();
        function onfocus() {
          ((Render.blurTime = -1),
            "focus" != _last && Events.emitter._fireEvent(Events.VISIBILITY, { type: "focus" }),
            (_last = "focus"));
        }
        function onblur() {
          ((Render.blurTime = Date.now()),
            "blur" != _last && Events.emitter._fireEvent(Events.VISIBILITY, { type: "blur" }),
            (_last = "blur"));
        }
        (Timer.create(function addVisibilityHandler() {
          let hidden, eventName;
          if (
            ([
              ["msHidden", "msvisibilitychange"],
              ["webkitHidden", "webkitvisibilitychange"],
              ["hidden", "visibilitychange"],
            ].forEach((d) => {
              void 0 !== document[d[0]] && ((hidden = d[0]), (eventName = d[1]));
            }),
            !eventName)
          ) {
            const root = "ie" == Device.browser ? document : window;
            return ((root.onfocus = onfocus), void (root.onblur = onblur));
          }
          document.addEventListener(eventName, () => {
            const time = performance.now();
            (time - _lastTime > 10 && (!1 === document[hidden] ? onfocus() : onblur()),
              (_lastTime = time));
          });
        }, 250),
          window.addEventListener("online", (_) =>
            Events.emitter._fireEvent(Events.CONNECTIVITY, { online: !0 }),
          ),
          window.addEventListener("offline", (_) =>
            Events.emitter._fireEvent(Events.CONNECTIVITY, { online: !1 }),
          ),
          (window.onbeforeunload = (_) => (Events.emitter._fireEvent(Events.UNLOAD), null)));
      })(),
        (window.Stage = window.Stage || {}),
        window.addEventListener("resize", handleResize),
        window.addEventListener("orientationchange", handleResize),
        defer(handleResize),
        (Events._fireResize = handleResize));
    });
  },
);
