import React from "react";
import {
  Group,
  Line
} from "react-konva";

export default function
PolygonRenderer({
  node,
  commonProps
}) {

  const points =
    node.points.flatMap(
      p => [p.x, p.y]
    );

  return (
    <Group
      id={node.id}
      x={node.x}
      y={node.y}
      {...commonProps}
    >
      <Line
        points={points}
        closed
        fill={
          node.fill ??
          "#7C3AED"
        }
        stroke={
          node.stroke ??
          "#4C1D95"
        }
      />
    </Group>
  );
}

