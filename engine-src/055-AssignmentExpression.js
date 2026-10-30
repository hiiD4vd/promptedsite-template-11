window.Inherit = function (child, parent) {
  const args = [].slice.call(arguments, 2),
    parentName = parent.name || parent.toString().match(/function ?([^\(]+)/)[1];
  if (
    (Global.RESERVED_CLASSES[parentName] && (parent = Global.RESERVED_HYDRA_CLASSES[parentName]),
    parent.apply(child, args),
    parent.inheritanceChain)
  ) {
    for (let method in parent.inheritanceChain)
      if (child[method]) {
        let name = method;
        do {
          name = `_${name}`;
        } while (child[name]);
        child[name] = child[method];
      }
    Object.assign(child, parent.inheritanceChain);
  }
  const save = Object.assign({}, child),
    addSuperMethods = () => {
      for (let method in save)
        if (child[method] && child[method] !== save[method]) {
          if ("destroy" == method && !child.__element)
            throw (
              "Do not override destroy directly, use onDestroy :: " + child.constructor.toString()
            );
          let name = method;
          do {
            name = `_${name}`;
          } while (child[name]);
          child[name] = save[method];
        }
    };
  child.__afterInitClass ? child.__afterInitClass.push(addSuperMethods) : defer(addSuperMethods);
};
