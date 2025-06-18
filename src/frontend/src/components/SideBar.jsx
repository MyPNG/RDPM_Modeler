import React from "react";
import { Drawer, Box, Toolbar } from "@mui/material";


const SideBar = ({ open, onClose, width, children }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: width,
        },
      }}
    >
      <Box>
        <Toolbar /> 
        {children}
      </Box>
    </Drawer>
  );
};

export default SideBar;
