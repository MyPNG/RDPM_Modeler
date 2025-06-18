import React from "react";
import { Button } from "@mui/material";
import { Fab } from "@mui/material"; 
import DownloadIcon from '@mui/icons-material/Download';


const DownloadResources = (resources) => {
  const downloadAsJSON = () => {
    const blob = new Blob([JSON.stringify(resources, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resources.json";
    link.click();
  };

  const downloadAsCSV = () => {
    const headers = "Resource,Role,Task\n";
    const rows = resources
      .map((resource) => `${resource.resource},${resource.role},${resource.task}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resources.csv";
    link.click();
  };

  return (
    <div>
      <Fab
      color="primary"
      aria-label="add"
      onClick={downloadAsJSON}
      sx={{
        position: "fixed", 
        top: 200, 
        right: 16, 
      }}
    >
      <DownloadIcon />
    </Fab>
    </div>
  );
};

export default DownloadResources;