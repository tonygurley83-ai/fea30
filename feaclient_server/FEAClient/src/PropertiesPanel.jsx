import React from "react";

function PropertiesPanel({
  selectedNode
}) {

  return (

    <div
      style={{
        width: 260,
        minWidth: 260,
        borderLeft:
          "1px solid #ddd",
        background:
          "#fafafa",
        padding: "16px"
      }}
    >

      <h3>Properties</h3>

      {!selectedNode && (

        <div>
          No Node Selected
        </div>

      )}

      {selectedNode && (

        <div>

          <div>

            <b>ID</b>

            {" "}

            {selectedNode.id}

          </div>

          <div>

            <b>X</b>

            {" "}

            {selectedNode.x}

          </div>

          <div>

            <b>Y</b>

            {" "}

            {selectedNode.y}

          </div>

        </div>

      )}

    </div>

  );

}

export default PropertiesPanel;
