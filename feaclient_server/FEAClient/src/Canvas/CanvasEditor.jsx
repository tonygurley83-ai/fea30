import React, { useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import apiClient from "../apiClient";

function CanvasEditor({ canvasId, userId }) {
  const [canvasData, setCanvasData] = useState({ shapes: [] });
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 260,
    height: window.innerHeight - 60
  });

  // Dynamically update Stage dimensions on window resize
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth - 260,
        height: window.innerHeight - 60
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Safe async canvas fetcher wrapped in useCallback
  const loadCanvas = useCallback(async (id, signal) => {
    try {
      setLoading(true);
      const data = await apiClient(`/auth/canvases/${id}`);
      
      if (signal.aborted) return;

      if (data?.canvas_data) {
        const parsed = typeof data.canvas_data === "string" 
          ? JSON.parse(data.canvas_data) 
          : data.canvas_data;
        setCanvasData(parsed.shapes ? parsed : { shapes: [] });
      } else {
        setCanvasData({ shapes: [] });
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error("[CanvasEditor] Failed to load canvas data", err);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!canvasId) return;

    const controller = new AbortController();
    loadCanvas(canvasId, controller.signal);

    return () => {
      controller.abort();
    };
  }, [canvasId, loadCanvas]);

  async function saveCanvas(updatedData) {
    try {
      await apiClient(`/auth/canvases/${canvasId}`, {
        method: "PUT",
        body: JSON.stringify({
          canvas_data: updatedData
        })
      });
    } catch (err) {
      console.error("[CanvasEditor] Failed to save canvas data", err);
    }
  }

  // --- Shape Handlers ---

  const addRectangle = () => {
    const newRect = {
      id: `rect_${Date.now()}`,
      type: "rect",
      x: 100 + Math.random() * 40,
      y: 100 + Math.random() * 40,
      width: 100,
      height: 100,
      fill: "#3B82F6" // Default blue
    };

    const nextData = {
      ...canvasData,
      shapes: [...(canvasData.shapes || []), newRect]
    };
    setCanvasData(nextData);
    saveCanvas(nextData);
  };

  const addCircle = () => {
    const newCircle = {
      id: `circle_${Date.now()}`,
      type: "circle",
      x: 150 + Math.random() * 40,
      y: 150 + Math.random() * 40,
      radius: 50,
      fill: "#10B981" // Default green
    };

    const nextData = {
      ...canvasData,
      shapes: [...(canvasData.shapes || []), newCircle]
    };
    setCanvasData(nextData);
    saveCanvas(nextData);
  };

  const handleDragEnd = (index, e) => {
    const updatedShapes = [...(canvasData.shapes || [])];
    updatedShapes[index] = {
      ...updatedShapes[index],
      x: e.target.x(),
      y: e.target.y()
    };
    
    const nextData = { ...canvasData, shapes: updatedShapes };
    setCanvasData(nextData);
    saveCanvas(nextData);
  };

  if (!canvasId) {
    return <div style={{ padding: 20 }}>Select or create a canvas to start drawing.</div>;
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading Canvas Stage...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Canvas Toolbar */}
      <div style={toolbarStyle}>
        <button style={btnStyle} onClick={addRectangle}>
          🟦 Add Rect
        </button>
        <button style={btnStyle} onClick={addCircle}>
          🟢 Add Circle
        </button>
      </div>

      {/* Stage Container */}
      <div style={{ flex: 1, position: "relative" }}>
        <Stage width={dimensions.width} height={dimensions.height}>
          <Layer>
            {(canvasData.shapes || []).map((shape, idx) => {
              if (shape.type === "circle") {
                return (
                  <Circle
                    key={shape.id || idx}
                    x={shape.x || 100}
                    y={shape.y || 100}
                    radius={shape.radius || 40}
                    fill={shape.fill || "#10B981"}
                    draggable
                    onDragEnd={(e) => handleDragEnd(idx, e)}
                  />
                );
              }
              return (
                <Rect
                  key={shape.id || idx}
                  x={shape.x || 50}
                  y={shape.y || 50}
                  width={shape.width || 100}
                  height={shape.height || 100}
                  fill={shape.fill || "#3B82F6"}
                  draggable
                  onDragEnd={(e) => handleDragEnd(idx, e)}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

// Styling definitions for toolbar and controls
const toolbarStyle = {
  display: "flex",
  gap: 8,
  padding: "8px 16px",
  background: "#e5e7eb",
  borderBottom: "1px solid #d1d5db"
};

const btnStyle = {
  padding: "6px 12px",
  fontSize: 13,
  fontWeight: "600",
  background: "#ffffff",
  border: "1px solid #9ca3af",
  borderRadius: 4,
  cursor: "pointer"
};

export default CanvasEditor;
