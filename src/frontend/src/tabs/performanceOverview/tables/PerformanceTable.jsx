import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

// TABLE 1
export default function PerformanceTable({loading, saving, handleSave, handleDeleteAll, deleting, rows} ) {
  const columns = [
    { field: "case_id", headerName: "Case ID", width: 220 },
    { field: "activity", headerName: "Task", width: 150 },
    { field: "resource", headerName: "Resource", width: 120 },
    { field: "start", headerName: "Start", width: 180 },
    { field: "complete", headerName: "Complete", width: 180 },
    { field: "duration", headerName: "Duration (s)", width: 130 },
  ];

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        sx={{ mr: 2, mb: 2 }}
      >
        {saving ? "Saving…" : "Save Performance Data"}
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={handleDeleteAll}
        disabled={deleting}
        sx={{ mb: 2 }}
      >
        {deleting ? "Deleting…" : "Delete All Performance Data"}
      </Button>

      <Paper style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          loading={loading || deleting}
        />
      </Paper>
    </div>
  );
}