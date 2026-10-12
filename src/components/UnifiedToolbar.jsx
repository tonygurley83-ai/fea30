function UnifiedToolbar({ onCommand }) {
  return (
    <div>
      <button onClick={() => onCommand("save")}>
        Save
      </button>

      <button onClick={() => onCommand("undo")}>
        Undo
      </button>

      <button onClick={() => onCommand("redo")}>
        Redo
      </button>

      <button onClick={() => onCommand("copy")}>
        Copy
      </button>

      <button onClick={() => onCommand("paste")}>
        Paste
      </button>

      <button onClick={() => onCommand("node")}>
        Node
      </button>

      <button onClick={() => onCommand("note")}>
        Note
      </button>

      <button onClick={() => onCommand("square")}>
        Square
      </button>

      <button onClick={() => onCommand("oval")}>
        Oval
      </button>

      <button onClick={() => onCommand("polygon")}>
        Polygon
      </button>

      <button onClick={() => onCommand("line")}>
        Line
      </button>

      <button onClick={() => onCommand("snap")}>
        Snap
      </button>

      <button onClick={() => onCommand("generate")}>
        Generate
      </button>

      <button onClick={() => onCommand("continuance")}>
        Continuance
      </button>
    </div>
  );
}
