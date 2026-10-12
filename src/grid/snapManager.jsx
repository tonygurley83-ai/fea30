export function snapToNearestNode(
  point,
  nodes,
  maxDistance
) {
  let nearest = null;
  let bestScore = Infinity;

  const maxDistanceSq =
    maxDistance * maxDistance;

  for (const node of nodes) {

    const dx =
      point.x - node.position[0];

    const dy =
      point.y - node.position[1];

    const dz =
      point.z - node.position[2];

    const distanceSq =
      dx * dx +
      dy * dy +
      dz * dz;

    if (distanceSq > maxDistanceSq)
      continue;

    const score =
      distanceSq /
      node.weight;

    if (score < bestScore) {
      bestScore = score;
      nearest = node;
    }
  }

  return nearest;
}

