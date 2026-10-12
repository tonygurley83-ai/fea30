import {
  createCellNode,
  createFaceNodes,
  createEdgeNodes,
  createVertexNodes,
} from "./nodeGenerator";

export default class ChunkManager {
  constructor(cellSize = 100, chunkSize = 16) {
    this.cellSize = cellSize;
    this.chunkSize = chunkSize;

    this.chunks = new Map();
  }

  key(x, y, z) {
    return `${x}:${y}:${z}`;
  }

  getChunk(x, y, z) {
    const key = this.key(x, y, z);

    if (!this.chunks.has(key)) {
      this.chunks.set(
        key,
        this.buildChunk(x, y, z)
      );
    }

    return this.chunks.get(key);
  }

  buildChunk(chunkX, chunkY, chunkZ) {
    const cellNodes = [];
    const faceNodes = [];
    const edgeNodes = [];
    const vertexNodes = [];

    for (let x = 0; x < this.chunkSize; x++) {
      for (let y = 0; y < this.chunkSize; y++) {
        for (let z = 0; z < this.chunkSize; z++) {

          const world = [
            ((chunkX * this.chunkSize) + x)
              * this.cellSize,

            ((chunkY * this.chunkSize) + y)
              * this.cellSize,

            ((chunkZ * this.chunkSize) + z)
              * this.cellSize,
          ];

          cellNodes.push(
            createCellNode(world)
          );

          faceNodes.push(
            ...createFaceNodes(
              world,
              this.cellSize
            )
          );

          edgeNodes.push(
            ...createEdgeNodes(
              world,
              this.cellSize
            )
          );

          vertexNodes.push(
            ...createVertexNodes(
              world,
              this.cellSize
            )
          );
        }
      }
    }

    return {
      cellNodes,
      faceNodes,
      edgeNodes,
      vertexNodes,
    };
  }
}
