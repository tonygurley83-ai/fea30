import { useMemo } from "react";
import { LOD } from "./lodLevels";

export default function useVisibleNodes(
  cameraPosition,
  lod,
  chunkManager
) {
  return useMemo(() => {

    const visible = [];

    const cx =
      Math.floor(
        cameraPosition.x /
        (chunkManager.chunkSize *
         chunkManager.cellSize)
      );

    const cy =
      Math.floor(
        cameraPosition.y /
        (chunkManager.chunkSize *
         chunkManager.cellSize)
      );

    const cz =
      Math.floor(
        cameraPosition.z /
        (chunkManager.chunkSize *
         chunkManager.cellSize)
      );

    const radius = 2;

    for (let x = cx - radius; x <= cx + radius; x++) {
      for (let y = cy - radius; y <= cy + radius; y++) {
        for (let z = cz - radius; z <= cz + radius; z++) {

          const chunk =
            chunkManager.getChunk(
              x,
              y,
              z
            );

          visible.push(
            ...chunk.cellNodes
          );

          if (lod >= LOD.FACE)
            visible.push(
              ...chunk.faceNodes
            );

          if (lod >= LOD.EDGE)
            visible.push(
              ...chunk.edgeNodes
            );

          if (lod >= LOD.FULL)
            visible.push(
              ...chunk.vertexNodes
            );
        }
      }
    }

    return visible;

  }, [cameraPosition, lod, chunkManager]);
}
