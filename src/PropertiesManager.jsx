// properties/PropertiesManager.jsx

import LayerSelector from "./LayerSelector";
import MaterialSelector from "./MaterialSelector";

export default function PropertiesManager({
  selectedObject,
  updateObject,
}) {
  if (!selectedObject) return null;

  return (
    <div className="properties-panel">
      <h3>Properties</h3>

      <LayerSelector
        value={selectedObject.layer}
        onChange={(layer) =>
          updateObject({
            ...selectedObject,
            layer,
          })
        }
      />

      <MaterialSelector
        value={selectedObject.material}
        onChange={(material) =>
          updateObject({
            ...selectedObject,
            material,
          })
        }
      />
    </div>
  );
}

