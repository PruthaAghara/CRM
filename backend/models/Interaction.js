const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        // User who performed this interaction
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        interactionType: {
            type: String,
            enum: [
                "Call",
                "Email",
                "Meeting",
                "Note"
            ],
            required: true
        },

        interactionDate: {
            type: Date,
            required: true
        },

        subject: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            trim: true
        },

        primaryOption: {
            type: String,
            trim: true
        },

        callStatus: {
            type: String,
            trim: true
        },

        customerInterest: {
            type: String,
            trim: true
        },

        meetingStatus: {
            type: String,
            trim: true
        },

        salesConversation: {
            type: String,
            trim: true
        },

        digitalCommunicationStatus: {
            type: String,
            trim: true
        },

        verificationStatus: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Interaction", interactionSchema);