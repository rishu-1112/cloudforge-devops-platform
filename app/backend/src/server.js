require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const connectDB = require("./config/db");
const applicationRoutes = require("./routes/applicationRoutes");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy"
    });
});

const PORT = process.env.PORT || 5000;
connectDB();


app.listen(PORT, () => {
    console.log(`CloudForge backend running on port ${PORT}`);
});

app.use("/api/applications", applicationRoutes);