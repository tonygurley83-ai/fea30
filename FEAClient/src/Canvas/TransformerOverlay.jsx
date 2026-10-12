import React from "react";
import { Transformer }
  from "react-konva";

export default function
TransformerOverlay({
  transformerRef
}) {
  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={false}
      keepRatio={false}
    />
  );
}
