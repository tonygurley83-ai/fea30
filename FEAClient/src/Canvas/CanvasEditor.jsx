import { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Group,
  Text,
  Transformer
} from "react-konva";
import "./index.css";

const SNAP_RADIUS = 18;

const COLORS = {
  polygon: "#4da3ff",
  rectangle: "#d989ff",
  circle: "#7ee787",
  node: "#ffcf5a",
  line: "#ff8d6a"
};

const ICONS = {
  polygon: "⬠",
  rectangle: "▭",
  circle: "◯",
  node: "●",
  line: "╱"
};

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function projectPointToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return { x: a.x, y: a.y };
  }

  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  return {
    x: a.x + dx * t,
    y: a.y + dy * t
  };
}

function getObjectSnapTargets(objects) {
  const targets = [];

  for (const object of objects) {
    if (object.type === "node") {
      targets.push({ x: object.x, y: object.y, kind: "node" });
    }

    if (object.type === "circle") {
      targets.push({ x: object.x, y: object.y, kind: "center" });
    }

    if (object.type === "line") {
      targets.push(
        { x: object.x, y: object.y, kind: "endpoint" },
        { x: object.x2, y: object.y2, kind: "endpoint" }
      );
    }

    if (object.type === "rectangle") {
      const halfWidth = object.width / 2;
      const halfHeight = object.height / 2;

      targets.push(
        { x: object.x - halfWidth, y: object.y - halfHeight, kind: "vertex" },
        { x: object.x + halfWidth, y: object.y - halfHeight, kind: "vertex" },
        { x: object.x + halfWidth, y: object.y + halfHeight, kind: "vertex" },
        { x: object.x - halfWidth, y: object.y + halfHeight, kind: "vertex" }
      );
    }

    if (object.type === "polygon") {
      for (const point of object.points) {
        targets.push({
          x: object.x + point.x,
          y: object.y + point.y,
          kind: "vertex"
        });
      }
    }
  }

  return targets;
}

function getObjectSegments(objects) {
  const segments = [];

  for (const object of objects) {
    if (object.type === "line") {
      segments.push({
        a: { x: object.x, y: object.y },
        b: { x: object.x2, y: object.y2 }
      });
    }

    if (object.type === "rectangle") {
      const hw = object.width / 2;
      const hh = object.height / 2;

      const corners = [
        { x: object.x - hw, y: object.y - hh },
        { x: object.x + hw, y: object.y - hh },
        { x: object.x + hw, y: object.y + hh },
        { x: object.x - hw, y: object.y + hh }
      ];

      for (let i = 0; i < corners.length; i += 1) {
        segments.push({
          a: corners[i],
          b: corners[(i + 1) % corners.length]
        });
      }
    }

    if (object.type === "polygon") {
      for (let i = 0; i < object.points.length; i += 1) {
        const a = object.points[i];
        const b = object.points[(i + 1) % object.points.length];

        segments.push({
          a: { x: object.x + a.x, y: object.y + a.y },
          b: { x: object.x + b.x, y: object.y + b.y }
        });
      }
    }
  }

  return segments;
}

function snapPoint(point, objects, snapEnabled) {
  if (!snapEnabled) return point;

  let best = { ...point };
  let bestDistance = SNAP_RADIUS;

  for (const target of getObjectSnapTargets(objects)) {
    const d = distance(point, target);

    if (d < bestDistance) {
      best = { x: target.x, y: target.y };
      bestDistance = d;
    }
  }

  for (const segment of getObjectSegments(objects)) {
    const projected = projectPointToSegment(point, segment.a, segment.b);
    const d = distance(point, projected);

    if (d < bestDistance) {
      best = projected;
      bestDistance = d;
    }
  }

  return best;
}

function makePolygon(id, x, y) {
  return {
    id,
    type: "polygon",
    name: `Polygon ${id}`,
    x,
    y,
    color: COLORS.polygon,
    points: [
      { x: -55, y: -45 },
      { x: 55, y: -30 },
      { x: 42, y: 55 },
      { x: -38, y: 45 }
    ]
  };
}

function makeRectangle(id, x, y) {
  return {
    id,
    type: "rectangle",
    name: `Rectangle ${id}`,
    x,
    y,
    width: 120,
    height: 75,
    color: COLORS.rectangle
  };
}

function makeCircle(id, x, y) {
  return {
    id,
    type: "circle",
    name: `Circle ${id}`,
    x,
    y,
    radius: 45,
    color: COLORS.circle
  };
}

