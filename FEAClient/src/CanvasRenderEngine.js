const renderCanvas = (
  project,
  canvasRecord
) => {
  const rawCanvasData =
    canvasRecord?.canvas_data ??
    canvasRecord?.canvasData ??
    canvasRecord ??
    {};

  const canvasData =
    typeof rawCanvasData === "string"
      ? JSON.parse(rawCanvasData)
      : rawCanvasData;

  const nodes = Array.isArray(
    canvasData?.nodes
  )
    ? canvasData.nodes
    : Array.isArray(
        canvasData?.elements
      )
      ? canvasData.elements
      : [];

  return {
    id:
      canvasRecord?.id ??
      canvasData?.id ??
      project?.activeCanvasId ??
      null,

    name:
      canvasRecord?.name ??
      canvasData?.name ??
      "Untitled Canvas",

    projectId:
      canvasRecord?.project_id ??
      canvasData?.projectId ??
      project?.id ??
      null,

    ownerId:
      canvasRecord?.owner_id ??
      canvasData?.ownerId ??
      null,

    createdAt:
      canvasRecord?.created_at ??
      canvasData?.createdAt ??
      null,

    updatedAt:
      canvasRecord?.updated_at ??
      canvasData?.updatedAt ??
      null,

    version:
      canvasData?.version ?? 1,

    nodes,

    elements: Array.isArray(
      canvasData?.elements
    )
      ? canvasData.elements
      : nodes,

    layers: Array.isArray(
      canvasData?.layers
    )
      ? canvasData.layers
      : [
          {
            id: "layer-default",
            name: "Layer 1",
            order: 0,
            locked: false,
            visible: true
          }
        ],

    grid: {
      enabled: true,
      visible: true,
      snap: true,
      size: 20,
      ...(canvasData?.grid ?? {})
    }
  };
};

export default renderCanvas;
