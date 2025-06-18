import React from "react";
import { Box, Tab, Tabs, Button } from "@mui/material"; 

// do not delete, serves as testing outputtings the avaiable resources
const Test = ({handleProcessTasks, downloadProcessedJSON,processedJSON, downloadProcessedXML, processedXML}) => {
  return (
    <div>
      <Box sx={{ padding: 2, textAlign: "center" }}>
        <Button variant="contained" onClick={handleProcessTasks}>
          Process Tasks
        </Button>
      </Box>
      {/* New Buttons: Download Processed Output */}
      <Box sx={{ padding: 2, textAlign: "center" }}>
        <Button
          variant="contained"
          onClick={downloadProcessedJSON}
          disabled={!processedJSON}
        >
          Download Processed JSON
        </Button>
        <Button
          variant="contained"
          onClick={downloadProcessedXML}
          disabled={!processedXML}
          sx={{ ml: 2 }}
        >
          Download Processed XML
        </Button>
      </Box>
    </div>
  );
};

export default Test;
