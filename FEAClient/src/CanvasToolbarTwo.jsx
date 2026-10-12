import React from "react";
import { AppBar, Toolbar, ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function CanvasToolbarTwo({ tool, setTool }) {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: "#115E59", width: "100%" }}>
      <Toolbar sx={{ minHeight: 44, gap: 1, px: 2, py: 0.5 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={tool || "nodes"}
          onChange={(e, value) => {
            if (value) {
              if (typeof setTool === "function") {
                setTool(value);
              } else {
                console.error("Critical: setTool is missing or not a function in CanvasToolbarTwo!", { setTool });
              }
            }
          }}
          sx={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <ToggleButton value="nodes" sx={{ color: "white" }}>Nodes</ToggleButton>
          <ToggleButton value="segments" sx={{ color: "white" }}>Segments</ToggleButton>
          <ToggleButton value="square" sx={{ color: "white" }}>Square</ToggleButton>
          <ToggleButton value="rectangle" sx={{ color: "white" }}>Rectangle</ToggleButton>
          <ToggleButton value="circle" sx={{ color: "white" }}>Circle</ToggleButton>
          <ToggleButton value="holes" sx={{ color: "white" }}>Holes</ToggleButton>
          <ToggleButton value="oval" sx={{ color: "white" }}>Oval</ToggleButton>
          <ToggleButton value="ellipse" sx={{ color: "white" }}>Ellipse</ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>
    </AppBar>
  );
}
