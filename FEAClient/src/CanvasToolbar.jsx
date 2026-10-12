import React from "react";

import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";

import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import ShareIcon from "@mui/icons-material/Share";

import ContentCopyIcon
  from "@mui/icons-material/ContentCopy";

import ContentPasteIcon
  from "@mui/icons-material/ContentPaste";

import MouseIcon
  from "@mui/icons-material/Mouse";

import PanToolIcon
  from "@mui/icons-material/PanTool";

import CropSquareIcon
  from "@mui/icons-material/CropSquare";

import CircleIcon
  from "@mui/icons-material/Circle";

import PolylineIcon
  from "@mui/icons-material/Polyline";

import NotesIcon
  from "@mui/icons-material/Notes";

import GridOnIcon
  from "@mui/icons-material/GridOn";

import TimelineIcon
  from "@mui/icons-material/Timeline";

import AdsClickIcon
  from "@mui/icons-material/AdsClick";

function UnifiedToolbar({
  canvas,

  tool,
  setTool,

  gridVisible,
  snapEnabled,

  onToggleGrid,
  onToggleSnap,

  onUndo,
  onRedo,

  onCopy,
  onPaste,

  onSave,
  onShare
}) {
  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: "#0F766E",
        width: "100%"
      }}
    >
      <Toolbar
        sx={{
          minHeight: 56,
          gap: 1,
          px: 2
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mr: 2
          }}
        >
          Tectera Labs
        </Typography>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={tool}
          onChange={(e, value) => {
            if (value) {
              setTool(value);
            }
          }}
          sx={{
            backgroundColor:
              "rgba(255,255,255,0.08)"
          }}
        >
          <ToggleButton
            value="select"
            sx={{ color: "white" }}
          >
            <AdsClickIcon />
          </ToggleButton>

          <ToggleButton
            value="pan"
            sx={{ color: "white" }}
          >
            <PanToolIcon />
          </ToggleButton>

          <ToggleButton
            value="rect"
            sx={{ color: "white" }}
          >
            <CropSquareIcon />
          </ToggleButton>

          <ToggleButton
            value="circle"
            sx={{ color: "white" }}
          >
            <CircleIcon />
          </ToggleButton>

          <ToggleButton
            value="polygon"
            sx={{ color: "white" }}
          >
            <PolylineIcon />
          </ToggleButton>

          <ToggleButton
            value="note"
            sx={{ color: "white" }}
          >
            <NotesIcon />
          </ToggleButton>

          <ToggleButton
            value="line"
            sx={{ color: "white" }}
          >
            <TimelineIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            borderColor:
              "rgba(255,255,255,0.2)"
          }}
        />

        <Button
          color="inherit"
          startIcon={<UndoIcon />}
          onClick={onUndo}
        >
          Undo
        </Button>

        <Button
          color="inherit"
          startIcon={<RedoIcon />}
          onClick={onRedo}
        >
          Redo
        </Button>

        <Button
          color="inherit"
          startIcon={<ContentCopyIcon />}
          onClick={onCopy}
        >
          Copy
        </Button>

        <Button
          color="inherit"
          startIcon={<ContentPasteIcon />}
          onClick={onPaste}
        >
          Paste
        </Button>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            borderColor:
              "rgba(255,255,255,0.2)"
          }}
        />

        <Button
          variant={
            gridVisible
              ? "contained"
              : "text"
          }
          startIcon={<GridOnIcon />}
          onClick={onToggleGrid}
        >
          Grid
        </Button>

        <Button
          variant={
            snapEnabled
              ? "contained"
              : "text"
          }
          startIcon={<MouseIcon />}
          onClick={onToggleSnap}
        >
          Snap
        </Button>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            borderColor:
              "rgba(255,255,255,0.2)"
          }}
        />

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
          sx={{
            backgroundColor:
              "#ffffff",

            color: "#0F766E",

            "&:hover": {
              backgroundColor:
                "#F3F4F6"
            }
          }}
        >
          Save
        </Button>

        <Button
          color="inherit"
          startIcon={<ShareIcon />}
          onClick={onShare}
        >
          Share
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            whiteSpace: "nowrap"
          }}
        >
          {canvas?.name ??
            "Untitled Canvas"}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default UnifiedToolbar;

