import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Paper } from "@mui/material";

// Table 3
export default function ResPerformanceProfileTable({
  loadingPerformancePr,
  syncing,
  handleSync,
  handleDeleteAllPerformanceData,
  deletingPerformancePr,
  rowsPerformancePr, 
}) {
  const columns = [
    {
      field: "resource",
      headerName: "Resource",
      width: 180,
      align: "left", headerAlign: "left"
    },
    {
      field: "count",
      headerName: "Total Executions",
      type: "number",
      width: 130,
      align: "left", headerAlign: "left"
    },
    {
      field: "totalDuration",
      headerName: "Total Duration (s)",
      type: "number",
      width: 150,
      align: "left", headerAlign: "left"
    },
    {
      field: "minDuration",
      headerName: "Min Duration (s)",
      type: "number",
      width: 130,
      align: "left", headerAlign: "left"
    },
    {
      field: "maxDuration",
      headerName: "Max Duration (s)",
      type: "number",
      width: 130, align: "left", headerAlign: "left"
    },
    {
      field: "avgDuration",
      headerName: "Avg Duration (s)",
      type: "number",
      width: 130, align: "left", headerAlign: "left"
    },
  ];


  const rows = rowsPerformancePr.map((prof) => ({
    id: prof.resource,
    ...prof,
  }));

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleSync}
        disabled={syncing}
        sx={{ mr: 2, mb: 2 }}
      >
        {syncing ? "Syncing…" : "Sync Performance Profiles"}
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
          : "Delete All Performance Profiles"}
      </Button>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          loading={loadingPerformancePr || deletingPerformancePr}
        />
      </Paper>
    </div>
  );
}