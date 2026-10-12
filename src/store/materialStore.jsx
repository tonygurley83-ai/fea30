// store/materialStore.jsx

import { createContext, useContext, useState } from "react";

const MaterialContext = createContext();

export function MaterialProvider({ children }) {
  const [materials] = useState([
    { id: "steel", name: "Steel" },
    { id: "wood", name: "Wood" },
    { id: "concrete", name: "Concrete" },
    { id: "glass", name: "Glass" },
  ]);

  return (
    <MaterialContext.Provider
      value={{ materials }}
    >
      {children}
    </MaterialContext.Provider>
  );
}

export const useMaterials = () => useContext(MaterialContext);
