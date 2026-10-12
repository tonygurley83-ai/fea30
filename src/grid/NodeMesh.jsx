export default function NodeMesh({
  node,
}) {
  const colors = {
    CELL: "#00ffff",
    FACE: "#00ff00",
    EDGE: "#ffaa00",
    VERTEX: "#ff4444",
  };

  const radii = {
    CELL: 2.5,
    FACE: 2.0,
    EDGE: 1.5,
    VERTEX: 1.0,
  };

  return (
    <mesh position={node.position}>
      <sphereGeometry
        args={[
          radii[node.type],
          8,
          8,
        ]}
      />

      <meshBasicMaterial
        color={colors[node.type]}
      />
    </mesh>
  );
}
