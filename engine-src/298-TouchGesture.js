Class(function TouchGesture($object) {
  Inherit(this, Component);
  var $touchArea = $object,
    _p0 = new Vector2(),
    _p1 = new Vector2(),
    _calc = new Vector2(),
    _scale = {},
    _translate = {},
    _rotate = {};
  function loop() {
    (($object.rect.width = $object.width * $object.scale),
      ($object.rect.height = $object.height * $object.scale),
      ($object.rect.x = $object.rect.cx - $object.rect.width / 2),
      ($object.rect.y = $object.rect.cy - $object.rect.height / 2),
      ($object.rect.mx = $object.rect.cx + $object.rect.width / 2),
      ($object.rect.my = $object.rect.cy + $object.rect.height / 2),
      $object.transform());
  }
  function updateVectors(e) {
    (e.touches[0] && _p0.set(e.touches[0].pageX, e.touches[0].pageY),
      e.touches[1] && _p1.set(e.touches[1].pageX, e.touches[1].pageY),
      _calc.lastDist || (_calc.lastDist = 0),
      _calc.subVectors(_p0, _p1),
      (_calc.dist = _calc.length()),
      (_calc.angle = _calc.angleTo(_p0, _p1)),
      (_calc.dir = _calc.dist > _calc.lastDist ? 1 : -1),
      (_calc.lastDist = _calc.dist));
  }
  function clearTweens() {
    (_scale.tween && (_scale.tween = _scale.tween.stop()),
      _scale.center && (_scale.center = _scale.center.stop()),
      _translate.tSnapX && (_translate.tSnapX = _translate.tSnapX.stop()),
      _translate.tSnapY && (_translate.tSnapY = _translate.tSnapY.stop()),
      _translate.tStartX && (_translate.tStartX = _translate.tStartX.stop()),
      _translate.tStartY && (_translate.tStartY = _translate.tStartY.stop()),
      _translate.tVelX && (_translate.tVelX = _translate.tVelX.stop()),
      _translate.tVelY && (_translate.tVelY = _translate.tVelY.stop()),
      _rotate.tweenR && (_rotate.tweenR = _rotate.tweenR.stop()),
      _rotate.tweenS && (_rotate.tweenS = _rotate.tweenS.stop()));
  }
  function addListeners() {
    ($touchArea.bind("touchstart", touchStart),
      Stage.bind("touchend", touchEnd),
      Stage.bind("touchcancel", touchEnd));
  }
  function touchStart(e) {
    ((_calc.dir = 0),
      clearTweens(),
      updateVectors(e),
      _scale.enabled &&
        (function startScale(e) {
          2 != e.touches.length ||
            _rotate.prevent ||
            (e.preventDefault(),
            (_scale.active = !0),
            (_scale.startDist = _calc.dist),
            (_scale.saveScale = $object.scale));
        })(e),
      _translate.enabled &&
        (function startTranslate(e) {
          if (_translate.moving || _scale.active) return;
          ((_translate.moving = !0),
            _translate.save.set(_p0.x, _p0.y),
            _translate.start.copy($object));
        })(),
      _rotate.enabled &&
        (function startRotate(e) {
          2 == e.touches.length && ((_rotate.active = !0), (_rotate.angle = _calc.angle));
        })(e),
      Stage.bind("touchmove", touchMove));
  }
  function touchMove(e) {
    (updateVectors(e),
      clearTweens(),
      _scale.enabled &&
        (function moveScale(e) {
          if (!_scale.active || _rotate.prevent) return;
          var diff = _calc.dist - _scale.startDist,
            scale = _scale.saveScale + Math.range(diff, 0, _scale.fidelity, 0, 1);
          ((_scale.snap = !1),
            scale > _scale.max
              ? ((_scale.snap = _scale.max), (scale = _scale.max + 0.05 * (scale - _scale.max)))
              : scale < _scale.min &&
                ((_scale.snap = _scale.min), (scale = _scale.min - 0.02 * (_scale.min - scale))));
          -1 == _calc.dir &&
            _translate.enabled &&
            ((_scale.centering = !0),
            ($object.x += 0.02 * (_translate.origin.x - $object.x)),
            ($object.y += 0.02 * (_translate.origin.y - $object.y)),
            _translate.start.copy($object));
          $object.scale = scale;
        })(),
      _translate.enabled &&
        (function moveTranslate(e) {
          if (
            (_translate.diff.subVectors(_p0, _translate.save),
            _translate.delta.subVectors(_p0, _translate.prevTouch),
            _translate.prevTouch.copy(_p0),
            !_translate.moving || _scale.active)
          )
            return (_translate.moving = !1);
          ((_translate.haveMoved = !0),
            (_translate.snapX = !1),
            (_translate.snapY = !1),
            (_translate.time = Date.now() - (_translate.prevTime || 0)),
            (_translate.prevTime = Date.now()),
            Math.abs(_translate.diff.x) > 20 && e.preventDefault());
          var x = _translate.start.x + _translate.diff.x,
            y = _translate.start.y + _translate.diff.y,
            mh = _translate.mask.height,
            mw = _translate.mask.width,
            l = $object.rect.x + x,
            t = $object.rect.y + y,
            max = 0,
            diff = 0;
          ((_translate.stopXR = mw - $object.rect.width - $object.rect.x),
            (_translate.stopXL = -$object.rect.x),
            (_translate.stopYB = mh - $object.rect.height - $object.rect.y),
            (_translate.stopYT = -$object.rect.y),
            l < 0
              ? l < (max = mw - $object.rect.width) &&
                (_translate.diff.sx1 || (_translate.diff.sx1 = _translate.diff.x),
                (diff = _translate.diff.sx1 - _translate.diff.x),
                (x = max - $object.rect.x - 0.3 * diff),
                (_translate.snapX = max - $object.rect.x))
              : (_translate.diff.sx2 || (_translate.diff.sx2 = _translate.diff.x),
                (diff = _translate.diff.sx2 - _translate.diff.x),
                (x = -$object.rect.x - 0.3 * diff),
                (_translate.snapX = -$object.rect.x)));
          t < 0
            ? t < (max = mh - $object.rect.height) &&
              (_translate.diff.sy1 || (_translate.diff.sy1 = _translate.diff.y),
              (diff = _translate.diff.sy1 - _translate.diff.y),
              (y = max - $object.rect.y - 0.3 * diff),
              (_translate.snapY = max - $object.rect.y))
            : (_translate.diff.sy2 || (_translate.diff.sy2 = _translate.diff.y),
              (diff = _translate.diff.sy2 - _translate.diff.y),
              (y = -$object.rect.y - 0.3 * diff),
              (_translate.snapY = -$object.rect.y));
          (($object.x = x), ($object.y = y));
        })(e),
      _rotate.enabled &&
        (function moveRotate(e) {
          if (!_rotate.active) return;
          var diff = Math.degrees(_calc.angle - _rotate.angle);
          (Math.abs(diff) > 3 || _rotate.allow) &&
            ((_rotate.allow = !0), ($object.rotation = _rotate.startAngle + diff));
        })());
  }
  function touchEnd(e) {
    (clearTweens(),
      Stage.unbind("touchmove", touchMove),
      _scale.enabled &&
        (function endScale(e) {
          if (!_scale.active || _rotate.prevent) return;
          ((_scale.saveScale = $object.scale),
            _scale.snap &&
              ((_scale.tween = tween($object, { scale: _scale.snap }, 300, "easeOutCubic")),
              (_scale.snap = !1)));
          _scale.centering &&
            (_scale.center = tween(
              $object,
              { x: _translate.origin.x, y: _translate.origin.y },
              300,
              "easeOutCubic",
            ));
          defer(function () {
            ((_scale.active = !1), (_scale.centering = !1));
          });
        })(),
      _translate.enabled &&
        (function endTranslate(e) {
          if (((_translate.haveMoverd = !1), !_translate.moving || _scale.active)) return;
          ((_translate.moving = !1),
            _translate.start.copy($object),
            (_translate.diff.sy1 = !1),
            (_translate.diff.sx1 = !1),
            (_translate.diff.sy2 = !1),
            (_translate.diff.sx2 = !1),
            _translate.velocity.copy(_translate.delta).divide(_translate.time).multiply(80));
          var xTime = 2 * Math.abs(_translate.velocity.x),
            yTime = 2 * Math.abs(_translate.velocity.y),
            time = xTime > yTime ? xTime : yTime;
          _scale.centering && _translate.velocity.set(0, 0);
          if ("number" == typeof _translate.snapX)
            ((_translate.tSnapX = tween($object, { x: _translate.snapX }, 300, "easeOutCubic")),
              (_translate.tStartX = tween(
                _translate.start,
                { x: _translate.snapX },
                300,
                "easeOutCubic",
              )),
              (_translate.snapX = !1));
          else if (Math.abs(_translate.velocity.x) > 10) {
            var x = $object.x + _translate.velocity.x;
            (x < _translate.stopXR
              ? (x = _translate.stopXR)
              : x > _translate.stopXL && (x = _translate.stopXL),
              (_translate.tVelX = tween($object, { x: x }, time, "easeOutCubic")),
              (_translate.tStartX = tween(_translate.start, { x: x }, time, "easeOutCubic")));
          }
          if ("number" == typeof _translate.snapY)
            ((_translate.tSnapY = tween($object, { y: _translate.snapY }, 300, "easeOutCubic")),
              (_translate.tStartY = tween(
                _translate.start,
                { y: _translate.snapY },
                300,
                "easeOutCubic",
              )),
              (_translate.snapY = !1));
          else if (Math.abs(_translate.velocity.y) > 10) {
            var y = $object.y + _translate.velocity.y;
            (y < _translate.stopYB
              ? (y = _translate.stopYB)
              : y > _translate.stopYT && (y = _translate.stopYT),
              (_translate.tVelY = tween($object, { y: y }, time, "easeOutCubic")),
              (_translate.tStartY = tween(_translate.start, { y: y }, time, "easeOutCubic")));
          }
        })(),
      _rotate.enabled &&
        (function endRotate(e) {
          if (!_rotate.active) return;
          ((_rotate.active = !1),
            (_rotate.allow = !1),
            (_rotate.prevent = !1),
            (_rotate.startAngle = $object.rotation),
            _rotate.snap &&
              ((_rotate.tweenR = tween($object, { rotation: 0 }, 300, "easeOutCubic")),
              (_rotate.tweenS = tween(_rotate, { startAngle: 0 }, 300, "easeOutCubic"))));
        })());
  }
  ((this.velocityDelta = 80),
    ($object.multiTween = !0),
    $object.transformPoint($object.width / 2, $object.height / 2),
    ($object.rect = {
      x: 0,
      y: 0,
      width: $object.width,
      height: $object.height,
      cx: $object.width / 2,
      cy: $object.height / 2,
    }),
    ($object.scale = $object.scale || 1),
    defer(addListeners),
    Render.start(loop),
    (this.scale = function (fidelity, min, max) {
      ((_scale.enabled = !0),
        (_scale.init = $object.scale || 1),
        (_scale.saveScale = _scale.init),
        (_scale.fidelity = 100 * (1 - fidelity)),
        (_scale.min = min),
        (_scale.max = max));
    }),
    (this.translate = function (mask, bounds) {
      ((_translate.enabled = !0),
        (_translate.bounds = bounds),
        (_translate.start = new Vector2($object.x || 0, $object.y || 0)),
        (_translate.origin = new Vector2().copy(_translate.start)),
        (_translate.save = new Vector2()),
        (_translate.diff = new Vector2()),
        (_translate.delta = new Vector2()),
        (_translate.velocity = new Vector2()),
        (_translate.prevTouch = new Vector2()),
        (_translate.mask = mask),
        (_translate.start.multiTween = !0));
    }),
    (this.rotate = function (snap) {
      ((_rotate.snap = snap), (_rotate.enabled = !0), (_rotate.startAngle = $object.rotation || 0));
    }),
    (this.onDestroy = function () {
      Render.stop(loop);
    }),
    this.set("bounding", function ($value) {
      $touchArea = $value;
    }));
});
