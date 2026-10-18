const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        // User who created this contact
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        contactName: {
            type: String,
            required: true,
            trim: true
        },

        designation: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Contact", contactSchema);