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

module.exports = {
    getApplications
};