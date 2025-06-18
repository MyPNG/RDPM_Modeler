import React, { useState, useRef } from "react";
import ReactFlow, {
  Background,
  Handle,
  NodeToolbar,
  MiniMap,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import ReactBpmnViewer from "../../components/bpmnViewer/ReactBpmnViewer";
import CustomNode from "../../components/CustomNode";
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getResources } from "../../api/resources/getResources";

const ResourceNode = ({ data }) => {
  const {
    label,
    attributes = [],
    cpModelers = [],
    resourceIsExpanded,
    resource,
    onDelete,
    onEdit,
  } = data;
  const [hovered, setHovered] = useState(false);
  const hideTimeoutRef = useRef();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 500);
  };

  const baseStyle = {
    width: "160px",
    border: "1px solid #ccc",
    borderRadius: 10,
    background: "#fff",
    fontFamily: "sans-serif",
    boxShadow: hovered ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    overflow: "hidden",
  };

  const headerStyle = {
    background: "#5e9fdf",
    color: "#fff",
    fontSize: "12px",
    padding: "6px",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    fontWeight: "bold",
    textAlign: "center",
  };

  const toolbarStyle = {
    padding: "4px",
    display: "flex",
    justifyContent: "center",
    gap: "4px",
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    if (resource && resource._id) {
      onDelete(resource._id);
    } else {
      console.warn("No valid resource found to delete:", resource);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={baseStyle}
    >
      {hovered && (
        <NodeToolbar isVisible style={toolbarStyle}>
          <IconButton color="primary" onClick={() => onEdit(resource)}>
            <EditIcon></EditIcon>
          </IconButton>
          <IconButton color="error" onClick={handleDeleteClick}>
            <DeleteIcon></DeleteIcon>
          </IconButton>
        </NodeToolbar>
      )}

      {/* Header with resource name */}
      <div style={headerStyle}>{label}</div>

      {/* Attributes section */}
      {!resourceIsExpanded && (
        <div style={{ margin: "10px 10px", fontSize: "10px" }}>
          {attributes.map((attr, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              {" "}
              <strong>{attr.name}:</strong> {attr.value}
            </div>
          ))}
        </div>
      )}

      {/* Divider and Change Patterns */}
      {!resourceIsExpanded && cpModelers.length > 0 && (
        <hr style={{ margin: "0 10px", borderTop: "1px solid #ccc" }} />
      )}
      {!resourceIsExpanded && cpModelers.length > 0 && (
        <div style={{ padding: "6px 7px 6px 6px" }}>
          {cpModelers.map((cp, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "9px",
                  marginBottom: "4px",
                }}
              >
                {cp.name || `CP ${index + 1}`}
              </div>
              <ReactBpmnViewer
                diagramXML={cp.diagramXML || ""}
                height="100px"
                width="150px"
              />
            </div>
          ))}
        </div>
      )}

      <Handle type="target" position="top" style={{ opacity: 0 }} />
      <Handle type="source" position="bottom" style={{ opacity: 0 }} />

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
    </div>
  );
};

const RoleNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    width: 158,
    height: 30,
    borderRadius: 10,
    border: "1px solid #1976d2",
    background: hovered ? "#eff7fc" : "#fff",
    fontSize: "12px",
    padding: "6px",
    textAlign: "center",
    fontFamily: "sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: hovered ? "0 4px 12px rgba(0, 0, 0, 0.09)" : "",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={baseStyle}
    >
      {data.label}
      <Handle type="target" position="top" style={{ opacity: 0 }} />
      <Handle type="source" position="bottom" style={{ opacity: 0 }} />
    </div>
  );
};

const TaskNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    width: 158,
    height: 30,
    borderRadius: 10,
    border: "1px solid #999da0",
    background: hovered ? "#f5f6f6" : "#fff",
    fontSize: "12px",
    padding: "6px",
    textAlign: "center",
    fontFamily: "sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: hovered ? "0 4px 12px rgba(0, 0, 0, 0.09)" : "",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={baseStyle}
    >
      {data.label}
      <Handle type="target" position="top" style={{ opacity: 0 }} />
      <Handle type="source" position="bottom" style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = {
  customToolbar: CustomNode,
  resourceNode: ResourceNode,
  roleNode: RoleNode,
  taskNode: TaskNode,
};

