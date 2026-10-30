Module(function BufferToVertices() {
  const FACES = ["a", "b", "c"];
  this.exports = {
    toVertices: function toVertices(geom) {
      !(function buildFaces(geom) {
        let attributes = geom.attributes,
          positions = attributes.position.array,
          normals = attributes.normal.array,
          uvs = attributes.uv.array,
          tempNormals = [],
          tempUVs = [];
        ((geom.vertices = []), (geom.faceVertexUvs = [[]]), (geom.faces = []));
        let indices = geom.index;
        function Face3(a, b, c, normal) {
          ((this.a = a), (this.b = b), (this.c = c), (this.normal = normal));
        }
        for (let i = 0, j = 0; i < positions.length; i += 3, j += 2)
          (geom.vertices.push(new Vector3(positions[i], positions[i + 1], positions[i + 2])),
            tempNormals.push(new Vector3(normals[i], normals[i + 1], normals[i + 2])),
            tempUVs.push(new Vector2(uvs[j], uvs[j + 1])));
        function addFace(a, b, c, materialIndex) {
          let face = new Face3(a, b, c, [
            tempNormals[a].clone(),
            tempNormals[b].clone(),
            tempNormals[c].clone(),
          ]);
          (geom.faces.push(face),
            geom.faceVertexUvs[0].push([
              tempUVs[a].clone(),
              tempUVs[b].clone(),
              tempUVs[c].clone(),
            ]));
        }
        for (var i = 0; i < indices.length; i += 3)
          addFace(indices[i], indices[i + 1], indices[i + 2]);
        !(function mergeVertices(geom) {
          var v,
            key,
            i,
            il,
            face,
            indices,
            j,
            jl,
            verticesMap = {},
            unique = [],
            changes = [],
            precisionPoints = 4,
            precision = Math.pow(10, precisionPoints);
          for (i = 0, il = geom.vertices.length; i < il; i++)
            ((v = geom.vertices[i]),
              void 0 ===
              verticesMap[
                (key =
                  Math.round(v.x * precision) +
                  "_" +
                  Math.round(v.y * precision) +
                  "_" +
                  Math.round(v.z * precision))
              ]
                ? ((verticesMap[key] = i),
                  unique.push(geom.vertices[i]),
                  (changes[i] = unique.length - 1))
                : (changes[i] = changes[verticesMap[key]]));
          var faceIndicesToRemove = [];
          for (i = 0, il = geom.faces.length; i < il; i++) {
            (((face = geom.faces[i]).a = changes[face.a]),
              (face.b = changes[face.b]),
              (face.c = changes[face.c]),
              (indices = [face.a, face.b, face.c]));
            for (var n = 0; n < 3; n++)
              if (indices[n] === indices[(n + 1) % 3]) {
                faceIndicesToRemove.push(i);
                break;
              }
          }
          for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
            var idx = faceIndicesToRemove[i];
            for (geom.faces.splice(idx, 1), j = 0, jl = geom.faceVertexUvs.length; j < jl; j++)
              geom.faceVertexUvs[j].splice(idx, 1);
          }
          var diff = geom.vertices.length - unique.length;
          return ((geom.vertices = unique), diff);
        })(geom);
      })(geom);
    },
    toBuffer: function toBuffer(geom) {
      let faces = geom.faces,
        array = geom.attributes.position.array;
      for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        for (let f = 0; f < FACES.length; f++) {
          let index = face[FACES[f]],
            vertex = geom.vertices[index];
          ((array[3 * index + 0] = vertex.x),
            (array[3 * index + 1] = vertex.y),
            (array[3 * index + 2] = vertex.z));
        }
      }
    },
  };
});
