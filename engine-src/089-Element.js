Class(
  function Element(type = "div") {
    Inherit(this, Component);
    var name = Utils.getConstructorName(this);
    ((this.__element = !0),
      (this.element = $("." + name, type)),
      (this.element.__useFragment = !0),
      (this.destroy = function () {
        (this.element && this.element.remove && (this.element = this.element.remove()),
          this._destroy && this._destroy());
      }));
  },
  (_) => {
    let Element = Global.RESERVED_HYDRA_CLASSES.Element;
    Element.inheritanceChain = {};
    const _this = Element.inheritanceChain;
    ((_this.querySelector = async function (selector) {
      if ((await defer(), Array.isArray(selector))) {
        let values = [];
        return (
          selector.forEach((s) => {
            values.push($(this.element.div.querySelector(s)));
          }),
          values
        );
      }
      return $(this.element.div.querySelector(selector));
    }),
      (_this.querySelectorAll = async function (selector) {
        await defer();
        let list = this.element.div.querySelectorAll(selector),
          values = [];
        for (let i = 0; i < list.length; i++) values.push($(list[i]));
        return values;
      }));
  },
);
