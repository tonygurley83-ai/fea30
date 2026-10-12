import React from "react";
import { Circle }
  from "react-konva";

export default function
CircleRenderer({
  node,
  selected,
  commonProps
}) {
  return (
    <Circle
      id={node.id}
      x={node.x}
      y={node.y}
      radius={
        node.radius ?? 50
      }
      fill={
        node.fill ??
        "#D97706"
      }
      stroke={
        selected
          ? "#2563EB"
          : undefined
      }
      strokeWidth={
        selected ? 3 : 0
      }
      {...commonProps}
    />
  );
}
