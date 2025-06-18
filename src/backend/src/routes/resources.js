const { Directions } = require("@mui/icons-material");
const express = require("express");
const router = express.Router();
const js2xmlparser = require("js2xmlparser");
const mongoose = require("mongoose");

const changePatternSchema = new mongoose.Schema(
  {
    type: { type: String },
    newTask: { type: String },
    basetask: { type: String },
    direction: { type: String },
    bpmnElementId: { type: String },
  },
  { _id: false }
);

const cpModelerSchema = new mongoose.Schema({
  id: { type: Number }, 
  diagramXML: { type: String },
  changePatterns: [changePatternSchema],
}, { _id: false });

const ResourceSchema = new mongoose.Schema({
  resource: String,
  role: String,
  task: String,
  attributes: [{ name: String, value: String }],
  cpModelers: [cpModelerSchema],
});
ResourceSchema.index({ task: 1, role: 1 });

const Resource = mongoose.model("Resource", ResourceSchema);

router.post("/", async (req, res) => {
  try {
    const resource = new Resource(req.body);
    const saved = await resource.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to save resource." });
  }
});

router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Failed to fetch resources." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedResource = await Resource.findByIdAndDelete(req.params.id);
    if (!deletedResource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.json({ message: "Resource deleted", deletedResource });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // gibt das aktualisierte Dokument zurück
    );
    if (!updatedResource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.json(updatedResource);
  } catch (error) {
    res.status(500).json({ error: "Failed to update resource." });
  }
});

router.get("/byTasks", async (req, res) => {
  try {
    let tasks = req.query.tasks;
    if (!tasks) {
      return res
        .status(400)
        .json({ error: "Query parameter 'tasks' is required." });
    }

    if (typeof tasks === "string") {
      tasks = tasks.split(",").map((t) => t.trim());
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res
        .status(400)
        .json({ error: "Query parameter 'tasks' must be a comma-separated list." });
    }

    const matchingResources = await Resource.find({ task: { $in: tasks } });

    const processedTasks = tasks.map((taskName, index) => {
      const resourceProfiles = matchingResources
        .filter((r) => r.task === taskName)
        .map((resource) => {
          const attributesObj = (resource.attributes || []).reduce(
            (acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            },
            {}
          );

          const cpModelers = (resource.cpModelers || []).map((modeler) => {
            const changePatterns = (modeler.changePatterns || []).map((cp) => {
              let change;
              if (cp.direction) {
                change = {
                  "@": {
                    type: cp.type,
                    direction: cp.direction,
                  },
                  taskName: cp.basetask,
                };
                if (cp.direction === "parallel") {
                  change.parallelTask = cp.newTask;
                } else {
                  change.insertedTask = cp.newTask;
                }
              } else if (cp.type === "replace"){
                change = {
                  "@": { type: cp.type },
                  taskName: cp.basetask,
                };
                change.replacedByTask = cp.newTask;
              } else {
                change = {
                  "@": { type: cp.type },
                  taskName: cp.basetask || cp.newTask,
                };
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
          task_id: index + 1,
          label: taskName,
        },
        availableResources: { resourceProfile: resourceProfiles },
      };
    });

    const xmlOptions = {
      declaration: { encoding: "UTF-8" },
      format: {
        pretty: true,
        doubleQuotes: true,
        indent: "  ",
        newline: "\n",
      },
      cdataKeys: ["diagramXML"],
    };

    const xml = js2xmlparser.parse(
      "tasks",
      { task: processedTasks },
      xmlOptions
    );

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Error in /api/resources/byTasks:", err);
    res
      .status(500)
      .json({ error: "Server error when building resource profiles." });
  }
});

module.exports = router;
