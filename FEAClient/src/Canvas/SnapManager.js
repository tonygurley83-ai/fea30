export function snapToGrid(
  x,
  y,
  cellSize
) {
  const row = Math.round(
    y / cellSize
  );

  const offset =
    row % 2 === 0
      ? 0
      : cellSize / 2;

  return {
    x:
      Math.round(
        (x - offset) /
          cellSize
      ) *
        cellSize +
      offset,

    y: row * cellSize
  };
}
