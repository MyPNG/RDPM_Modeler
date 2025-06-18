const { Directions } = require("@mui/icons-material");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");


// Roles Table 
const RoleSchema = new mongoose.Schema({
  role: String,
  children: { type: [String], default: [] },
  tasks: { type: [String], default: [] },
});
const Role = mongoose.model("Role", RoleSchema);

router.post("/", async (req, res) => {
  try {
    const role = new Role(req.body);
    const saved = await role.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to save role." });
  }
});

router.get("/", async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json({ message: "Role deleted", deletedRole });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete role" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // gibt das aktualisierte Dokument zurück
    );
    if (!updatedRole) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: "Failed to update role." });
  }
});


module.exports = router;
