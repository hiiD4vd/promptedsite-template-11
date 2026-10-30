Class(
  function AudioNode(_id, _ctx, _src, options = {}) {
    Inherit(this, Component);
    const _this = this;
    let _gain, _buffer, _currentTime, _loopCounter;
    function checkAudioPlayback() {
      _currentTime = _ctx.currentTime - _this.startedAt + _this.startFrom;
      const hasPlayedOnce = _currentTime >= (_this.stopTo || _this.buffer.duration),
        loopCounter = Math.floor(_currentTime / _this.buffer.duration);
      hasPlayedOnce &&
        (_this.events.fire(AudioNode.AUDIO_COMPLETE, { id: _this.id }),
        _this.shouldLoop
          ? loopCounter !== _loopCounter &&
            ((_loopCounter = loopCounter),
            _this.events.fire(AudioNode.HAS_LOOPED, { id: _this.id }),
            (_this.startFrom = 0))
          : _this.stop({ duration: 0, clearTimeStamps: !0 }));
    }
    function removeSource() {
      (_this.sources.forEach((source) => {
        (source.stop(), source.disconnect());
      }),
        (_this.sources = []),
        _this.flag("stopping", !1));
    }
    ((_this.id = _id),
      (_this.ctx = _ctx),
      (_this.promise = Promise.create()),
      (_this.sources = []),
      (_this.startFrom = 0),
      (_this.startedAt = 0),
      (_this.shouldLoop = !1),
      (_this.baseGain = options.baseGain ?? 1),
      (_this.fade = { value: 0 }),
      (_currentTime = 0),
      (_loopCounter = 0),
      (_this._loopStart = 0),
      (_this._loopEnd = 0),
      _this.flag("playing", !1),
      (async function () {
        _gain = _this.ctx.createGain();
        const arrayBuffer = await (async function getArrayBuffer(_src) {
          if ("string" == typeof _src) {
            let response = await fetch(_src);
            return await response.arrayBuffer();
          }
          if (_src instanceof Blob)
            return await (function blobToArrayBuffer(blob) {
              let promise = Promise.create();
              const reader = new FileReader();
              return (
                (reader.onloadend = () => {
                  promise.resolve(reader.result);
                }),
                reader.readAsArrayBuffer(blob),
                promise
              );
            })(_src);
          if (_src instanceof ArrayBuffer) return _src;
        })(_src);
        if (((_buffer = await _this.ctx.decodeAudioData(arrayBuffer)), options.needsTrimming)) {
          const { loopStart: loopStart, loopEnd: loopEnd } = (function getLoopStartEnd(
            buffer,
            threshold = 0.01,
          ) {
            const { length: length, numberOfChannels: numberOfChannels } = buffer;
            let firstNonZeroIndex = null,
              lastNonZeroIndex = null;
            const channelData = Array.from(
              { length: numberOfChannels },
              () => new Float32Array(length),
            );
            for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex++) {
              const data = channelData[channelIndex];
              buffer.copyFromChannel(data, channelIndex);
              for (let i = 0; i < data.length; i++)
                if (Math.abs(data[i]) > threshold) {
                  i < (firstNonZeroIndex || 1 / 0) && (firstNonZeroIndex = i);
                  break;
                }
              for (let i = data.length - 1; i >= 0; i--)
                if (Math.abs(data[i]) > threshold) {
                  i > (lastNonZeroIndex || -1) && (lastNonZeroIndex = i);
                  break;
                }
            }
            return {
              loopStart: firstNonZeroIndex / buffer.sampleRate,
              loopEnd: lastNonZeroIndex / buffer.sampleRate,
            };
          })(_buffer);
          ((_this._loopStart = loopStart + 0.05), (_this._loopEnd = loopEnd));
        }
        (_this.flag("loaded", !0), _this.promise.resolve(_this));
      })(),
      (this.pause = async function ({ duration: duration = 500 } = {}) {
        return (
          _this.flag("stopping") && (await _this.wait((_) => !_this.flag("stopping"))),
          (_this.startFrom += _ctx.currentTime - _this.startedAt),
          _this.stop({ duration: duration, clearTimeStamps: !1 })
        );
      }),
      (this.play = async function ({
        duration: duration = 500,
        loop: loop = !0,
        playOnce: playOnce = !1,
        startFrom: startFrom = null,
        stopTo: stopTo = null,
        noTween: noTween = !1,
        volume: volume = _this.baseGain,
        allowSimultaneous: allowSimultaneous = !1,
      } = {}) {
        if (!_this.flag("playing") || playOnce || allowSimultaneous) {
          if (Number.isNaN(volume)) throw new Error("Volume is NaN");
          if (
            ((volume = Math.max(0, volume)),
            playOnce && !allowSimultaneous && _this.stop({ duration: 0, clearTimeStamps: !0 }),
            _this.flag("stopping") &&
              !allowSimultaneous &&
              (await _this.wait((_) => !_this.flag("stopping"))),
            (_this.startedAt = _ctx.currentTime),
            startFrom && (_this.startFrom = startFrom),
            stopTo && (_this.stopTo = stopTo),
            (_this.shouldLoop = loop),
            (_loopCounter = 0),
            (function addSource(options = {}) {
              const source = _this.ctx.createBufferSource();
              ((source.buffer = _buffer),
                (source.loop = _this.shouldLoop),
                (source.loopStart = _this._loopStart),
                (source.loopEnd = _this._loopEnd),
                source.connect(_this.gain),
                _this.events.fire(AudioNode.ADD_SOURCE, { source: source }));
              const duration = options.playOnce ? _buffer.duration : void 0;
              (source.start(0, _this.startFrom, duration),
                _this.flag("playing", !0),
                _this.sources.push(source));
            })({ playOnce: playOnce }),
            _this.startRender(checkAudioPlayback),
            0 !== duration)
          )
            return noTween
              ? void (_this.gain.gain.value = volume)
              : ((_this.gain.gain.value = 0),
                _this.gain.gain.setValueAtTime(volume, _ctx.currentTime),
                _this.gain.gain.linearRampToValueAtTime(volume, _ctx.currentTime + duration / 1e3),
                tween(_this.fade, { value: volume }, duration, "linear").promise());
          _this.gain.gain.value = 1;
        }
      }),
      (this.seek = async function (timestamp) {
        (_this.flag("stopping") && (await _this.wait((_) => !_this.flag("stopping"))),
          _this.stop({ duration: 0, clearTimeStamps: !0 }),
          _this.flag("stopping") && (await _this.wait((_) => !_this.flag("stopping"))),
          (_this.startFrom = Math.max(
            0,
            Math.min(timestamp, _this.stopTo || _this.buffer.duration),
          )),
          this.play());
      }),
      (this.stop = async function ({
        duration: duration = 0,
        clearTimeStamps: clearTimeStamps = !0,
      } = {}) {
        return (
          _this.flag("stopping") && (await _this.wait((_) => !_this.flag("stopping"))),
          clearTimeStamps &&
            ((_this.startedAt = 0), (_this.startFrom = 0), (_currentTime = 0), (_loopCounter = 0)),
          _this.flag("stopping", !0),
          _this.flag("playing", !1),
          _this.flag("playedOnce", !1),
          _this.stopRender(checkAudioPlayback),
          0 === duration
            ? removeSource()
            : (_this.gain.gain.setValueAtTime(_this.gain.gain.value, _ctx.currentTime),
              _this.gain.gain.linearRampToValueAtTime(0, _ctx.currentTime + duration / 1e3),
              tween(_this.fade, { value: 0 }, duration, "linear")
                .onComplete(() => {
                  removeSource();
                })
                .promise())
        );
      }),
      this.get("currentTime", (_) => _currentTime),
      this.get("progress", () =>
        _this.buffer ? Math.fract(_currentTime / _this.buffer.duration) : 0,
      ),
      this.get("gain", (_) => _gain),
      this.get("buffer", (_) => _buffer),
      this.get("duration", (_) => _buffer?.duration));
  },
  (_) => {
    ((AudioNode.AUDIO_COMPLETE = "AudioNode.AUDIO_COMPLETE"),
      (AudioNode.HAS_LOOPED = "AudioNode.HAS_LOOPED"),
      (AudioNode.ADD_SOURCE = "AudioNode.ADD_SOURCE"));
  },
);
