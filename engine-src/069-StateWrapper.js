Class(function StateWrapper(_array) {
  const _this = this;
  (Inherit(this, Component),
    (this.bind = this.listen =
      function (key, callback) {
        _array.forEach(async (obj) => {
          (await obj.wait("__ready"),
            _this.bindState(obj.state, key, (data) => {
              callback({ target: obj, data: data });
            }));
        });
      }));
});
