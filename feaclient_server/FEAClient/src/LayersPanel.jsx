import React from "react";

function LayersPanel({
  layers = []
}) {

  return (

    <div
      style={{
        borderTop: "1px solid #ddd",
        padding: "12px"
      }}
    >

      <div
        style={{
          fontWeight: "bold",
          marginBottom: "10px"
        }}
      >
        Layers
      </div>

      {layers.map(layer => (

        <div
          key={layer.id}
          style={{
            marginBottom: "6px"
          }}
        >

          <input
            type="checkbox"
            checked={layer.visible}
            readOnly
          />

          {" "}

          {layer.name}

        </div>

      ))}

    </div>

  );

}

export default LayersPanel;