function makeNode(id, x, y) {
  return {
    id,
    type: "node",
    name: `Node ${id}`,
    x,
    y,
    radius: 7,
    color: COLORS.node
  };
}

function makeLine(id, start, end) {
  return {
    id,
    type: "line",
    name: `Line ${id}`,
    x: start.x,
    y: start.y,
    x2: end.x,
    y2: end.y,
    color: COLORS.line
  };
}

function PolygonShape({ object, selected, onSelect, onChange, shapeRef }) {
  const points = object.points.flatMap((point) => [point.x, point.y]);

  return (
    <Group
      ref={shapeRef}
      id={object.id}
      x={object.x}
      y={object.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => {
        onChange({
          ...object,
          x: event.target.x(),
          y: event.target.y()
        });
      }}
    >
      <Line
        points={points}
        closed
        fill={`${object.color}55`}
        stroke={object.color}
        strokeWidth={2}
        lineJoin="round"
      />

      {selected &&
        object.points.map((point, index) => (
          <Rect
            key={index}
            x={point.x - 3}
            y={point.y - 3}
            width={6}
            height={6}
            fill="#ffffff"
            listening={false}
          />
        ))}
    </Group>
  );
}

function RectangleShape({ object, onSelect, onChange, shapeRef }) {
  return (
    <Rect
      ref={shapeRef}
      id={object.id}
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      offsetX={object.width / 2}
      offsetY={object.height / 2}
      fill={`${object.color}45`}
      stroke={object.color}
      strokeWidth={2}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => {
        onChange({
          ...object,
          x: event.target.x(),
          y: event.target.y()
        });
      }}
    />
  );
}

function CircleShape({ object, onSelect, onChange, shapeRef }) {
  return (
    <Circle
      ref={shapeRef}
      id={object.id}
      x={object.x}
      y={object.y}
      radius={object.radius}
      fill={`${object.color}40`}
      stroke={object.color}
      strokeWidth={2}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => {
        onChange({
          ...object,
          x: event.target.x(),
          y: event.target.y()
        });
      }}
    />
  );
}

function NodeShape({ object, onSelect, onChange, shapeRef }) {
  return (
    <Circle
      ref={shapeRef}
      id={object.id}
      x={object.x}
      y={object.y}
      radius={object.radius}
      fill={object.color}
      stroke="#fff3c4"
      strokeWidth={1.5}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => {
        onChange({
          ...object,
          x: event.target.x(),
          y: event.target.y()
        });
      }}
    />
  );
}

function LineShape({ object, onSelect, onChange, shapeRef }) {
  const width = object.x2 - object.x;
  const height = object.y2 - object.y;

  return (
    <Group
      ref={shapeRef}
      id={object.id}
      x={object.x}
      y={object.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => {
        const nextX = event.target.x();
        const nextY = event.target.y();

        onChange({
          ...object,
          x: nextX,
          y: nextY,
          x2: nextX + width,
          y2: nextY + height
        });
      }}
    >
      <Line
        points={[0, 0, width, height]}
        stroke={object.color}
        strokeWidth={3}
        hitStrokeWidth={18}
        lineCap="round"
      />
      <Circle x={0} y={0} radius={4} fill={object.color} listening={false} />
      <Circle x={width} y={height} radius={4} fill={object.color} listening={false} />
    </Group>
  );
}

