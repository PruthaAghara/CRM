const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
    getAllInteractions,
    getInteractionById,
    createInteraction,
    updateInteraction,
    deleteInteraction
} = require("../controllers/interactionController");


router.get("/", protect, getAllInteractions);
router.get("/:id", protect, getInteractionById);
router.post("/", protect, createInteraction);
router.put("/:id", protect, updateInteraction);
router.delete("/:id", protect, deleteInteraction);

module.exports = router;