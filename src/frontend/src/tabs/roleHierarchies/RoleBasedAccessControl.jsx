import * as React from "react";
import { useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const DataTable = ({ roleData, onEdit, onDelete }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (rowToDelete) {
      onDelete(rowToDelete.id);
    }
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "role", headerName: "Role", width: 230 },
    { field: "children", headerName: "Children", width: 330 },
    { field: "tasks", headerName: "Task(s)", width: 330 },
    {
      field: "actions",
      headerName: "",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" onClick={() => onEdit(params.row)}>
            <EditIcon></EditIcon>
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row)}
          >
            <DeleteIcon></DeleteIcon>
          </IconButton>
        </Stack>
      ),
    },
  ];

  const rows = useMemo(() => {
    return roleData.map((data) => ({
      id: data._id,
      role: data.role,
      children: Array.isArray(data.children) ? data.children.join(", ") : data.children || "",
      tasks: Array.isArray(data.tasks) ? data.tasks.join(", ") : data.tasks || "",
    }));
  }, [roleData]);

 

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <>
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          sx={{ border: 0 }}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this resource?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DataTable;
