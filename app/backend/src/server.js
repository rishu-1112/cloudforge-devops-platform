require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");

const app = express();
const connectDB = require("./config/db");
const applicationRoutes = require("./routes/applicationRoutes");
const { startHealthMonitor } = require("./services/healthMonitor");

app.use(express.json());

app.get("/health", (req, res) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;

    if (isDatabaseConnected) {
        return res.status(200).json({
            status: "healthy",
            database: "connected"
        });
    }

    return res.status(503).json({
        status: "unhealthy",
        database: "disconnected"
    });
});

app.use("/api/applications", applicationRoutes);

connectDB().then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`CloudForge backend running on port ${port}`);
        startHealthMonitor(process.env.DEMO_HEALTH_URL);
    });
});
