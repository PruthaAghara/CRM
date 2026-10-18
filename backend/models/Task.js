const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        
        // 1. TASK ASSIGNEE
        // Stores the user/person responsible for
        // completing this task.
        //
        // We keep this as an ObjectId because later,
        // when we build User Authentication, this can
        // reference a User from the User collection.
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Short name of the task
        // Example:
        // "Call ABC Ltd"
        // "Send quotation"
        // "Verify customer documents"
        taskTitle: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        dueDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "In Progress",
                "Completed",
                "Cancelled"
            ],
            default: "Pending"
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);