const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} = require("../controllers/taskController");


router.get("/", protect, getAllTasks);
router.get("/:id", protect, getTaskById);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;