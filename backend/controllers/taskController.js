const mongoose = require("mongoose");

const Task = require("../models/Task");
const User = require("../models/User");


// GET ALL TASKS
const getAllTasks = async (req, res) => {
    try {

        let query = {};

        // SALES EXECUTIVE CAN ONLY SEE THEIR OWN TASKS
        if (req.user.role === "Sales Executive") {
            query.assignedTo = req.user.userId;
        }

        // OPTIONAL STATUS FILTER
        if (req.query.status) {
            query.status = req.query.status;
        }

        // UPCOMING TASKS
        if (req.query.upcoming === "true") {
            query.dueDate = {
                $gte: new Date()
            };

            query.status = {
                $ne: "Completed"
            };
        }

        // OVERDUE TASKS
        if (req.query.overdue === "true") {
            query.dueDate = {
                $lt: new Date()
            };

            query.status = {
                $nin: ["Completed", "Cancelled"]
            };
        }

        const tasks = await Task.find(query)
            .populate(
                "assignedTo",
                "name email role"
            )
            .sort({
                dueDate: 1
            });

        res.status(200).json(tasks);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get tasks",
            error: error.message
        });

    }
};


// GET TASK BY ID
const getTaskById = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findById(req.params.id)
            .populate(
                "assignedTo",
                "name email role"
            );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // SALES EXECUTIVE CAN ONLY VIEW THEIR OWN TASK
        if (
            req.user.role === "Sales Executive" &&
            task.assignedTo._id.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this task"
            });
        }

        res.status(200).json(task);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get task",
            error: error.message
        });

    }
};


// CREATE TASK
const createTask = async (req, res) => {
    try {

        const {
            assignedTo,
            taskTitle,
            description,
            dueDate,
            status
        } = req.body;

        let taskAssignee;


        // SALES EXECUTIVE
        // AUTOMATICALLY BECOMES ASSIGNEE
        if (req.user.role === "Sales Executive") {

            taskAssignee = req.user.userId;

        }

        // ADMIN / MANAGER
        // CAN ASSIGN TASK TO SALES EXECUTIVE
        else if (
            req.user.role === "Administrator" ||
            req.user.role === "Manager"
        ) {

            if (!assignedTo) {
                return res.status(400).json({
                    message: "assignedTo is required"
                });
            }

            taskAssignee = assignedTo;

        }

        else {

            return res.status(403).json({
                message: "You are not authorized to create tasks"
            });

        }


        // CHECK ASSIGNEE ID
        if (!mongoose.Types.ObjectId.isValid(taskAssignee)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }


        // CHECK USER
        const user = await User.findById(taskAssignee);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // DO NOT ASSIGN TASK TO INACTIVE USER
        if (user.status === "Inactive") {
            return res.status(400).json({
                message: "Cannot assign task to an inactive user"
            });
        }


        // TASKS MUST BE ASSIGNED TO SALES EXECUTIVES
        if (user.role !== "Sales Executive") {
            return res.status(400).json({
                message: "Task must be assigned to a Sales Executive"
            });
        }


        const task = await Task.create({

            assignedTo: taskAssignee,

            taskTitle,

            description,

            dueDate,

            status: status || "Pending"

        });


        const populatedTask = await Task.findById(task._id)
            .populate(
                "assignedTo",
                "name email role"
            );


        res.status(201).json({

            message: "Task added successfully",

            task: populatedTask

        });

    } catch (error) {

        res.status(400).json({
            message: "Failed to add task",
            error: error.message
        });

    }
};


// UPDATE TASK
const updateTask = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }


        const task = await Task.findById(
            req.params.id
        );


        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }


        // SALES EXECUTIVE CAN ONLY UPDATE THEIR OWN TASK
        if (
            req.user.role === "Sales Executive" &&
            task.assignedTo.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not authorized to update this task"
            });
        }


        // SALES EXECUTIVE CANNOT CHANGE ASSIGNEE
        if (req.user.role === "Sales Executive") {
            delete req.body.assignedTo;
        }


        // ADMIN / MANAGER CAN CHANGE ASSIGNEE
        if (
            req.body.assignedTo &&
            (
                req.user.role === "Administrator" ||
                req.user.role === "Manager"
            )
        ) {

            // CHECK NEW ASSIGNEE ID
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.body.assignedTo
                )
            ) {
                return res.status(400).json({
                    message: "Invalid assigned user ID"
                });
            }


            // FIND NEW ASSIGNEE
            const newAssignee = await User.findById(
                req.body.assignedTo
            );


            if (!newAssignee) {
                return res.status(404).json({
                    message: "Assigned user not found"
                });
            }


            // DO NOT ASSIGN TASK TO INACTIVE USER
            if (newAssignee.status === "Inactive") {
                return res.status(400).json({
                    message: "Cannot assign task to an inactive user"
                });
            }


            // TASK MUST BE ASSIGNED TO SALES EXECUTIVE
            if (newAssignee.role !== "Sales Executive") {
                return res.status(400).json({
                    message: "Task must be assigned to a Sales Executive"
                });
            }

        }


        Object.assign(
            task,
            req.body
        );


        await task.save();


        const updatedTask = await Task.findById(
            task._id
        ).populate(
            "assignedTo",
            "name email role"
        );


        res.status(200).json({

            message: "Task updated successfully",

            task: updatedTask

        });

    } catch (error) {

        res.status(400).json({
            message: "Failed to update task",
            error: error.message
        });

    }
};


// DELETE TASK
const deleteTask = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }


        const task = await Task.findById(
            req.params.id
        );


        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }


        // SALES EXECUTIVE CAN ONLY DELETE THEIR OWN TASK
        if (
            req.user.role === "Sales Executive" &&
            task.assignedTo.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this task"
            });
        }


        await Task.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete task",
            error: error.message
        });

    }
};


module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};