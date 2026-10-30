Class(
  function SocketConnection(_server, _channel, _options = {}) {
    Inherit(this, Component);
    var _socket,
      _pingPong,
      _this = this,
      _fail = 0,
      _binary = {},
      _time = Render.TIME;
    const PING = "ping",
      PONG = "pong";
    function connect() {
      ((_this.pending = !1),
        ((_socket = _options.noDeflate
          ? new WebSocket(_server)
          : new WebSocket(_server, ["permessage-deflate"])).binaryType = "arraybuffer"),
        (_socket.onopen = open),
        (_socket.onmessage = message),
        (_socket.onclose = close),
        (_socket.onerror = close));
    }
    function sendPing() {
      _socket && _socket.readyState == WebSocket.OPEN && _socket.send(PING);
    }
    function checkIfConnected() {
      _this.blocked ||
        _this.connected ||
        ((_this.blocked = !0), _this.events.fire(SocketConnection.BLOCKED));
    }
    function open(e) {
      ((_fail = 0),
        (_this.connected = !0),
        _this.events.fire(SocketConnection.OPEN, { socket: _this }, !0),
        _channel && _this.send("register", { channel: _channel }),
        (_pingPong = setInterval(sendPing, 5e3)));
    }
    function message(e) {
      if (e.data !== PONG && e.data !== PING)
        if ("string" == typeof e.data)
          try {
            let data = JSON.parse(e.data),
              evt = data._evt;
            evt
              ? (delete data._evt, _this.events.fire(evt, data, !0))
              : ((_binary.data = data), _this.events.fire(SocketConnection.BINARY, _binary));
          } catch (er) {}
        else ((_binary.data = e.data), _this.events.fire(SocketConnection.BINARY, _binary));
    }
    function close(e) {
      if (Render.TIME - _time < 50 && !_this.blocked)
        return ((_this.blocked = !0), _this.events.fire(SocketConnection.BLOCKED));
      _this.pending ||
        _fail++ > 250 ||
        ((_this.connected = !1),
        (_this.pending = !0),
        _this.events.fire(SocketConnection.CLOSE, { socket: _this }, !0),
        (_this.timer = _this.delayedCall(connect, 250)),
        clearTimeout(_pingPong));
    }
    ((this.connected = !1),
      (async function () {
        try {
          connect();
        } catch (e) {
          (await defer(),
            _this.events.fire(SocketConnection.ERROR, { socket: _this }),
            (_this.timer = _this.delayedCall(connect, 250)),
            _this.delayedCall(checkIfConnected, 2e4));
        }
      })(),
      (this.send = function (evt, data = {}) {
        if (!_this.connected) return _this.delayedCall((_) => _this.send(evt, data), 100);
        ((data._evt = evt),
          _socket &&
            _socket.readyState == WebSocket.OPEN &&
            _socket.send(null != data.length ? data : JSON.stringify(data)));
      }),
      (this.sendBinary = function (data) {
        _socket &&
          _socket.readyState == WebSocket.OPEN &&
          _socket.bufferedAmount < 1024 &&
          _socket.send("binary:" + (null != data.length ? data : JSON.stringify(data)));
      }),
      (this.close = function () {
        ((_socket.onclose = null),
          (_socket.onerror = null),
          clearTimeout(_this.timer),
          _socket.close());
      }));
  },
  (_) => {
    ((SocketConnection.OPEN = "socket_connection_open"),
      (SocketConnection.CLOSE = "socket_connection_close"),
      (SocketConnection.ERROR = "socket_connection_error"),
      (SocketConnection.BINARY = "socket_connection_binary"),
      (SocketConnection.BLOCKED = "socket_connection_blocked"));
  },
);
