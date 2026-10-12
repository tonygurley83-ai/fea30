// store/layerStore.jsx

import { createContext, useContext, useState } from "react";

const LayerContext = createContext();

export function LayerProvider({ children }) {
  const [layers, setLayers] = useState([
    {
      id: "default",
      name: "Default",
      visible: true,
      locked: false,
      color: "#ffffff",
    },
  ]);

  return (
    <LayerContext.Provider
      value={{
        layers,
        setLayers,
      }}
    >
      {children}
    </LayerContext.Provider>
  );
}

export const useLayers = () => useContext(LayerContext);
