const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
    {
        // Customer related to this follow-up
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        // User responsible for the follow-up
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Date and time of the follow-up
        followUpDate: {
            type: Date,
            required: true
        },

        // Reason for the follow-up
        purpose: {
            type: String,
            required: true,
            trim: true
        },

        // Follow-up progress
        status: {
            type: String,
            enum: [
                "Pending",
                "Completed",
                "Cancelled"
            ],
            default: "Pending"
        },

        // Additional follow-up result/option
        followUpOption: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("FollowUp", followUpSchema);