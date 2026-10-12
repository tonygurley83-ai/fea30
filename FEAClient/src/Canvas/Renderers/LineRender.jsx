import React from "react";
import { Line }
  from "react-konva";

export default function
LineRenderer({
  node,
  selected,
  onSelect
}) {
  return (
    <Line
      id={node.id}
      points={[
        node.x,
        node.y,
        node.x2 ?? node.x,
        node.y2 ?? node.y
      ]}
      stroke={
        selected
          ? "#2563EB"
          : (
              node.stroke ??
              "#2563EB"
            )
      }
      strokeWidth={
        node.strokeWidth ?? 3
      }
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}
