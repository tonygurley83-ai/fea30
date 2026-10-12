// properties/LayerSelector.jsx

import { useLayers } from "../store/layerStore";

export default function LayerSelector({
  value,
  onChange,
}) {
  const { layers } = useLayers();

  return (
    <>
      <label>Layer</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {layers.map((layer) => (
          <option
            key={layer.id}
            value={layer.id}
          >
            {layer.name}
          </option>
        ))}
      </select>
    </>
  );
}
