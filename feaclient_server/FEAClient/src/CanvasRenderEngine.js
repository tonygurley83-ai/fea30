export function renderCanvas(
  project,
  canvas
) {
  if (!canvas) {
    return null;
  }

  const data =
    typeof canvas.canvas_data ===
    "string"
      ? JSON.parse(
          canvas.canvas_data
        )
      : canvas.canvas_data || {};

  return {
    id: canvas.id,
    name: canvas.name,
    type: canvas.type,
    nodes:
      data.nodes ||
      data.shapes ||
      [],
    elements:
      data.elements || [],
    layers:
      data.layers || []
  };
}
