import React from "react";
import { Rect } from "react-konva";

export default function SelectionBox({
  selectionBox
}) {
  if (!selectionBox) {
    return null;
  }

  return (
    <Rect
      x={selectionBox.x}
      y={selectionBox.y}
      width={selectionBox.width}
      height={selectionBox.height}
      fill="rgba(37,99,235,0.15)"
      stroke="#2563EB"
      dash={[5, 5]}
      listening={false}
    />
  );
}
