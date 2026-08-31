const express = require("express");

const {
    getApplications,
    createApplication,
    getApplicationById
} = require("../controllers/applicationController");

const router = express.Router();

router.get("/", getApplications);
router.post("/", createApplication);
router.get("/:id", getApplicationById);

module.exports = router;