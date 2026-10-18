const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createUser,
    getAllUsers,
    getSalesExecutives,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/userController");

// Sales Executives dropdown for Administrator and Manager
router.get("/sales-executives", protect, roleMiddleware("Administrator", "Manager"), getSalesExecutives);

//Admin can only do this 
router.post( "/", protect, roleMiddleware("Administrator"), createUser );
router.get("/",protect,roleMiddleware("Administrator"),getAllUsers);
router.get("/:id",protect,roleMiddleware("Administrator"),getUserById);
router.put("/:id",protect,roleMiddleware("Administrator"),updateUser);
router.delete("/:id",protect,roleMiddleware("Administrator"),deleteUser);

module.exports = router;