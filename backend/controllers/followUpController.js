const mongoose = require("mongoose");

const FollowUp = require("../models/FollowUp");
const Customer = require("../models/Customer");
const User = require("../models/User");


// =====================================================
// GET ALL FOLLOW-UPS
// =====================================================

const getAllFollowUps = async (req, res) => {
    try {
        let query = {};

        // SALES EXECUTIVE CAN ONLY SEE THEIR OWN ASSIGNED FOLLOW-UPS
        if (req.user.role === "Sales Executive") {
            query.assignedTo = req.user.userId;

            // If filtering by specific customer, verify ownership of that customer
            if (req.query.customerId) {
                if (!mongoose.Types.ObjectId.isValid(req.query.customerId)) {
                    return res.status(400).json({
                        message: "Invalid customer ID"
                    });
                }

                const customer = await Customer.findById(req.query.customerId);
                if (!customer) {
                    return res.status(404).json({
                        message: "Customer not found"
                    });
                }

                if (!customer.owner || customer.owner.toString() !== req.user.userId) {
                    return res.status(403).json({
                        message: "You are not authorized to view follow-ups for this customer"
                    });
                }

                query.customerId = req.query.customerId;
            }
        } else if (
            req.user.role === "Administrator" ||
            req.user.role === "Manager"
        ) {
            if (req.query.customerId) {
                if (!mongoose.Types.ObjectId.isValid(req.query.customerId)) {
                    return res.status(400).json({
                        message: "Invalid customer ID"
                    });
                }
                query.customerId = req.query.customerId;
            }
        } else {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // OPTIONAL STATUS FILTER
        if (req.query.status) {
            query.status = req.query.status;
        }

        // UPCOMING FOLLOW-UPS: followUpDate >= current date, status != Completed
        if (req.query.upcoming === "true") {
            query.followUpDate = {
                $gte: new Date()
            };
            query.status = {
                $ne: "Completed"
            };
        }

        // OVERDUE FOLLOW-UPS: followUpDate < current date, status not Completed or Cancelled
        if (req.query.overdue === "true") {
            query.followUpDate = {
                $lt: new Date()
            };
            query.status = {
                $nin: ["Completed", "Cancelled"]
            };
        }

        // SEARCH FILTER (purpose or followUpOption)
        if (req.query.search) {
            const searchRegex = {
                $regex: req.query.search,
                $options: "i"
            };
            query.$or = [
                { purpose: searchRegex },
                { followUpOption: searchRegex }
            ];
        }

        const followUps = await FollowUp.find(query)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "assignedTo",
                "name email role"
            )
            .sort({
                followUpDate: 1
            });

        res.status(200).json(followUps);

    } catch (error) {
        console.error("GET FOLLOW-UPS ERROR:", error);
        res.status(500).json({
            message: "Failed to get follow-ups",
            error: error.message
        });
    }
};


// =====================================================
// GET FOLLOW-UP BY ID
// =====================================================

const getFollowUpById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid follow-up ID"
            });
        }

        const followUp = await FollowUp.findById(req.params.id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "assignedTo",
                "name email role"
            );

        if (!followUp) {
            return res.status(404).json({
                message: "Follow-up not found"
            });
        }

        // SALES EXECUTIVE CAN ONLY VIEW THEIR OWN ASSIGNED FOLLOW-UP
        if (
            req.user.role === "Sales Executive" &&
            (!followUp.assignedTo ||
                followUp.assignedTo._id.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this follow-up"
            });
        }

        if (
            req.user.role !== "Administrator" &&
            req.user.role !== "Manager" &&
            req.user.role !== "Sales Executive"
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        res.status(200).json(followUp);

    } catch (error) {
        console.error("GET FOLLOW-UP BY ID ERROR:", error);
        res.status(500).json({
            message: "Failed to get follow-up",
            error: error.message
        });
    }
};


// =====================================================
// CREATE FOLLOW-UP
// =====================================================

