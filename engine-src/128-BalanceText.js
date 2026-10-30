Class(function BalanceText() {
  Inherit(this, Component);
  const _this = this;
  ((_this.TEXT_WRAP_BALANCE_SUPPORT = !1),
    (_this.TEXT_WRAP_BALANCE_SUPPORT =
      "undefined" != typeof CSS &&
      "function" == typeof CSS.supports &&
      CSS.supports("text-wrap", "balance")),
    (_this.relayout = (wrapper, ratio = 1, useParent = !1) => {
      const container = useParent ? wrapper.parentElement : wrapper;
      if (!container) return;
      const computedStyle = window.getComputedStyle(wrapper);
      if (_this.TEXT_WRAP_BALANCE_SUPPORT && "balance" === computedStyle.textWrap)
        return void (
          Hydra.LOCAL &&
          !_this.flag("notified") &&
          (console.warn(
            "Balanced text is supported by this browser, no need to use BalanceText here",
          ),
          _this.flag("notified", !0))
        );
      const charBuffer = 1.5 * parseFloat(computedStyle.fontSize || 0),
        update = (width) => (wrapper.style.maxWidth = `${Math.ceil(width)}px`);
      wrapper.style.maxWidth = "";
      const width = container.clientWidth,
        height = container.clientHeight;
      let middle,
        lower = width / 2 - 0.25,
        upper = width + 0.5,
        maxTry = 0;
      if (width) {
        for (; lower + 1 < upper && maxTry < 2e3;)
          ((middle = Math.round((lower + upper) / 2)),
            update(middle),
            container.clientHeight === height ? (upper = middle) : (lower = middle),
            maxTry++);
        update(upper * ratio + width * (1 - ratio) + charBuffer);
      }
    }));
}, "static");
