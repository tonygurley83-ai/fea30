// src/CanvasTooler.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Ellipse,
  Text,
  Group,
  Line,
  RegularPolygon
} from "react-konva";
import TruncatedOctaGrid from "./grid/TruncatedOctaGrid";

/* ---------- helpers ---------- */

let idCounter = 0;
const nextId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

// Logical anchor point of a node (used for connector endpoints)
function getNodeCenter(node) {
  if (node.type === "circle" || node.type === "ellipse" || node.type === "point") {
    return { x: node.x ?? 0, y: node.y ?? 0 };
  }
  if (node.type === "octagon") {
    return { x: node.cx ?? 0, y: node.cy ?? 0 };
  }
  if (node.type === "pencil" || node.type === "line") {
    const p = node.points ?? [];
    if (p.length < 2) return { x: 0, y: 0 };
    let sx = 0, sy = 0;
    for (let i = 0; i < p.length; i += 2) { sx += p[i]; sy += p[i + 1]; }
    return { x: sx / (p.length / 2), y: sy / (p.length / 2) };
  }
  return {
    x: (node.x ?? 0) + (node.width ?? 0) / 2,
    y: (node.y ?? 0) + (node.height ?? 0) / 2,
  };
}

/* ---------- component ---------- */

function CanvasTooler({
  canvas,
  onCanvasChange,
  selectedNodeId,
  onNodeSelected,
  // "select" | "node" | "pencil" | "line" | "connector" |
  // "octagon" | "rect" | "square" | "circle" | "ellipse"
  tool = "select",
  gridVisible: gridVisibleProp,
  snapEnabled: snapEnabledProp,
}) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const draftLineRef = useRef(null);
  const draftOctagonRef = useRef(null);
  const draftRectRef = useRef(null);
  const draftEllipseRef = useRef(null);
  const drawingRef = useRef(null); // mutated imperatively during drawing

  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [connectorFrom, setConnectorFrom] = useState(null);

  /* container resize */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const update = () => {
      const { width, height } = container.getBoundingClientRect();
      setDimensions({
        width: Math.max(1, Math.floor(width)),
        height: Math.max(1, Math.floor(height)),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  /* derived state */
  const nodes = canvas?.nodes ?? [];
  const layers = Array.isArray(canvas?.layers) ? canvas.layers : [];
  const grid = canvas?.grid ?? {};

  const gridSize =
    Number.isFinite(grid.size) && grid.size > 0 ? grid.size : 40;
  const gridVisible =
    gridVisibleProp ?? (grid.enabled !== false && grid.visible !== false);
  const snapEnabled =
    snapEnabledProp ?? (grid.enabled !== false && grid.snap !== false);

  const nodeById = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  if (!canvas) return null;

  /* ---------- grid / layers ---------- */

  function snapToGrid(x, y, cellSize = gridSize) {
    const row = Math.round(y / cellSize);
    const offset = row % 2 === 0 ? 0 : cellSize / 2;
    return {
      x: Math.round((x - offset) / cellSize) * cellSize + offset,
      y: row * cellSize,
    };
  }

  const getLayer = (node) =>
    node?.layerId ? layers.find((l) => l.id === node.layerId) ?? null : null;
  const isNodeVisible = (node) => getLayer(node)?.visible !== false;
  const isNodeLocked = (node) => getLayer(node)?.locked === true;
  const getDefaultLayerId = () =>
    layers.find((l) => l.visible !== false && l.locked !== true)?.id ?? null;

  /* ---------- mutations ---------- */

  function addNode(node) {
    onCanvasChange?.({
      ...canvas,
      nodes: [...nodes, { ...node, layerId: node.layerId ?? getDefaultLayerId() }],
    });
  }

  function updateNode(id, updates) {
    onCanvasChange?.({
      ...canvas,
      nodes: nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    });
  }

  /* ---------- pointer helpers ---------- */

  function getPointerPosition() {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return null;
    return snapEnabled ? snapToGrid(pos.x, pos.y) : pos;
  }

  /* ---------- drawing tools ---------- */

  function handleMouseDown(e) {
    // Only start drawing on empty-stage clicks
    const isDrawingTool =
      tool === "node" || tool === "pencil" || tool === "line" ||
      tool === "octagon" || tool === "rect" || tool === "square" ||
      tool === "circle" || tool === "ellipse";
    if (!isDrawingTool) return;
    if (e.target !== e.target.getStage()) return;

    const pos = getPointerPosition();
    if (!pos) return;

    // "node" tool: click to drop a point
    if (tool === "node") {
      addNode({
        id: nextId("pt"),
        type: "point",
        x: pos.x,
        y: pos.y,
        radius: 6,
        fill: "#2563EB",
      });
      return;
    }

    // rect / square: drag from corner
    if (tool === "rect" || tool === "square") {
      drawingRef.current = { type: tool, x0: pos.x, y0: pos.y, w: gridSize, h: gridSize };
      const draft = draftRectRef.current;
      if (draft) {
        draft.x(pos.x);
        draft.y(pos.y);
        draft.width(gridSize);
        draft.height(gridSize);
        draft.visible(true);
        draft.getLayer()?.batchDraw();
      }
      return;
    }

    // circle / ellipse: drag from center
    if (tool === "circle" || tool === "ellipse") {
      drawingRef.current = { type: tool, cx: pos.x, cy: pos.y, rx: gridSize, ry: gridSize };
      const draft = draftEllipseRef.current;
      if (draft) {
        draft.x(pos.x);
        draft.y(pos.y);
        draft.radiusX(gridSize);
        draft.radiusY(gridSize);
        draft.visible(true);
        draft.getLayer()?.batchDraw();
      }
      return;
    }

    // octagon: FEA seepage cell — center on grid vertex, radius in whole cells
    if (tool === "octagon") {
      drawingRef.current = { type: "octagon", cx: pos.x, cy: pos.y, r: gridSize };
      const draft = draftOctagonRef.current;
      if (draft) {
        draft.x(pos.x);
        draft.y(pos.y);
        draft.radius(gridSize);
        draft.visible(true);
        draft.getLayer()?.batchDraw();
      }
      return;
    }

    // pencil / line
    drawingRef.current = { type: tool, points: [pos.x, pos.y] };
    const draft = draftLineRef.current;
    if (draft) {
      draft.points([pos.x, pos.y, pos.x, pos.y]);
      draft.stroke(tool === "pencil" ? "#1F2937" : "#7C3AED");
      draft.strokeWidth(tool === "pencil" ? 2 : 3);
      draft.tension(tool === "pencil" ? 0.5 : 0);
      draft.visible(true);
      draft.getLayer()?.batchDraw();
    }
  }

  function handleMouseMove() {
    const drawing = drawingRef.current;
    if (!drawing) return;

    const pos = getPointerPosition();
    if (!pos) return;

    if (drawing.type === "rect" || drawing.type === "square") {
      const w = Math.max(gridSize, Math.round((pos.x - drawing.x0) / gridSize) * gridSize);
      const h = Math.max(gridSize, Math.round((pos.y - drawing.y0) / gridSize) * gridSize);
      if (drawing.type === "square") {
        const side = Math.max(w, h);
        drawing.w = side;
        drawing.h = side;
      } else {
        drawing.w = w;
        drawing.h = h;
      }
      const draft = draftRectRef.current;
      if (draft) {
        draft.width(drawing.w);
        draft.height(drawing.h);
        draft.getLayer()?.batchDraw();
      }
      return;
    }

    if (drawing.type === "circle" || drawing.type === "ellipse") {
      const rx = Math.max(gridSize, Math.round(Math.abs(pos.x - drawing.cx) / gridSize) * gridSize);
      const ry = Math.max(gridSize, Math.round(Math.abs(pos.y - drawing.cy) / gridSize) * gridSize);
      if (drawing.type === "circle") {
        const r = Math.max(rx, ry);
        drawing.rx = r;
        drawing.ry = r;
      } else {
        drawing.rx = rx;
        drawing.ry = ry;
      }
      const draft = draftEllipseRef.current;
      if (draft) {
        draft.radiusX(drawing.rx);
        draft.radiusY(drawing.ry);
        draft.getLayer()?.batchDraw();
      }
      return;
    }

    if (drawing.type === "octagon") {
      const raw = Math.hypot(pos.x - drawing.cx, pos.y - drawing.cy);
      const r = Math.max(gridSize, Math.round(raw / gridSize) * gridSize);
      drawing.r = r;
      const draft = draftOctagonRef.current;
      if (draft) {
        draft.radius(r);
        draft.getLayer()?.batchDraw();
      }
      return;
    }

    if (drawing.type === "line") {
      drawing.points = [drawing.points[0], drawing.points[1], pos.x, pos.y];
    } else {
      drawing.points.push(pos.x, pos.y);
    }

    const draft = draftLineRef.current;
    if (draft) {
      draft.points(drawing.points);
      draft.getLayer()?.batchDraw();
    }
  }

  function handleMouseUp() {
    const drawing = drawingRef.current;
    if (!drawing) return;
    drawingRef.current = null;

    if (drawing.type === "rect" || drawing.type === "square") {
      draftRectRef.current?.visible(false);
      addNode({
        id: nextId(drawing.type),
        type: "rect", // squares are rects with w === h
        x: drawing.x0,
        y: drawing.y0,
        width: drawing.w,
        height: drawing.h,
        fill: drawing.type === "square" ? "#0E7490" : "#0F766E",
      });
      return;
    }

    if (drawing.type === "circle" || drawing.type === "ellipse") {
      draftEllipseRef.current?.visible(false);
      if (drawing.type === "circle") {
        addNode({
          id: nextId("circ"),
          type: "circle",
          x: drawing.cx,
          y: drawing.cy,
          radius: drawing.rx,
          fill: "#D97706",
        });
      } else {
        addNode({
          id: nextId("ell"),
          type: "ellipse",
          x: drawing.cx,
          y: drawing.cy,
          radiusX: drawing.rx,
          radiusY: drawing.ry,
          fill: "#C2410C",
        });
      }
      return;
    }

    if (drawing.type === "octagon") {
      draftOctagonRef.current?.visible(false);
      addNode({
        id: nextId("oct"),
        type: "octagon",
        cx: drawing.cx,
        cy: drawing.cy,
        r: drawing.r,
        fill: "#DBEAFE",
        stroke: "#1D4ED8",
        strokeWidth: 2,
        domain: "seepage",
      });
      return;
    }

    draftLineRef.current?.visible(false);
    const minPoints = drawing.type === "line" ? 4 : 6;
    if (drawing.points.length < minPoints) return; // ignore accidental clicks

    addNode({
      id: nextId(drawing.type),
      type: drawing.type,
      points: [...drawing.points],
      x: 0,
      y: 0, // points are absolute; x/y carries drag offset only
      stroke: drawing.type === "pencil" ? "#1F2937" : "#7C3AED",
      strokeWidth: drawing.type === "pencil" ? 2 : 3,
    });
  }

  /* ---------- connector tool (click node A, click node B) ---------- */

  function handleNodeClicked(nodeId) {
    if (tool !== "connector") {
      onNodeSelected?.(nodeId);
      return;
    }
    if (!connectorFrom) {
      setConnectorFrom(nodeId);
      onNodeSelected?.(nodeId);
      return;
    }
    if (connectorFrom === nodeId) {
      setConnectorFrom(null);
      return;
    }
    addNode({
      id: nextId("conn"),
      type: "connector",
      from: connectorFrom,
      to: nodeId,
      stroke: "#059669",
      strokeWidth: 2,
    });
    setConnectorFrom(null);
    onNodeSelected?.(null);
  }

  function handleStageClick(e) {
    if (e.target !== e.target.getStage()) return;
    if (tool === "connector") setConnectorFrom(null);
    if (tool === "select") onNodeSelected?.(null);
  }

  function handleDragEnd(nodeId) {
    return (e) => {
      const node = nodeById.get(nodeId);
      const position = { x: e.target.x(), y: e.target.y() };
      const snapped = snapEnabled ? snapToGrid(position.x, position.y) : position;
      // RegularPolygon x/y IS the center — remap to cx/cy for octagons
      updateNode(
        nodeId,
        node?.type === "octagon" ? { cx: snapped.x, cy: snapped.y } : snapped
      );
    };
  }

  /* ---------- selection styling ---------- */

  function getSelectionProps(node) {
    if (node.id === connectorFrom) {
      return { stroke: "#F59E0B", strokeWidth: 3 };
    }
    const selected = node.id === selectedNodeId;
    return {
      stroke: selected ? "#2563EB" : undefined,
      strokeWidth: selected ? 3 : 0,
    };
  }

  function getNodeEventProps(node) {
    return {
      draggable: tool === "select" && !isNodeLocked(node),
      onClick: () => handleNodeClicked(node.id),
      onTap: () => handleNodeClicked(node.id),
      onDragEnd: handleDragEnd(node.id),
    };
  }

  /* ---------- node renderers ---------- */

  function renderNode(node) {
    if (!isNodeVisible(node)) return null;

    const eventProps = getNodeEventProps(node);
    const selectionProps = getSelectionProps(node);

    if (node.type === "connector") {
      const a = nodeById.get(node.from);
      const b = nodeById.get(node.to);
      if (!a || !b) return null;
      const pa = getNodeCenter(a);
      const pb = getNodeCenter(b);
      const selected = node.id === selectedNodeId;
      return (
        <Line
          key={node.id}
          points={[pa.x, pa.y, pb.x, pb.y]}
          stroke={selected ? "#2563EB" : node.stroke ?? "#059669"}
          strokeWidth={node.strokeWidth ?? 2}
          hitStrokeWidth={12}
          onClick={() => onNodeSelected?.(node.id)}
          onTap={() => onNodeSelected?.(node.id)}
        />
      );
    }

    if (node.type === "pencil" || node.type === "line") {
      return (
        <Line
          key={node.id}
          x={node.x ?? 0}
          y={node.y ?? 0}
          points={node.points ?? []}
          stroke={node.stroke ?? "#1F2937"}
          strokeWidth={node.strokeWidth ?? 2}
          {...(node.type === "pencil" && {
            tension: 0.5,
            lineCap: "round",
            lineJoin: "round",
          })}
          hitStrokeWidth={12}
          {...selectionProps}
          {...eventProps}
        />
      );
    }

    if (node.type === "octagon") {
      return (
        <RegularPolygon
          key={node.id}
          x={node.cx ?? 0}
          y={node.cy ?? 0}
          sides={8}
          radius={node.r ?? gridSize}
          rotation={22.5}
          fill={node.fill ?? "#DBEAFE"}
          stroke={node.stroke ?? "#1D4ED8"}
          strokeWidth={node.strokeWidth ?? 2}
          {...selectionProps}
          {...eventProps}
        />
      );
    }

    if (node.type === "ellipse") {
      return (
        <Ellipse
          key={node.id}
          x={node.x ?? 0}
          y={node.y ?? 0}
          radiusX={node.radiusX ?? gridSize}
          radiusY={node.radiusY ?? gridSize}
          fill={node.fill ?? "#C2410C"}
          {...selectionProps}
          {...eventProps}
        />
      );
    }

    if (node.type === "point") {
      return (
        <Circle
          key={node.id}
          x={node.x ?? 0}
          y={node.y ?? 0}
          radius={node.radius ?? 6}
          fill={node.fill ?? "#2563EB"}
          {...selectionProps}
          {...eventProps}
        />
      );
    }

    if (node.type === "circle") {
      return (
        <Circle
          key={node.id}
          x={node.x ?? 0}
          y={node.y ?? 0}
          radius={node.radius ?? 50}
          fill={node.fill ?? "#D97706"}
          {...selectionProps}
          {...eventProps}
        />
      );
    }

    if (node.type === "note") {
      const w = node.width ?? 220;
      const h = node.height ?? 140;
      return (
        <Group key={node.id} x={node.x ?? 0} y={node.y ?? 0} {...eventProps}>
          <Rect
            width={w}
            height={h}
            fill={node.fill ?? "#FEF08A"}
            cornerRadius={4}
            shadowColor="#000"
            shadowBlur={6}
            shadowOpacity={0.15}
            {...selectionProps}
          />
          <Text
            x={10}
            y={10}
            width={Math.max(0, w - 20)}
            height={Math.max(0, h - 20)}
            text={node.text ?? ""}
            fontSize={16}
            fill="#1F2937"
            wrap="word"
            listening={false}
          />
        </Group>
      );
    }

    // default: rectangle (also squares)
    return (
      <Rect
        key={node.id}
        x={node.x ?? 0}
        y={node.y ?? 0}
        width={node.width ?? 140}
        height={node.height ?? 100}
        fill={node.fill ?? "#0F766E"}
        cornerRadius={4}
        {...selectionProps}
        {...eventProps}
      />
    );
  }

  /* ---------- render ---------- */

  const shapeNodes = nodes.filter((n) => n.type !== "connector");
  const connectorNodes = nodes.filter((n) => n.type === "connector");

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        background: "#F8FAFC",
      }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer listening={false}>
          <TruncatedOctaGrid
            width={dimensions.width}
            height={dimensions.height}
            cellSize={gridSize}
            visible={gridVisible}
          />
        </Layer>

        <Layer>
          {shapeNodes.map(renderNode)}
          {connectorNodes.map(renderNode)}

          {/* draft line — pencil / line preview */}
          <Line
            ref={draftLineRef}
            points={[0, 0]}
            stroke="#1F2937"
            strokeWidth={2}
            dash={[6, 4]}
            lineCap="round"
            lineJoin="round"
            visible={false}
            listening={false}
          />

          {/* draft octagon — FEA seepage cell preview */}
          <RegularPolygon
            ref={draftOctagonRef}
            sides={8}
            rotation={22.5}
            radius={gridSize}
            fill="rgba(219, 234, 254, 0.4)"
            stroke="#1D4ED8"
            strokeWidth={1.5}
            dash={[4, 3]}
            visible={false}
            listening={false}
          />

          {/* draft rect — rectangle / square preview */}
          <Rect
            ref={draftRectRef}
            width={gridSize}
            height={gridSize}
            fill="rgba(15, 118, 110, 0.15)"
            stroke="#0F766E"
            strokeWidth={1.5}
            dash={[4, 3]}
            visible={false}
            listening={false}
          />

          {/* draft ellipse — circle / ellipse preview */}
          <Ellipse
            ref={draftEllipseRef}
            radiusX={gridSize}
            radiusY={gridSize}
            fill="rgba(217, 119, 6, 0.15)"
            stroke="#D97706"
            strokeWidth={1.5}
            dash={[4, 3]}
            visible={false}
            listening={false}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasTooler;

