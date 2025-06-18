import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Collapse,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Autocomplete,
  TextField,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReactBpmnViewer from "../../components/bpmnViewer/ReactBpmnViewer";


function Row({ row, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    onDelete(row._id);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          backgroundColor: open ? "#aed6f1" : "white",
          transition: "background-color 0.3s ease",
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.resource}
        </TableCell>
        <TableCell align="left">{row.role}</TableCell>
        <TableCell align="left">{row.task}</TableCell>
        <TableCell align="center">
          {/* Edit Button */}
          <IconButton onClick={() => onEdit(row)} color="primary">
            <EditIcon />
          </IconButton>
          {/* Delete button */}
          <IconButton onClick={handleDeleteClick} color="error">
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
                paddingBottom: 2,
                maxHeight: "60vh",
                overflowY: "auto",
                backgroundColor: "#f9f9f9",
              }}
            >
              <Typography variant="h6" gutterBottom component="div">
                Additional Attributes
              </Typography>
              <Table
                size="small"
                aria-label="additional-attributes"
                sx={{
                  "& thead th": {
                    backgroundColor: "#d6eaf8",
                    color: "#333",
                  },
                  "& tbody tr:nth-of-type(odd)": {
                    backgroundColor: "#f9f9f9",
                  },
                  "& tbody tr:nth-of-type(even)": {
                    backgroundColor: "#ffffff",
                  },
                  "& tbody td": {
                    color: "#555",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Attribute Name</TableCell>
                    <TableCell>Attribute Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.attributes.map((attr, index) => (
                    <TableRow key={index}>
                      <TableCell>{attr.name}</TableCell>
                      <TableCell>{attr.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Change Pattern
              </Typography>
              {row.cpModelers && row.cpModelers.length > 0 ? (
                row.cpModelers.map((modeler, index) => (
                  <Box
                    key={modeler._id || index}
                    sx={{
                      border: "1px solid #ccc",
                      padding: 1,
                      marginBottom: 1,
                    }}
                  >
                    <div
                      style={{
                        border: "",
                        background: "",
                        position: "relative",
                        width: "95%",
                        height: "25vh",
                      }}
                    >
                      <ReactBpmnViewer diagramXML={modeler.diagramXML} />
                    </div>
                  </Box>
                ))
              ) : (
                <Typography>No change pattern available</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
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
    </React.Fragment>
  );
}

const ResourceOverview = ({ resources, onEditResource, onDeleteResource }) => {
  const [filteredResources, setFilteredResources] = useState(resources);
  const [selectedField, setSelectedField] = useState(null);
  const [filterValue, setFilterValue] = useState("");

  const fields = useMemo(() => {
    const baseFields = ["Resource", "Role", "Task"];
    const additionalAttributes = new Set();

    resources.forEach((resource) => {
      if (resource.attributes) {
        resource.attributes.forEach((attr) => {
          additionalAttributes.add(attr.name.toLowerCase());
        });
      }
    });

    return [
      ...baseFields,
      ...Array.from(additionalAttributes).map(
        (attr) => attr.charAt(0).toUpperCase() + attr.slice(1)
      ),
    ];
  }, [resources]);

  const applyFilter = () => {
    if (!selectedField || !filterValue) {
      setFilteredResources(resources);
    } else {
      setFilteredResources(
        resources.filter((resource) => {
          if (
            ["resource", "role", "task"].includes(selectedField.toLowerCase())
          ) {
            return (
              resource[selectedField.toLowerCase()]?.toLowerCase() ===
              filterValue.toLowerCase()
            );
          }

          if (resource.attributes) {
            return resource.attributes.some(
              (attr) =>
                attr.name.toLowerCase() === selectedField.toLowerCase() &&
                attr.value.toLowerCase() === filterValue.toLowerCase()
            );
          }

          return false;
        })
      );
    }
  };

  useEffect(() => {
    applyFilter();
  }, [resources, selectedField, filterValue]);

  const handleFieldChange = (event, newField) => {
    setSelectedField(newField);
    setFilterValue("");
  };

  const handleValueChange = (event, newValue) => {
    setFilterValue(newValue || "");
  };

  const valueOptions = useMemo(() => {
    if (!selectedField) return [];

    if (["resource", "role", "task"].includes(selectedField.toLowerCase())) {
      return [...new Set(resources.map((r) => r[selectedField.toLowerCase()]))];
    }

    return [
      ...new Set(
        resources
          .flatMap((r) =>
            r.attributes?.filter(
              (attr) => attr.name.toLowerCase() === selectedField.toLowerCase()
            )
          )
          .map((attr) => attr?.value)
      ),
    ];
  }, [selectedField, resources]);

  return (
    <Box sx={{ padding: 0 }}>
      <Box sx={{ display: "flex", marginBottom: 2, gap: 2 }}>
        <Autocomplete
          disablePortal
          options={fields}
          value={selectedField}
          onChange={handleFieldChange}
          sx={{ width: 200 }}
          renderInput={(params) => <TextField {...params} label="Filter By" />}
        />
        <Autocomplete
          disablePortal
          options={valueOptions}
          value={filterValue}
          onChange={handleValueChange}
          sx={{ width: 200 }}
          renderInput={(params) => (
            <TextField {...params} label="Filter Value" />
          )}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Resource</TableCell>
              <TableCell align="left">Role</TableCell>
              <TableCell align="left">Task</TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResources.map((resource, index) => (
              <Row
                key={index}
                row={resource}
                onEdit={onEditResource}
                onDelete={onDeleteResource}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResourceOverview;
