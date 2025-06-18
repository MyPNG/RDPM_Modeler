import React from 'react'
import {  Box } from "@mui/material";


const ResiziedHandle = ({handleMouseDown}) => {
  return (
    <Box
          sx={{
            position: "absolute",
            top: 0,
            left: -5,
            height: "100%",
            width: 10,
            cursor: "ew-resize",
            zIndex: 1200,
          }}
          onMouseDown={handleMouseDown}
        />
  )
}

export default ResiziedHandle