const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
} = require("../controllers/customerController");

router.get("/", protect, getAllCustomers);
router.get("/:id", protect, getCustomerById);
router.post("/", protect, createCustomer);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);

module.exports = router;