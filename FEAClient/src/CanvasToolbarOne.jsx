import React from "react";
import { AppBar, Toolbar, Button, Typography, Divider } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";

export default function CanvasToolbarOne({
  canvas,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onArchive,
  onLoadArchive
}) {
  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: "#0F766E", width: "100%" }}>
      <Toolbar sx={{ minHeight: 48, gap: 1, px: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mr: 2 }}>
          Tectera Labs
        </Typography>

        <Button color="inherit" startIcon={<UndoIcon />} onClick={onUndo} size="small">
          Undo
        </Button>
        <Button color="inherit" startIcon={<RedoIcon />} onClick={onRedo} size="small">
          Redo
        </Button>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255,255,255,0.2)" }} />

        <Button color="inherit" startIcon={<SaveIcon />} onClick={onSave} size="small">
          Save
        </Button>
        <Button color="inherit" startIcon={<FolderOpenIcon />} onClick={onLoad} size="small">
          Load
        </Button>
        <Button color="inherit" startIcon={<ArchiveIcon />} onClick={onArchive} size="small">
          Archive
        </Button>
        <Button color="inherit" startIcon={<UnarchiveIcon />} onClick={onLoadArchive} size="small">
          Load Archive
        </Button>

        <Typography variant="body2" sx={{ ml: "auto", opacity: 0.9 }}>
          {canvas?.name ?? "Untitled Canvas"}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
