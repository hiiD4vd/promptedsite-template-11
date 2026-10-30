Class(
  function UILTabsIconNavItem(_data, _index, _params) {
    const _this = this;
    (Inherit(_this, Element),
      Inherit(_this, ViewStateElement),
      Inherit(_this, UILTabsNavItem),
      Inherit(_this, XComponent),
      (_this.fragName = "UILTabsIconNavItem"),
      (_this.contexts = "Element,ViewStateElement,UILTabsNavItem"),
      (_this.data = _data),
      (_this.index = _index),
      (_this.params = _params),
      (this.isFragment = !0));
    var _promises = [];
    !(async function () {
      (_this.element && (_this.element.onMountedHook = (_) => _this.onMounted?.()),
        _this.createState(),
        _this.layout?.getAllLayers && (_this.layers = await _this.layout.getAllLayers()));
      let onInit = _this.onInit;
      ((_this.onInit = async () => {
        (await _this.wait(() => _this.ready),
          await defer(),
          UILTabsIconNavItem.icons[_this.data.id] &&
            _this.tab.div.insertAdjacentHTML(
              "afterbegin",
              `\n        <span class="icon">${UILTabsIconNavItem.icons[_this.data.id]}</span>`,
            ));
      }),
        _this.element.goob(
          "\n    & {\n        --icon-size: 16px;\n    }\n\n    .icon {\n        display: inline-block;\n        width: var(--icon-size);\n        height: var(--icon-size);\n    }\n\n\n    .tab {\n        color: var(--color-action--disabled);\n        display: flex;\n        font: var(--label3);\n        gap: calc(var(--spacing-small) / 2);\n        padding: var(--spacing-small) var(--spacing);\n        text-decoration: none;\n        position: relative;\n\n        &:after {\n            display: none;\n        }\n        \n        &.active {\n            background-color: var(--color-action);\n            color: var(--font-color-base);\n        }\n    }\n",
        ),
        (onInit = _this.onInit === onInit ? null : _this.onInit));
      for (let key in _this)
        if (_this[key]?.then) {
          let store = _this[key];
          (store.then((val) => (_this[key] = val)), _promises.push(store));
        }
      (_promises.length && (await Promise.all(_promises)),
        (_promises = null),
        _this.flag?.("__ready", !0),
        onInit ||
          "UILTabsIconNavItem" !== _this.fragName ||
          !_this.onInit ||
          _this.onInit.calledInit ||
          (onInit = _this.onInit),
        onInit && (onInit.calledInit || ((onInit.calledInit = !0), onInit())));
    })();
  },
  () => {
    UILTabsIconNavItem.icons = {
      image:
        '\n            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M14.167 2.4v11.2a.4.4 0 0 1-.4.4h-11.2a.4.4 0 0 1-.4-.4V2.4c0-.22.179-.4.4-.4h11.2a.4.4 0 0 1 .4.4Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m2.167 10.667 4.666-2L14.167 12M10.833 6.667a1.333 1.333 0 1 1 0-2.667 1.333 1.333 0 0 1 0 2.667Z"/></svg>',
      geometry:
        '\n            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M14.5 10.667V5.333a1.333 1.333 0 0 0-.667-1.153L9.167 1.513a1.333 1.333 0 0 0-1.334 0L3.167 4.18A1.333 1.333 0 0 0 2.5 5.333v5.334a1.334 1.334 0 0 0 .667 1.153l4.666 2.667a1.334 1.334 0 0 0 1.334 0l4.666-2.667a1.333 1.333 0 0 0 .667-1.153Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M2.68 4.64 8.5 8.007l5.82-3.367M8.5 14.72V8"/></svg>',
      shader:
        '\n            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M14.833 2.4v11.2a.4.4 0 0 1-.4.4h-11.2a.4.4 0 0 1-.4-.4V2.4c0-.22.18-.4.4-.4h11.2c.221 0 .4.18.4.4Z"/><circle cx="6.167" cy="5.333" r=".667" fill="currentColor"/><circle cx="6.167" cy="8" r=".667" fill="currentColor"/><circle cx="6.167" cy="10.667" r=".667" fill="currentColor"/><circle cx="8.833" cy="5.333" r=".667" fill="currentColor"/><circle cx="8.833" cy="8" r=".667" fill="currentColor"/><circle cx="8.833" cy="10.667" r=".667" fill="currentColor"/><circle cx="11.5" cy="5.333" r=".667" fill="currentColor"/><circle cx="11.5" cy="8" r=".667" fill="currentColor"/><circle cx="11.5" cy="10.667" r=".667" fill="currentColor"/></svg>',
      video:
        '\n            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M14.167 2.4v11.2a.4.4 0 0 1-.4.4h-11.2a.4.4 0 0 1-.4-.4V2.4c0-.22.179-.4.4-.4h11.2a.4.4 0 0 1 .4.4Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M6.765 5.675a.4.4 0 0 0-.598.348v3.954a.4.4 0 0 0 .598.348l3.46-1.978a.4.4 0 0 0 0-.694l-3.46-1.978Z"/></svg>',
      audio:
        '\n            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M13 5s1 1 1 2.667c0 1.666-1 2.666-1 2.666"/><path stroke="currentColor" d="M1.333 9.238V6.762c0-.736.597-1.333 1.334-1.333H4.6c.13 0 .258-.039.367-.11l4-2.637A.667.667 0 0 1 10 3.238v9.524c0 .53-.59.849-1.034.556l-3.999-2.636a.667.667 0 0 0-.367-.11H2.667a1.333 1.333 0 0 1-1.334-1.334Z"/></svg>',
    };
  },
);
