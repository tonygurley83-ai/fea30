export default function
createRectangle(
  position,
  layerId,
  makeId
) {
  return {
    id: makeId("rect"),
    type: "rect",
    layerId,
    x: position.x,
    y: position.y,
    width: 140,
    height: 100,
    fill: "#0F766E"
  };
}
