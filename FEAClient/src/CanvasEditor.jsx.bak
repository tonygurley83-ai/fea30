import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";

function CanvasEditor({ canvasId }) {
  const [dimensions, setDimensions] = useState({
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

  console.log(
    "[CanvasEditor] canvasId:",
    canvasId
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f8fafc",
        border: "3px solid red"
      }}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onClick={() =>
          console.log("Stage clicked")
        }
      >
        <Layer>
          <Rect
            x={100}
            y={100}
            width={200}
            height={200}
            fill="red"
            draggable
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasEditor;
