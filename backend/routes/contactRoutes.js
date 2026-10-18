const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
} = require("../controllers/contactController");

router.get("/", protect, getAllContacts);
router.get("/:id", protect, getContactById);
router.post("/", protect, createContact);
router.put("/:id", protect, updateContact);
router.delete("/:id", protect, deleteContact);

module.exports = router;