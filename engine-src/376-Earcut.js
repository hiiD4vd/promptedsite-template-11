Class(function Earcut() {
  Inherit(this, Component);
  function linkedList(data, start, end, dim, clockwise) {
    var i, last;
    if (
      clockwise ===
      (function signedArea(data, start, end, dim) {
        for (var sum = 0, i = start, j = end - dim; i < end; i += dim)
          ((sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1])), (j = i));
        return sum;
      })(data, start, end, dim) >
        0
    )
      for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    else for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    return (last && equals(last, last.next) && (removeNode(last), (last = last.next)), last);
  }
  function filterPoints(start, end) {
    if (!start) return start;
    end || (end = start);
    var again,
      p = start;
    do {
      if (((again = !1), p.steiner || (!equals(p, p.next) && 0 !== area(p.prev, p, p.next))))
        p = p.next;
      else {
        if ((removeNode(p), (p = end = p.prev) === p.next)) break;
        again = !0;
      }
    } while (again || p !== end);
    return end;
  }
  function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (ear) {
      !pass &&
        invSize &&
        (function indexCurve(start, minX, minY, invSize) {
          var p = start;
          do {
            (null === p.z && (p.z = zOrder(p.x, p.y, minX, minY, invSize)),
              (p.prevZ = p.prev),
              (p.nextZ = p.next),
              (p = p.next));
          } while (p !== start);
          ((p.prevZ.nextZ = null),
            (p.prevZ = null),
            (function sortLinked(list) {
              var i,
                p,
                q,
                e,
                tail,
                numMerges,
                pSize,
                qSize,
                inSize = 1;
              do {
                for (p = list, list = null, tail = null, numMerges = 0; p;) {
                  for (
                    numMerges++, q = p, pSize = 0, i = 0;
                    i < inSize && (pSize++, (q = q.nextZ));
                    i++
                  );
                  for (qSize = inSize; pSize > 0 || (qSize > 0 && q);)
                    (0 !== pSize && (0 === qSize || !q || p.z <= q.z)
                      ? ((e = p), (p = p.nextZ), pSize--)
                      : ((e = q), (q = q.nextZ), qSize--),
                      tail ? (tail.nextZ = e) : (list = e),
                      (e.prevZ = tail),
                      (tail = e));
                  p = q;
                }
                ((tail.nextZ = null), (inSize *= 2));
              } while (numMerges > 1);
              return list;
            })(p));
        })(ear, minX, minY, invSize);
      for (var prev, next, stop = ear; ear.prev !== ear.next;)
        if (
          ((prev = ear.prev),
          (next = ear.next),
          invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear))
        )
          (triangles.push(prev.i / dim),
            triangles.push(ear.i / dim),
            triangles.push(next.i / dim),
            removeNode(ear),
            (ear = next.next),
            (stop = next.next));
        else if ((ear = next) === stop) {
          pass
            ? 1 === pass
              ? earcutLinked(
                  (ear = cureLocalIntersections(ear, triangles, dim)),
                  triangles,
                  dim,
                  minX,
                  minY,
                  invSize,
                  2,
                )
              : 2 === pass && splitEarcut(ear, triangles, dim, minX, minY, invSize)
            : earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
          break;
        }
    }
  }
  function isEar(ear) {
    var a = ear.prev,
      b = ear,
      c = ear.next;
    if (area(a, b, c) >= 0) return !1;
    for (var p = ear.next.next; p !== ear.prev;) {
      if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0)
        return !1;
      p = p.next;
    }
    return !0;
  }
  function isEarHashed(ear, minX, minY, invSize) {
    var a = ear.prev,
      b = ear,
      c = ear.next;
    if (area(a, b, c) >= 0) return !1;
    for (
      var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : b.x < c.x ? b.x : c.x,
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : b.y < c.y ? b.y : c.y,
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : b.x > c.x ? b.x : c.x,
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : b.y > c.y ? b.y : c.y,
        minZ = zOrder(minTX, minTY, minX, minY, invSize),
        maxZ = zOrder(maxTX, maxTY, minX, minY, invSize),
        p = ear.prevZ,
        n = ear.nextZ;
      p && p.z >= minZ && n && n.z <= maxZ;
    ) {
      if (
        p !== ear.prev &&
        p !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        area(p.prev, p, p.next) >= 0
      )
        return !1;
      if (
        ((p = p.prevZ),
        n !== ear.prev &&
          n !== ear.next &&
          pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
          area(n.prev, n, n.next) >= 0)
      )
        return !1;
      n = n.nextZ;
    }
    for (; p && p.z >= minZ;) {
      if (
        p !== ear.prev &&
        p !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        area(p.prev, p, p.next) >= 0
      )
        return !1;
      p = p.prevZ;
    }
    for (; n && n.z <= maxZ;) {
      if (
        n !== ear.prev &&
        n !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
        area(n.prev, n, n.next) >= 0
      )
        return !1;
      n = n.nextZ;
    }
    return !0;
  }
  function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
      var a = p.prev,
        b = p.next.next;
      (!equals(a, b) &&
        intersects(a, p, p.next, b) &&
        locallyInside(a, b) &&
        locallyInside(b, a) &&
        (triangles.push(a.i / dim),
        triangles.push(p.i / dim),
        triangles.push(b.i / dim),
        removeNode(p),
        removeNode(p.next),
        (p = start = b)),
        (p = p.next));
    } while (p !== start);
    return p;
  }
  function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    var a = start;
    do {
      for (var b = a.next.next; b !== a.prev;) {
        if (a.i !== b.i && isValidDiagonal(a, b)) {
          var c = splitPolygon(a, b);
          return (
            (a = filterPoints(a, a.next)),
            (c = filterPoints(c, c.next)),
            earcutLinked(a, triangles, dim, minX, minY, invSize),
            void earcutLinked(c, triangles, dim, minX, minY, invSize)
          );
        }
        b = b.next;
      }
      a = a.next;
    } while (a !== start);
  }
  function compareX(a, b) {
    return a.x - b.x;
  }
  function eliminateHole(hole, outerNode) {
    if (
      ((outerNode = (function findHoleBridge(hole, outerNode) {
        var m,
          p = outerNode,
          hx = hole.x,
          hy = hole.y,
          qx = -1 / 0;
        do {
          if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + ((hy - p.y) * (p.next.x - p.x)) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
              if (((qx = x), x === hx)) {
                if (hy === p.y) return p;
                if (hy === p.next.y) return p.next;
              }
              m = p.x < p.next.x ? p : p.next;
            }
          }
          p = p.next;
        } while (p !== outerNode);
        if (!m) return null;
        if (hx === qx) return m.prev;
        var tan,
          stop = m,
          mx = m.x,
          my = m.y,
          tanMin = 1 / 0;
        p = m.next;
        for (; p !== stop;)
          (hx >= p.x &&
            p.x >= mx &&
            hx !== p.x &&
            pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y) &&
            ((tan = Math.abs(hy - p.y) / (hx - p.x)) < tanMin || (tan === tanMin && p.x > m.x)) &&
            locallyInside(p, hole) &&
            ((m = p), (tanMin = tan)),
            (p = p.next));
        return m;
      })(hole, outerNode)),
      outerNode)
    ) {
      var b = splitPolygon(outerNode, hole);
      filterPoints(b, b.next);
    }
  }
  function zOrder(x, y, minX, minY, invSize) {
    return (
      (x =
        1431655765 &
        ((x =
          858993459 &
          ((x =
            252645135 &
            ((x = 16711935 & ((x = 32767 * (x - minX) * invSize) | (x << 8))) | (x << 4))) |
            (x << 2))) |
          (x << 1))) |
      ((y =
        1431655765 &
        ((y =
          858993459 &
          ((y =
            252645135 &
            ((y = 16711935 & ((y = 32767 * (y - minY) * invSize) | (y << 8))) | (y << 4))) |
            (y << 2))) |
          (y << 1))) <<
        1)
    );
  }
  function getLeftmost(start) {
    var p = start,
      leftmost = start;
    do {
      ((p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) && (leftmost = p),
        (p = p.next));
    } while (p !== start);
    return leftmost;
  }
  function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (
      (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
      (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
      (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0
    );
  }
  function isValidDiagonal(a, b) {
    return (
      a.next.i !== b.i &&
      a.prev.i !== b.i &&
      !(function intersectsPolygon(a, b) {
        var p = a;
        do {
          if (
            p.i !== a.i &&
            p.next.i !== a.i &&
            p.i !== b.i &&
            p.next.i !== b.i &&
            intersects(p, p.next, a, b)
          )
            return !0;
          p = p.next;
        } while (p !== a);
        return !1;
      })(a, b) &&
      locallyInside(a, b) &&
      locallyInside(b, a) &&
      (function middleInside(a, b) {
        var p = a,
          inside = !1,
          px = (a.x + b.x) / 2,
          py = (a.y + b.y) / 2;
        do {
          (p.y > py != p.next.y > py &&
            p.next.y !== p.y &&
            px < ((p.next.x - p.x) * (py - p.y)) / (p.next.y - p.y) + p.x &&
            (inside = !inside),
            (p = p.next));
        } while (p !== a);
        return inside;
      })(a, b)
    );
  }
  function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  }
  function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }
  function intersects(p1, q1, p2, q2) {
    return (
      !!((equals(p1, p2) && equals(q1, q2)) || (equals(p1, q2) && equals(p2, q1))) ||
      (area(p1, q1, p2) > 0 != area(p1, q1, q2) > 0 && area(p2, q2, p1) > 0 != area(p2, q2, q1) > 0)
    );
  }
  function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0
      ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0
      : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
  }
  function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
      b2 = new Node(b.i, b.x, b.y),
      an = a.next,
      bp = b.prev;
    return (
      (a.next = b),
      (b.prev = a),
      (a2.next = an),
      (an.prev = a2),
      (b2.next = a2),
      (a2.prev = b2),
      (bp.next = b2),
      (b2.prev = bp),
      b2
    );
  }
  function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);
    return (
      last
        ? ((p.next = last.next), (p.prev = last), (last.next.prev = p), (last.next = p))
        : ((p.prev = p), (p.next = p)),
      p
    );
  }
  function removeNode(p) {
    ((p.next.prev = p.prev),
      (p.prev.next = p.next),
      p.prevZ && (p.prevZ.nextZ = p.nextZ),
      p.nextZ && (p.nextZ.prevZ = p.prevZ));
  }
  function Node(i, x, y) {
    ((this.i = i),
      (this.x = x),
      (this.y = y),
      (this.prev = null),
      (this.next = null),
      (this.z = null),
      (this.prevZ = null),
      (this.nextZ = null),
      (this.steiner = !1));
  }
  this.triangulate = function (data, holeIndices, dim) {
    dim = dim || 2;
    var minX,
      minY,
      maxX,
      maxY,
      x,
      y,
      invSize,
      hasHoles = holeIndices && holeIndices.length,
      outerLen = hasHoles ? holeIndices[0] * dim : data.length,
      outerNode = linkedList(data, 0, outerLen, dim, !0),
      triangles = [];
    if (!outerNode || outerNode.next === outerNode.prev) return triangles;
    if (
      (hasHoles &&
        (outerNode = (function eliminateHoles(data, holeIndices, outerNode, dim) {
          var i,
            len,
            list,
            queue = [];
          for (i = 0, len = holeIndices.length; i < len; i++)
            ((list = linkedList(
              data,
              holeIndices[i] * dim,
              i < len - 1 ? holeIndices[i + 1] * dim : data.length,
              dim,
              !1,
            )) === list.next && (list.steiner = !0),
              queue.push(getLeftmost(list)));
          for (queue.sort(compareX), i = 0; i < queue.length; i++)
            (eliminateHole(queue[i], outerNode),
              (outerNode = filterPoints(outerNode, outerNode.next)));
          return outerNode;
        })(data, holeIndices, outerNode, dim)),
      data.length > 80 * dim)
    ) {
      ((minX = maxX = data[0]), (minY = maxY = data[1]));
      for (var i = dim; i < outerLen; i += dim)
        ((x = data[i]) < minX && (minX = x),
          (y = data[i + 1]) < minY && (minY = y),
          x > maxX && (maxX = x),
          y > maxY && (maxY = y));
      invSize = 0 !== (invSize = Math.max(maxX - minX, maxY - minY)) ? 1 / invSize : 0;
    }
    return (earcutLinked(outerNode, triangles, dim, minX, minY, invSize), triangles);
  };
}, "static");
