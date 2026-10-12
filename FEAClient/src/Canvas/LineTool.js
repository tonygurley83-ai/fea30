export default function
createLine(
  start,
  end,
  layerId,
  makeId
) {
  return {
    id: makeId("line"),
    type: "line",
    layerId,
    x: start.x,
    y: start.y,
    x2: end.x,
    y2: end.y,
    stroke: "#2563EB",
    strokeWidth: 3
  };
}
