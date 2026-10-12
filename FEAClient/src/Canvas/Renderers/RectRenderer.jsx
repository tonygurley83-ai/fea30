import React from "react";
import { Rect }
  from "react-konva";

export default function
RectRenderer({
  node,
  selected,
  commonProps
}) {
  return (
    <Rect
      id={node.id}
      x={node.x}
      y={node.y}
      width={node.width ?? 140}
      height={
        node.height ?? 100
      }
      fill={
        node.fill ??
        "#0F766E"
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
