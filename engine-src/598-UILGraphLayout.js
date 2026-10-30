Class(
  function UILGraphLayout(_params, ...restArgs) {
    const _this = this;
    (Inherit(_this, Element),
      Inherit(_this, DragAndDrop),
      Inherit(_this, XComponent),
      (_this.fragName = "UILGraphLayout"),
      (_this.contexts = "Element,DragAndDrop"),
      (_this.params = _params),
      (_this.args = arguments),
      (this.isFragment = !0));
    var _promises = [];
    (async function () {
      function createStateArray(array) {
        return new StateArray(array || []);
      }
      (_this.element && (_this.element.onMountedHook = (_) => _this.onMounted?.()),
        _this.initClass(FragUIHelper, {
          _type: "UI",
          refName: "unnamed",
          children: [
            {
              _type: "div",
              refName: "wrapper",
              children: [
                {
                  tabIndex: 1,
                  _type: "div",
                  refName: "header",
                  children: [
                    { _type: "div", refName: "toggle", children: [] },
                    { _type: "div", _innerText: "$params.name", refName: "title", children: [] },
                  ],
                },
                {
                  _type: "div",
                  refName: "children",
                  children: [
                    {
                      _type: "div",
                      refName: "viewstate",
                      children: [
                        {
                          view: "$determineView",
                          data: "$nodes",
                          layoutId: "$id",
                          getBridge: "$getBridge",
                          bridge: "$groupBridge",
                          layoutInstance: "$layoutInstance",
                          _type: "ViewState",
                          refName: "layers",
                          children: [],
                        },
                      ],
                    },
                    {
                      _type: "div",
                      refName: "dropTarget",
                      children: [{ _type: "div", refName: "highlight", children: [] }],
                    },
                  ],
                },
              ],
            },
          ],
        }),
        _this.layout?.getAllLayers && (_this.layers = await _this.layout.getAllLayers()));
      let onInit = _this.onInit;
      var _isOpen = !1,
        _isFocused = !1,
        _saveEnabled = !1,
        _isGL = !0 === _this.params.isGL,
        _layoutInstance = _this.params.layoutInstance,
        _isStageLayout = _layoutInstance.isStageLayout;
      function handleParentBinding(node) {
        _this.bind(node, "parent", (val, prevValue) => {
          val
            ? _this.groupBridge.groups.forEach((n) => {
                n.id.includes(val) &&
                  !n.children.includes(node) &&
                  (n.children.push(node),
                  _this.nodes.remove(node),
                  1 == n.children.length && (node.sortIndex = 0));
              })
            : prevValue &&
              _this.groupBridge.groups.forEach((n) => {
                n.id.includes(prevValue) &&
                  (n.children.remove(node),
                  _this.nodes.push(node),
                  (node.sortIndex = _this.nodes.length));
              });
        });
      }
      async function duplicateGroup({ targetId: targetId }) {
        if (!targetId) throw new Error("UIL: no targetId in duplicateGroup");
        const targetGroup = _this.groupBridge.groups.find((node) => node.id == targetId);
        if (!targetGroup)
          throw new Error(`UIL: no group found in the _this.groupBridge.groups for ${targetId}`);
        const { id: id } = targetGroup,
          groupLayers = [];
        _this.groupBridge.layers.forEach((node) => {
          node.parent === id && groupLayers.push(node);
        });
        const groupDataKeys = UIL.sidebar.toolbar
          .getParentFolder()
          ?.getChildrenControlIds(targetGroup.id);
        UILStorage.duplicateData(groupDataKeys, _this.groupBridge.groups.length);
        const newGroup = await _this.groupBridge.createGroup({
          groupName: `Copy of ${targetGroup.name}`,
        });
        (handleParentBinding(newGroup), _this.nodes.push(newGroup), healSort());
        for (let i = 0; i < groupLayers.length; i++) {
          const layer = groupLayers[i];
          await duplicateLayer({ targetId: layer.id, groupId: newGroup.id });
        }
      }
      async function duplicateLayer({ targetId: targetId, groupId: groupId = null }) {
        if (!targetId) throw new Error("UIL: no targetId in duplicateLayer");
        const targetLayer = _this.groupBridge.layers.find((node) => node.id == targetId);
        if (!targetLayer)
          throw new Error(`UIL: no layer found in the _this.groupBridge.layers for ${targetId}`);
        const layerDataKeys = UIL.sidebar.toolbar
          .getParentFolder()
          ?.getChildrenControlIds(targetLayer.id);
        UILStorage.duplicateData(layerDataKeys, _this.groupBridge.layers.length);
        let parent = null,
          layerName = `Copy of ${targetLayer.name}`;
        groupId
          ? ((parent = groupId), (layerName = targetLayer.name))
          : (parent = targetLayer.parent ? targetLayer.parent : null);
        const newNode = await _this.groupBridge.createLayer(parent, { layerName: layerName });
        (parent && (newNode.parent = parent),
          handleParentBinding(newNode),
          parent || _this.nodes.push(newNode),
          healSort());
      }
      function copyLayer({ targetId: targetId }) {
        if (!targetId) throw new Error("UIL: no targetId in copyLayer");
        const targetLayer = _this.groupBridge.layers.find((node) => node.id == targetId),
          parent = targetLayer.parent ? targetLayer.parent : null;
        if (!targetLayer)
          throw new Error(`UIL: no layer found in the _this.groupBridge.layers for ${targetId}`);
        const layerDataKeys = UIL.sidebar.toolbar
            .getParentFolder()
            ?.getChildrenControlIds(targetLayer.id),
          copyData = UILStorage.getDataForKeys(layerDataKeys),
          sceneName = _layoutInstance.name;
        navigator.clipboard.writeText(
          JSON.stringify({
            action: "UIL_COPY_LAYER",
            sceneName: sceneName,
            parent: parent,
            name: targetLayer.name,
            layerData: copyData,
          }),
        );
      }
      function copyGroup({ targetId: targetId }) {
        if (!targetId) throw new Error("UIL: no targetId in copyGroup");
        const targetGroup = _this.groupBridge.groups.find((node) => node.id == targetId),
          { id: id } = targetGroup;
        if (!targetGroup)
          throw new Error(`UIL: no group found in the _this.groupBridge.groups for ${targetId}`);
        const groupDataKeys = UIL.sidebar.toolbar
            .getParentFolder()
            ?.getChildrenControlIds(targetGroup.id),
          groupData = UILStorage.getDataForKeys(groupDataKeys),
          sceneName = _layoutInstance.name,
          layersData = [];
        _this.groupBridge.layers.forEach((node) => {
          node.parent == id &&
            layersData.push({
              id: node.id,
              name: node.name,
              sceneName: sceneName,
              layerData: UILStorage.getDataForKeys(
                UIL.sidebar.toolbar.getParentFolder()?.getChildrenControlIds(node.id),
              ),
            });
        });
        const copyObject = {
          action: "UIL_COPY_GROUP",
          sceneName: sceneName,
          groupData: { id: targetGroup.id, data: groupData, name: targetGroup.name },
          layersData: layersData,
        };
        navigator.clipboard.writeText(JSON.stringify(copyObject));
      }
      async function pasteLayer({ parentGroupId: parentGroupId, data: data = null }) {
        const copyData = data || JSON.parse(await navigator.clipboard.readText());
        if (!data && copyData && "UIL_COPY_LAYER" != copyData.action)
          return void alert(
            "Didnt find any UIL data in your clipboard. Please copy a layer first.",
          );
        const newSceneName = _layoutInstance.name,
          { layerData: layerData, name: name, sceneName: oldSceneName } = copyData,
          copyName = _this.groupBridge.layers.find((node) => node.name == name)
            ? `Copy of ${name}`
            : name;
        layerData.forEach((item) => {
          item.key.endsWith("_name") && (item.value = copyName);
        });
        const parentIndex = layerData.findIndex((item) => item.key.endsWith("_parent"));
        (-1 !== parentIndex && layerData.splice(parentIndex, 1),
          UILStorage.pasteLayerData({
            layerData: layerData,
            newLayerNumber: _this.groupBridge.layers.length,
            sceneName: newSceneName,
            oldSceneName: oldSceneName,
          }));
        const newNode = await _this.groupBridge.createLayer(parentGroupId || null, {
          layerName: copyName,
        });
        (parentGroupId && (newNode.parent = parentGroupId),
          handleParentBinding(newNode),
          parentGroupId || _this.nodes.push(newNode),
          healSort());
      }
      async function pasteGroup({ parentGroupId: parentGroupId }) {
        const copyData = JSON.parse(await navigator.clipboard.readText());
        if (copyData && "UIL_COPY_GROUP" != copyData.action)
          return void alert(
            "Didnt find any UIL data in your clipboard. Please copy a group first.",
          );
        _layoutInstance.name;
        const { groupData: groupData, layersData: layersData, sceneName: oldSceneName } = copyData,
          newGroupName = _this.groupBridge.groups.find((node) => node.name == groupData.name)
            ? `Copy of ${groupData.name}`
            : groupData.name,
          newGroup = await _this.groupBridge.createGroup({ groupName: newGroupName });
        for (let i = 0; i < layersData.length; i++) {
          const layer = layersData[i];
          await pasteLayer({ parentGroupId: newGroup.id, data: layer });
        }
        (parentGroupId && (newGroup.parent = parentGroupId),
          handleParentBinding(newGroup),
          _this.nodes.push(newGroup),
          healSort());
      }
      function deleteLayer({ targetId: targetId }) {
        if (!targetId) throw new Error("UIL: no targetId in deleteLayer");
        const targetLayer = _this.groupBridge.layers.find((node) => node.id == targetId);
        if (!targetLayer)
          throw new Error(`UIL: no layer found in the _this.groupBridge.layers for ${targetId}`);
        const additionalKeys = [
            `${targetLayer.firebaseKeyPrefix}_name`,
            `${targetLayer.firebaseKeyPrefix}_sortIndex`,
            `${targetLayer.firebaseKeyPrefix}_renderOrder`,
            `${targetLayer.firebaseKeyPrefix}_parent`,
          ],
          layerDataKeys = UIL.sidebar.toolbar
            .getParentFolder()
            ?.getChildrenControlIds(targetLayer.id);
        let foundNode;
        if (
          (UILStorage.deleteItemsWithKeys([...layerDataKeys, ...additionalKeys]),
          _this.nodes.forEach((node) => {
            node.id == targetId && (foundNode = node);
          }),
          foundNode && !foundNode.parent)
        ) {
          _this.groupBridge.deleteNode(foundNode) &&
            (_this.nodes.remove(foundNode),
            _this.nodes.forEach((node) => {
              node.sortIndex > foundNode.sortIndex && (node.sortIndex -= 1);
            }),
            _this.nodes.length
              ? _this.set(`UIL/${_this.id}/UILGraph/node/focused`, _this.nodes[0].id)
              : _this.set(`UIL/${_this.id}/UILGraph/node/focused`, null));
        }
        healSort();
      }
      async function deleteGroup({ targetId: targetId }) {
        if (!targetId) throw new Error("UIL: no targetId in deleteGroup");
        const targetGroup = _this.groupBridge.groups.find((node) => node.id == targetId);
        if (!targetGroup)
          throw new Error(`UIL: no group found in the _this.groupBridge.groups for ${targetId}`);
        const additionalKeys = [
            `${targetGroup.firebaseKeyPrefix || "INPUT_GROUP"}_name`,
            `${targetGroup.firebaseKeyPrefix}_sortIndex`,
            `${targetGroup.firebaseKeyPrefix}_renderOrder`,
            `${targetGroup.firebaseKeyPrefix}_parent`,
          ],
          groupDataKeys = UIL.sidebar.toolbar
            .getParentFolder()
            ?.getChildrenControlIds(targetGroup.id);
        (UILStorage.deleteItemsWithKeys([...groupDataKeys, ...additionalKeys]),
          _this.groupBridge.deleteNode(targetGroup),
          _this.nodes.remove(targetGroup),
          healSort());
      }
      function addHandlers() {
        (_this.header.div.addEventListener("contextmenu", openContextMenu),
          _this.bind(`UIL/${_this.id}/UILGraph/node/focused`, handleNodeFocused),
          _this.listen("GraphContextMenu/action", handleContextMenuAction),
          _this.listen("UILGraph/MoveNode", handleMoveNode),
          _this.events.sub(UILSocket.EDITOR_BRIDGE, onEditorBridgeMessage));
      }
      function handleMoveNode(e) {
        const find = (id) => {
          let found;
          return (
            _this.groupBridge.all.forEach((node) => {
              node.id == id && (found = node);
            }),
            found
          );
        };
        let moveNode = find(e.moveId),
          targetNode = find(e.targetId);
        if (
          moveNode &&
          !(
            (moveNode.parent && moveNode.parent == targetNode?.parent) ||
            moveNode == targetNode ||
            (targetNode?.parent && moveNode.id.includes(targetNode.parent)) ||
            (targetNode?.children && moveNode.children)
          )
        ) {
          if ("end-of-list" == e.type)
            if (targetNode) moveNode.parent = targetNode.id;
            else {
              let oldIndex = moveNode.sortIndex;
              (_this.nodes.forEach((node) => {
                node.sortIndex > oldIndex && (node.sortIndex -= 1);
              }),
                (moveNode.sortIndex = _this.nodes.length - 1),
                (moveNode.parent = null),
                _this.nodes.sort((a, b) => a.sortIndex - b.sortIndex));
            }
          else {
            if ("group" == moveNode.type && "group" == targetNode?.type) return;
            if (targetNode?.parent)
              return (
                (moveNode.parent = targetNode.parent),
                _this.fire("UILGraph/MoveNode", e),
                void healSort()
              );
            moveNode.parent = null;
            let oldIndex = moveNode.sortIndex;
            if (
              (_this.nodes.forEach((node) => {
                node.sortIndex > oldIndex && (node.sortIndex -= 1);
              }),
              "before" == e.type)
            ) {
              let newIndex = targetNode.sortIndex;
              (_this.nodes.forEach((node) => {
                node.sortIndex >= newIndex && (node.sortIndex += 1);
              }),
                (moveNode.sortIndex = newIndex));
            }
            _this.nodes.sort((a, b) => a.sortIndex - b.sortIndex);
          }
          (healSort(), _this.set(`UIL/${_this.id}/UILGraph/node/focused`, e.moveId));
        }
      }
      function healSort() {
        let lastIndex = -1;
        _this.nodes.forEach((node) => {
          let delta = node.sortIndex - lastIndex;
          (delta > 1 && (node.sortIndex -= delta - 1), (lastIndex = node.sortIndex));
        });
      }
      async function onEditorBridgeMessage(e) {
        if (e.layout && e.layout === _this.name) {
          if ("create" == e.action) {
            let layer = await _layoutInstance._createLayer(null);
            (await _this.wait(100),
              _this.events.fire(UILGraphLayout.BRIDGE_CREATE, {
                layoutName: _layoutInstance.name,
                layerName: layer._sceneLayout.name,
                newName: e.layerName,
              }));
          }
          if ("delete" == e.action) {
            let node = find(e.layerName);
            _layoutInstance._deleteLayer(node.id, e.layerName, !0) && _this.remove(node, !0);
          }
          if ("eval" == e.action) {
            let layer = await _layoutInstance.getLayer(e.layerName);
            eval("layer._sceneLayout." + e.code);
          }
        }
      }
      function openContextMenu(e) {
        (e.preventDefault(),
          _this.set("UIL/ContextMenu", {
            layoutId: _this.id,
            targetId: _this.id,
            type: _isStageLayout ? UILGraph.STAGE_LAYOUT_TYPE : UILGraph.LAYOUT_TYPE,
            isStageLayout: _isStageLayout,
          }));
      }
      async function handleContextMenuAction(event) {
        const context = _this.get("UIL/ContextMenu");
        if (context && context.layoutId == _this.id)
          switch (event) {
            case UILGraphContextMenu.DELETE:
              _this.groupBridge.groups.find((node) => node.id == context.targetId)
                ? deleteGroup({ targetId: context.targetId })
                : deleteLayer({ targetId: context.targetId });
              break;
            case UILGraphContextMenu.ADD_LAYER:
              {
                const parent =
                  context.targetId && context.targetId !== _this.id
                    ? _this.groupBridge.groups.find((node) => node.id == context.targetId)
                    : null;
                _this.groupBridge.createLayer();
                let newNode = _this.groupBridge.layers[_this.groupBridge.layers.length - 1];
                (handleParentBinding(newNode),
                  _this.nodes.push(newNode),
                  healSort(),
                  parent && (newNode.parent = parent.id));
              }
              break;
            case UILGraphContextMenu.ADD_GROUP:
              {
                _this.groupBridge.createGroup();
                let newNode = _this.groupBridge.groups[_this.groupBridge.groups.length - 1];
                (handleParentBinding(newNode), _this.nodes.push(newNode), healSort());
              }
              break;
            case UILGraphContextMenu.COPY_GROUP:
              copyGroup({ targetId: context.targetId });
              break;
            case UILGraphContextMenu.COPY_LAYER:
              copyLayer({ targetId: context.targetId });
              break;
            case UILGraphContextMenu.COPY_LAYOUT:
              var dataToCopy = {
                UIL_ID: window.UIL_ID,
                layout: context.layoutId,
                location: window.location.pathname.split("/").filter(Boolean)[0],
              };
              if (window.Platform && Router) {
                const world = await Platform.getRoute(Router.getStateString());
                dataToCopy.world = world;
              }
              navigator.clipboard.writeText(JSON.stringify(dataToCopy));
              break;
            case UILGraphContextMenu.DUPLICATE_LAYER:
              duplicateLayer({ targetId: context.targetId, parentId: context.parentId });
              break;
            case UILGraphContextMenu.DUPLICATE_GROUP:
              duplicateGroup({ targetId: context.targetId, parentId: context.parentId });
              break;
            case UILGraphContextMenu.CINEMA:
              applyCinemaConfig();
              break;
            case UILGraphContextMenu.FIGMA:
              applyFigmaConfig();
              break;
            case UILGraphContextMenu.PASTE_LAYER:
              let parentId = null;
              (context.name && context.name.startsWith("group_") && (parentId = context.name),
                pasteLayer({ parentGroupId: parentId }));
              break;
            case UILGraphContextMenu.PASTE_GROUP:
              let parentGroupId = null;
              (context.name && context.name.startsWith("group_") && (parentGroupId = context.name),
                pasteGroup({ parentGroupId: parentGroupId }));
              break;
            case UILGraphContextMenu.PASTE_LAYOUT:
              return alert("The Paste Layout feature is not yet implemented.");
          }
      }
      function handleNodeFocused(val) {
        let focusedNode;
        if (!val || !_this.nodes.length)
          return (
            _this.set("UILGraphLayoutFocused", "xxxxx"),
            UIL.sidebar.toolbar.filterSingle("xxxxx"),
            void _this.events.fire(UILGraphNode.FOCUSED, {
              name: "Config",
              layoutInstance: _layoutInstance,
            })
          );
        (_this.nodes.forEach((node) => {
          ((node.focused = val == node.id), node.focused && (focusedNode = node));
        }),
          focusedNode &&
            (UIL.sidebar.toolbar.filterSingle(val),
            Storage.set(`UIL:${_this.id}/Graph/focused`, val),
            Storage.set("UILGraphLayoutFocused", _this.id),
            _this.set("UILGraphLayoutFocused", _this.id),
            _this.events.fire(UILGraphNode.FOCUSED, {
              name: focusedNode.name,
              layoutInstance: _layoutInstance,
            })));
      }
      ((_this.id = _this.params.id || `${_this.params.name.toLowerCase()}-${_this.params.uniq}`),
        (_this.layoutInstance = _layoutInstance),
        (_this.attachmentId = `${_this.params.name}-${_this.params.uniq}`),
        (_this.addSpecial =
          _this.addLayer =
          _this.addGroup =
          _this.syncVisibility =
          _this.syncGroupNames =
          _this.open =
            (_) => {}),
        (_this.getBridge = () => _this.groupBridge),
        (_this.groupBridge = await UILGroupBridge.createSceneLayout(_layoutInstance.name)),
        (_this.determineView = (data) => ("group" == data.type ? UILGraphGroup : UILGraphLayer)),
        _this.setDragEnabled(!1),
        (_this.nodes = createStateArray()),
        _this.groupBridge.all.forEach((node) => {
          (handleParentBinding(node), node.parent || _this.nodes.push(node));
        }),
        addHandlers(),
        _this.delayedCall((_) => {
          Storage.get("UILGraphLayoutFocused") == _this.id &&
            _this.set(
              `UIL/${_this.id}/UILGraph/node/focused`,
              Storage.get(`UIL:${_this.id}/Graph/focused`),
            );
        }, 500),
        (_this.onDrop = function (dropId) {
          _this.fire("UILGraph/MoveNode", { moveId: dropId, targetId: null, type: "end-of-list" });
        }),
        _this.bind("UILGraphLayoutFocused", (id) => {
          id != _this.id &&
            _this.groupBridge.all.forEach((node) => {
              node.focused = !1;
            });
        }),
        _this.element.goob(
          "\n    & {\n        position: relative;\n        width: 100%;\n        height: auto;\n        font-family: sans-serif;\n        font-size: 11px;\n    }\n\n    & > .wrapper {\n        background-color: #161616;\n    }\n\n    .header {\n        width: 100%;\n        height: auto;\n        outline: none;\n        display: block;\n        padding: 4px;\n        box-sizing: border-box;\n        user-select: none;\n    }\n\n    .toggle {\n        position: relative;\n        width: 2px;\n        height: 2px;\n        fontSize: 9ps;\n        text-align: center;\n        display: inline-block;\n        vertical-align: middle;\n        border: 1px solid #b1b1b1;\n        border-radius: 50%;\n        margin-left: 2px;\n    }\n\n    .title {\n        display: inline-block;\n        vertical-align: middle;\n        marginLeft: 6px;\n    }\n\n    .children {\n        overflow: hidden;\n        transition: filter 0.1s linear;\n        filter: brightness(0.8);\n    }\n    .children:hover {\n        filter: brightness(1.0);\n    }\n\n    .lastPseudoLayer {\n        height: 8px;\n    }\n\n    .dropTarget {\n        position: relative;\n        height: 15px;\n        width: 100%;\n        margin-bottom: -15px;\n    }\n\n    .dropTarget .highlight {\n        width: 100%;\n        height: 6px;\n        background: #1A6DEA;\n        opacity: 0;\n        transition: opacity 200ms;\n    }\n\n    .dropTarget.hover .highlight{\n        opacity: 1;\n    }\n\n    & > .wrapper > .children > .dropTarget {\n        margin-bottom: 0;\n    }\n\n    .iconButton {\n        width: 16px;\n        height: 16px;\n        cursor: pointer;\n        transition: opacity 200ms;\n        stroke: var(--color-white);\n        fill: var(--color-white);\n        opacity: 0.6;\n        margin: 2px;\n    }\n    \n    .iconButton rect {\n        fill: var(--color-white);\n    }\n    \n    .iconButton:hover {\n        opacity: 1;\n    }\n",
        ),
        (_this.onDestroy = (_) => {
          _this.fire("UILGraphLayout/destroy", _this.attachmentId);
        }),
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
          "UILGraphLayout" !== _this.fragName ||
          !_this.onInit ||
          _this.onInit.calledInit ||
          (onInit = _this.onInit),
        onInit && (onInit.calledInit || ((onInit.calledInit = !0), onInit())));
    })();
  },
  "",
  () => {
    ((UILGraphLayout.VISIBILE_ICON =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <path d="M8 10C9.1046 10 10 9.1046 10 8C10 6.8954 9.1046 6 8 6C6.8954 6 6 6.8954 6 8C6 9.1046 6.8954 10 8 10Z" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>\n    <path d="M14 8C12.7409 9.4955 10.4789 11 8 11C5.52113 11 3.25904 9.4955 2 8C3.53237 6.57913 5.32775 5 8 5C10.6723 5 12.4677 6.5791 14 8Z" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>\n    </svg>'),
      (UILGraphLayout.INVISIBLE_ICON =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <path d="M3 3L13 13" stroke-width="0.833333" stroke-linecap="round" stroke-linejoin="round"/>\n    <path d="M7.09535 7.32587C7.03396 7.47036 7 7.62933 7 7.79621C7 8.461 7.53893 8.99998 8.20377 8.99998C8.40481 8.99998 8.59434 8.9507 8.76095 8.86354" stroke-width="0.833333" stroke-linecap="round" stroke-linejoin="round"/>\n    <path d="M5.27945 6C4.40054 6.56451 3.66836 7.36877 3 8.12613C3.98694 9.55876 5.76015 11 7.70328 11C8.51324 11 9.29372 10.7496 10 10.3538" stroke-width="0.833333" stroke-linecap="round" stroke-linejoin="round"/>\n    <path d="M8 5C10.2269 5 11.7231 6.68437 13 8.2C12.8231 8.46896 12.6224 8.73824 12.4011 9" stroke-width="0.833333" stroke-linecap="round" stroke-linejoin="round"/>\n    </svg>'),
      (UILGraphLayout.LOCKED_ICON =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <path d="M10.6667 8H11.6C11.8209 8 12 8.16788 12 8.375V12.625C12 12.8321 11.8209 13 11.6 13H4.4C4.17909 13 4 12.8321 4 12.625V8.375C4 8.16788 4.17909 8 4.4 8H5.33333M10.6667 8V5.5C10.6667 4.66667 10.1333 3 8 3C5.86667 3 5.33333 4.66667 5.33333 5.5V8M10.6667 8H5.33333" stroke-width="0.937501" stroke-linecap="round" stroke-linejoin="round"/>\n    <rect x="4" y="8" width="8" height="5" />\n    </svg>\n    '),
      (UILGraphLayout.UNLOCKED_ICON =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <path d="M10.6667 8H11.6C11.8209 8 12 8.16787 12 8.375V12.625C12 12.8321 11.8209 13 11.6 13H4.4C4.17909 13 4 12.8321 4 12.625V8.375C4 8.16787 4.17909 8 4.4 8H5.33333H10.6667ZM10.6667 8V5.5C10.6667 4.66667 10.1333 3 8 3C7.04247 3 6.40727 3.33577 5.99796 3.78125" stroke-width="0.750001" stroke-linecap="round" stroke-linejoin="round"/>\n    </svg>\n    \n    '),
      (UILGraphLayout.SCENE_ICON =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <path d="M13.0009 8.00124C13.0009 8.59111 12.8984 9.1589 12.7107 9.6841C12.3622 10.6588 11.7218 11.4931 10.8938 12.0814C10.0768 12.6618 9.07846 13.0025 8.00125 13.0025C6.92403 13.0025 5.92567 12.6618 5.10869 12.0814C4.28067 11.4931 3.63876 10.6588 3.29178 9.6841C3.1041 9.1589 3.00158 8.59111 3.00158 8.00124C3.00158 7.32936 3.13406 6.68745 3.37537 6.10232C3.77598 5.12446 4.47782 4.30275 5.36577 3.75074C6.12913 3.27443 7.03286 3 8.00125 3C8.96964 3 9.87178 3.27443 10.6367 3.75074C11.5247 4.30275 12.2265 5.12446 12.6271 6.10232C12.8684 6.68745 13.0009 7.32936 13.0009 8.00124Z" stroke-width="0.75" stroke-miterlimit="10"/>\n    <path d="M8.00129 3C8.96968 3 9.87183 3.27443 10.6368 3.75074C10.3339 3.82644 10.0217 3.88795 9.69992 3.93685C9.15421 4.02044 8.58485 4.0646 7.99972 4.0646C7.41458 4.0646 6.84522 4.02044 6.29951 3.93685C5.97935 3.88795 5.66706 3.82487 5.36267 3.75074C6.12918 3.27443 7.0329 3 8.00129 3Z" stroke-width="0.75" stroke-miterlimit="10"/>\n    <path d="M12.6271 6.10232C12.0419 6.25373 11.4221 6.37675 10.777 6.46822C9.89537 6.59282 8.96484 6.66064 8.00118 6.66064C7.03752 6.66064 6.10698 6.59282 5.22534 6.46822C4.58027 6.37675 3.96044 6.25373 3.37531 6.10232C3.77591 5.12446 4.47776 4.30275 5.36571 3.75074C6.12906 3.27443 7.03279 3 8.00118 3C8.96957 3 9.87172 3.27443 10.6366 3.75074C11.5246 4.30275 12.2264 5.12446 12.6271 6.10232Z" stroke-width="0.75" stroke-miterlimit="10"/>\n    <path d="M8.00116 13.0009C6.92394 13.0009 5.92559 12.6603 5.10861 12.0799C5.44139 11.9868 5.78522 11.9111 6.14166 11.8512C6.73626 11.7518 7.35925 11.6982 8.00116 11.6982C8.64307 11.6982 9.26764 11.7518 9.86066 11.8512C10.2155 11.9111 10.5609 11.9868 10.8937 12.0799C10.0767 12.6603 9.07837 13.0009 8.00116 13.0009V13.0009Z" stroke-width="0.75" stroke-miterlimit="10"/>\n    <path d="M12.7107 9.6841C12.3621 10.6588 11.7218 11.4931 10.8938 12.0814C10.0768 12.6618 9.07844 13.0025 8.00122 13.0025C6.92401 13.0025 5.92565 12.6618 5.10867 12.0814C4.28065 11.4931 3.63874 10.6588 3.29176 9.6841C3.88951 9.52638 4.52353 9.39863 5.18595 9.30242C6.08021 9.17309 7.02337 9.1037 8.00122 9.1037C8.97907 9.1037 9.92381 9.17309 10.8165 9.30242C11.4789 9.39705 12.1129 9.52638 12.7107 9.6841V9.6841Z" stroke-width="0.75" stroke-miterlimit="10"/>\n    <path d="M7.99971 13.0025C9.61028 13.0025 10.9159 10.7634 10.9159 8.00124C10.9159 5.23913 9.61028 3 7.99971 3C6.38913 3 5.0835 5.23913 5.0835 8.00124C5.0835 10.7634 6.38913 13.0025 7.99971 13.0025Z" stroke-width="0.75" stroke-miterlimit="10"/>\n    <path d="M7.99967 3V13.0009" stroke-width="0.75" stroke-miterlimit="10"/></svg>'),
      (UILGraphLayout.GROUP_ICON =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <rect x="2.5" y="2.5" width="7" height="7" />\n    <path d="M14 14V6H11V11H6V14H14Z" />\n    </svg>'),
      (UILGraphLayout.ARROW_ICON =
        '<svg width="6" class="arrow" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <path d="M6 0L3 4L0 -2.62268e-07L6 0Z" />\n    </svg>'),
      (UILGraphLayout.LINE_ELBOW =
        '<svg fill="#aaaaaa" width="20px" height="22px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">\n    <path d="M210.82825,178.82861h-.00013l-48,48a3.99992,3.99992,0,0,1-5.65625-5.65722L198.34277,180H64a4.0002,4.0002,0,0,1-4-4V32a4,4,0,0,1,8,0V172H198.34277l-41.1709-41.17139a3.99992,3.99992,0,0,1,5.65625-5.65722l48,48h.00013a4.02834,4.02834,0,0,1,.49841.61035c.06543.09814.11047.20434.1665.30664a3.97146,3.97146,0,0,1,.20093.38183,3.91958,3.91958,0,0,1,.126.406c.03345.11377.07751.22266.10083.34033a4.01026,4.01026,0,0,1,0,1.5669c-.02332.11767-.06738.22656-.10083.34033a3.90157,3.90157,0,0,1-.126.406,3.94471,3.94471,0,0,1-.20093.38183c-.0559.1023-.10095.2085-.1665.30664A4.02834,4.02834,0,0,1,210.82825,178.82861Z"/>\n    </svg>'));
  },
);
