export function getSelectionBounds(
  start,
  end
) {
  return {
    x: Math.min(
      start.x,
      end.x
    ),

    y: Math.min(
      start.y,
      end.y
    ),

    width: Math.abs(
      end.x - start.x
    ),

    height: Math.abs(
      end.y - start.y
    )
  };
}

export function isInsideSelection(
  node,
  box
) {
  return (
    node.x >= box.x &&
    node.x <=
      box.x + box.width &&
    node.y >= box.y &&
    node.y <=
      box.y + box.height
  );
}
