const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Table 3
const ResourcePerformanceProfileSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true, index: true },
    count: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    minDuration: { type: Number, default: Infinity },
    maxDuration: { type: Number, default: 0 },
    avgDuration: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { indexes: [{ key: { resource: 1 }, unique: true }] }
);

const ResourcePerformanceProfile = mongoose.model(
  "ResourcePerformanceProfile",
  ResourcePerformanceProfileSchema
);

router.post("/", async (req, res) => {
  try {
    const resPerformanceProfile = new ResourcePerformanceProfile(req.body);
    const saved = await resPerformanceProfile.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to save resPerformanceProfile." });
  }
});

router.get("/", async (req, res) => {
  try {
    const resPerformanceProfile = await ResourcePerformanceProfile.find();
    res.json(resPerformanceProfile);
  } catch (error) {
    console.error("Error fetching resPerformanceProfile:", error);
    res.status(500).json({ error: "Failed to fetch resPerformanceProfile." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const resPerformanceProfile =
      await ResourcePerformanceProfile.findByIdAndDelete(req.params.id);
    if (!resPerformanceProfile) {
      return res.status(404).json({ error: "resPerformanceProfile not found" });
    }
    res.json({
      message: "resPerformanceProfile deleted",
      resPerformanceProfile,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete resPerformanceProfile" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const resPerformanceProfile =
      await ResourcePerformanceProfile.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true } // gibt das aktualisierte Dokument zurück
      );
    if (!resPerformanceProfile) {
      return res.status(404).json({ error: "resPerformanceProfile not found" });
    }
    res.json(resPerformanceProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update resPerformanceProfile." });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { resource, count, duration, minDuration, maxDuration } = req.body;
    if (!resource || count == null || duration == null || minDuration == null || maxDuration == null ) {
      return res
        .status(400)
        .json({ error: "resource und duration erforderlich" });
    }

    const filter = { resource };
    const update = {
      $inc: {
        count: count,
        totalDuration: duration,
      },
      $min: { minDuration: minDuration },
      $max: { maxDuration: maxDuration },
      $set: { lastUpdated: new Date() },
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    let profile = await ResourcePerformanceProfile.findOneAndUpdate(
      filter,
      update,
      options
    );

    profile.avgDuration = profile.totalDuration / profile.count;
    await profile.save();

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
    await ResourcePerformanceProfile.deleteMany({});
    return res.json({
      message: "All resource performance profile data deleted.",
    });
  } catch (error) {
    console.error(
      "Failed to delete all resource performance profile data:",
      error
    );
    return res
      .status(500)
      .json({
        error: "Failed to delete all resource performance profile data.",
      });
  }
});

module.exports = router;
