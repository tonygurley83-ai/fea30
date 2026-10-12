import React from "react";
import { AppBar, Toolbar, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import GridOnIcon from "@mui/icons-material/GridOn";
import LinkIcon from "@mui/icons-material/Link";
import GrainIcon from "@mui/icons-material/Grain";

export default function CanvasToolbarThree({
  snapEnabled,
  onToggleSnap,
  onConnectAll,
  onGeneratePolygons,
  meshType,
  setMeshType
}) {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: "#0F766E", width: "100%" }}>
      <Toolbar sx={{ minHeight: 44, gap: 1, px: 2, py: 0.5 }}>
        <Button
          variant={snapEnabled ? "contained" : "text"}
          color="inherit"
          size="small"
          startIcon={<GridOnIcon />}
          onClick={onToggleSnap}
        >
          Snap to Grid
        </Button>

        <Button color="inherit" size="small" startIcon={<LinkIcon />} onClick={onConnectAll}>
          Connect All
        </Button>

        <Button color="inherit" size="small" startIcon={<GrainIcon />} onClick={onGeneratePolygons}>
          Generate Polygons
        </Button>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={meshType}
          onChange={(e, value) => {
            if (value) setMeshType(value);
          }}
          sx={{ ml: "auto", backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <ToggleButton value="delaunay" sx={{ color: "white" }}>Delaunay</ToggleButton>
          <ToggleButton value="physical" sx={{ color: "white" }}>Physical</ToggleButton>
          <ToggleButton value="regular" sx={{ color: "white" }}>Regular</ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>
    </AppBar>
  );
}
