import React, { useEffect, useState } from "react";
import CanvasManager from "./CanvasManager";

const TOOLS = [
  { id: "select", label: "Select (V)" },
  { id: "node", label: "Point (N)" },
  { id: "pencil", label: "Pencil (P)" },
  { id: "line", label: "Line (L)" },
  { id: "connector", label: "Connector (C)" },
];

const KEY_MAP = {
  v: "select", n: "node", p: "pencil", l: "line", c: "connector",
};

export default function CanvasEditor() {
  const [canvas, setCanvas] = useState({
    name: "Untitled Canvas",
    nodes: [],
    layers: [{ id: "default", visible: true, locked: false }],
    grid: { size: 40, enabled: true, visible: true, snap: true },
  });
  const [tool, setTool] = useState("select");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);

  const handleCanvasChange = (updated) => setCanvas(updated);

  /* keyboard shortcuts */
  useEffect(() => {
    function onKeyDown(e) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        e.preventDefault();
        setCanvas((prev) => ({
          ...prev,
          nodes: prev.nodes.filter(
            (n) =>
              n.id !== selectedNodeId &&
              !(n.type === "connector" && (n.from === selectedNodeId || n.to === selectedNodeId))
          ),
        }));
        setSelectedNodeId(null);
        return;
      }

      if (e.key === "Escape") {
        setTool("select");
        setSelectedNodeId(null);
        return;
      }

      const mapped = KEY_MAP[e.key.toLowerCase()];
      if (mapped && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setTool(mapped);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedNodeId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%" }}>
      {/* toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 10px",
          background: "#1E1F24",
          borderBottom: "1px solid #33353C",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "#C9CCD3", fontSize: 13, fontWeight: 600, padding: "0 8px" }}>
          {canvas.name}
        </span>

        <div style={{ width: 1, height: 20, background: "#3A3D45", margin: "0 6px" }} />

        {TOOLS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            title={label}
            style={{
              padding: "6px 12px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              background: tool === id ? "#3565D0" : "transparent",
              color: tool === id ? "#FFF" : "#A8ABB5",
            }}
          >
            {id}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: "#3A3D45", margin: "0 6px" }} />

        <button
          type="button"
          onClick={() => setGridVisible((v) => !v)}
          style={{
            padding: "6px 12px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
            background: gridVisible ? "#3565D0" : "transparent",
            color: gridVisible ? "#FFF" : "#A8ABB5",
          }}
        >
          grid
        </button>
        <button
          type="button"
          onClick={() => setSnapEnabled((v) => !v)}
          style={{
            padding: "6px 12px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
            background: snapEnabled ? "#3565D0" : "transparent",
            color: snapEnabled ? "#FFF" : "#A8ABB5",
          }}
        >
          snap
        </button>
      </div>

      {/* canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <CanvasManager
          canvas={canvas}
          onCanvasChange={handleCanvasChange}
          selectedNodeId={selectedNodeId}
          onNodeSelected={setSelectedNodeId}
          tool={tool}
          gridVisible={gridVisible}
          snapEnabled={snapEnabled}
        />
      </div>
    </div>
  );
}
