import { React, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Box, Grid2, Snackbar, Alert } from "@mui/material";

const FormRole = ({
  formRole,
  setFormRole,
  onSaveRole,
  onDiscard,
  existingRoles = [],
  mode,
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const [tempRoleData, setTempRoleData] = useState([...existingRoles]);

  const checkIsCycle = (roleArray) => {
    const roleMap = {};
    roleArray.forEach(({ role, children }) => {
      roleMap[role] = {
        children: Array.isArray(children)
          ? children
          : (children || "")
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
      };
    });

    const allRoles = new Set(Object.keys(roleMap));
    const allChildren = new Set();
    Object.values(roleMap).forEach(({ children }) =>
      children.forEach((c) => allChildren.add(c))
    );

    const roots = [...allRoles].filter((r) => !allChildren.has(r));

    if (roots.length === 0) return true;

    return false;
  };

  const handleSave = () => {
    setShowErrors(true);
    if (!formRole.role) {
      setSnackbarMessage("Role Name missing!");
      setSnackbarOpen(true);
      return;
    }

    if (mode == "create") {
      const normalizeRoleName = (role) =>
        role.toLowerCase().replace(/\s+/g, "");

      const normalizedNewRole = normalizeRoleName(formRole.role);
      const hasDuplicate = existingRoles.some(
        (r) => normalizeRoleName(r.role || r) === normalizedNewRole
      );
      if (hasDuplicate) {
        setSnackbarMessage("Role Name already exists!");
        setSnackbarOpen(true);
        return;
      }
    }

    const parseList = (str) =>
      str
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    const roleData = {
      role: formRole.role.trim(),
      children: parseList(formRole.children),
      tasks: parseList(formRole.tasks),
    };

    const roleArray = [...tempRoleData, roleData];

    if (checkIsCycle(roleArray)) {
      setSnackbarMessage(
        "Hierarchy would form a cycle—please adjust children or role name."
      );
      setSnackbarOpen(true);
      return;
    }

    setTempRoleData(roleArray);

    onSaveRole(roleData);

    setFormRole({ role: "", children: "", tasks: "" });
    setShowErrors(false);
  };

  const handleDeleteClick = () => {};

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
        <h3>Create Role</h3>

        <Grid2 container spacing={2} direction="column">
          <TextField
              sx={{width: "96%"}}
              label="Role"
              variant="outlined"
              value={formRole.role}
              onChange={(e) =>
                  setFormRole((prev) => ({...prev, role: e.target.value}))
              }
              error={showErrors && !formRole.role}
              helperText={showErrors && !formRole.role ? "Role is required" : ""}
          />
          <TextField
              sx={{width: "96%"}}
              label="Children"
              variant="outlined"
              value={formRole.children}
              onChange={(e) =>
                  setFormRole((prev) => ({...prev, children: e.target.value}))
              }
          />
          <TextField
              sx={{width: "96%"}}
              label="Task(s)"
              variant="outlined"
              value={formRole.tasks}
              onChange={(e) =>
                  setFormRole((prev) => ({...prev, tasks: e.target.value}))
              }
          />
          <Grid2>
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
            <Button
                variant="outlined"
                sx={{ml: 2, color: "#7c7c7c", borderColor: "#7c7c7c"}}
                onClick={onDiscard}
            >
              Discard Changes
            </Button>
          </Grid2>
        </Grid2>
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

export default FormRole;