const createFollowUp = async (req, res) => {
    try {
        const {
            customerId,
            assignedTo,
            followUpDate,
            purpose,
            status,
            followUpOption
        } = req.body;

        // VALIDATE REQUIRED FIELDS
        if (!customerId) {
            return res.status(400).json({
                message: "Customer ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }

        if (!followUpDate) {
            return res.status(400).json({
                message: "Follow-up date is required"
            });
        }

        if (isNaN(new Date(followUpDate).getTime())) {
            return res.status(400).json({
                message: "Invalid follow-up date"
            });
        }

        if (!purpose || !purpose.trim()) {
            return res.status(400).json({
                message: "Purpose is required"
            });
        }

        // VALIDATE CUSTOMER EXISTS
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // SALES EXECUTIVE CAN ONLY CREATE FOLLOW-UPS FOR THEIR OWN CUSTOMERS
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You can only create follow-ups for your own customers"
            });
        }

        let followUpAssignee;

        // SALES EXECUTIVE AUTOMATICALLY BECOMES ASSIGNEE
        if (req.user.role === "Sales Executive") {
            followUpAssignee = req.user.userId;
        }
        // ADMIN / MANAGER MUST ASSIGN TO A SALES EXECUTIVE
        else if (
            req.user.role === "Administrator" ||
            req.user.role === "Manager"
        ) {
            if (!assignedTo) {
                return res.status(400).json({
                    message: "assignedTo is required"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
                return res.status(400).json({
                    message: "Invalid user ID"
                });
            }

            const user = await User.findById(assignedTo);
            if (!user) {
                return res.status(404).json({
                    message: "Assigned user not found"
                });
            }

            if (user.role !== "Sales Executive") {
                return res.status(400).json({
                    message: "Follow-up must be assigned to a Sales Executive"
                });
            }

            followUpAssignee = assignedTo;
        } else {
            return res.status(403).json({
                message: "You are not authorized to create follow-ups"
            });
        }

        // VALIDATE STATUS IF PROVIDED
        if (status && !["Pending", "Completed", "Cancelled"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status value"
            });
        }

        // CREATE FOLLOW-UP
        const followUp = await FollowUp.create({
            customerId,
            assignedTo: followUpAssignee,
            followUpDate,
            purpose: purpose.trim(),
            status: status || "Pending",
            followUpOption: followUpOption ? followUpOption.trim() : ""
        });

        const populatedFollowUp = await FollowUp.findById(followUp._id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "assignedTo",
                "name email role"
            );

        res.status(201).json({
            message: "Follow-up added successfully",
            followUp: populatedFollowUp
        });

    } catch (error) {
        console.error("CREATE FOLLOW-UP ERROR:", error);
        res.status(400).json({
            message: "Failed to add follow-up",
            error: error.message
        });
    }
};


// =====================================================
// UPDATE FOLLOW-UP
// =====================================================

const updateFollowUp = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid follow-up ID"
            });
        }

        const followUp = await FollowUp.findById(req.params.id);

        if (!followUp) {
            return res.status(404).json({
                message: "Follow-up not found"
            });
        }

        // SALES EXECUTIVE CAN ONLY UPDATE THEIR OWN ASSIGNED FOLLOW-UP
        if (
            req.user.role === "Sales Executive" &&
            followUp.assignedTo.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not authorized to update this follow-up"
            });
        }

        if (
            req.user.role !== "Administrator" &&
            req.user.role !== "Manager" &&
            req.user.role !== "Sales Executive"
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // IMMUTABLE: Customer association cannot be changed in update
        delete req.body.customerId;

        // SALES EXECUTIVE CANNOT CHANGE ASSIGNEE
        if (req.user.role === "Sales Executive") {
            delete req.body.assignedTo;
        }

        // ADMIN / MANAGER CAN CHANGE ASSIGNEE
        if (
            req.body.assignedTo &&
            (req.user.role === "Administrator" || req.user.role === "Manager")
        ) {
            if (!mongoose.Types.ObjectId.isValid(req.body.assignedTo)) {
                return res.status(400).json({
                    message: "Invalid assigned user ID"
                });
            }

            const newAssignee = await User.findById(req.body.assignedTo);
            if (!newAssignee) {
                return res.status(404).json({
                    message: "Assigned user not found"
                });
            }

            if (newAssignee.role !== "Sales Executive") {
                return res.status(400).json({
                    message: "Follow-up must be assigned to a Sales Executive"
                });
            }

            followUp.assignedTo = req.body.assignedTo;
        }

        // VALIDATE DATE IF PROVIDED
        if (req.body.followUpDate !== undefined) {
            if (isNaN(new Date(req.body.followUpDate).getTime())) {
                return res.status(400).json({
                    message: "Invalid follow-up date"
                });
            }
            followUp.followUpDate = req.body.followUpDate;
        }

        // VALIDATE PURPOSE IF PROVIDED
        if (req.body.purpose !== undefined) {
            if (!req.body.purpose || !req.body.purpose.trim()) {
                return res.status(400).json({
                    message: "Purpose is required"
                });
            }
            followUp.purpose = req.body.purpose.trim();
        }

        // VALIDATE STATUS IF PROVIDED
        if (req.body.status !== undefined) {
            if (!["Pending", "Completed", "Cancelled"].includes(req.body.status)) {
                return res.status(400).json({
                    message: "Invalid status value"
                });
            }
            followUp.status = req.body.status;
        }

        // FOLLOW-UP OPTION
        if (req.body.followUpOption !== undefined) {
            followUp.followUpOption = req.body.followUpOption ? req.body.followUpOption.trim() : "";
        }

        await followUp.save();

        const updatedFollowUp = await FollowUp.findById(followUp._id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "assignedTo",
                "name email role"
            );

        res.status(200).json({
            message: "Follow-up updated successfully",
            followUp: updatedFollowUp
        });

    } catch (error) {
        console.error("UPDATE FOLLOW-UP ERROR:", error);
        res.status(400).json({
            message: "Failed to update follow-up",
            error: error.message
        });
    }
};


// =====================================================
// DELETE FOLLOW-UP
// =====================================================

const deleteFollowUp = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid follow-up ID"
            });
        }

        const followUp = await FollowUp.findById(req.params.id);

        if (!followUp) {
            return res.status(404).json({
                message: "Follow-up not found"
            });
        }

        // SALES EXECUTIVE CAN ONLY DELETE THEIR OWN ASSIGNED FOLLOW-UP
        if (
            req.user.role === "Sales Executive" &&
            followUp.assignedTo.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this follow-up"
            });
        }

        if (
            req.user.role !== "Administrator" &&
            req.user.role !== "Manager" &&
            req.user.role !== "Sales Executive"
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await FollowUp.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Follow-up deleted successfully"
        });

    } catch (error) {
        console.error("DELETE FOLLOW-UP ERROR:", error);
        res.status(500).json({
            message: "Failed to delete follow-up",
            error: error.message
        });
    }
};


module.exports = {
    getAllFollowUps,
    getFollowUpById,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
};