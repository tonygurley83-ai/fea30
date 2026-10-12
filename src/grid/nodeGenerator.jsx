import {
  FACE_OFFSETS,
  EDGE_OFFSETS,
  VERTEX_OFFSETS,
} from "./truncatedOctaGeometry";

export function createCellNode(position) {
  return {
    type: "CELL",
    position,
    weight: 100,
  };
}

export function createFaceNodes(center, size) {
  return FACE_OFFSETS.map(([x, y, z]) => ({
    type: "FACE",
    weight: 75,
    position: [
      center[0] + x * size * 0.5,
      center[1] + y * size * 0.5,
      center[2] + z * size * 0.5,
    ],
  }));
}

export function createEdgeNodes(center, size) {
  return EDGE_OFFSETS.map(([x, y, z]) => ({
    type: "EDGE",
    weight: 50,
    position: [
      center[0] + x * size,
      center[1] + y * size,
      center[2] + z * size,
    ],
  }));
}

export function createVertexNodes(center, size) {
  return VERTEX_OFFSETS.map(([x, y, z]) => ({
    type: "VERTEX",
    weight: 25,
    position: [
      center[0] + x * size,
      center[1] + y * size,
      center[2] + z * size,
    ],
  }));
}
