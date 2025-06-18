const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Table 2
const PerformanceProfileSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true, index: true },
    task: { type: String, required: true, index: true },
    count: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    minDuration: { type: Number, default: Infinity },
    maxDuration: { type: Number, default: 0 },
    avgDuration: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { indexes: [{ key: { resource: 1, task: 1 }, unique: true }] }
);

const PerformanceProfile = mongoose.model(
  "PerformanceProfile",
  PerformanceProfileSchema
);

router.post("/", async (req, res) => {
  try {
    const performanceProfile = new PerformanceProfile(req.body);
    const saved = await performanceProfile.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to save performanceProfile." });
  }
});

router.get("/", async (req, res) => {
  try {
    const performanceProfile = await PerformanceProfile.find();
    res.json(performanceProfile);
  } catch (error) {
    console.error("Error fetching performanceProfile:", error);
    res.status(500).json({ error: "Failed to fetch performanceProfile." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const performanceProfile = await PerformanceProfile.findByIdAndDelete(
      req.params.id
    );
    if (!performanceProfile) {
      return res.status(404).json({ error: "performanceProfile not found" });
    }
    res.json({ message: "performanceProfile deleted", performanceProfile });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete performanceProfile" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const performanceProfile = await PerformanceProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // gibt das aktualisierte Dokument zurück
    );
    if (!performanceProfile) {
      return res.status(404).json({ error: "performanceProfile not found" });
    }
    res.json(performanceProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update performanceProfile." });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { resource, task, duration } = req.body;
    if (!resource || !task || duration == null) {
      return res
        .status(400)
        .json({ error: "resource, task und duration erforderlich" });
    }

    // 1) Upsert: count++, totalDuration += duration, minDuration/$maxDuration anpassen
    const filter = { resource: resource, task: task };
    const update = {
      $inc: { count: 1, totalDuration: duration },
      $min: { minDuration: duration },
      $max: { maxDuration: duration },
      $set: { lastUpdated: new Date() },
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    // Finde das Profil (oder lege es an) und wende das Update an
    let profile = await PerformanceProfile.findOneAndUpdate(
      filter,
      update,
      options
    );

    // Wenn das Dokument gerade neu angelegt wurde (upsert), dann steht
    // initialer count=1, totalDuration=duration, minDuration=duration, maxDuration=duration:
    if (profile.count === 1 && !profile.avgDuration) {
      profile.avgDuration = duration;
      await profile.save();
      return res.json(profile);
    }

    // 2) Durchschnitt neu berechnen
    profile.avgDuration = profile.totalDuration / profile.count;
    await profile.save();

    // 3) Antworte mit dem aktualisierten Profil
    return res.status(200).json(profile);
  } catch (err) {
    console.error("Fehler in POST /api/performance/update:", err);
    return res
      .status(500)
      .json({ error: "Interner Serverfehler beim Profil-Update" });
  }
});

router.delete("/", async (req, res) => {
  try {
    await PerformanceProfile.deleteMany({});
    return res.json({ message: "All performance profile data deleted." });
  } catch (error) {
    console.error("Failed to delete all performance profile data:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete all performance profile data." });
  }
});

module.exports = router;
