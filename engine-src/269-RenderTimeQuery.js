Class(function RenderTimeQuery(_gl, shader, resultavailableCB = () => {}) {
  Inherit(this, Component);
  const _this = this,
    HAS_SPECTOR = window.spector;
  ((_this.durationQuery = null),
    (_this.testInProgress = !1),
    (_this.resultsAvailable = !1),
    (_this.queryEnded = !0),
    (_this.timeElapsed = 0),
    (_this.prevTimeElapsed = 0),
    (_this.inactive = !1),
    (_this.inactivityAttempts = 100));
  const ext = Renderer.extensions.disjointTimerQuery;
  function endDurationQuery() {
    _this.queryEnded || ((_this.queryEnded = !0), _gl.endQuery(ext.TIME_ELAPSED_EXT));
  }
  function checkQueryResults() {
    let available = _gl.getQueryParameter(_this.durationQuery, _gl.QUERY_RESULT_AVAILABLE),
      disjoint = _gl.getParameter(ext.GPU_DISJOINT_EXT);
    if (((_this.prevTimeElapsed = _this.timeElapsed), available && !disjoint)) {
      let elapsedTime = _gl.getQueryParameter(_this.durationQuery, _gl.QUERY_RESULT);
      ((shader.renderDuration = _this.timeElapsed =
        (function timeInMS(res) {
          return Math.round(res / 1e6, 2);
        })(elapsedTime)),
        (_this.resultsAvailable = !0));
    }
    (available || disjoint) && (deleteQueries(), resultavailableCB(_this));
  }
  function deleteQueries() {
    (_gl.deleteQuery(_this.durationQuery), (_this.durationQuery = null));
  }
  (!(async function () {
    (await Hydra.ready(),
      ext
        ? ((_this.queryObject = shader),
          (_this.id = shader.mesh?.id || shader.parent?.__id),
          (shader.renderTimeQuery = _this))
        : console.error("extension not available"));
  })(),
    (this.beginTest = function beginTest() {
      if (HAS_SPECTOR) {
        const v = Object.values(RenderMonitor.results).find((i) => i.obj === shader),
          name = v?.obj?.__renderstatsname;
        spector.log(`RenderMonitor:START = ${name}`);
      }
      _this.queryObject &&
        (_this.testInProgress ||
          ((_this.testInProgress = !0),
          (_this.queryEnded = !1),
          (_this.resultsAvailable = !1),
          (_this.resultsReady = Promise.create()),
          _gl.getParameter(ext.GPU_DISJOINT_EXT),
          (function initDrawDurationQuery() {
            _this.durationQuery ||
              ((_this.durationQuery = _gl.createQuery()),
              _gl.beginQuery(ext.TIME_ELAPSED_EXT, _this.durationQuery));
          })()));
    }),
    (this.endTest = function endTest(force = !1) {
      if (HAS_SPECTOR) {
        const v = Object.values(RenderMonitor.results).find((i) => i.obj === shader),
          name = v?.obj?.__renderstatsname,
          duration = v?.duration / v?.resultCount;
        spector.log(`RenderMonitor:END = ${name}; duration = ${duration}ms`);
      }
      if (force)
        return (
          (_this.testInProgress = !1),
          endDurationQuery(),
          deleteQueries(),
          void _gl.getParameter(ext.GPU_DISJOINT_EXT)
        );
      _this.durationQuery && _this.testInProgress && (endDurationQuery(), checkQueryResults());
    }),
    (this.deleteQueries = deleteQueries));
});
