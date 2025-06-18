const { Directions } = require("@mui/icons-material");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Table 1
const PerformanceSchema = new mongoose.Schema(
  {
    meta: {
      case_id: { type: String, required: true },
      task_name: { type: String, required: true },
      resource_name: { type: String, required: true },
    },
    start_time: { type: Date, required: true },
    complete_time: { type: Date, required: true },
    duration: { type: Number, required: true },
  },
  {
    // Tell MongoDB to make this a time-series collection:
    timeseries: {
      timeField: "complete_time",
      metaField: "meta",
      granularity: "seconds",
    },
  }
);
const Performance = mongoose.model("Performance", PerformanceSchema);

Performance.createCollection()
  .then(() => console.log("Time-series collection ready"))
  .catch(console.error);

router.post("/", async (req, res) => {
  try {
    const performance = new Performance(req.body);
    const saved = await performance.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to save performance data." });
  }
});

router.get("/", async (req, res) => {
  try {
    const performances = await Performance.find();
    res.json(performances);
  } catch (error) {
    console.error("Error fetching performance data:", error);
    res.status(500).json({ error: "Failed to fetch performance data." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedPerformanceData = await Performance.findByIdAndDelete(
      req.params.id
    );
    if (!deletedPerformanceData) {
      return res.status(404).json({ error: "Performance data not found" });
    }
    res.json({ message: "Performance data ", deletedPerformanceData });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Performance data." });
  }
});
router.delete("/", async (req, res) => {
    try {
      await Performance.deleteMany({});
      return res.json({ message: "All performance data deleted." });
    } catch (error) {
      console.error("Failed to delete all performance data:", error);
      return res.status(500).json({ error: "Failed to delete all performance data." });
    }
  });

router.put("/:id", async (req, res) => {
  try {
    const updatedPerformanceData = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // gibt das aktualisierte Dokument zurück
    );
    if (!updatedPerformanceData) {
      return res.status(404).json({ error: "Performance data not found" });
    }
    res.json(updatedPerformanceData);
  } catch (error) {
    res.status(500).json({ error: "Failed to update Performance data." });
  }
});

module.exports = router;
