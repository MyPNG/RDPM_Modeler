require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const resourceRoutes = require("./routes/resources");
const roleRoutes = require("./routes/roles");
const performanceRoutes = require("./routes/performances");
const performanceProfileRoutes = require("./routes/performanceProfile");
const resPerformanceProfileRoutes = require("./routes/resourcePerformanceProfile");
const config = require('../../config.json');
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

app.use(cors());
app.use(express.json()); 
app.use("/api/resources", resourceRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/performances", performanceRoutes);
app.use("/api/performanceProfiles", performanceProfileRoutes);
app.use("/api/resourcePerformanceProfile", resPerformanceProfileRoutes);

console.log("MONGO_URI is:", process.env.MONGO_URI); 

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.listen(NODE_SERVER_PORT, "localhost", () => {
  console.log(`Server running on http://localhost:${NODE_SERVER_PORT}`);
});