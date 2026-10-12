import React from "react";
import ShareIcon from "@mui/icons-material/Share";

import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box
} from "@mui/material";

import UndoIcon
  from "@mui/icons-material/Undo";

import RedoIcon
  from "@mui/icons-material/Redo";

import ContentCopyIcon
  from "@mui/icons-material/ContentCopy";

import ContentPasteIcon
  from "@mui/icons-material/ContentPaste";

import SaveIcon
  from "@mui/icons-material/Save";

function UnifiedToolbar({
  canvas,
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
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2
        }}
      >

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mr: 2
          }}
        >
          Tectera Labs
        </Typography>

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

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
          sx={{
            ml: 1,
            backgroundColor: "#ffffff",
            color: "#0F766E",

            "&:hover": {
              backgroundColor: "#F3F4F6"
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
          {canvas?.name || "No Canvas"}
        </Typography>

      </Toolbar>

    </AppBar>

  );

}

export default UnifiedToolbar;
