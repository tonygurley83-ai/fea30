export default function
createCircle(
  position,
  layerId,
  makeId
) {
  return {
    id: makeId("circle"),
    type: "circle",
    layerId,
    x: position.x,
    y: position.y,
    radius: 50,
    fill: "#D97706"
  };
}
