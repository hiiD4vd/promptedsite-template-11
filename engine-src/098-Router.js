Class(function Router(_isHash, _rootPath) {
  Inherit(this, PushState, _isHash);
  const _this = this;
  var _debounce,
    _prevView,
    _nextView,
    _404Route,
    _prevRoute,
    _callbacks = [],
    _routesFlattened = [];
  function matchRoute(path) {
    let params, matchedRoute;
    for (
      let i = 0;
      i < 2 &&
      ((matchedRoute = _routesFlattened.find((route) => {
        const result = route.matcher.exec({ pathname: `/${path}` });
        return !(!result || !result.pathname) && ((params = result.pathname.groups), !0);
      })),
      !matchedRoute) &&
      path.endsWith("/");
      ++i
    )
      path = path.slice(0, -1);
    return !!matchedRoute && { ...matchedRoute.route, params: params, matchedPath: path };
  }
  function handleState(e) {
    let value = e?.value,
      isInit = !1;
    if ((value || ((isInit = !0), (value = _this.getState())), _this.virtualRoutes))
      return AppState.set("Router/state", String(value), isInit && !value);
    let route = null,
      cb = null;
    if (
      (_this.lock(),
      _callbacks.forEach((callback) => {
        route || ((route = matchRoute(value)), (cb = callback));
      }),
      route && (value = route.matchedPath),
      route && route.redirect)
    ) {
      let redirectedRoute = matchRoute(route.redirect);
      if (redirectedRoute) {
        if (route.updateURL) return (_this.unlock(), void _this.setState(route.redirect));
        ((route = redirectedRoute), (value = redirectedRoute.matchedPath));
      }
    }
    (route || ((value = "404"), (route = _404Route)),
      AppState.set("Router/state", String(value)),
      AppState.set("Router/route", route),
      (async function doRoute(route, path, callback) {
        if (((_nextView = route?.view), "$" == _nextView?.charAt?.(0))) {
          let ref = _nextView.slice(1);
          if (_this[ref]) _nextView = _this[ref];
          else
            for (let key in _this.classes) {
              let obj = _this.classes[key];
              (obj.ref == ref && obj.force(), (_nextView = _this[ref]));
            }
          _nextView && (_nextView.visible = !0);
        }
        (await callback?.(_prevView, _nextView, path, route.params, route),
          await _nextView?.onRouteChange?.({
            params: route.params,
            path: path,
            name: route.name,
            children: route.children,
            meta: route.meta,
          }),
          (_prevView = _nextView),
          AppState.set("Router/previous", _prevRoute?.path),
          AppState.set("Router/previousRoute", _prevRoute),
          (_this.currentRoute = { ...route }),
          _this.unlock(),
          (_prevRoute = route));
      })(route, value, cb));
  }
  function handleInstanceReloaded({ oldInstance: oldInstance, newInstance: newInstance }) {
    (_prevView === oldInstance && (_prevView = newInstance),
      _routesFlattened.forEach(({ route: route }) => {
        route.view === oldInstance && (route.view = newInstance);
      }));
    let route = AppState.get("Router/route");
    route?.view === oldInstance && (route.view = newInstance);
  }
  function addChildrenRoutes(element, parentPath) {
    element.children &&
      element.children.length &&
      element.children.forEach((child) => {
        const path = `${parentPath}/${child.path}`;
        (_routesFlattened.push({
          path: `${parentPath}/${child.path}`,
          route: child,
          matcher: new URLPattern({ pathname: path }),
        }),
          addChildrenRoutes(child, path));
      });
  }
  ((_this.currentRoute = null),
    (_this.fireChangeWhenSet = !0),
    (function setRootPath(val) {
      let rootPath;
      ((rootPath = "string" == typeof _rootPath ? _rootPath : Hydra.LOCAL ? "" : "/"),
        _this.setRoot(rootPath));
    })(),
    (function initEvents() {
      (_this.events.sub(_this, Events.UPDATE, handleState),
        _this.events.sub(Component.HMR_INSTANCE_RELOADED, handleInstanceReloaded));
    })(),
    (this._initFragRoutes = function (array) {
      (array.forEach((obj) => {
        (obj.view && (obj.view = _this[obj.view.slice(1)]),
          obj.lazyView && (obj.view = obj.lazyView));
      }),
        this.registerRoutes(_this.onRouteChange, array));
    }),
    (this.registerRoutes = function (callback, list) {
      if (
        (list.forEach((element) => {
          if (element.path.startsWith("/")) throw new Error("router paths should not start with /");
          if (element.redirect && element.redirect.startsWith("/"))
            throw new Error("redirect paths must not start with /");
          const path = `/${element.path}`;
          (_routesFlattened.push({
            path: path,
            route: element,
            matcher: new URLPattern({ pathname: path }),
          }),
            addChildrenRoutes(element, path),
            "404" === element.path && (_404Route = element));
        }),
        !_404Route)
      )
        throw new Error('Error: no 404 route defined.  Please define a route whos path is "404" ');
      (_callbacks.push(callback),
        clearTimeout(_debounce),
        (_debounce = _this.delayedCall(handleState, 1)));
    }),
    (this.navigate = function (path) {
      _this.isLocked ||
        (path.startsWith("/") && (path = path.substring(1)),
        Utils.debounce(() => {
          _this.setState(path);
        }, 10));
    }),
    (this.replace = function (path) {
      (path.startsWith("/") && (path = path.substring(1)),
        Utils.debounce(() => {
          _this.replaceState(path);
        }, 10));
    }));
});