const ResourceFlow = ({
  resources,
  onEditResource,
  onDeleteResource,
  focus,
  tree,
  expandedRoles,
  expandedTasks,
  expandedResources,
  expandedRp,
  toggleRole,
  toggleTask,
  toggleResource,
}) => {
  const focusLayout = focus;

  const toggleLayout = () => {
    setLayout((prev) => (prev === true ? false : true));
  };

  // Generate nodes and edges based on the selected layout
  const generateElements = () => {
    const nodes = [];
    const edges = [];
    const spaceY = 50;

    const type = determineType();

    //console.log("TYPE DETERMINED IS:", type);

    const nodeWidth = 150;

    if (focusLayout === "role-focus") {
      const roleY = 50,
        taskY = 190,
        resourceY = 330;
      let roleX = 50;
      let taskX = roleX;
      let resourceX = taskX;
      let prevRoleX = 0;
      let prevTaskX = 0;
      let prevResourceX = 0;
      let firstRole = true;
      Object.keys(tree).forEach((normRole) => {
        const numberOfTasks = Object.keys(tree[normRole].tasks).length;
        const xWidth = 100 * (numberOfTasks - 1);
        const roleLabel = tree[normRole].label;
        const roleId = `role-${normRole}`;

        if (type == 1) {
          // Case 1: Role not expanded -> only push role nodes
          nodes.push({
            id: roleId,
            type: "roleNode",
            data: { label: roleLabel },
            position: { x: roleX, y: roleY },
          });
        } else {
          // Case 2: Role is expanded, Task not --> Push role and task nodes

          if (expandedRoles[normRole] && !firstRole) {
            // Check if this is not the first initial node
            const oldPosX = roleX;

            if (taskX < prevRoleX) {
              taskX = prevRoleX;
            }
            roleX = taskX + xWidth;

            if (roleX < oldPosX) {
              // Prevents this case: e.g. role1 is closed but role2 is opened --> so role2 won't stick to the border of role1 if opened
              roleX = oldPosX;
            }
          }

          taskX = roleX - xWidth;
          // prevents from overlapping task nodes
          if (
            expandedRoles[normRole] &&
            !firstRole &&
            taskX - prevTaskX < 200
          ) {
            taskX = prevTaskX + 200;
            roleX = taskX + xWidth;
          }

          // if case 2 then role node is pushed here
          if (type == 2 || !expandedRoles[normRole]) {
            nodes.push({
              id: roleId,
              type: "roleNode",
              data: { label: roleLabel },
              position: { x: roleX, y: roleY },
            });
          }

          if (expandedRoles[normRole]) {
            let firstTask = true;
            Object.keys(tree[normRole].tasks).forEach((task) => {
              const taskKey = `${normRole}-${task}`;
              const taskId = `task-${normRole}-${task}`;
              // Case 2: Role expanded + Task not expanded --> Push role and task nodes
              if (type == 2) {
                nodes.push({
                  id: taskId,
                  type: "taskNode",
                  data: { label: task },
                  position: { x: taskX, y: taskY },
                });
                edges.push({
                  id: `e-${roleId}-${taskId}`,
                  source: roleId,
                  target: taskId,
                  animated: true,
                });
                prevTaskX = taskX;
                taskX += 200;
              }

              if (type == 3) {
                const numberOfResources = Object.keys(
                  tree[normRole].tasks[task]
                ).length;
                const xWidthResource = 100 * (numberOfResources - 1);
                resourceX = taskX - xWidthResource;

                // prevents overlapping Resourcecs
                if (
                  expandedTasks[taskKey] &&
                  (!firstTask || !firstRole) &&
                  prevResourceX != 0 &&
                  resourceX - prevResourceX < 200
                ) {
                  resourceX = prevResourceX + 200;
                  taskX = resourceX + xWidthResource;
                  //roleX = taskX - xWidthResource;
                }

                nodes.push({
                  id: roleId,
                  type: "roleNode",
                  data: { label: roleLabel },
                  position: { x: roleX, y: roleY },
                });

                nodes.push({
                  id: taskId,
                  type: "taskNode",
                  data: { label: task },
                  position: { x: taskX, y: taskY },
                });
                edges.push({
                  id: `e-${roleId}-${taskId}`,
                  source: roleId,
                  target: taskId,
                  animated: true,
                });

                if (expandedTasks[taskKey]) {
                  Object.keys(tree[normRole].tasks[task]).forEach(
                    (resource) => {
                      const resourceId = `resource-${normRole}-${task}-${resource}`;
                      const resourceData = tree[normRole].tasks[task][resource];
                      const resourceKey = `${normRole}-${task}-${resource}`;
                      nodes.push({
                        id: resourceId,
                        type: "resourceNode",
                        data: {
                          label: resource,
                          attributes: resourceData.attributes,
                          cpModelers: resourceData.cpModelers,
                          resourceIsExpanded: expandedResources[resourceKey],
                          resource: resourceData,
                          onDelete: onDeleteResource,
                          onEdit: onEditResource,
                        },
                        position: { x: resourceX, y: resourceY },
                      });
                      edges.push({
                        id: `e-${taskId}-${resourceId}`,
                        source: taskId,
                        target: resourceId,
                        animated: true,
                      });

                      prevResourceX = resourceX;
                      resourceX += 200;
                    }
                  );
                }
                prevTaskX = taskX;
                taskX += 200;
                firstTask = false;
              }
            });
          }
        }
        prevRoleX = roleX;
        roleX += 200;
        firstRole = false;
      });
    } else if (focusLayout === "task-focus") {
      const taskY = 50,
        roleY = 190,
        resourceY = 330;
      let taskX = 50;
      let roleX = taskX;
      let resourceX = roleX;
      let prevRoleX = 0;
      let prevTaskX = 0;
      let prevResourceX = 0;
      let firstTask = true;

      Object.keys(tree).forEach((task) => {
        const numberOfRoles = Object.keys(tree[task].roles).length;
        const xWidth = 100 * (numberOfRoles - 1);
        const taskLabel = tree[task].label;
        const taskId = `task-${task}`;

        if (type == 1) {
          // Case 1: Task not expanded -> only push task nodes
          nodes.push({
            id: taskId,
            type: "taskNode",
            data: { label: task },
            position: { x: taskX, y: taskY },
          });
        } else {
          // Case 2: Task is expanded, Role not --> Push Task and Role Nodes
          if (expandedTasks[task] && !firstTask) {
            // Check if this is not the first initial node
            const oldPosX = taskX;

            if (taskX < prevTaskX) {
              roleX = prevTaskX;
            }
            taskX = roleX + xWidth;

            if (taskX < oldPosX) {
              // Prevents this case: e.g. task1 is closed but task2 is opened --> so task2 won't stick to the border of role1 if opened
              taskX = oldPosX;
            }
          }

          roleX = taskX - xWidth;
          // prevents from overlapping role nodes
          if (expandedTasks[task] && !firstTask && roleX - prevRoleX < 200) {
            roleX = prevRoleX + 200;
            taskX = roleX + xWidth;
          }

          // if case 2 then task node is pushed here
          if (type == 2 || !expandedTasks[task]) {
            nodes.push({
              id: taskId,
              type: "taskNode",
              data: { label: task },
              position: { x: taskX, y: taskY },
            });
          }

          if (expandedTasks[task]) {
            let firstRole = true;
            Object.keys(tree[task].roles).forEach((normRole) => {
              const roleKey = `${task}-${normRole}`;
              const roleId = `role-${task}-${normRole}`;
              const roleLabel = tree[task].roles[normRole].label;
              // Case 2: Task is expanded + Role not expanded --> Push Task and Role Nodes
              if (type == 2) {
                nodes.push({
                  id: roleId,
                  type: "roleNode",
                  data: { label: roleLabel },
                  position: { x: roleX, y: roleY },
                });
                edges.push({
                  id: `e-${taskId}-${roleId}`,
                  source: taskId,
                  target: roleId,
                  animated: true,
                });
                prevRoleX = roleX;
                roleX += 200;
              }

              if (type == 3) {
                const numberOfResources = Object.keys(
                  tree[task].roles[normRole].resources
                ).length;
                //console.log("numberOfResources", numberOfResources);
                const xWidthResource = 100 * (numberOfResources - 1);
                resourceX = roleX - xWidthResource;

                // prevents overlapping resources
                if (
                  expandedRoles[roleKey] &&
                  (!firstRole || !firstTask) &&
                  prevResourceX != 0 &&
                  resourceX - prevResourceX < 200
                ) {
                  resourceX = prevResourceX + 200;
                  roleX = resourceX + xWidthResource;
                  //roleX = taskX - xWidthResource;
                }

                nodes.push({
                  id: taskId,
                  type: "taskNode",
                  data: { label: task },
                  position: { x: taskX, y: taskY },
                });

                nodes.push({
                  id: roleId,
                  type: "roleNode",
                  data: { label: roleLabel },
                  position: { x: roleX, y: roleY },
                });
                edges.push({
                  id: `e-${taskId}-${roleId}`,
                  source: taskId,
                  target: roleId,
                  animated: true,
                });

                if (expandedRoles[roleKey]) {
                  Object.keys(tree[task].roles[normRole].resources).forEach(
                    (resource) => {
                      const resourceId = `resource-${task}-${normRole}-${resource}`;
                      const resourceData =
                        tree[task].roles[normRole].resources[resource];
                      const resourceKey = `${task}-${normRole}-${resource}`;
                      nodes.push({
                        id: resourceId,
                        type: "resourceNode",
                        data: {
                          label: resource,
                          attributes: resourceData.attributes,
                          cpModelers: resourceData.cpModelers,
                          resourceIsExpanded: expandedResources[resourceKey],
                          resource: resourceData,
                          onDelete: onDeleteResource,
                          onEdit: onEditResource,
                        },
                        position: { x: resourceX, y: resourceY },
                      });
                      edges.push({
                        id: `e-${roleId}-${resourceId}`,
                        source: roleId,
                        target: resourceId,
                        animated: true,
                      });

                      prevResourceX = resourceX;
                      resourceX += 200;
                    }
                  );
                }
                prevRoleX = roleX;
                roleX += 200;
                firstRole = false;
              }
            });
          }
        }
        prevTaskX = taskX;
        taskX += 200;
        firstTask = false;
      });
    } else {
      const resourceY = 50,
        roleY = 190,
        taskY = 330,
        rpY = taskY + 140;
      let resourceX = 50;
      let roleX = resourceX;
      let taskX = roleX;
      let rpX = taskX;

      let prevRoleX = 0;
      let prevTaskX = 0;
      let prevResourceX = 0;
      let prevRpX = 0;
      let firstRes = true;

      Object.keys(tree).forEach((resource) => {
        const numberOfRoles = Object.keys(tree[resource].roles).length;
        const xWidth = 100 * (numberOfRoles - 1);
        // const resourceLabel = tree[resource].label;
        const resourceId = `resource-${resource}`;
        const resourceData = tree[resource];
        const resourceKey = `${resource}`;

        if (type == 1) {
          //("resourceData:", resourceData);
          // Case 1: Res not expanded -> only push Res nodes
          nodes.push({
            id: resourceId,
            type: "resourceNode",
            data: {
              label: resource,
              attributes: resourceData.attributes,
              cpModelers: resourceData.cpModelers,
              resourceIsExpanded: expandedResources[resourceKey],
              resource: resourceData,
              onDelete: onDeleteResource,
              onEdit: onEditResource,
            },
            position: { x: resourceX, y: resourceY },
          });
        } else {
          // Case 2: Res Node is expanded, Role not --> Push Res and Role Nodes
          if (expandedResources[resource] && !firstRes) {
            // Check if this is not the first initial node
            const oldPosX = resourceX;

            if (resourceX < prevResourceX) {
              roleX = prevResourceX;
            }
            resourceX = roleX + xWidth;

            if (resourceX < oldPosX) {
              // Prevents this case: e.g. res1 is closed but res2 is opened --> so task2 won't stick to the border of role1 if opened
              resourceX = oldPosX;
            }
          }

          roleX = resourceX - xWidth;
          // prevents from overlapping role nodes
          if (
            expandedResources[resource] &&
            !firstRes &&
            roleX - prevRoleX < 200
          ) {
            roleX = prevRoleX + 200;
            resourceX = roleX + xWidth;
          }

          // if case 2 then res node is pushed here
          if (type == 2 || !expandedResources[resource]) {
            nodes.push({
              id: resourceId,
              type: "resourceNode",
              data: {
                label: resource,
                attributes: resourceData.attributes,
                cpModelers: resourceData.cpModelers,
                resourceIsExpanded: expandedResources[resourceKey],
                resource: resourceData,
                onDelete: onDeleteResource,
                onEdit: onEditResource,
              },
              position: { x: resourceX, y: resourceY },
            });
          }

          if (expandedResources[resource]) {
            let firstRole = true;
            Object.keys(tree[resource].roles).forEach((normRole) => {
              const roleKey = `${resource}-${normRole}`;
              const roleId = `role-${resource}-${normRole}`;
              const roleLabel = tree[resource].roles[normRole].label;
              // Case 2: res is expanded + Role not expanded --> Push Res and Role Nodes
              if (type == 2) {
                nodes.push({
                  id: roleId,
                  type: "roleNode",
                  data: { label: roleLabel },
                  position: { x: roleX, y: roleY },
                });
                edges.push({
                  id: `e-${resourceId}-${roleId}`,
                  source: resourceId,
                  target: roleId,
                  animated: true,
                });
                prevRoleX = roleX;
                roleX += 200;
              }

              if (type == 3) {
                const numberOfTasks = Object.keys(
                  tree[resource].roles[normRole].tasks
                ).length;
                const xWidthTask = 100 * (numberOfTasks - 1);
                taskX = roleX - xWidthTask;

                // prevents overlapping task nodes
                if (
                  expandedRoles[roleKey] &&
                  (!firstRole || !firstRes) &&
                  prevTaskX != 0 &&
                  taskX - prevTaskX < 200
                ) {
                  taskX = prevTaskX + 200;
                  roleX = taskX + xWidthTask;
                  //roleX = taskX - xWidthResource;
                }

                nodes.push({
                  id: resourceId,
                  type: "resourceNode",
                  data: {
                    label: resource,
                    attributes: resourceData.attributes,
                    cpModelers: resourceData.cpModelers,
                    resourceIsExpanded: expandedResources[resourceKey],
                    resource: resourceData,
                    onDelete: onDeleteResource,
                    onEdit: onEditResource,
                  },
                  position: { x: resourceX, y: resourceY },
                });

                nodes.push({
                  id: roleId,
                  type: "roleNode",
                  data: { label: roleLabel },
                  position: { x: roleX, y: roleY },
                });
                edges.push({
                  id: `e-${resourceId}-${roleId}`,
                  source: resourceId,
                  target: roleId,
                  animated: true,
                });

                if (expandedRoles[roleKey]) {
                  Object.keys(tree[resource].roles[normRole].tasks).forEach(
                    (task) => {
                      const taskId = `task-${resource}-${normRole}-${task}`;
                      nodes.push({
                        id: taskId,
                        type: "taskNode",
                        data: { label: task },
                        position: { x: taskX, y: taskY },
                      });
                      edges.push({
                        id: `e-${roleId}-${taskId}`,
                        source: roleId,
                        target: taskId,
                        animated: true,
                      });

                      // test erp node
                      const taskKey = `${resource}-${normRole}-${task}`;
                      if (expandedTasks[taskKey]) {
                        rpX = taskX;
                        Object.keys(
                          tree[resource].roles[normRole].tasks[task]
                        ).forEach((resource) => {
                          const rpId = `rp-${resource}-${normRole}-${task}-${resource}`;
                          const rpData =
                            tree[resource].roles[normRole].tasks[task][
                              resource
                            ];
                          const rpKey = `${resource}-${normRole}-${task}-${resource}`;
                          nodes.push({
                            id: rpId,
                            type: "resourceNode",
                            data: {
                              label: resource,
                              attributes: rpData.attributes,
                              cpModelers: rpData.cpModelers,
                              resourceIsExpanded: expandedRp[rpKey],
                              resource: rpData,
                              onDelete: onDeleteResource,
                              onEdit: onEditResource,
                            },
                            position: { x: rpX, y: rpY },
                          });
                          edges.push({
                            id: `e-${taskId}-${rpId}`,
                            source: taskId,
                            target: rpId,
                            animated: true,
                          });

                          prevRpX = rpX;
                          rpX += 200;
                        });
                      }

                      prevTaskX = taskX;
                      taskX += 200;
                    }
                  );
                }
                prevRoleX = roleX;
                roleX += 200;
                firstRole = false;
              }
            });
          }
        }
        prevResourceX = resourceX;
        resourceX += 200;
        firstRes = false;
      });
    }
    return { nodes, edges };
  };

  const determineType = () => {
    let type = 1;
    if (focusLayout === "role-focus") {
      for (const normRole of Object.keys(tree)) {
        if (expandedRoles[normRole]) {
          type = 2;
          for (const task of Object.keys(tree[normRole].tasks)) {
            const taskKey = `${normRole}-${task}`;
            if (expandedTasks[taskKey]) {
              type = 3;
              return type; // break out of both loops
            }
          }
        }
      }
    } else if (focusLayout === "task-focus") {
      for (const task of Object.keys(tree)) {
        if (expandedTasks[task]) {
          type = 2;
          for (const normRole of Object.keys(tree[task].roles)) {
            const roleKey = `${task}-${normRole}`;
            if (expandedRoles[roleKey]) {
              type = 3;
              return type; // break out of both loops
            }
          }
        }
      }
    } else {
      for (const resource of Object.keys(tree)) {
        if (expandedResources[resource]) {
          type = 2;
          for (const normRole of Object.keys(tree[resource].roles)) {
            const roleKey = `${resource}-${normRole}`;
            if (expandedRoles[roleKey]) {
              type = 3;
              return type; // break out of both loops
            }
          }
        }
      }
    }

    return type;
  };

  const { nodes, edges } = generateElements();
  //console.log("nodes: ", nodes);

  // Handle clicks on nodes to toggle their expansion.
  const onNodeClick = (event, node) => {
    const { id } = node;
    if (focusLayout === "role-focus") {
      //console.log("role focus");
      if (id.startsWith("role-")) {
        const normRole = id.substring(5);
        //console.log("id.substring(5):", normRole);
        toggleRole(normRole);
      } else if (id.startsWith("task-")) {
        const parts = id.split("-");
        const normRole = parts[1];
        const task = parts.slice(2).join("-");
        toggleTask(normRole, task);
      } else if (id.startsWith("resource-")) {
        const parts = id.split("-");
        const normRole = parts[1];
        const task = parts[2];
        const resource = parts.slice(3).join("-");
        toggleResource(normRole, task, resource);
      }
    } else if (focusLayout === "task-focus") {
      if (id.startsWith("task-")) {
        const task = id.substring(5);
        //console.log("id.substring(5)", task);
        toggleTask(task);
      } else if (id.startsWith("role-")) {
        const parts = id.split("-");
        const task = parts[1];
        const normRole = parts.slice(2).join("-");
        toggleRole(normRole, task);
      } else if (id.startsWith("resource-")) {
        const parts = id.split("-");
        const task = parts[1];
        const normRole = parts[2];
        const resource = parts.slice(3).join("-");
        toggleResource(normRole, task, resource);
      }
    } else {
      //console.log("resource focus");
      if (id.startsWith("resource-")) {
        const resource = id.substring(9);
        //console.log("id.substring(9)", resource);
        toggleResource(resource);
      } else if (id.startsWith("role-")) {
        const parts = id.split("-"); // it would look like this: "role - <resource_label> - <role_label>""
        const resource = parts[1];
        const normRole = parts.slice(2).join("-");
        toggleRole(normRole, resource);
      } else if (id.startsWith("task-")) {
        const parts = id.split("-");
        const resource = parts[1];
        const normRole = parts[2];
        const task = parts.slice(3).join("-");
        toggleTask(normRole, task, resource);
      }
    }
  };

  return (
    <div style={{ width: "100%", height: "1000px", padding: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        //onNodesChange={onNodesChange}
      >
        <MiniMap zoomable pannable />
        <Controls />
        <Background />
      </ReactFlow>
      <style>
        {`
        .react-flow__attribution {
         display: none !important;
        }
        `}
      </style>
    </div>
  );
};

export default ResourceFlow;
