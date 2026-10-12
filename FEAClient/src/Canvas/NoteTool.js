export default function
createNote(
  position,
  layerId,
  makeId
) {
  return {
    id: makeId("note"),
    type: "note",
    layerId,
    x: position.x,
    y: position.y,
    width: 220,
    height: 140,
    fill: "#FEF08A",
    text: "New Note"
  };
}
