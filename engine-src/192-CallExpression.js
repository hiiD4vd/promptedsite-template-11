Module(function GLSLOptimizer() {
  this.exports = function (code) {
    return (function unrollLoops(string) {
      return string.replace(
        /#pragma unroll_loop[\s]+?for \(int i \= (\d+)\; i < (\d+)\; i\+\+\) \{([\s\S]+?)(?=\})\}/g,
        function replace(match, start, end, snippet) {
          let unroll = "";
          for (let i = parseInt(start); i < parseInt(end); i++)
            unroll += snippet.replace(/\[i\]/g, "[" + i + "]");
          return unroll;
        },
      );
    })(code);
  };
});
