const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        // PASSWORD
        // Stores the hashed password.
        // IMPORTANT:
        // We will NEVER store the user's actual
        // password directly in MongoDB.
        // bcryptjs will hash the password before
        // saving it.
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: [
                "Administrator",
                "Manager",
                "Sales Executive"
            ],
            default: "Sales Executive"
        },

        // 5. ACCOUNT STATUS
        // Allows an administrator to activate or
        // deactivate a user's CRM account.
        status: {
            type: String,
            enum: [
                "Active",
                "Inactive"
            ],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);
module.exports = mongoose.model("User", userSchema);