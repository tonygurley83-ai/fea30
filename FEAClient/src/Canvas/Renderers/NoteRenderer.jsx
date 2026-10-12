import React from "react";
import {
  Group,
  Rect,
  Text
} from "react-konva";

export default function
NoteRenderer({
  node,
  selected,
  commonProps
}) {
  return (
    <Group
      id={node.id}
      x={node.x}
      y={node.y}
      {...commonProps}
    >
      <Rect
        width={
          node.width ?? 220
        }
        height={
          node.height ?? 140
        }
        fill={
          node.fill ??
          "#FEF08A"
        }
        stroke={
          selected
            ? "#2563EB"
            : undefined
        }
        strokeWidth={
          selected ? 3 : 0
        }
      />

      <Text
        x={10}
        y={10}
        text={
          node.text ??
          ""
        }
      />
    </Group>
  );
}
