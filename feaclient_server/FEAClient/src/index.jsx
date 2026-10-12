import React from "react";
import { createRoot } from "react-dom/client";
import MasterManager from "./FEAMain";

const root = createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <FEAMain />
  </React.StrictMode>
);

