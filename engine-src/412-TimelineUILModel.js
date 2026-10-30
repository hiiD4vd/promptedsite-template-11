Class(function TimelineUILModel(_id) {
  var _items,
    _config,
    _data = [],
    _map = {};
  (!(function initItems() {
    ((_config = JSON.parse(UILStorage.get(`${_id}_config`) || "{}")),
      (_items = JSON.parse(UILStorage.get(`${_id}_list_items`) || "[]")));
  })(),
    (function initData() {
      _items.forEach((item, i) => {
        let input = InputUIL.create(`${item}_folder`, null, null, !!UIL.global),
          data = {};
        ((data.label = input.get("label") || "Item"),
          (data.value = input.getNumber("percent") || 0),
          (data.arbitrary = input.get("arbitrary")),
          _data.push(data),
          (_map[data.label] = data),
          UIL.global &&
            Render.start((_) => {
              ((data.label = input.get("label") || "Item"),
                (data.value = input.getNumber("percent") || 0));
            }, 10));
      });
    })(),
    (this.setState = function (array) {
      for (let i = 0; i < array.length; i++)
        _items[i] || _items.push(`${_id}_${Utils.timestamp()}`);
      (_items.length > array.length && (_items = _items.slice(0, array.length)),
        _items.forEach((item, i) => {
          let data = array[i],
            input = InputUIL.create(`${item}_folder`, null);
          (input.setValue("label", data.label),
            data.percent && input.setValue("percent", data.percent),
            data.arbitrary && input.setValue("percent", data.arbitrary));
        }),
        UILStorage.set(`${_id}_list_items`, JSON.stringify(_items)));
    }),
    (this.lock = function () {
      return (
        _config.lock ||
          ((_config.lock = !0),
          UIL.global && UILStorage.set(`${_id}_config`, JSON.stringify(_config))),
        this
      );
    }),
    (this.rails = function () {
      return (
        _config.rails ||
          ((_config.rails = !0),
          UIL.global && UILStorage.set(`${_id}_config`, JSON.stringify(_config))),
        this
      );
    }),
    (this.getData = function () {
      return _data;
    }),
    (this.get = function (key) {
      return _map[key];
    }));
});
