Class(function GLUIElement() {
  Inherit(this, Component);
  ((this.element = $gl()),
    (this.create = function (w, h, t) {
      return this.element.create(w, h, t);
    }));
});
