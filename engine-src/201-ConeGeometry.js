class ConeGeometry extends CylinderGeometry {
  constructor(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength) {
    super(0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
  }
}
