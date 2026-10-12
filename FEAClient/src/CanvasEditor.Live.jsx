import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  Stage,
  Layer,
  Group,
  Rect,
  Circle,
  Line,
  Text
} from "react-konva";

import TruncatedOctaGrid
  from "../grid/TruncatedOctaGrid";

const DEFAULT_GRID_SIZE = 40;

const DEFAULT_LAYER = {
  id: "layer_default",
  name: "Default",
  visible: true,
  locked: false,
  order: 0
};

function makeId(prefix) {
  if (typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getLayers(canvas) {
  const source = Array.isArray(canvas?.layers)
    ? canvas.layers
    : [];

  const normalized = source.map((layer, index) => ({
    id: layer?.id ?? `layer_${index + 1}`,
    name: layer?.name ?? `Layer ${index + 1}`,
    visible: layer?.visible !== false,
    locked: layer?.locked === true,
    order: Number.isFinite(layer?.order)
      ? layer.order
      : index
  }));

  const hasDefaultLayer = normalized.some(
    (layer) => layer.id === DEFAULT_LAYER.id
  );

  const allLayers = hasDefaultLayer
    ? normalized
    : [
        ...normalized,
        {
          ...DEFAULT_LAYER,
          order: normalized.length
        }
      ];

  return allLayers.sort(
    (a, b) => a.order - b.order
  );
}

function snapToGrid(x, y, cellSize) {
  const row = Math.round(y / cellSize);

  const offset = row % 2 === 0
    ? 0
    : cellSize / 2;

  return {
    x:
      Math.round(
        (x - offset) / cellSize
      ) *
        cellSize +
      offset,

    y: row * cellSize
  };
}

function CanvasEditor({
  canvas,
  onCanvasChange,
  selectedNodeId,
  onNodeSelected
}) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1
  });

  const [activeLayerId, setActiveLayerId] =
    useState(DEFAULT_LAYER.id);

  const [lineStart, setLineStart] = useState(null);

  const [tool, setTool] = useState("select");

  const nodes = useMemo(
    () => Array.isArray(canvas?.nodes)
      ? canvas.nodes
      : [],
    [canvas?.nodes]
  );

  const layers = useMemo(
    () => getLayers(canvas),
    [canvas?.layers]
  );

  const grid = canvas?.grid ?? {};

  const gridSize =
    Number.isFinite(grid.size) &&
    grid.size > 0
      ? grid.size
      : DEFAULT_GRID_SIZE;

  const gridVisible =
    grid.enabled !== false &&
    grid.visible !== false;

  const snapEnabled =
    grid.enabled !== false &&
    grid.snap !== false;

  const activeLayer = useMemo(() => {
    const selected = layers.find(
      (layer) => layer.id === activeLayerId
    );

    if (
      selected &&
      selected.visible !== false &&
      selected.locked !== true
    ) {
      return selected;
    }

    return layers.find(
      (layer) =>
        layer.visible !== false &&
        layer.locked !== true
    ) ?? layers[0];
  }, [
    activeLayerId,
    layers
  ]);

  useEffect(() => {
    if (!layers.some(
      (layer) => layer.id === activeLayerId
    )) {
      setActiveLayerId(
        layers[0]?.id ??
        DEFAULT_LAYER.id
      );
    }
  }, [
    activeLayerId,
    layers
  ]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const observer = new ResizeObserver(
      (entries) => {
        const entry = entries[0];

        setDimensions({
          width: Math.max(
            1,
            Math.floor(
              entry.contentRect.width
            )
          ),

          height: Math.max(
            1,
            Math.floor(
              entry.contentRect.height
            )
          )
        });
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const emitCanvas = useCallback(
    (nextCanvas) => {
      onCanvasChange?.(nextCanvas);
    },
    [onCanvasChange]
  );

  const updateNodes = useCallback(
    (nextNodes) => {
      emitCanvas({
        ...canvas,
        layers,
        nodes: nextNodes
      });
    },
    [
      canvas,
      emitCanvas,
      layers
    ]
  );

  const updateLayers = useCallback(
    (nextLayers) => {
      emitCanvas({
        ...canvas,
        layers: nextLayers,
        nodes
      });
    },
    [
      canvas,
      emitCanvas,
      nodes
    ]
  );

  const updateNode = useCallback(
    (nodeId, updates) => {
      updateNodes(
        nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                ...updates
              }
            : node
        )
      );
    },
    [
      nodes,
      updateNodes
    ]
  );

  const addNode = useCallback(
    (node) => {
      updateNodes([
        ...nodes,
        node
      ]);

      onNodeSelected?.(node.id);
    },
    [
      nodes,
      onNodeSelected,
      updateNodes
    ]
  );

  const removeSelectedNode = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    updateNodes(
      nodes.filter(
        (node) =>
          node.id !== selectedNodeId
      )
    );

    onNodeSelected?.(null);
  }, [
    nodes,
    onNodeSelected,
    selectedNodeId,
    updateNodes
  ]);

  function getInsertPosition() {
    const center = {
      x: dimensions.width / 2,
      y: dimensions.height / 2
    };

    return snapEnabled
      ? snapToGrid(
          center.x,
          center.y,
          gridSize
        )
      : center;
  }

  function createRectangle() {
    if (!activeLayer) {
      return;
    }

    const position = getInsertPosition();

    addNode({
      id: makeId("rect"),
      type: "rect",
      layerId: activeLayer.id,
      x: position.x,
      y: position.y,
      width: 140,
      height: 100,
      fill: "#0F766E"
    });

    setTool("select");
  }

  function createCircle() {
    if (!activeLayer) {
      return;
    }

    const position = getInsertPosition();

    addNode({
      id: makeId("circle"),
      type: "circle",
      layerId: activeLayer.id,
      x: position.x,
      y: position.y,
      radius: 50,
      fill: "#D97706"
    });

    setTool("select");
  }

  function createNote() {
    if (!activeLayer) {
      return;
    }

    const position = getInsertPosition();

    addNode({
      id: makeId("note"),
      type: "note",
      layerId: activeLayer.id,
      x: position.x,
      y: position.y,
      width: 220,
      height: 140,
      fill: "#FEF08A",
      text: "New Note"
    });

    setTool("select");
  }

  function createPolygon() {
    if (!activeLayer) {
      return;
    }

    const position = getInsertPosition();

    addNode({
      id: makeId("polygon"),
      type: "polygon",
      layerId: activeLayer.id,
      x: position.x,
      y: position.y,
      fill: "#7C3AED",
      stroke: "#4C1D95",
      strokeWidth: 2,
      points: [
        { x: -55, y: -45 },
        { x: 55, y: -30 },
        { x: 42, y: 55 },
        { x: -38, y: 45 }
      ]
    });

    setTool("select");
  }

  function createLayer() {
    const nextOrder = layers.reduce(
      (maxOrder, layer) =>
        Math.max(
          maxOrder,
          Number.isFinite(layer.order)
            ? layer.order
            : 0
        ),
      -1
    ) + 1;

    const newLayer = {
      id: makeId("layer"),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      order: nextOrder
    };

    updateLayers([
      ...layers,
      newLayer
    ]);

    setActiveLayerId(newLayer.id);
  }

  function updateLayer(layerId, updates) {
    updateLayers(
      layers.map((layer) =>
        layer.id === layerId
          ? {
              ...layer,
              ...updates
            }
          : layer
      )
    );
  }

  function handleDragEnd(node) {
    return (event) => {
      const layer = layers.find(
        (candidate) =>
          candidate.id === node.layerId
      );

      if (
        layer?.locked === true ||
        node.locked === true
      ) {
        return;
      }

      const rawPosition = {
        x: event.target.x(),
        y: event.target.y()
      };

      const position = snapEnabled
        ? snapToGrid(
            rawPosition.x,
            rawPosition.y,
            gridSize
          )
        : rawPosition;

      updateNode(
        node.id,
        position
      );
    };
  }

  function getPointerPosition() {
    const stage = stageRef.current;

    return stage?.getPointerPosition() ?? null;
  }

  function handleStagePointerDown(event) {
    const stage = event.target.getStage();

    if (event.target !== stage) {
      return;
    }

    onNodeSelected?.(null);

    if (tool !== "line") {
      return;
    }

    if (!activeLayer) {
      return;
    }

    const rawPosition = getPointerPosition();

    if (!rawPosition) {
      return;
    }

    const position = snapEnabled
      ? snapToGrid(
          rawPosition.x,
          rawPosition.y,
          gridSize
        )
      : rawPosition;

    if (!lineStart) {
      setLineStart(position);
      return;
    }

    addNode({
      id: makeId("line"),
      type: "line",
      layerId: activeLayer.id,
      x: lineStart.x,
      y: lineStart.y,
      x2: position.x,
      y2: position.y,
      stroke: "#2563EB",
      strokeWidth: 3
    });

    setLineStart(null);
    setTool("select");
  }

  function renderNode(node, layer) {
    if (
      node.visible === false ||
      layer.visible === false
    ) {
      return null;
    }

    const selected =
      node.id === selectedNodeId;

    const locked =
      layer.locked === true ||
      node.locked === true;

    const commonProps = {
      draggable: !locked,

      onClick: () => {
        onNodeSelected?.(node.id);
      },

      onTap: () => {
        onNodeSelected?.(node.id);
      },

      onDragEnd: handleDragEnd(node)
    };

    const selectionStroke = selected
      ? "#2563EB"
      : undefined;

    const selectionStrokeWidth = selected
      ? 3
      : 0;

    if (node.type === "circle") {
      return (
        <Circle
          key={node.id}
          x={node.x}
          y={node.y}
          radius={node.radius ?? 50}
          fill={node.fill ?? "#D97706"}
          stroke={selectionStroke}
          strokeWidth={selectionStrokeWidth}
          {...commonProps}
        />
      );
    }

    if (node.type === "note") {
      return (
        <Group
          key={node.id}
          x={node.x}
          y={node.y}
          {...commonProps}
        >
          <Rect
            width={node.width ?? 220}
            height={node.height ?? 140}
            fill={node.fill ?? "#FEF08A"}
            stroke={selectionStroke}
            strokeWidth={selectionStrokeWidth}
            cornerRadius={6}
            shadowColor="#0F172A"
            shadowBlur={5}
            shadowOpacity={0.12}
            shadowOffsetY={2}
          />

          <Text
            x={10}
            y={10}
            width={
              Math.max(
                0,
                (node.width ?? 220) - 20
              )
            }
            height={
              Math.max(
                0,
                (node.height ?? 140) - 20
              )
            }
            text={node.text ?? ""}
            fill="#1F2937"
            fontSize={16}
            wrap="word"
            listening={false}
          />
        </Group>
      );
    }

    if (node.type === "line") {
      return (
        <Line
          key={node.id}
          points={[
            node.x,
            node.y,
            node.x2 ?? node.x,
            node.y2 ?? node.y
          ]}
          stroke={node.stroke ?? "#2563EB"}
          strokeWidth={node.strokeWidth ?? 3}
          lineCap="round"
          hitStrokeWidth={18}
          onClick={() => {
            onNodeSelected?.(node.id);
          }}
          onTap={() => {
            onNodeSelected?.(node.id);
          }}
        />
      );
    }

    if (node.type === "polygon") {
      const points = Array.isArray(node.points)
        ? node.points.flatMap((point) => [
            point.x,
            point.y
          ])
        : [];

      return (
        <Group
          key={node.id}
          x={node.x}
          y={node.y}
          {...commonProps}
        >
          <Line
            points={points}
            closed
            fill={node.fill ?? "#7C3AED"}
            stroke={node.stroke ?? "#4C1D95"}
            strokeWidth={node.strokeWidth ?? 2}
            lineJoin="round"
          />
        </Group>
      );
    }

    return (
      <Rect
        key={node.id}
        x={node.x}
        y={node.y}
        width={node.width ?? 140}
        height={node.height ?? 100}
        fill={node.fill ?? "#0F766E"}
        stroke={selectionStroke}
        strokeWidth={selectionStrokeWidth}
        {...commonProps}
      />
    );
  }

  if (!canvas) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "220px minmax(0, 1fr)",
        background: "#F8FAFC"
      }}
    >
      <aside
        style={{
          overflowY: "auto",
          padding: 12,
          borderRight: "1px solid #CBD5E1",
          background: "#FFFFFF"
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 10
          }}
        >
          Canvas Tools
        </h3>

        <div
          style={{
            display: "grid",
            gap: 8
          }}
        >
          <button
            onClick={() => {
              setTool("select");
              setLineStart(null);
            }}
          >
            {tool === "select"
              ? "✓ Select"
              : "Select"}
          </button>

          <button onClick={createRectangle}>
            Rectangle
          </button>

          <button onClick={createCircle}>
            Circle
          </button>

          <button onClick={createNote}>
            Note
          </button>

          <button onClick={createPolygon}>
            Polygon
          </button>

          <button
            onClick={() => {
              setTool("line");
              setLineStart(null);
            }}
          >
            {tool === "line"
              ? "✓ Draw Line"
              : "Draw Line"}
          </button>

          <button
            disabled={!selectedNodeId}
            onClick={removeSelectedNode}
          >
            Delete Selected
          </button>
        </div>

        <hr
          style={{
            margin: "16px 0",
            border: 0,
            borderTop: "1px solid #E2E8F0"
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8
          }}
        >
          <h3
            style={{
              margin: 0
            }}
          >
            Layers
          </h3>

          <button onClick={createLayer}>
            + Layer
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gap: 6,
            marginTop: 10
          }}
        >
          {layers.map((layer) => {
            const active =
              layer.id === activeLayerId;

            return (
              <div
                key={layer.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "32px 32px minmax(0, 1fr)",

                  alignItems: "center",
                  gap: 4,

                  padding: 5,

                  borderRadius: 4,

                  background: active
                    ? "#DBEAFE"
                    : "transparent"
                }}
              >
                <button
                  title={
                    layer.visible
                      ? "Hide layer"
                      : "Show layer"
                  }
                  onClick={() => {
                    updateLayer(
                      layer.id,
                      {
                        visible: !layer.visible
                      }
                    );
                  }}
                >
                  {layer.visible
                    ? "◉"
                    : "○"}
                </button>

                <button
                  title={
                    layer.locked
                      ? "Unlock layer"
                      : "Lock layer"
                  }
                  onClick={() => {
                    updateLayer(
                      layer.id,
                      {
                        locked: !layer.locked
                      }
                    );
                  }}
                >
                  {layer.locked
                    ? "🔒"
                    : "🔓"}
                </button>

                <button
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "left"
                  }}
                  onClick={() => {
                    setActiveLayerId(layer.id);
                  }}
                >
                  {layer.name}
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      <main
        ref={containerRef}
        style={{
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          background: "#F8FAFC"
        }}
      >
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          onPointerDown={handleStagePointerDown}
          onTap={handleStagePointerDown}
        >
          <Layer
            listening={false}
            visible={gridVisible}
          >
            <TruncatedOctaGrid
              width={dimensions.width}
              height={dimensions.height}
              cellSize={gridSize}
              visible={gridVisible}
            />
          </Layer>

          {layers.map((layer) => {
            const layerNodes = nodes.filter(
              (node) =>
                (node.layerId ??
                  DEFAULT_LAYER.id) ===
                layer.id
            );

            return (
              <Layer
                key={layer.id}
                visible={layer.visible !== false}
                listening={layer.locked !== true}
              >
                {layerNodes.map((node) =>
                  renderNode(node, layer)
                )}
              </Layer>
            );
          })}

          <Layer listening={false}>
            {tool === "line" && lineStart && (
              <>
                <Circle
                  x={lineStart.x}
                  y={lineStart.y}
                  radius={5}
                  fill="#2563EB"
                />

                <Text
                  x={lineStart.x + 8}
                  y={lineStart.y - 25}
                  text="Choose line endpoint"
                  fill="#1E3A8A"
                  fontSize={13}
                />
              </>
            )}
          </Layer>
        </Stage>
      </main>
    </div>
  );
}

export default CanvasEditor;
