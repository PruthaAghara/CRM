const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required"
            });
        }

        // Check whether the role is allowed
        const allowedRoles = [
            "Administrator",
            "Manager",
            "Sales Executive"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Check whether email is already registered
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Never send password back in response
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
};

// GET SALES EXECUTIVES
const getSalesExecutives = async (req, res) => {
    try {
        const salesExecutives = await User.find({
            role: "Sales Executive"
        }).select("_id name email role status");

        res.status(200).json(salesExecutives);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get sales executives",
            error: error.message
        });
    }
};


// GET USER BY ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get user",
            error: error.message
        });
    }
};


// UPDATE USER
const updateUser = async (req, res) => {
    try {
        const { name, email, role, status } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                role,
                status
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: user
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update user",
            error: error.message
        });
    }
};


// DELETE USER
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};


module.exports = {
    createUser,
    getAllUsers,
    getSalesExecutives,
    getUserById,
    updateUser,
    deleteUser
};