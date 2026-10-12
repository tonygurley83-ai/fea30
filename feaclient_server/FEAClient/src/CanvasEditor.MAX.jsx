import React, {
  useEffect,
  useState,
  useCallback
} from "react";

import {
  Stage,
  Layer,
  Rect,
  Circle,
  Text
} from "react-konva";

import { cold } from "react-hot-loader/root";
import apiClient from "../apiClient";

function CanvasEditor({ canvasId, user }) {
  const [canvasData, setCanvasData] = useState({
    shapes: []
  });

  const [loading, setLoading] = useState(false);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  const loadCanvas = useCallback(
    async (id, signal) => {
      try {
        setLoading(true);

        const data = await apiClient(
          `/auth/canvases/${id}`
        );

        if (signal.aborted) {
          return;
        }

        let parsed = {
          shapes: []
        };

        try {
          parsed =
            typeof data?.canvas_data === "string"
              ? JSON.parse(data.canvas_data)
              : data?.canvas_data || {
                  shapes: []
                };
        } catch (err) {
          console.error(
            "Canvas parse error",
            err
          );
        }

        setCanvasData({
          shapes: Array.isArray(
            parsed?.shapes
          )
            ? parsed.shapes
            : []
        });
      } catch (err) {
        if (!signal.aborted) {
          console.error(
            "[CanvasEditor]",
            err
          );
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!canvasId) {
      return;
    }

    const controller =
      new AbortController();

    loadCanvas(
      canvasId,
      controller.signal
    );

    return () => controller.abort();
  }, [canvasId, loadCanvas]);

  const saveCanvas =
    useCallback(
      async (dataToSave) => {
        if (!canvasId) {
          return;
        }

        try {
          await apiClient(
            `/auth/canvases/${canvasId}`,
            {
              method: "PUT",
              body: JSON.stringify({
                canvas_data: dataToSave
              })
            }
          );
        } catch (err) {
          console.error(
            "[Canvas Save]",
            err
          );
        }
      },
      [canvasId]
    );

  const updateCanvas = (
    updatedShapes
  ) => {
    const nextData = {
      ...canvasData,
      shapes: updatedShapes
    };

    setCanvasData(nextData);
    saveCanvas(nextData);
  };

  const addRectangle = () => {
    updateCanvas([
      ...canvasData.shapes,
      {
        id: `rect_${Date.now()}`,
        type: "rect",
        x: 100,
        y: 100,
        width: 140,
        height: 100,
        fill: "#0F766E"
      }
    ]);
  };

  const addCircle = () => {
    updateCanvas([
      ...canvasData.shapes,
      {
        id: `circle_${Date.now()}`,
        type: "circle",
        x: 200,
        y: 150,
        radius: 55,
        fill: "#D97706"
      }
    ]);
  };

  const addSticky = () => {
    updateCanvas([
      ...canvasData.shapes,
      {
        id: `note_${Date.now()}`,
        type: "sticky",
        x: 120,
        y: 120,
        width: 220,
        height: 140,
        fill: "#FEF08A",
        text: "New Note"
      }
    ]);
  };

  const addTask = () => {
    updateCanvas([
      ...canvasData.shapes,
      {
        id: `task_${Date.now()}`,
        type: "task",
        x: 150,
        y: 150,
        width: 240,
        height: 90,
        fill: "#DBEAFE",
        text: "New Task"
      }
    ]);
  };

  const handleDragEnd = (
    index,
    e
  ) => {
    const updatedShapes = [
      ...canvasData.shapes
    ];

    updatedShapes[index] = {
      ...updatedShapes[index],
      x: e.target.x(),
      y: e.target.y()
    };

    updateCanvas(updatedShapes);
  };

  if (!canvasId) {
    return (
      <div style={emptyStateStyle}>
        Select a canvas to begin.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={emptyStateStyle}>
        Loading canvas...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%"
      }}
    >
      <div style={toolbarStyle}>
        <button
          style={btnStyle}
          onClick={addRectangle}
        >
          Rectangle
        </button>

        <button
          style={btnStyle}
          onClick={addCircle}
        >
          Circle
        </button>

        <button
          style={btnStyle}
          onClick={addSticky}
        >
          Note
        </button>

        <button
          style={btnStyle}
          onClick={addTask}
        >
          Task
        </button>

        <div style={{ flex: 1 }} />

        <button
          style={btnStyle}
          onClick={() =>
            saveCanvas(canvasData)
          }
        >
          Save
        </button>
      </div>

      <div
        style={{
          flex: 1,
          background: "#f8fafc"
        }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
        >
          <Layer>
            {canvasData.shapes.map(
              (shape, idx) => {
                if (
                  shape.type === "sticky" ||
                  shape.type === "task"
                ) {
                  return (
                    <React.Fragment
                      key={shape.id}
                    >
                      <Rect
                        x={shape.x}
                        y={shape.y}
                        width={
                          shape.width
                        }
                        height={
                          shape.height
                        }
                        fill={shape.fill}
                        draggable
                        onDragEnd={(e) =>
                          handleDragEnd(
                            idx,
                            e
                          )
                        }
                      />

                      <Text
                        x={
                          shape.x + 10
                        }
                        y={
                          shape.y + 10
                        }
                        width={
                          shape.width -
                          20
                        }
                        text={
                          shape.text
                        }
                        fontSize={14}
                      />
                    </React.Fragment>
                  );
                }

                if (
                  shape.type ===
                  "circle"
                ) {
                  return (
                    <Circle
                      key={shape.id}
                      x={shape.x}
                      y={shape.y}
                      radius={
                        shape.radius
                      }
                      fill={shape.fill}
                      draggable
                      onDragEnd={(e) =>
                        handleDragEnd(
                          idx,
                          e
                        )
                      }
                    />
                  );
                }

                return (
                  <Rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={
                      shape.height
                    }
                    fill={shape.fill}
                    draggable
                    onDragEnd={(e) =>
                      handleDragEnd(
                        idx,
                        e
                      )
                    }
                  />
                );
              }
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

const toolbarStyle = {
  display: "flex",
  gap: 8,
  padding: "10px 12px",
  background: "#ffffff",
  borderBottom:
    "1px solid #e2e8f0"
};

const btnStyle = {
  padding: "8px 14px",
  background: "#f1f5f9",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600
};

const emptyStateStyle = {
  padding: 24,
  color: "#64748b"
};

export default cold(CanvasEditor);
