function CanvasElement({
  element,
  selected,
  onSelect,
  onUpdate
}) {
  const isSelected = selected === element.id;

  if (element.type === "node") {
    return (
      <Circle
        x={element.x}
        y={element.y}
        radius={element.data.radius}
        fill={element.data.color}
        stroke={isSelected ? "#ffffff" : "#fff3c4"}
        strokeWidth={isSelected ? 3 : 1.5}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) => {
          onUpdate({
            ...element,
            x: event.target.x(),
            y: event.target.y()
          });
        }}
      />
    );
  }

  if (element.type === "rectangle") {
    return (
      <Rect
        x={element.x}
        y={element.y}
        width={element.data.width}
        height={element.data.height}
        offsetX={element.data.width / 2}
        offsetY={element.data.height / 2}
        fill={`${element.data.color}45`}
        stroke={element.data.color}
        strokeWidth={2}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) => {
          onUpdate({
            ...element,
            x: event.target.x(),
            y: event.target.y()
          });
        }}
      />
    );
  }

  if (element.type === "circle") {
    return (
      <Circle
        x={element.x}
        y={element.y}
        radius={element.data.radius}
        fill={`${element.data.color}40`}
        stroke={element.data.color}
        strokeWidth={2}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) => {
          onUpdate({
            ...element,
            x: event.target.x(),
            y: event.target.y()
          });
        }}
      />
    );
  }

  if (element.type === "polygon") {
    const points = element.data.points.flatMap((point) => [
      point.x,
      point.y
    ]);

    return (
      <Group
        x={element.x}
        y={element.y}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) => {
          onUpdate({
            ...element,
            x: event.target.x(),
            y: event.target.y()
          });
        }}
      >
        <Line
          points={points}
          closed
          fill={`${element.data.color}55`}
          stroke={element.data.color}
          strokeWidth={2}
          lineJoin="round"
        />
      </Group>
    );
  }

  if (element.type === "line") {
    const dx = element.data.x2 - element.x;
    const dy = element.data.y2 - element.y;

    return (
      <Group
        x={element.x}
        y={element.y}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) => {
          const nextX = event.target.x();
          const nextY = event.target.y();

          onUpdate({
            ...element,
            x: nextX,
            y: nextY,

            data: {
              ...element.data,
              x2: nextX + dx,
              y2: nextY + dy
            }
          });
        }}
      >
        <Line
          points={[0, 0, dx, dy]}
          stroke={element.data.color}
          strokeWidth={3}
          hitStrokeWidth={18}
          lineCap="round"
        />
      </Group>
    );
  }

  return null;
}
