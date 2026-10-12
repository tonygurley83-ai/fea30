import React, {
  useState,
  useEffect,
  useMemo
} from "react";

import {
  Stage,
  Layer,
  Rect,
  Circle,
  Text
} from "react-konva";

function CanvasManager({
  canvas,
  onCanvasChange,
  selectedNodeId,
  onNodeSelected
}) {
  const [dimensions, setDimensions] =
    useState({
      width: window.innerWidth,
      height: window.innerHeight
    });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

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

  const nodes = useMemo(
    () => canvas?.nodes || [],
    [canvas]
  );

  const updateNode = (
    id,
    updates
  ) => {
    const updatedCanvas = {
      ...canvas,
      nodes: nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              ...updates
            }
          : node
      )
    };

    onCanvasChange?.(
      updatedCanvas
    );
  };

  const addRectangle = () => {
    const updatedCanvas = {
      ...canvas,
      nodes: [
        ...nodes,
        {
          id: `rect_${Date.now()}`,
          type: "rect",
          x: 100,
          y: 100,
          width: 140,
          height: 100,
          fill: "#0F766E"
        }
      ]
    };

    onCanvasChange?.(
      updatedCanvas
    );
  };

  const addCircle = () => {
    const updatedCanvas = {
      ...canvas,
      nodes: [
        ...nodes,
        {
          id: `circle_${Date.now()}`,
          type: "circle",
          x: 250,
          y: 150,
          radius: 50,
          fill: "#D97706"
        }
      ]
    };

    onCanvasChange?.(
      updatedCanvas
    );
  };

  const addNote = () => {
    const updatedCanvas = {
      ...canvas,
      nodes: [
        ...nodes,
        {
          id: `note_${Date.now()}`,
          type: "note",
          x: 150,
          y: 150,
          width: 220,
          height: 140,
          fill: "#FEF08A",
          text: "New Note"
        }
      ]
    };

    onCanvasChange?.(
      updatedCanvas
    );
  };

  if (!canvas) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          padding: 8,
          borderBottom:
            "1px solid #ddd",
          display: "flex",
          gap: 8
        }}
      >
        <button
          onClick={addRectangle}
        >
          Rectangle
        </button>

        <button
          onClick={addCircle}
        >
          Circle
        </button>

        <button
          onClick={addNote}
        >
          Note
        </button>
      </div>

      <div
        style={{
          flex: 1,
          background: "#f8fafc"
        }}
      >
        <Stage
          width={
            dimensions.width
          }
          height={
            dimensions.height
          }
        >
          <Layer>
            {nodes.map((node) => {
              if (
                node.type ===
                "circle"
              ) {
                return (
                  <Circle
                    key={node.id}
                    x={node.x}
                    y={node.y}
                    radius={
                      node.radius
                    }
                    fill={
                      node.fill
                    }
                    stroke={
                      node.id ===
                      selectedNodeId
                        ? "#2563EB"
                        : null
                    }
                    strokeWidth={3}
                    draggable
                    onClick={() =>
                      onNodeSelected?.(
                        node.id
                      )
                    }
                    onDragEnd={(
                      e
                    ) =>
                      updateNode(
                        node.id,
                        {
                          x: e.target.x(),
                          y: e.target.y()
                        }
                      )
                    }
                  />
                );
              }

              if (
                node.type ===
                "note"
              ) {
                return (
                  <React.Fragment
                    key={node.id}
                  >
                    <Rect
                      x={node.x}
                      y={node.y}
                      width={
                        node.width
                      }
                      height={
                        node.height
                      }
                      fill={
                        node.fill
                      }
                      draggable
                      stroke={
                        node.id ===
                        selectedNodeId
                          ? "#2563EB"
                          : null
                      }
                      strokeWidth={3}
                      onClick={() =>
                        onNodeSelected?.(
                          node.id
                        )
                      }
                      onDragEnd={(
                        e
                      ) =>
                        updateNode(
                          node.id,
                          {
                            x: e.target.x(),
                            y: e.target.y()
                          }
                        )
                      }
                    />

                    <Text
                      x={
                        node.x +
                        10
                      }
                      y={
                        node.y +
                        10
                      }
                      width={
                        node.width -
                        20
                      }
                      text={
                        node.text
                      }
                    />
                  </React.Fragment>
                );
              }

              return (
                <Rect
                  key={node.id}
                  x={node.x}
                  y={node.y}
                  width={
                    node.width
                  }
                  height={
                    node.height
                  }
                  fill={
                    node.fill
                  }
                  draggable
                  stroke={
                    node.id ===
                    selectedNodeId
                      ? "#2563EB"
                      : null
                  }
                  strokeWidth={3}
                  onClick={() =>
                    onNodeSelected?.(
                      node.id
                    )
                  }
                  onDragEnd={(
                    e
                  ) =>
                    updateNode(
                      node.id,
                      {
                        x: e.target.x(),
                        y: e.target.y()
                      }
                    )
                  }
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default CanvasManager;
