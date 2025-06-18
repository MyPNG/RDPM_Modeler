import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Box, Tab, Tabs, Button, IconButton } from "@mui/material";
import * as js2xmlparser from "js2xmlparser";
import xmlFormatter from "xml-formatter";

import ResourceOverview from "./tabs/resourceList/ResourceOverview";
import SideButton from "./components/SideButton";
import SideBar from "./components/SideBar";
import ResiziedHandle from "./components/ResiziedHandle";
import Form from "./forms/resourceForm/Form";
import DownloadResources from "./components/DownloadResources";
import GraphicalResourceOverview from "./tabs/resourceTree/GraphicalResourceOverview";
import { useResizeDrawer } from "./components/useResizeDrawer";
import "./components/PalettePosition.css";
import { saveResource } from "./api/resources/saveResource";
import { getResources } from "./api/resources/getResources";
import { updateResource } from "./api/resources/updateResource";
import { deleteResource } from "./api/resources/deleteResource";
import { updateRole } from "./api/roles/updateRole";
import { getRoles } from "./api/roles/getRoles";

import MenuIcon from "@mui/icons-material/Menu";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import MiniDrawer from "./tabs/MiniDrawer";

import Test from "./components/Test";
import { v4 as uuidv4 } from "uuid";
import { DarkMode } from "@mui/icons-material";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import TaskPrinter from "./components/TaskPrinter";
import RolesHierArchiesOverview from "./tabs/roleHierarchies/RolesHierArchiesOverview";
import FormRole from "./forms/roleForm/FormRole";
import { saveRole } from "./api/roles/saveRole";
import { deleteRole } from "./api/roles/deleteRole";
import PerformanceTable from "./tabs/performanceOverview/tables/PerformanceTable";
import Dashboard from "./tabs/performanceOverview/dashboard/Dashboard";
import PerformanceTab from "./tabs/performanceOverview/PerformanceTab";

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [resources, setResources] = useState([]);

  // for role form
  const [roles, setRoles] = useState([]);

  const [selectedTab, setSelectedTab] = useState(0);
  const [dndDrawerOpen, setDndDrawerOpen] = useState(false);

  const [processedJSON, setProcessedJSON] = useState(null);
  const [processedXML, setProcessedXML] = useState(null);

  const [menuBarOpen, setMenuBar] = useState(false);
  const [focusLayout, setFocus] = useState("role-focus");
  const [treeExpanded, setTreeExpanded] = useState(false);

  const [expandedRoles, setExpandedRoles] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const [expandedResources, setExpandedResources] = useState({});
  const [expandedRp, setExpandedRp] = useState({});

  let pollInterval = 10000;
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    resource: "",
    role: "",
    task: "",
  });
  const [cpModelers, setCpModelers] = useState([]);

  // for role form
  const [formRole, setFormRole] = useState({
    role: "",
    children: "",
    tasks: "",
  });

  // Speichert die ID der Ressource, die editiert werden soll (wenn vorhanden)
  const [currentResourceId, setCurrentResourceId] = useState(null);

  // for role form, speichert die ID der Role die editiert werden soll (falls vorhanden)
  const [currentRoleId, setCurrentRoleId] = useState(null);

  const handleEditResource = (resource) => {
    const originalRoleObj = roles.find(
      r => normalizeRole(r.role) === resource.role
    );

    setFormData({
      resource: resource.resource,
      role: originalRoleObj?.role || resource.role,
      task: resource.task,
    });
    setAttributes(resource.attributes || []);

    setCpModelers(
      (resource.cpModelers || []).map((cp) => ({
        ...cp,
        modelerStatus: true,
        unsavedChanges: false,
        changePatterns: cp.changePatterns || [],
      }))
    );
    setCurrentResourceId(resource._id);
    setDrawerOpen(true);
  };

  // für Role Form
  const handleEditRole = (data) => {
    setFormRole({
      role: data.role,
      children: data.children,
      tasks: data.tasks,
    });
    setCurrentRoleId(data.id);
    setDrawerOpen(true);
  };

  const handleAddModeler = useCallback(() => {
    setCpModelers((prev) => [
      ...prev,
      {
        id: Date.now(),
        modelerStatus: true,
        diagramXML: "",
        isSaved: false,
        changePatterns: [],
      },
    ]);
  }, []);

  const handleDeleteModeler = useCallback((id) => {
    setCpModelers((prev) => prev.filter((cp) => cp.id !== id));
  }, []);

  const handleToggleModelerStatus = (id) => {
    setCpModelers((prev) =>
      prev.map((modeler) =>
        modeler.id === id
          ? { ...modeler, modelerStatus: !modeler.modelerStatus }
          : modeler
      )
    );
  };

  const handleSaveDiagram = useCallback(
    (id, xml) => {
      setCpModelers((prev) =>
        prev.map((modeler) => {
          if (modeler.id === id) {
            const saved = {
              ...modeler,
              diagramXML: xml,
              unsavedChanges: false,
            };
            console.log("Saved succesful: ", saved);
            return saved;
          }
          return modeler;
        })
      );
    },
    [cpModelers]
  );

  const handleDiagramChange = useCallback((patternId) => {
    setCpModelers(prev => {
      const idx = prev.findIndex(p => p.id === patternId);
      if (idx === -1 || prev[idx].unsavedChanges) {
        return prev;
      }
  
      const updated = {
        ...prev[idx],
        unsavedChanges: true
      };
  
      return [
        ...prev.slice(0, idx),
        updated,
        ...prev.slice(idx + 1)
      ];
    });
  }, []);

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  const handleDeleteAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleChangeAttribute = (index, key, value) => {
    setAttributes(
      attributes.map((attr, i) =>
        i === index ? { ...attr, [key]: value } : attr
      )
    );
  };

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const toggleDndDrawer = (open) => {
    setDndDrawerOpen(open);
  };

  const { drawerWidth, handleMouseDown } = useResizeDrawer();

  const handleSaveResource = async (resourceData) => {
    try {
      let savedResource;
      if (currentResourceId) {
        // We're in edit mode: update the existing resource
        savedResource = await updateResource(currentResourceId, resourceData);
        // Update state by replacing the edited resource
        setResources((prev) =>
          prev.map((res) =>
            res._id === currentResourceId ? savedResource : res
          )
        );
      } else {
        // New resource: create it
        savedResource = await saveResource(resourceData);
        setResources((prev) => [...prev, savedResource]);
      }
      console.log("resourceData before await saveResource", resourceData);
      console.log("saved resource:", savedResource);

      // Reset form and close sidebar
      setFormData({ resource: "", role: "", task: "" });
      setCpModelers([]);
      setAttributes([]);
      setDrawerOpen(false);
      setCurrentResourceId(null);
    } catch (err) {
      console.error("Error saving to MongoDB:", err);
    }
  };

  function buildRoleMap(roles) {
    const roleMap = {};
    roles.forEach(({ _id, role, children, tasks }) => {
      roleMap[role] = {
        id: _id,
        children: Array.isArray(children)
          ? children
          : (children || "")
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
        ownTasks: Array.isArray(tasks)
          ? tasks
          : (tasks || "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
      };
    });
    return roleMap;
  }

  function buildInheritedTasksMap(roleMap) {
    function getInheritedTasks(role, roleMap, memo = {}) {
      if (memo[role]) return memo[role];
      const { ownTasks = [], children = [], id } = roleMap[role] || {};
      let allTasks = [...ownTasks];
      children.forEach((child) => {
        const childResult = getInheritedTasks(child, roleMap, memo);
        allTasks = allTasks.concat(childResult.tasks);
      });
      const uniqueTasks = [...new Set(allTasks)];
      memo[role] = { id, tasks: uniqueTasks };
      return memo[role];
    }
    const inheritedTasksMap = {};
    Object.keys(roleMap).forEach((role) => {
      inheritedTasksMap[role] = getInheritedTasks(role, roleMap);
    });
    return inheritedTasksMap;
  }

  async function updateAllInheritedTasks(inheritedTasksMap) {
    const updates = Object.values(inheritedTasksMap).map(({ id, tasks }) => {
      console.log("id to be updated", id);
      return updateRole(id, { tasks }); 
    });
    await Promise.all(updates);
    console.log("All roles updated with inherited tasks.");
  }

  async function updateInheritedTasksAndRefresh() {
    const roleMap = buildRoleMap(await getRoles());
    const inheritedTasksMap = buildInheritedTasksMap(roleMap);
    await updateAllInheritedTasks(inheritedTasksMap);
    const updatedRoles = await getRoles();
    setRoles(updatedRoles);
  }

  // for role form
  const handleSaveRole = async (roleData) => {
    try {
      let savedRole;
      if (currentRoleId) {
        savedRole = await updateRole(currentRoleId, roleData);
        setRoles((prev) =>
          prev.map((role) => (role._id === currentRoleId ? savedRole : role))
        );
      } else {
        savedRole = await saveRole(roleData);
        setRoles((prev) => [...prev, savedRole]);
      }
      console.log("resourceData before await saveResource", roleData);
      console.log("saved resource:", savedRole);
      // Reset
      setFormRole({ role: "", children: "", tasks: "" });
      setDrawerOpen(false);
      setCurrentRoleId(null);

      await updateInheritedTasksAndRefresh();

      //await updateAllInheritedTasks(inheritedTasksMap);
    } catch (err) {
      console.error("Error saving to MongoDB:", err);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    const success = await deleteResource(resourceId);
    if (success) {
      setResources((prev) => prev.filter((res) => res._id !== resourceId));
    } else {
      console.error("Resource deletion failed.");
    }
  };

  // for Role Delete
  const handleDeleteRole = async (roleId) => {
    const success = await deleteRole(roleId);
    if (success) {
      setRoles((prev) => prev.filter((role) => role._id !== roleId));
    } else {
      console.error("Failed to delete role");
    }
  };

  useEffect(() => {
    async function fetchResources() {
      try {
        const data = await getResources();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    }
    fetchResources();
  }, []);

  // for Role Form
  useEffect(() => {
    async function fetchRoles() {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error("Errro fetching roles:", error);
      }
    }
    fetchRoles();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleDiscardChanges = () => {
    setDrawerOpen(false);
    setFormData({ resource: "", role: "", task: "" });
    setAttributes([]);
    setCpModelers([]);
    setCurrentResourceId(null);
  };

  const handleDiscardRoleChanges = () => {
    setDrawerOpen(false);
    setFormRole({ role: "", children: "", tasks: "" });
    setAttributes([]);
    setCurrentRoleId(null);
  };

  const handleProcessTasks = () => {
    const inputJSON = tasks;

    const processedTasks = inputJSON.map(({ task_id, label: taskName }) => {
      // finde alle Ressourcen, die zu diesem taskName passen
      const resourceProfile = resources
        .filter((r) => r.task === taskName)
        .map((resource) => {
          const attributesObj = resource.attributes.reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {});

          // changePatterns umwandeln
          const cpModelers = resource.cpModelers.map((modeler) => {
            const changePatterns = modeler.changePatterns.map((cp) => {
              let change;

              if (cp.direction) {
                change = {
                  "@": {
                    type: cp.type,
                    direction: cp.direction,
                  },
                  taskName: cp.basetask,
                };
              } else {
                change = {
                  "@": {
                    type: cp.type,
                  },
                  taskName: cp.basetask,
                };
              }
              if (cp.direction) {
                if (cp.direction === "parallel") {
                  change.parallelTask = cp.newTask;
                } else {
                  change.insertedTask = cp.newTask;
                }
              } else if (cp.type === "replace") {
                change.replacedByTask = cp.newTask;
              }

              return change;
            });

            return {
              "@": {
                _id: modeler._id || modeler.id,
              },
              diagramXML: modeler.diagramXML,
              changePatterns: { changePattern: changePatterns },
            };
          });

          return {
            "@": {
              _id: resource._id,
              resource: resource.resource,
              role: resource.role,
              task: resource.task,
            },
            attributes: attributesObj,
            cpModelers: { modeler: cpModelers },
          };
        });

      return {
        "@": {
          task_id: task_id,
          label: taskName,
        },
        availableResources: { resourceProfile },
      };
    });

    setProcessedJSON(processedTasks);

    // Erzeuge wieder XML
    const options = {
      format: {
        doubleQuotes: true,
        pretty: true,
        indent: "  ",
        newline: "\n",
      },
      declaration: { encoding: "UTF-8" },
      cdataKeys: ["diagramXML"],
    };
    const xmlOutput = js2xmlparser.parse(
      "tasks",
      { task: processedTasks },
      options
    );
    setProcessedXML(xmlOutput);
  };

  const downloadProcessedJSON = () => {
    if (!processedJSON) {
      alert("No processed JSON available. Please process tasks first.");
      return;
    }
    const blob = new Blob([JSON.stringify(processedJSON, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "processedTasks.json";
    link.click();
  };

  const downloadProcessedXML = () => {
    if (!processedXML) {
      alert("No processed XML available. Please process tasks first.");
      return;
    }
    const blob = new Blob([processedXML], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "processedTasks.xml";
    link.click();
  };

  const handleMenuClick = (open) => {
    setMenuBar(open);
  };

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2",
      },
    },
  });

  // These are responsible for TREE !!!!!

  const normalizeRole = (role) => role.replace(/\s/g, "").toLowerCase();

  const tree = {};
  const buildTree = () => {
    // Build a hierarchical tree where the key is the normalized role
    if (focusLayout === "role-focus") {
      // role - task - resource
      resources.forEach((item) => {
        const { role, task, resource, attributes = [], cpModelers = [] } = item;
        const normRole = normalizeRole(role);
        if (!tree[normRole]) {
          tree[normRole] = { label: role, tasks: {} };
        }
        if (!tree[normRole].tasks[task]) {
          tree[normRole].tasks[task] = {};
        }
        tree[normRole].tasks[task][resource] = {
          _id: item._id,
          resource: resource,
          role: normRole,
          task: task,
          attributes,
          cpModelers,
        };
      });
    }
    // Build a hierarchical tree where the key is the normalized task
    else if (focusLayout === "task-focus") {
      // task - role - resource
      resources.forEach((item) => {
        const { role, task, resource, attributes = [], cpModelers = [] } = item;
        const normRole = normalizeRole(role);
        if (!tree[task]) {
          tree[task] = { label: task, roles: {} };
        }
        if (!tree[task].roles[normRole]) {
          tree[task].roles[normRole] = { label: role, resources: {} };
        }
        tree[task].roles[normRole].resources[resource] = {
          _id: item._id,
          resource: resource,
          role: normRole,
          task: task,
          attributes,
          cpModelers,
        };
      });
    } else {
      // res - role -task - rp
      resources.forEach((item) => {
        const { role, task, resource, attributes = [], cpModelers = [] } = item;
        const normRole = normalizeRole(role);
        if (!tree[resource]) {
          tree[resource] = {
            _id: item._id,
            resource: resource,
            roles: {},
          };
        }
        if (!tree[resource].roles[normRole]) {
          tree[resource].roles[normRole] = { label: role, tasks: {} };
        }

        if (!tree[resource].roles[normRole].tasks[task]) {
          tree[resource].roles[normRole].tasks[task] = {};
        }

        tree[resource].roles[normRole].tasks[task][resource] = {
          _id: item._id,
          resource: resource,
          role: normRole,
          task: task,
          attributes,
          cpModelers,
        };
      });
    }
  };

  buildTree();

  // Toggle a role's expansion state
  const toggleRole = (...args) => {
    if (focusLayout === "role-focus") {
      const [normRole] = args;
      setExpandedRoles((prev) => {
        const newVal = { ...prev, [normRole]: !prev[normRole] };
        if (!newVal[normRole]) {
          // Collapse all tasks and resources for this role
          const newTasks = { ...expandedTasks };
          Object.keys(newTasks).forEach((key) => {
            if (key.startsWith(`${normRole}-`)) delete newTasks[key];
          });
          setExpandedTasks(newTasks);

          const newResources = { ...expandedResources };
          Object.keys(newResources).forEach((key) => {
            if (key.startsWith(`${normRole}-`)) delete newResources[key];
          });
          setExpandedResources(newResources);
        }
        return newVal;
      });
    } else if (focusLayout == "task-focus") {
      const [normRole, task] = args;
      const key = `${task}-${normRole}`;
      setExpandedRoles((prev) => {
        const newVal = { ...prev, [key]: !prev[key] };
        if (!newVal[key]) {
          // Collapse all resources under this task
          const newResources = { ...expandedResources };
          Object.keys(newResources).forEach((rkey) => {
            if (rkey.startsWith(`${task}-${normRole}-`))
              delete newResources[rkey];
          });
          setExpandedResources(newResources);
        }
        return newVal;
      });
    } else {
      const [normRole, resource] = args;
      const key = `${resource}-${normRole}`;
      setExpandedRoles((prev) => {
        const newVal = { ...prev, [key]: !prev[key] };
        if (!newVal[key]) {
          // Collapse all tasks under this roles
          const newTasks = { ...expandedTasks };
          Object.keys(newTasks).forEach((rkey) => {
            if (rkey.startsWith(`${resource}-${normRole}-`))
              delete newTasks[rkey];
          });
          setExpandedTasks(newTasks);
        }
        return newVal;
      });
    }
  };

  // Toggle a task's expansion state
  const toggleTask = (...args) => {
    if (focusLayout === "role-focus") {
      // focusLayout == "role-focus"
      const [normRole, task] = args;
      const key = `${normRole}-${task}`;
      setExpandedTasks((prev) => {
        const newVal = { ...prev, [key]: !prev[key] };
        if (!newVal[key]) {
          // Collapse all resources under this task
          const newResources = { ...expandedResources };
          Object.keys(newResources).forEach((rkey) => {
            if (rkey.startsWith(`${normRole}-${task}-`))
              delete newResources[rkey];
          });
          setExpandedResources(newResources);
        }
        return newVal;
      });
    } else if (focusLayout == "task-focus") {
      const [task] = args;
      setExpandedTasks((prev) => {
        const newVal = { ...prev, [task]: !prev[task] };
        if (!newVal[task]) {
          // Collapse all roles and resources for this task
          const newRoles = { ...expandedRoles };
          Object.keys(newRoles).forEach((key) => {
            if (key.startsWith(`${task}-`)) delete newRoles[key];
          });
          setExpandedRoles(newRoles);

          const newResources = { ...expandedResources };
          Object.keys(newResources).forEach((key) => {
            if (key.startsWith(`${task}-`)) delete newResources[key];
          });
          setExpandedResources(newResources);
        }
        return newVal;
      });
    } else {
      const [normRole, task, resource] = args;
      const key = `${resource}-${normRole}-${task}`;
      setExpandedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const toggleResource = (...args) => {
    if (focusLayout === "resource-focus") {
      const [resource] = args;
      setExpandedResources((prev) => {
        const newVal = { ...prev, [resource]: !prev[resource] };
        if (!newVal[resource]) {
          // Collapse all roles and tasks for this resource
          const newRoles = { ...expandedRoles };
          Object.keys(newRoles).forEach((key) => {
            if (key.startsWith(`${resource}-`)) delete newRoles[key];
          });
          setExpandedRoles(newRoles);

          const newTasks = { ...expandedTasks };
          Object.keys(newTasks).forEach((key) => {
            if (key.startsWith(`${resource}-`)) delete newTasks[key];
          });
          setExpandedTasks(newTasks);
        }
        return newVal;
      });
    } else {
      const [normRole, task, resource] = args;
      const key = `${normRole}-${task}-${resource}`;
      setExpandedResources((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const expandTree = () => {
    if (focusLayout === "role-focus") {
      const newExpandedRoles = {};
      const newExpandedTasks = {};
      const newExpandedResources = {};

      Object.keys(tree).forEach((normRole) => {
        // Mark every role as expanded
        newExpandedRoles[normRole] = true;

        const tasksObj = tree[normRole].tasks;
        Object.keys(tasksObj).forEach((task) => {
          const taskKey = `${normRole}-${task}`;
          newExpandedTasks[taskKey] = true;
        });
      });

      setExpandedRoles(newExpandedRoles);
      setExpandedTasks(newExpandedTasks);
      setExpandedResources(newExpandedResources);
    } else if (focusLayout === "task-focus") {
      const newExpandedRoles = {};
      const newExpandedTasks = {};
      const newExpandedResources = {};

      Object.keys(tree).forEach((task) => {
        // Mark every role as expanded
        newExpandedTasks[task] = true;

        const roleObj = tree[task].roles;
        Object.keys(roleObj).forEach((role) => {
          const roleKey = `${task}-${role}`;
          newExpandedRoles[roleKey] = true;

          const resourcesObj = roleObj[role];
          Object.keys(resourcesObj).forEach((resource) => {
            const resourceKey = `${task}-${role}-${resource}`;
            newExpandedResources[resourceKey] = true;
          });
        });
      });

      setExpandedRoles(newExpandedRoles);
      setExpandedTasks(newExpandedTasks);
      setExpandedResources(newExpandedResources);
    } else if (focusLayout === "resource-focus") {
      const newExpandedRoles = {};
      const newExpandedTasks = {};
      const newExpandedResources = {};
      const newExpandedRp = {};

      Object.keys(tree).forEach((resource) => {
        // Mark every role as expanded
        newExpandedResources[resource] = true;

        const roleObj = tree[resource].roles;
        Object.keys(roleObj).forEach((role) => {
          const roleKey = `${resource}-${role}`;
          newExpandedRoles[roleKey] = true;

          const taskList = roleObj[role].tasks;
          Object.keys(taskList).forEach((task) => {
            const taskKey = `${resource}-${role}-${task}`;
            newExpandedTasks[taskKey] = true;
          });
        });
      });

      setExpandedRoles(newExpandedRoles);
      setExpandedTasks(newExpandedTasks);
      setExpandedResources(newExpandedResources);
      setExpandedRp(newExpandedRp);
    }
  };

  const collapseTree = () => {
    setExpandedRoles({});
    setExpandedTasks({});
    setExpandedResources({});
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("https://lehre.bpm.in.tum.de/ports/4570/tasks", {
        method: "GET",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const jsonTasks = await res.json();
      setTasks(jsonTasks);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  //useEffect(() => {
  //  fetchTasks(); // sofort beim Start
  //  const handle = setInterval(fetchTasks, pollInterval);
  //  return () => clearInterval(handle);
  //}, [pollInterval]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <MiniDrawer
        handleTabChange={handleTabChange}
        selectedTab={selectedTab}
        changeFocus={setFocus}
        expandTree={expandTree}
        collapseTree={collapseTree}
      >
        {/* Tabs for switching views */}
        {/* Tab content */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 2 }}>
          {selectedTab === 0 && (
            <RolesHierArchiesOverview
              roles={roles}
              onEdit={handleEditRole}
              onDelete={handleDeleteRole}
            />
          )}
          {selectedTab === 1 && (
            <div>
              <GraphicalResourceOverview
                resources={resources}
                onEditResource={handleEditResource}
                onDeleteResource={handleDeleteResource}
                focus={focusLayout}
                tree={tree}
                expandedRoles={expandedRoles}
                expandedTasks={expandedTasks}
                expandedResources={expandedResources}
                expandedRp={expandedRp}
                toggleRole={toggleRole}
                toggleTask={toggleTask}
                toggleResource={toggleResource}
              />
            </div>
          )}
          {selectedTab === 2 && (
            <ResourceOverview
              resources={resources}
              onEditResource={handleEditResource}
              onDeleteResource={handleDeleteResource}
            />
          )}
          {selectedTab === 3 && (
            <>
              <PerformanceTab></PerformanceTab>
              {/* <Test
                handleProcessTasks={handleProcessTasks}
                downloadProcessedJSON={downloadProcessedJSON}
                processedJSON={processedJSON}
                downloadProcessedXML={downloadProcessedXML}
                processedXML={processedXML}
              /> */}
            </>
          )}
        </Box>

        {(selectedTab === 0 || selectedTab === 1 || selectedTab === 2) && (
          <>
            {/* Add Resource Button */}
            <Box sx={{ flexGrow: 1, overFlowY: "auto", padding: 2 }}>
              <SideButton handleOnClick={toggleDrawer} top={100} />
            </Box>
          </>
        )}

        {selectedTab === 0 && currentRoleId && (
          <>
            {/* Drawer for Create Role */}
            <SideBar
              open={drawerOpen}
              onClose={() => toggleDrawer(false)}
              width={drawerWidth}
            >
              <FormRole
                formRole={formRole}
                setFormRole={setFormRole}
                onSaveRole={handleSaveRole}
                onDiscard={handleDiscardRoleChanges}
                existingRoles={roles}
                mode="edit"
              ></FormRole>
              <ResiziedHandle
                handleMouseDown={handleMouseDown}
              ></ResiziedHandle>
            </SideBar>
          </>
        )}

        {selectedTab === 0 && !currentRoleId && (
          <>
            {/* Drawer for Create Role */}
            <SideBar
              open={drawerOpen}
              onClose={() => toggleDrawer(false)}
              width={drawerWidth}
            >
              <FormRole
                formRole={formRole}
                setFormRole={setFormRole}
                onSaveRole={handleSaveRole}
                onDiscard={handleDiscardRoleChanges}
                existingRoles={roles}
                mode="create"
              ></FormRole>
              <ResiziedHandle
                handleMouseDown={handleMouseDown}
              ></ResiziedHandle>
            </SideBar>
          </>
        )}

        {(selectedTab === 1 || selectedTab === 2) && (
          <>
            {/* Drawer for Create Resource */}
            <SideBar
              open={drawerOpen}
              onClose={() => toggleDrawer(false)}
              width={drawerWidth}
            >
              <Form
                formData={formData}
                setFormData={setFormData}
                cpModelers={cpModelers}
                setCpModelers={setCpModelers}
                handleAddModeler={handleAddModeler}
                handleDeleteModeler={handleDeleteModeler}
                handleToggleModelerStatus={handleToggleModelerStatus}
                onSaveDiagram={handleSaveDiagram}
                attributes={attributes}
                handleAddAttribute={handleAddAttribute}
                handleChangeAttribute={handleChangeAttribute}
                handleDeleteAttribute={handleDeleteAttribute}
                onSaveResource={handleSaveResource}
                handleDiagramChange={handleDiagramChange}
                onDiscard={handleDiscardChanges}
                roles={roles}
              ></Form>
              <ResiziedHandle
                handleMouseDown={handleMouseDown}
              ></ResiziedHandle>
            </SideBar>
          </>
        )}
      </MiniDrawer>
    </Box>
  );
};

export default App;
