import React, { useRef, useEffect, useState, useCallback } from "react";
import BpmnModeler from "bpmn-js/dist/bpmn-modeler.production.min.js";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import {
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CustomPaletteProvider from "../CustomPaletteProvider";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";

import "./ReactBpmnModeler.css";

const customPaletteModule = {
  __init__: ["customPaletteProvider"],
  customPaletteProvider: ["type", CustomPaletteProvider],
  originalPaletteProvider: [
    "type",
    function (paletteProvider) {
      return paletteProvider;
    },
  ],
};

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const ReactBpmnModeler = ({
  patternId,
  diagramXML,
  cpModelers,
  setCpModelers,
  onSave,
  onDelete,
  taskName,
  onChange,
  colorFrame,
  onRemovePattern,
}) => {
  const containerRef = useRef(null);
  const bpmnModelerRef = useRef(null);
  //const paletteRef = useRef(null); // Palette ausblenden

  const [selectedElement, setSelectedElement] = useState(null);
  const [previewTasks, setPreviewTasks] = useState([]);
  const [previewConnections, setPreviewConnections] = useState([]);

  const [snackbarErrorOpen, setSnackbarErrorOpen] = useState(false);
  const [snackbarErrorMessage, setSnackbarErrorMessage] = useState("");

  //const [paletteVisible, setPaletteVisible] = useState(true);

  const diagramUrl = "/diagram.bpmn";

  const [paletteMode, setPaletteMode] = useState("default");
  const hasInitializedPalette = useRef(false);

  const [cpType, setCPType] = useState(0); // 1: Insert Before, 2: Insert After, 3: Insert Parallel

  useEffect(() => {
    if (!containerRef.current) return;
    bpmnModelerRef.current = new BpmnModeler({
      container: containerRef.current,
      //additionalModules: [customPaletteModule], // Palette ausblenden
    });

    const watermarkElement =
      containerRef.current.querySelector(".bjs-powered-by");
    if (watermarkElement) {
      watermarkElement.style.display = "none"; // Hide the element
    }

    /** Palette ausblenden
    // Palette nach importXML einmalig finden und merken
    paletteRef.current = containerRef.current?.querySelector(".djs-palette");
    if (paletteRef.current && !hasInitializedPalette.current) {
      paletteRef.current.style.display = "block";
      //setPaletteVisible(true);
      hasInitializedPalette.current = true;
    }
     */

    let timeout;
    const loadDiagram = async () => {
      try {
        timeout = setTimeout(async () => {
          try {
            let bpmnXML;
            if (diagramXML) {
              bpmnXML = diagramXML;
            } else {
              const response = await fetch(diagramUrl);
              bpmnXML = await response.text();
            }
            await bpmnModelerRef.current.importXML(bpmnXML);

            const eventBus = bpmnModelerRef.current.get("eventBus");
            eventBus.on("commandStack.changed", () => {
              onChange?.(patternId); // Parent informieren über Änderung
            });

            //bpmnModelerRef.current.get("canvas").zoom("fit-viewport");
          } catch (error) {
            console.error("Failed to load BPMN diagram:", error);
          }
        }, 100);

        // update existing task name if needed
        bpmnModelerRef.current.get("eventBus").once("import.done", () => {
          const elementRegistry = bpmnModelerRef.current.get("elementRegistry");
          const modeling = bpmnModelerRef.current.get("modeling");

          const existingTask = elementRegistry.get("Activity_1eot89e");

          if (taskName && existingTask) {
            modeling.updateProperties(existingTask, { name: taskName });
          }

          //bpmnModelerRef.current.get("canvas").zoom("fit-viewport");
        });

        const eventBus = bpmnModelerRef.current.get("eventBus");

        // Use single-click to select a task and optionally activate direct editing
        eventBus.on("element.click", (e) => {
          if (e.element.type === "bpmn:Task") {
            setSelectedElement(e.element);
            const directEditing = bpmnModelerRef.current.get("directEditing");
            directEditing.activate(e.element);
          } else {
            setSelectedElement(null);
          }
        });

        eventBus.on("directEditing.complete", () => {
          onChange?.(patternId); // Notify parent that a change happened
        });

        eventBus.on("directEditing.activate", () => {
          onChange?.(patternId);
        });

        // wird getriggert jedes Mal wenn ein Element gelöscht wird (auf BPMN-Basis), hindert tote Referenz
        eventBus.on("commandStack.elements.delete.preExecute", (e) => {
          const modeling = bpmnModelerRef.current.get("modeling");
          const { elements } = e.context;

          elements.forEach((element) => {
            if (element.type === "bpmn:Task") {
              element.incoming?.forEach((connection) => {
                modeling.removeConnection(connection);
              });

              element.outgoing?.forEach((connection) => {
                modeling.removeConnection(connection);
              });
            }
          });

          // Selektiertes Element zurücksetzen, wenn es gelöscht wurde
          if (
            selectedElement &&
            elements.some((el) => el.id === selectedElement.id)
          ) {
            setSelectedElement(null);
          }
        });

        // Prevent the default context menu inside the BPMN container
        containerRef.current.addEventListener("contextmenu", (e) => {
          e.preventDefault();
        });
      } catch (error) {
        console.error("Failed to load BPMN diagram:", error);
      }
    };

    loadDiagram();

    return () => {
      clearTimeout(timeout);
      bpmnModelerRef.current?.destroy();
      bpmnModelerRef.current = null;
    };
  }, [diagramXML]);

  useEffect(() => {
    if (!bpmnModelerRef.current || !taskName) return;
    const timeout = setTimeout(() => {
      const task = bpmnModelerRef.current
        .get("elementRegistry")
        ?.get("Activity_1eot89e");
      if (task) {
        bpmnModelerRef.current
          .get("modeling")
          ?.updateProperties(task, { name: taskName });
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [taskName]);

  useEffect(() => {
    if (!bpmnModelerRef.current) return;
    const eventBus = bpmnModelerRef.current.get("eventBus");

    function handleCoreDelete(evt) {
      const { elements } = evt.context;
      elements.forEach((el) => {
        // only if the deleted shape was one of our change-patterns:
        onRemovePattern?.(patternId, el.id);
      });
    }

    // BPMN fires this after its own delete “core” command runs
    eventBus.on("commandStack.elements.delete.postExecute", handleCoreDelete);

    return () => {
      eventBus.off(
        "commandStack.elements.delete.postExecute",
        handleCoreDelete
      );
    };
  }, [patternId, onRemovePattern]);

  /** Palette ausblenden
  // Palette via Ref toggeln
  useEffect(() => {
    if (paletteRef.current) {
      paletteRef.current.style.display = paletteVisible ? "block" : "none";
    }
  }, [paletteVisible]);
  */

  /** Palette ausblenden
  const togglePaletteVisibility = () => {
    setPaletteVisible((prev) => !prev);
  };
   */

  // Show a preview BPMN Task shape on hover
  const showBpmnPreview = (action) => {
    if (!selectedElement) {
      //console.error("No task selected for insert");
      //setSnackbarErrorMessage("Please click on a task first");
      //setSnackbarErrorOpen(true);
      return;
    }

    removeBpmnPreview();
    const modeling = bpmnModelerRef.current.get("modeling");
    const elementRegistry = bpmnModelerRef.current.get("elementRegistry");

    const baseTask = elementRegistry.get(selectedElement.id);

    if (!baseTask) {
      setSnackbarErrorMessage("Please click on a task first");
      setSnackbarErrorOpen(true);
      return;
    }
    const parentElement =
      baseTask.parent || bpmnModelerRef.current.get("canvas").getRootElement();

    let xPos, yPos, colorFill, colorStroke;

    switch (action) {
      case "insert before":
        xPos = baseTask.x - baseTask.width;
        yPos = baseTask.y + baseTask.height / 2;
        colorStroke = "#75c999";
        colorFill = "#fff";
        break;
      case "insert after":
        xPos = baseTask.x + baseTask.width * 2;
        yPos = baseTask.y + baseTask.height / 2;
        colorStroke = "#75c999";
        colorFill = "#fff";
        break;
      case "insert parallel":
        xPos = baseTask.x + baseTask.width / 2;
        yPos = baseTask.y + baseTask.height * 2;
        colorStroke = "#75c999";
        colorFill = "#fff";
        break;
      case "replace":
        xPos = baseTask.x + baseTask.width / 2;
        yPos = baseTask.y + baseTask.height * 2;
        colorStroke = "#fad59b";
        colorFill = "#fff";
        break;
      case "delete":
        xPos = baseTask.x + baseTask.width / 2;
        yPos = baseTask.y + baseTask.height / 2;
        colorStroke = "#f1948a";
        colorFill = "#f6beb8";
        break;
      default:
        xPos = baseTask.x + baseTask.width;
        yPos = baseTask.y;
        colorFill = "#d1f2eb";
        colorStroke = "#1abc9c";
        break;
    }

    // Create a BPMN task preview at the right position
    const newPreview = modeling.createShape(
      { type: "bpmn:Task", name: "New Task" },
      {
        x: xPos,
        y: yPos,
      },
      parentElement
    );

    // Style the preview shape like BPMN tasks
    modeling.setColor(newPreview, {
      fill: colorFill,
      stroke: colorStroke,
    });
    if (action === "insert after") {
      const connection = modeling.connect(baseTask, newPreview);
      modeling.setColor(connection, { stroke: colorStroke });
    } else if (action === "insert before") {
      const connection = modeling.connect(newPreview, baseTask);
      modeling.setColor(connection, { stroke: colorStroke });
    } else if (action === "replace") {
      const downConnection = modeling.connect(baseTask, newPreview);
      const upConnection = modeling.connect(newPreview, baseTask);

      modeling.updateWaypoints(downConnection, [
        { x: baseTask.x + baseTask.width / 3, y: baseTask.y + baseTask.height },
        { x: newPreview.x + newPreview.width / 3, y: newPreview.y },
      ]);

      modeling.updateWaypoints(upConnection, [
        { x: newPreview.x + (newPreview.width * 2) / 3, y: newPreview.y },
        {
          x: baseTask.x + (baseTask.width * 2) / 3,
          y: baseTask.y + baseTask.height,
        },
      ]);
      modeling.setColor(downConnection, { stroke: "#fad59b" });
      modeling.setColor(upConnection, { stroke: "#fad59b" });
      setPreviewConnections((prev) => [...prev, downConnection]);
    } else if (action === "insert parallel") {
      // create gateways for parallel cp
      const dummySource = modeling.createShape(
        { type: "bpmn:Task", name: "dummySource" },
        { x: baseTask.x - baseTask.width, y: baseTask.y + baseTask.height * 2 },
        parentElement
      );
      modeling.setColor(dummySource, {
        fill: "#fff",
        stroke: "#000",
        text: "#000000",
      });
      modeling.updateProperties(dummySource, { name: "..." });

      // Create a dummy target node below the parallel task
      const dummyTarget = modeling.createShape(
        { type: "bpmn:Task", name: "dummyTarget" },
        {
          x: baseTask.x + baseTask.width * 2,
          y: baseTask.y + baseTask.height * 2,
        },
        parentElement
      );
      modeling.setColor(dummyTarget, {
        fill: "#fff",
        stroke: "#000",
        text: "#000000",
      });
      modeling.updateProperties(dummyTarget, { name: "..." });

      const connection1 = modeling.connect(dummySource, newPreview);
      const connection2 = modeling.connect(newPreview, dummyTarget);
      modeling.setColor(dummySource, { stroke: "#e5e5e5" });
      modeling.setColor(dummyTarget, { stroke: "#e5e5e5" });
      modeling.setColor(connection1, { stroke: "#e5e5e5" });
      modeling.setColor(connection2, { stroke: "#e5e5e5" });

      setPreviewTasks((prev) => [...prev, dummySource, dummyTarget]);
    }

    setPreviewTasks((prevPreviews) => [...prevPreviews, newPreview]);
  };

  // Function to remove preview task when mouse leaves
  const removeBpmnPreview = () => {
    if (previewTasks.length > 0 && bpmnModelerRef.current) {
      const modeling = bpmnModelerRef.current.get("modeling");
      previewTasks.forEach((preview) => {
        // Nur löschen, wenn es einen Parent gibt (Element im Diagramm)
        if (preview?.parent) {
          modeling.removeShape(preview);
        }
      });
      setPreviewTasks([]);
    }

    if (previewConnections.length > 0 && bpmnModelerRef.current) {
      const modeling = bpmnModelerRef.current.get("modeling");
      previewConnections.forEach((connection) => {
        if (connection?.parent) {
          modeling.removeConnection(connection);
        }
      });
      setPreviewConnections([]);
    }
  };

  

  // Helper function to update a change pattern with the new type and details
  const updateChangePattern = (newData) => {
    setCpModelers((prev) =>
      prev.map((cp) =>
        cp.id === patternId
          ? {
              ...cp,
              changePatterns: [
                ...(cp.changePatterns || []),
                {
                  bpmnElementId: newData.bpmnElementId || "",
                  type: newData.type || "",
                  direction: newData.direction || "",
                  basetask: newData.basetask || "",
                  newTask: newData.newTask || "",
                },
              ],
            }
          : cp
      )
    );
  };

  // Insert: Creates a new task to the right of the selected task.
  const handleInsertAfter = () => {
    if (!selectedElement) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }

    removeBpmnPreview();
    const modeling = bpmnModelerRef.current.get("modeling");
    const elementRegistry = bpmnModelerRef.current.get("elementRegistry");

    const baseTask = elementRegistry.get(selectedElement.id);

    if (!baseTask) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }
    const parentElement =
      baseTask.parent || bpmnModelerRef.current.get("canvas").getRootElement();
    const newTask = modeling.createShape(
      {
        type: "bpmn:Task",
        name: "New Task",
      },
      {
        x: baseTask.x + baseTask.width * 2,
        y: baseTask.y + baseTask.height / 2, // Align vertically
      },
      parentElement
    );

    // Check if the base task already has an outgoing connection, If yes -> Remove and connect new task with child element of basetask 8can be a gateway or a task element!)
    (((cpType == 2 || cpType == 3) && baseTask.outgoing) || []).forEach(
      (connection) => {
        // InsertAfter or InsertParallel was done before?
        const childOfBT = connection.target;
        modeling.removeConnection(connection);
        modeling.connect(newTask, childOfBT);
      }
    );

    try {
      modeling.connect(baseTask, newTask);
      setTimeout(() => {
        modeling.setColor(newTask, { fill: "#82e0aa" });
      }, 0);
      modeling.updateProperties(newTask, {
        name: "Inserted New Task",
      });

      newTask.businessObject.customType = "insert";
      newTask.businessObject.customDirection = "after";
      newTask.businessObject.customBaseTask =
        selectedElement?.businessObject?.name || "";

      updateChangePattern({
        bpmnElementId: newTask.id,
        type: "insert",
        direction: "after",
        basetask: selectedElement.businessObject.name,
        newTask: newTask.businessObject.name,
      });
    } catch (err) {
      console.error("Could not insert new task: ", err);
    }

    setCPType(2);
  };

  const handleInsertParallel = () => {
    if (!selectedElement) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }

    removeBpmnPreview();
    const modeling = bpmnModelerRef.current.get("modeling");
    const elementRegistry = bpmnModelerRef.current.get("elementRegistry");
    const baseTask = elementRegistry.get(selectedElement.id);

    if (!baseTask) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }
    const parentElement =
      baseTask.parent || bpmnModelerRef.current.get("canvas").getRootElement();

    // Create the parallel task below the base task
    const parallelTask = modeling.createShape(
      { type: "bpmn:Task", name: "New Parallel Task" },
      {
        x: baseTask.x + baseTask.width / 2,
        y: baseTask.y + baseTask.height * 2,
      },
      parentElement
    );

    // parallel gateway start
    const gateway1 = modeling.createShape(
      { type: "bpmn:ParallelGateway", name: "Fork" },
      {
        x: baseTask.x - baseTask.width / 2,
        y: (baseTask.y + parallelTask.y + parallelTask.height) / 2,
      },
      parentElement
    );

    // parallel gateway end
    const gateway2 = modeling.createShape(
      { type: "bpmn:ParallelGateway", name: "Join" },
      {
        x: baseTask.x + baseTask.width * 1.5,
        y: (baseTask.y + parallelTask.y + parallelTask.height) / 2,
      },
      parentElement
    );

    (((cpType == 1 || cpType == 2) && baseTask.incoming) || []).forEach(
      (connection) => {
        // InsertBefore or InsertAfter was done?
        const parentOfBT = connection.source;
        modeling.removeConnection(connection);
        modeling.connect(parentOfBT, gateway1);
      }
    );

    (baseTask.outgoing || []).forEach((connection) => {
      const child = connection.target;
      modeling.removeConnection(connection);
      modeling.connect(gateway2, child);
    });

    // connect gateway to parallel and base tasks
    modeling.connect(gateway1, baseTask, {
      type: "bpmn:SequenceFlow",
    });
    modeling.connect(gateway1, parallelTask, { type: "bpmn:SequenceFlow" });

    // connect parallel and base tasks to gateway
    modeling.connect(baseTask, gateway2, {
      type: "bpmn:SequenceFlow",
    });
    modeling.connect(parallelTask, gateway2, { type: "bpmn:SequenceFlow" });

    // colour stuff for parallel task
    modeling.setColor(parallelTask, { fill: "#82e0aa", stroke: "" });
    modeling.updateProperties(parallelTask, { name: "Parallel Task" });

    // for change pattern output (in XML)
    parallelTask.businessObject.customType = "insert";
    parallelTask.businessObject.customDirection = "parallel";
    parallelTask.businessObject.customBaseTask =
      selectedElement?.businessObject?.name || "";

    updateChangePattern({
      bpmnElementId: parallelTask.id,
      type: "insert",
      direction: "parallel",
      basetask: selectedElement.businessObject.name,
      newTask: parallelTask.businessObject.name,
    });

    setCPType(3);
  };

  const handleInsertBefore = () => {
    if (!selectedElement) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }

    removeBpmnPreview();
    const modeling = bpmnModelerRef.current.get("modeling");
    const elementRegistry = bpmnModelerRef.current.get("elementRegistry");

    const baseTask = elementRegistry.get(selectedElement.id);

    if (!baseTask) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }
    const parentElement =
      baseTask.parent || bpmnModelerRef.current.get("canvas").getRootElement();
    const newTask = modeling.createShape(
      {
        type: "bpmn:Task",
        name: "New Task",
      },
      {
        x: baseTask.x - baseTask.width,
        y: baseTask.y + baseTask.height / 2,
      },
      parentElement
    );

    (((cpType == 1 || cpType == 3) && baseTask.incoming) || []).forEach(
      (connection) => {
        // an InsertBefore or InsertParallel happened before?
        const parent = connection.source;
        modeling.removeConnection(connection);
        modeling.connect(parent, newTask);
      }
    );

    try {
      modeling.connect(newTask, baseTask);
      setTimeout(() => {
        modeling.setColor(newTask, { fill: "#82e0aa" });
        modeling.updateProperties(newTask, { name: "Inserted New Task" });

        newTask.businessObject.customType = "insert";
        newTask.businessObject.customDirection = "before";
        newTask.businessObject.customBaseTask =
          selectedElement?.businessObject?.name || "";
      }, 0);

      updateChangePattern({
        bpmnElementId: newTask.id,
        type: "insert",
        direction: "before",
        basetask: selectedElement.businessObject.name,
        newTask: newTask.businessObject.name,
      });
    } catch (err) {
      console.error("Could not insert new task: ", err);
    }

    setCPType(1);
  };

  const handleReplace = () => {
    if (!selectedElement) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }

    removeBpmnPreview();
    const modeling = bpmnModelerRef.current.get("modeling");
    const elementRegistry = bpmnModelerRef.current.get("elementRegistry");

    const baseTask = elementRegistry.get(selectedElement.id);
    if (!baseTask) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }
    const parentElement =
      baseTask.parent || bpmnModelerRef.current.get("canvas").getRootElement();
    const newTask = modeling.createShape(
      {
        type: "bpmn:Task",
        name: "New Task",
      },
      {
        x: baseTask.x + baseTask.width / 2,
        y: baseTask.y + baseTask.height * 2,
      },
      parentElement
    );

    const downConnection = modeling.connect(baseTask, newTask);
    const upConnection = modeling.connect(newTask, baseTask);

    modeling.updateWaypoints(downConnection, [
      { x: baseTask.x + baseTask.width / 3, y: baseTask.y + baseTask.height },
      { x: newTask.x + newTask.width / 3, y: newTask.y },
    ]);

    modeling.updateWaypoints(upConnection, [
      { x: newTask.x + (newTask.width * 2) / 3, y: newTask.y },
      {
        x: baseTask.x + (baseTask.width * 2) / 3,
        y: baseTask.y + baseTask.height,
      },
    ]);
    modeling.updateProperties(newTask, { name: "Replacement Task" });

    newTask.businessObject.customType = "replace";
    //newTask.businessObject.customDirection = "after";
    newTask.businessObject.customBaseTask =
      selectedElement?.businessObject?.name || "";

    updateChangePattern({
      bpmnElementId: newTask.id,
      type: "replace",
      basetask: selectedElement.businessObject.name,
      newTask: newTask.businessObject.name,
    });

    modeling.setColor(newTask, { fill: "#f8c471" });
  };

  const handleDelete = () => {
    if (!selectedElement) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }

    removeBpmnPreview();
    const modeling = bpmnModelerRef.current.get("modeling");
    const elementRegistry = bpmnModelerRef.current.get("elementRegistry");
    const baseTask = elementRegistry.get(selectedElement.id);

    if (!baseTask) {
      setSnackbarErrorMessage("Please select a task first");
      setSnackbarErrorOpen(true);
      return;
    }

    const parentElement =
      baseTask.parent || bpmnModelerRef.current.get("canvas").getRootElement();

    const newTask = modeling.createShape(
      { type: "bpmn:Task", text: "Delete" },
      {
        x: baseTask.x + baseTask.width/2,
        y: baseTask.y - baseTask.height ,
      },
      parentElement
    );

    try {
      modeling.connect(baseTask, newTask, {
        type: "bpmn:Association",
      });
      setTimeout(() => {
        modeling.setColor(newTask, {
          fill: "#f1948a",
        });
        modeling.updateProperties(newTask, { name: baseTask.businessObject.name});

        newTask.businessObject.customType = "delete";
        newTask.businessObject.customBaseTask =
          selectedElement?.businessObject?.name || "";
      }, 0);

      updateChangePattern({
        bpmnElementId: newTask.id,
        type: "delete",
        basetask: selectedElement.businessObject.name,
        newTask: newTask.businessObject.name,
      });
    } catch (err) {
      console.error("Could not insert new task: ", err);
    }
  };

  /** Palette ausblenden
   const hidePalette = () => {
    if (paletteRef.current) {
      //console.log("HIDEPALETTE triggered!");
      paletteRef.current.style.display = "none";
    }
    setPaletteVisible(false);
  };
   */

  // Save the current BPMN XML.
  const handleSave = async () => {
    try {
      const directEditing = bpmnModelerRef.current.get("directEditing");
      if (directEditing && directEditing._active) {
        directEditing.complete();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // setPaletteVisible(true); Palette ausblenden

      const modeler = bpmnModelerRef.current;
      const { xml } = await modeler.saveXML({ format: true });

      const elementRegistry = modeler.get("elementRegistry");

      // update the name of the task (e.g. because the user gives task new name)
      setCpModelers((prev) =>
        prev.map((cp) => {
          if (cp.id !== patternId) {
            console.log("cp.id !== patternId:", cp.id !== patternId);
            return cp;
          }

          return {
            ...cp,
            changePatterns: cp.changePatterns.map((pattern) => {
              const shape = elementRegistry.get(pattern.bpmnElementId);

              if (!shape) {
                console.log("This bpmn element ID does not exist here:");
                return pattern;
              }
              const bo = shape.businessObject;

              console.log("shape:", shape);
              console.log("businessObject of shape", bo);
              console.log("Pattern:", {
                bpmnElementId: pattern.bpmnElementId,
                name: pattern.name,
                type: pattern.type,
                direction: pattern.direction,
                basetask: pattern.basetask,
              });
              console.log("Business Object:", {
                id: bo.id,
                name: bo.name,
                customType: bo.customType,
                customDirection: bo.customDirection,
                customBaseTask: bo.customBaseTask,
                type: bo.$type,
              });

              if (pattern.bpmnElementId === bo.id) {
                return {
                  ...pattern,
                  newTask:
                    bo.customType === "delete" ? "" : bo.name || "no name",
                };
              }
              console.log(
                "Pattern bpmnElementId and bo id are not the same. pattern.bpmnElementId: ",
                pattern.bpmnElementId,
                "and bo.id:",
                bo.id
              );
              return pattern;
            }),
          };
        })
      );

      // Jetzt speichern
      onSave(xml);
    } catch (error) {
      console.error("Failed to save BPMN diagram:", error);
    }
  };

  const handleSetColor = (color) => {
    if (selectedElement) {
      const modeling = bpmnModelerRef.current.get("modeling");
      modeling.setColor(selectedElement, { stroke: "#000000", fill: color });
    }
    // setMenuAnchor(null);
  };

  //let rightPos = paletteVisible ? 120 : 20;

  return (
    <div>
      <div
        style={{
          position: "relative", // Make this container the positioning context
          height: "42vh",
          width: "100%",
          border: `1px solid ${colorFrame}`,
          marginBottom: "10px",
        }}
      >
        {/* Button to toggle the palette */}
        {/* Palette ausblenden <div
          style={{
            position: "absolute",
            top: 20,
            right: rightPos, // place the button 100px left of the palette
            zIndex: 10, // Ensure it appears above other elements
          }}
        >
          <IconButton onClick={togglePaletteVisibility}>
            {paletteVisible ? <CloseIcon /> : <MenuOpenIcon />}
          </IconButton>
        </div> */}

        <div
          ref={containerRef}
          style={{
            height: "100%",
            width: "100%",
          }}
        ></div>
        {/* Fixed buttons positioned relative to the change pattern window */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            display: "flex",
            flexDirection: "column", // Arrange vertically
            gap: "10px",
            background: "rgba(255,255,255,0.9)",
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {paletteMode === "default" ? (
            <>
              {/* Insert Button */}
              <Tooltip title="Insert" arrow enterDelay={1000} placement="top">
                <IconButton
                  onClick={() => setPaletteMode("insert")}
                  style={{ color: "#82e0aa" }}
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>

              {/* Delete Button */}
              <Tooltip
                title="Delete"
                arrow
                enterDelay={1000}
                placement="top-end"
              >
                <IconButton
                  onMouseEnter={() => showBpmnPreview("delete")}
                  onMouseLeave={removeBpmnPreview}
                  onClick={handleDelete}
                  style={{ color: "#f1948a" }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>

              {/* Replace Button */}
              <Tooltip
                title="Replace"
                arrow
                enterDelay={1000}
                placement="top-end"
              >
                <IconButton
                  onMouseEnter={() => showBpmnPreview("replace")}
                  onMouseLeave={removeBpmnPreview}
                  onClick={handleReplace}
                  style={{ color: "#f8c471" }}
                >
                  <SwapHorizIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              {/* In Insert Mode: Show the three insert options and a Back button */}
              <Tooltip title="Insert Before" arrow enterDelay={500}>
                <IconButton
                  onMouseEnter={() => showBpmnPreview("insert before")}
                  onMouseLeave={removeBpmnPreview}
                  onClick={handleInsertBefore}
                  style={{ color: "#82e0aa" }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert After" arrow enterDelay={500}>
                <IconButton
                  onMouseEnter={() => showBpmnPreview("insert after")}
                  onMouseLeave={removeBpmnPreview}
                  onClick={handleInsertAfter}
                  style={{ color: "#82e0aa" }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert Parallel" arrow enterDelay={500}>
                <IconButton
                  onMouseEnter={() => showBpmnPreview("insert parallel")}
                  onMouseLeave={removeBpmnPreview}
                  onClick={handleInsertParallel}
                  style={{ color: "#82e0aa" }}
                >
                  <CallSplitIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Back" arrow enterDelay={500}>
                <IconButton
                  onClick={() => setPaletteMode("default")}
                  style={{ color: "#000" }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Snackbar
            open={snackbarErrorOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarErrorOpen(false)}
            TransitionComponent={SlideTransition}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbarErrorOpen(false)}
              severity="error"
              sx={{ width: "100%" }}
            >
              {snackbarErrorMessage}
            </Alert>
          </Snackbar>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <Button onClick={handleSave} variant="contained" size="small">
          Save
        </Button>
        <Button
          onClick={onDelete}
          variant="text"
          style={{ color: "#990000" }}
          size="small"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default React.memo(ReactBpmnModeler);
