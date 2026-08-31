const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        version: {
            type: String,
            required: true
        },

        environment: {
            type: String,
            required: true,
            enum: ["development", "staging", "production"]
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },

        deploymentStatus: {
            type: String,
            enum: ["pending", "deployed", "failed"],
            default: "pending"
        },

        deploymentTime: {
            type: Date
        },

        healthStatus: {
            type: String,
            enum: ["healthy", "unhealthy", "unknown"],
            default: "unknown"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Application", applicationSchema);