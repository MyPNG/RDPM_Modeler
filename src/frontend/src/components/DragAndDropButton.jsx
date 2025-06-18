import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import React from "react";
import { Fab } from "@mui/material";

const DragAndDropButton = ({handleOnClick}) => {
  return (
    <Fab
      color="primary"
      aria-label="dragAndDrop"
      sx={{
        position: "fixed",
        top: 184,
        right: 16,
      }}
      onClick={handleOnClick}
    >
      <DragIndicatorIcon></DragIndicatorIcon>
    </Fab>
  );
};

export default DragAndDropButton;
