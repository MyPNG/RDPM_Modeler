import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

// Table 2
export default function ResourcePerformanceTable({
  loadingPerformancePr,
  syncing, 
  handleSync,
  handleDeleteAllPerformanceData,
  deletingPerformancePr,
  rowsPerformancePr,
}) {
  const columns = [
    { field: "resource", headerName: "Resource", width: 150 },
    { field: "task", headerName: "Task", width: 150 },
    { field: "count", headerName: "Task Execution Count", width: 170 },
    { field: "totalDuration", headerName: "Total Duration (s)", width: 130 },
    { field: "minDuration", headerName: "Min Duration (s)", width: 130 },
    { field: "maxDuration", headerName: "Max Duration (s)", width: 180 },
    { field: "avgDuration", headerName: "Avg Duration (s)", width: 180 },
    
  ];

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleSync}
        disabled={syncing}
        sx={{ mr: 2, mb: 2 }}
      >
        {syncing ? "Syncing" : "Sync Performance Data"}
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={handleDeleteAllPerformanceData}
        disabled={deletingPerformancePr}
        sx={{ mb: 2 }}
      >
        {deletingPerformancePr
          ? "Deleting…"
          : "Delete All Performance Profile Data"}
      </Button>

      <Paper style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rowsPerformancePr}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          loading={loadingPerformancePr || deletingPerformancePr}
        />
      </Paper>
    </div>
  );
}
