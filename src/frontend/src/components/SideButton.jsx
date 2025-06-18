import React from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";


const SideButton = ({ handleOnClick, top }) => {
  return (
    <Fab
      color="primary"
      aria-label="add"
      onClick={()=> handleOnClick(true)}
      sx={{
        position: "fixed", 
        top: top, 
        right: 16, 
      }}
    >
      <AddIcon />
    </Fab>
  );
};

export default SideButton;
