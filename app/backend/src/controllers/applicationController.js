const Application = require("../models/Application");

const getApplications = async (req, res) => {
    try {
        const applications = await Application.find();

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
            environment
        } = req.body;

        if (!name || !version || !environment) {
            return res.status(400).json({
                success: false,
                message: "name, version and environment are required"
            });
        }

        const application = await Application.create({
            name,
            version,
            environment
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