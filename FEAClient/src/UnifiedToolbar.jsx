// UnifiedToolbar.jsx
import React from "react";
import "./UnifiedToolbar.css";

/* --- Inline SVG icons (no icon library needed) --- */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  select:    <Icon d={["M4 3l7.5 17 2.4-7.6L21.5 9.9 4 3z"]} />,
  node:      <Icon d={["M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />,
  pencil:    <Icon d={["M17 3l4 4L8 20l-5 1 1-5L17 3z"]} />,
  line:      <Icon d={["M5 19L19 5", "M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"]} />,
  connector: <Icon d={["M7 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0", "M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0", "M9.3 8.6l5.4 6.8"]} />,
  octagon:   <Icon d={["M12 3l6.5 2.7L21 12l-2.5 6.3L12 21l-6.5-2.7L3 12l2.5-6.3L12 3z"]} />,
  rect:      <Icon d={["M4 4h16v12H4z", "M4 20h16"]} />,
  square:    <Icon d={["M5 5h14v14H5z"]} />,
  circle:    <Icon d={["M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0"]} />,
  ellipse:   <Icon d={["M12 12m-9 0a9 4.5 0 1 0 18 0a9 4.5 0 1 0-18 0"]} />,
  grid:      <Icon d={["M3 3h18v18H3z", "M3 9h18", "M3 15h18", "M9 3v18", "M15 3v18"]} />,
  snap:      <Icon d={["M12 3v3", "M12 18v3", "M3 12h3", "M18 12h3", "M12 8m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0", "M12 12v6"]} />,
  undo:      <Icon d={["M9 14L4 9l5-5", "M4 9h10a6 6 0 0 1 0 12h-3"]} />,
  redo:      <Icon d={["M15 14l5-5-5-5", "M20 9H10a6 6 0 0 0 0 12h3"]} />,
  copy:      <Icon d={["M9 9h11v11H9z", "M5 15H4V4h11v1"]} />,
  paste:     <Icon d={["M9 4h6v3H9z", "M15 5h3v16H6V5h3", "M9 12h6", "M9 16h6"]} />,
  save:      <Icon d={["M5 3h11l5 5v13H5z", "M8 3v5h7V3", "M8 14h8v7H8z"]} />,
  share:     <Icon d={["M18 8a3 3 0 1 0-2.8-4", "M6 15a3 3 0 1 0 2.8 4", "M8.5 8.5h7v7h-7z", "M15.5 8.5L18 6M8.5 15.5L6 18"]} />,
};

// Tool ids MUST match CanvasTooler's `tool` prop values
const tools = [
  { id: "select",    label: "Select (V)" },
  { id: "node",      label: "Point (N)" },
  { id: "pencil",    label: "Pencil (P)" },
  { id: "line",      label: "Line (L)" },
  { id: "connector", label: "Connector (C)" },
  { id: "octagon",   label: "Seepage Cell (O)" },
  { id: "rect",      label: "Rectangle (R)" },
  { id: "square",    label: "Square (Q)" },
  { id: "circle",    label: "Circle (I)" },
  { id: "ellipse",   label: "Ellipse (E)" },
];

function ToolbarButton({ icon, label, onClick, active, disabled }) {
  return (
    <button
      type="button"
      className={`utb-btn${active ? " utb-btn--active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="utb-divider" />;
}

export default function UnifiedToolbar({
  canvas,
  tool,
  setTool,
  gridVisible,
  snapEnabled,
  onToggleGrid,
  onToggleSnap,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onSave,
  onShare,
  isSaving,
  isDirty,
}) {
  return (
    <div className="utb" role="toolbar" aria-label="Canvas editor toolbar">
      <span className="utb-title" title={canvas?.name}>
        {canvas?.name ?? "Untitled Canvas"}
        {isSaving ? " — saving…" : isDirty ? " — unsaved changes" : ""}
      </span>

      <Divider />

      {tools.map(({ id, label }) => (
        <ToolbarButton
          key={id}
          icon={icons[id]}
          label={label}
          active={tool === id}
          onClick={() => setTool(id)}
        />
      ))}

      <Divider />

      <ToolbarButton icon={icons.grid} label="Toggle Grid (G)"
        active={gridVisible} onClick={onToggleGrid} />
      <ToolbarButton icon={icons.snap} label="Toggle Snap (S)"
        active={snapEnabled} onClick={onToggleSnap} />

      <Divider />

      <ToolbarButton icon={icons.undo} label="Undo (Ctrl+Z)" onClick={onUndo} />
      <ToolbarButton icon={icons.redo} label="Redo (Ctrl+Shift+Z)" onClick={onRedo} />
      <ToolbarButton icon={icons.copy} label="Copy (Ctrl+C)" onClick={onCopy} />
      <ToolbarButton icon={icons.paste} label="Paste (Ctrl+V)" onClick={onPaste} />

      <Divider />

      <ToolbarButton icon={icons.save} label="Save" onClick={onSave}
        disabled={isSaving || !isDirty} />
      {onShare && <ToolbarButton icon={icons.share} label="Share Project" onClick={onShare} />}
    </div>
  );
}
