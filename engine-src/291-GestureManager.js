Class(function GestureManager(_object) {
  Inherit(this, Component);
  const _this = this;
  var _interactions;
  ((_this.add = function (listener, element, checkHit, options) {
    _interactions || (_interactions = new Map());
    let interaction = _interactions.get(element);
    return (
      interaction ||
        ((interaction = _this.initClass(GestureManagerInteraction, element, options)),
        _interactions.set(element, interaction)),
      interaction.addListener(listener, checkHit)
    );
  }),
    (_this.remove = function (listener) {
      for (const [element, interactions] of _interactions)
        (interactions.removeListener(listener),
          interactions.empty && (_interactions.delete(element), interactions.destroy()));
    }));
}, "static");
