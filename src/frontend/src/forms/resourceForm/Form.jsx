import React, { useState } from "react";
import {
  TextField,
  Box,
  Button,
  Grid2,
  Snackbar,
  Alert,
  Slide,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactBpmnModeler from "../../components/bpmnModeler/ReactBpmnModeler";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Form = ({
  formData,
  setFormData,
  cpModelers,
  setCpModelers,
  handleAddModeler,
  handleDeleteModeler,
  handleToggleModelerStatus,
  onSaveDiagram,
  attributes,
  handleAddAttribute,
  handleChangeAttribute,
  handleDeleteAttribute,
  onSaveResource,
  handleDiagramChange,
  onDiscard,
  roles,
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSuccessSnackbarClose = () => {
    setSuccessSnackbarOpen(false);
  };

  const validateAdditionalAttributes = () => {
    return attributes.every((attr) => attr.name && attr.value);
  };

  const validateChangePatterns = () => {
    return !cpModelers.some((pattern) => pattern.unsavedChanges);
  };

  const checkValidAssignment = () => {
    console.log("roles:", roles);
    const roleObj = roles.find((r) => r.role === formData.role);

    if (!roleObj) {
      // Role not found
      setSnackbarMessage(
        `Role "${formData.role}" does not exist in the roles hierarchy.`
      );
      setSnackbarOpen(true);
      return false;
    }

    console.log("roleObj:", roleObj);
    const tasks = Array.isArray(roleObj.tasks)
      ? roleObj.tasks
      : (roleObj.tasks || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
    console.log("permissioned tasks", tasks);

    if (!tasks.includes(formData.task)) {
      // Task not assigned to this role
      setSnackbarMessage(
        `Task "${formData.task}" is not assigned to role "${formData.role}". Please check the roles hierarchy.`
      );
      setSnackbarOpen(true);
      return false;
    }

    // Valid role and task assignment
    return true;
  };

  const handleSave = () => {
    setShowErrors(true);
    if (!formData.resource || !formData.role || !formData.task) {
      setSnackbarMessage("All fields must be filled out.");
      setSnackbarOpen(true);
      return;
    }

    const validAssigment = checkValidAssignment();
    if (!validAssigment) {
      return;
    }

    if (!validateAdditionalAttributes()) {
      setSnackbarMessage(
        "All additional attributes must be filled out or deleted."
      );
      setSnackbarOpen(true);
      return;
    }

    if (!validateChangePatterns()) {
      setSnackbarMessage(
        "All change patterns must be saved or deleted before saving."
      );
      setSnackbarOpen(true);
      return;
    }

    const resourceData = { ...formData, attributes, cpModelers };
    onSaveResource(resourceData);

    setFormData({ resource: "", role: "", task: "" });
    setShowErrors(false);
    setSuccessSnackbarOpen(true);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          padding: 2,
          overflowY: "auto",
          position: "relative",
        }}
      >
        <h3>Create Resource</h3>

        {/* Resource, Role, Task Fields */}
        <Grid2 container spacing={2} direction="column">
          <Grid2>
            <TextField
              sx={{ width: "96%" }}
              label="Resource Name"
              variant="outlined"
              value={formData.resource}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, resource: e.target.value }))
              }
              error={showErrors && !formData.resource}
              helperText={
                showErrors && !formData.resource ? "Resource is required" : ""
              }
            />
          </Grid2>

          <Grid2>
            <TextField
              sx={{ width: "96%" }}
              label="Role"
              variant="outlined"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              error={showErrors && !formData.role}
              helperText={
                showErrors && !formData.role ? "Role is required" : ""
              }
            />
          </Grid2>

          <Grid2>
            <TextField
              sx={{ width: "96%" }}
              label="Task"
              variant="outlined"
              value={formData.task}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, task: e.target.value }))
              }
              error={showErrors && !formData.task}
              helperText={
                showErrors && !formData.task ? "Task is required" : ""
              }
            />
          </Grid2>

          {/* Dynamic Attributes */}
          {attributes.map((attr, index) => (
            <Grid2 container spacing={2} key={index} alignItems="center">
              <Grid2 size={5}>
                <TextField
                  fullWidth
                  label="Attribute Name"
                  variant="standard"
                  value={attr.name}
                  onChange={(e) =>
                    handleChangeAttribute(index, "name", e.target.value)
                  }
                  error={showErrors && !attr.name}
                  helperText={showErrors && !attr.name && "Name is required"}
                />
              </Grid2>
              <Grid2 size={5}>
                <TextField
                  fullWidth
                  label="Attribute Value"
                  variant="standard"
                  value={attr.value}
                  onChange={(e) =>
                    handleChangeAttribute(index, "value", e.target.value)
                  }
                  error={showErrors && !attr.value}
                  helperText={showErrors && !attr.value && "Value is required"}
                />
              </Grid2>
              <Grid2 size={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleDeleteAttribute(index)}
                >
                  Delete
                </Button>
              </Grid2>
            </Grid2>
          ))}

          {/* Add Attribute Button */}
          <Grid2>
            <Button
              sx={{ width: "32%", mt: 2 }}
              variant="outlined"
              onClick={handleAddAttribute}
            >
              Add Attribute
            </Button>
          </Grid2>
        </Grid2>

        {/* Render Change Patterns */}
        {cpModelers.map((cp, index) => (
          <Paper
            key={cp.id}
            sx={{
              marginTop: 2,
              border: "1px solid #fff",
              padding: 2,
              width: "90%",
            }}
          >
            <Grid2 container spacing={2} direction="column">
              {/* Toggle Button for BPMN viewer */}
              <Grid2>
                <IconButton
                  sx={{ width: "auto" }}
                  onClick={() => handleToggleModelerStatus(cp.id)}
                >
                  {cp.modelerStatus ? (
                    <VisibilityIcon />
                  ) : (
                    <VisibilityOffIcon />
                  )}
                </IconButton>
              </Grid2>

              {/* Render the BPMN viewer only if modelerStatus is true */}

              {cp.modelerStatus && (
                <Grid2>
                  <Box sx={{ marginBottom: 2 }}>
                    <strong>Change Pattern {index + 1} </strong>
                    <ReactBpmnModeler
                      patternId={cp.id}
                      diagramXML={cp.diagramXML}
                      cpModelers={cpModelers}
                      setCpModelers={setCpModelers}
                      onSave={(xml) => onSaveDiagram(cp.id, xml)}
                      onDelete={() => handleDeleteModeler(cp.id)}
                      taskName={formData.task}
                      onChange={() => handleDiagramChange(cp.id)}
                      colorFrame={cp.unsavedChanges ? "#de2a2a" : "#ffff"}
                      onRemovePattern={(modelerId, elementId) => {
                        setCpModelers(all =>
                          all.map(m =>
                            m.id === modelerId
                              ? {
                                  ...m,
                                  changePatterns: (m.changePatterns || []).filter(
                                    p => p.bpmnElementId !== elementId
                                  ),
                                }
                              : m
                          )
                        );
                      }}
                    />
                  </Box>
                </Grid2>
              )}
            </Grid2>
          </Paper>
        ))}

        {/* Add Change Pattern Button */}
        <Grid2>
          <Button
            sx={{ width: "32%", mt: 2 }}
            variant="outlined"
            onClick={handleAddModeler}
          >
            Add Change Pattern
          </Button>
        </Grid2>

        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 7 }}>
          <Button type="submit" variant="contained" size="medium">
            Save Resource
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 2, color: "#7c7c7c", borderColor: "#7c7c7c" }}
            onClick={onDiscard}
          >
            Discard Changes
          </Button>
        </Box>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default Form;
