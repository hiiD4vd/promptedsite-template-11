function UILCMS(_name, _data) {
  return (async function list() {
    await UILStorage.ready();
    let sceneLayout = new SceneLayout(_name + "_cms", { cmsData: _data }),
      stateArray = new StateArray(),
      bridge = await UILGroupBridge.createSceneLayout(sceneLayout.name);
    return (
      (bridge.onChange = (_) => {
        let array = [];
        (bridge.layers.forEach((layer) => {
          layer.deleted ||
            (array.push(
              (function appStateify(input, sort) {
                let appState = AppState.createLocal();
                return (
                  (input.state = appState),
                  (input.sort = sort),
                  (input.onUpdate = (key) => {
                    let val = input.get(key);
                    (isNaN(val) || (val = Number(val)),
                      "object" == typeof val && val.src && (val = val.src),
                      appState.set(key, val));
                  }),
                  defer((_) => {
                    Object.keys(_data).forEach(input.onUpdate);
                  }),
                  appState
                );
              })(layer.cmsInput, layer.sortIndex),
            ),
            (layer.onUpdate = (_) => bridge.onChange()));
        }),
          array.sort((a, b) => a.sort - b.sort),
          stateArray.refresh(array));
      }),
      bridge.onChange(),
      await new Promise((resolve) => setTimeout(resolve, 50)),
      stateArray
    );
  })();
}
