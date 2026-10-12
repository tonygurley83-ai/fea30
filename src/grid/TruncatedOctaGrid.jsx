import React from "react";
import {
  Group,
  Line
} from "react-konva";

function TruncatedOctaGrid({
  width,
  height,
  cellSize = 40,
  visible = true,
  stroke = "#CBD5E1",
  strokeWidth = 1,
  opacity = 0.65
}) {
  if (
    !visible ||
    width <= 0 ||
    height <= 0 ||
    cellSize <= 0
  ) {
    return null;
  }

  const lines = [];

  // Build lines using width, height, and cellSize.
  // Every rendered Line should be non-interactive.

  return (
    <Group
      listening={false}
      opacity={opacity}
    >
      {lines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          stroke={stroke}
          strokeWidth={strokeWidth}
          listening={false}
        />
      ))}
    </Group>
  );
}

export default React.memo(
  TruncatedOctaGrid
);
