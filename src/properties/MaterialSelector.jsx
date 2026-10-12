// properties/MaterialSelector.jsx

import { useMaterials } from "../store/materialStore";

export default function MaterialSelector({
  value,
  onChange,
}) {
  const { materials } = useMaterials();

  return (
    <>
      <label>Material</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {materials.map((mat) => (
          <option
            key={mat.id}
            value={mat.id}
          >
            {mat.name}
          </option>
        ))}
      </select>
    </>
  );
}

