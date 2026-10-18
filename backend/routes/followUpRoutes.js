const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getAllFollowUps,
    getFollowUpById,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
} = require("../controllers/followUpController");


router.get("/", protect, getAllFollowUps);
router.get("/:id", protect, getFollowUpById);
router.post("/", protect, createFollowUp);
router.put("/:id", protect, updateFollowUp);
router.delete("/:id", protect, deleteFollowUp);

module.exports = router;