function SelectionTransformer({ selectedShapeRef, selectedObject }) {
  const transformerRef = useRef(null);

  useEffect(() => {
    if (!selectedShapeRef.current || !transformerRef.current) return;

    const transformable = ["polygon", "rectangle", "circle"];
    if (!transformable.includes(selectedObject?.type)) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }

    transformerRef.current.nodes([selectedShapeRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedObject, selectedShapeRef]);

  if (!selectedObject || !["polygon", "rectangle", "circle"].includes(selectedObject.type)) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={false}
      flipEnabled={false}
      keepRatio={selectedObject.type === "circle"}
      boundBoxFunc={(oldBox, newBox) => {
        if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
}

export default function App() {
  const stageRef = useRef(null);
  const selectedShapeRef = useRef(null);

  const [stageSize, setStageSize] = useState({
    width: Math.max(400, window.innerWidth - 280),
    height: Math.max(400, window.innerHeight - 60)
  });

  const [tool, setTool] = useState("select");
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [lineStart, setLineStart] = useState(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [nextId, setNextId] = useState(6);

  const [objects, setObjects] = useState([
    makePolygon(1, 230, 150),
    makeRectangle(2, 500, 265),
    makeCircle(3, 290, 410),
    makeNode(4, 150, 330),
    makeLine(5, { x: 115, y: 110 }, { x: 445, y: 415 })
  ]);

  const selectedObject = useMemo(
    () => objects.find((object) => object.id === selectedId) ?? null,
    [objects, selectedId]
  );

  useEffect(() => {
    const updateStageSize = () => {
      const workspace = document.getElementById("workspace");

      if (!workspace) return;

      setStageSize({
        width: workspace.clientWidth,
        height: workspace.clientHeight
      });
    };

    updateStageSize();
    window.addEventListener("resize", updateStageSize);

    return () => window.removeEventListener("resize", updateStageSize);
  }, []);

  useEffect(() => {
    const keyboardHandler = (event) => {
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
        return;
      }

      if (event.key === "v" || event.key === "V") {
        setTool("select");
        setLineStart(null);
      }

      if (event.key === "n" || event.key === "N") {
        setTool("node");
        setLineStart(null);
      }

      if (event.key === "l" || event.key === "L") {
        setTool("line");
        setLineStart(null);
      }

      if (event.key === "Escape") {
        setLineStart(null);
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        setObjects((current) => current.filter((object) => object.id !== selectedId));
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", keyboardHandler);
    return () => window.removeEventListener("keydown", keyboardHandler);
  }, [selectedId]);

  const status = useMemo(() => {
    if (tool === "node") {
      return "Click or tap the canvas to place a node. Nearby geometry snaps.";
    }

    if (tool === "line") {
      return lineStart
        ? "Choose the second snapped endpoint."
        : "Choose the first endpoint for a snapped line.";
    }

    return "Select a shape, use the hierarchy, or drag an object.";
  }, [tool, lineStart]);

  function getStagePoint() {
    const stage = stageRef.current;
    const position = stage?.getPointerPosition();

    return position ?? { x: 0, y: 0 };
  }

  function addObject(object) {
    setObjects((current) => [...current, object]);
    setSelectedId(object.id);
  }

  function updateObject(nextObject) {
    setObjects((current) =>
      current.map((object) =>
        object.id === nextObject.id ? nextObject : object
      )
    );
  }

  function allocateId() {
    const id = nextId;
    setNextId((current) => current + 1);
    return id;
  }

  function createShape(type) {
    const id = allocateId();
    const center = {
      x: stageSize.width / 2,
      y: stageSize.height / 2
    };

    const creators = {
      polygon: makePolygon,
      rectangle: makeRectangle,
      circle: makeCircle
    };

    addObject(creators[type](id, center.x, center.y));
    setTool("select");
    setLineStart(null);
  }

  function clearScene() {
    setObjects([]);
    setSelectedId(null);
    setLineStart(null);
  }

  function deleteSelected() {
    if (selectedId === null) return;

    setObjects((current) =>
      current.filter((object) => object.id !== selectedId)
    );
    setSelectedId(null);
    setLineStart(null);
  }

  function selectObject(object) {
    setSelectedId(object.id);
    setTool("select");
    setLineStart(null);
  }

  function handlePointerMove() {
    const raw = getStagePoint();
    setPointer(raw);
  }

  function handleStagePointerDown(event) {
    const stage = event.target.getStage();
    const clickedEmptyCanvas = event.target === stage;

    if (!clickedEmptyCanvas) return;

    const raw = getStagePoint();
    setPointer(raw);

    if (tool === "select") {
      setSelectedId(null);
      return;
    }

    const snapped = snapPoint(raw, objects, snapEnabled);

    if (tool === "node") {
      const id = allocateId();
      addObject(makeNode(id, snapped.x, snapped.y));
      return;
    }

    if (tool === "line") {
      if (!lineStart) {
        setLineStart(snapped);
        return;
      }

      if (distance(lineStart, snapped) > 2) {
        const id = allocateId();
        addObject(makeLine(id, lineStart, snapped));
      }

      setLineStart(null);
    }
  }

  const snapPreview = useMemo(
    () => snapPoint(pointer, objects, snapEnabled),
    [pointer, objects, snapEnabled]
  );

  function renderObject(object) {
    const common = {
      key: object.id,
      object,
      selected: object.id === selectedId,
      shapeRef: object.id === selectedId ? selectedShapeRef : null,
      onSelect: () => selectObject(object),
      onChange: updateObject
    };

    if (object.type === "polygon") {
      return <PolygonShape {...common} />;
    }

    if (object.type === "rectangle") {
      return <RectangleShape {...common} />;
    }

    if (object.type === "circle") {
      return <CircleShape {...common} />;
    }

    if (object.type === "node") {
      return <NodeShape {...common} />;
    }

    if (object.type === "line") {
      return <LineShape {...common} />;
    }

    return null;
  }

  return (
    <div className="editor-shell">
      <header className="toolbar">
        <button
          className={tool === "select" ? "active" : ""}
          onClick={() => {
            setTool("select");
            setLineStart(null);
          }}
        >
          Select / Drag
        </button>

        <button
          className={tool === "node" ? "active" : ""}
          onClick={() => {
            setTool("node");
            setLineStart(null);
          }}
        >
          Place Node
        </button>

        <button
          className={tool === "line" ? "active" : ""}
          onClick={() => {
            setTool("line");
            setLineStart(null);
          }}
        >
          Draw Line
        </button>

        <div className="separator" />

        <button onClick={() => createShape("polygon")}>+ Polygon</button>
        <button onClick={() => createShape("rectangle")}>+ Rectangle</button>
        <button onClick={() => createShape("circle")}>+ Circle</button>

        <div className="separator" />

        <button
          className={snapEnabled ? "active" : ""}
          onClick={() => setSnapEnabled((enabled) => !enabled)}
        >
          Snap: {snapEnabled ? "ON" : "OFF"}
        </button>

        <button className="danger" onClick={deleteSelected}>
          Delete Selected
        </button>

        <button onClick={clearScene}>Clear Scene</button>

        <span className="status">{status}</span>
      </header>

      <aside className="sidebar">
        <h2>Scene Hierarchy</h2>

        <div className="hierarchy">
          {objects.length === 0 && (
            <p className="hint">
              No shapes yet. Create a shape, place a node, or draw a line.
            </p>
          )}

          {objects.map((object) => (
            <button
              className={`tree-row ${
                object.id === selectedId ? "selected" : ""
              }`}
              key={object.id}
              onClick={() => selectObject(object)}
            >
              <span className="tree-icon">{ICONS[object.type]}</span>
              <span className="tree-name">{object.name}</span>
            </button>
          ))}
        </div>

        <h3>Selected Object</h3>

        <div className="property-grid">
          <div className="property">
            <label>Type</label>
            <output>{selectedObject?.type ?? "None"}</output>
          </div>

          <div className="property">
            <label>Name</label>
            <output>{selectedObject?.name ?? "—"}</output>
          </div>

          <div className="property">
            <label>X</label>
            <output>
              {selectedObject ? Math.round(selectedObject.x) : "—"}
            </output>
          </div>

          <div className="property">
            <label>Y</label>
            <output>
              {selectedObject ? Math.round(selectedObject.y) : "—"}
            </output>
          </div>
        </div>

        <h3>Keyboard</h3>
        <p className="hint">
          <kbd>V</kbd> Select / drag
          <br />
          <kbd>N</kbd> Place node
          <br />
          <kbd>L</kbd> Draw line
          <br />
          <kbd>Delete</kbd> Remove selection
          <br />
          <kbd>Esc</kbd> Cancel a line
        </p>
      </aside>

      <main id="workspace" className="workspace">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handlePointerMove}
          onTap={handleStagePointerDown}
        >
          <Layer>
            {objects.map(renderObject)}

            {tool === "line" && lineStart && (
              <>
                <Line
                  points={[lineStart.x, lineStart.y, snapPreview.x, snapPreview.y]}
                  stroke="#ffce8b"
                  strokeWidth={2}
                  dash={[7, 5]}
                  listening={false}
                />
                <Circle
                  x={lineStart.x}
                  y={lineStart.y}
                  radius={5}
                  fill="#fff0c8"
                  listening={false}
                />
              </>
            )}

            {(tool === "node" || tool === "line") &&
              snapEnabled &&
              distance(pointer, snapPreview) > 0.5 && (
                <>
                  <Line
                    points={[pointer.x, pointer.y, snapPreview.x, snapPreview.y]}
                    stroke="#ffe28a"
                    strokeWidth={1}
                    dash={[3, 3]}
                    listening={false}
                  />
                  <Circle
                    x={snapPreview.x}
                    y={snapPreview.y}
                    radius={8}
                    stroke="#ffe28a"
                    strokeWidth={2}
                    listening={false}
                  />
                </>
              )}

            <SelectionTransformer
              selectedShapeRef={selectedShapeRef}
              selectedObject={selectedObject}
            />
          </Layer>
        </Stage>

        <div className="legend">
          Nodes and line endpoints snap to vertices, nodes, endpoints, and line
          segments.
        </div>
      </main>
    </div>
  );
}
