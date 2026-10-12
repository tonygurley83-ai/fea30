export const LOD = Object.freeze({
  CHUNK: 0,
  CELL: 1,
  FACE: 2,
  EDGE: 3,
  FULL: 4,
});

export function zoomToLOD(zoom) {
  if (zoom < 0.25) return LOD.CHUNK;
  if (zoom < 0.75) return LOD.CELL;
  if (zoom < 1.5) return LOD.FACE;
  if (zoom < 4.0) return LOD.EDGE;

  return LOD.FULL;
}
