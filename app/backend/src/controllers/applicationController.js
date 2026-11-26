const Application = require("../models/Application");
const { isObjectIdOrHexString } = require("mongoose");

const getApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 }).select("-healthHistory");

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error("Failed to fetch applications:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch applications"
        });
    }
};

const createApplication = async (req, res) => {
    try {
        const {
            name,
            version,
            environment,
            monitor = "none"
        } = req.body ?? {};

        if (typeof name !== "string" || !name.trim() || name.length > 100 ||
            typeof version !== "string" || !version.trim() || version.length > 50 ||
            !["development", "staging", "production"].includes(environment) ||
            !["none", "demo"].includes(monitor)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid name, version, environment and monitoring target."
            });
        }

        const application = await Application.create({
            name,
            version: version.trim(),
            environment,
            monitor
        });

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error("Failed to create application:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create application"
        });
    }
};

const getApplicationById = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid application ID." });
    }
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error("Failed to fetch application:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch application"
        });
    }
};

module.exports = {
    getApplications,
    createApplication,
    getApplicationById
};