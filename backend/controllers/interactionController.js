const mongoose = require("mongoose");
const Interaction = require("../models/Interaction");
const Customer = require("../models/Customer");


// =====================================================
// GET ALL INTERACTIONS
// =====================================================

const getAllInteractions = async (req, res) => {
    try {
        const query = {};

        // Sales Executive can only see interactions of their own customers
        if (req.user.role === "Sales Executive") {
            const customers = await Customer.find({
                owner: req.user.userId
            }).select("_id");

            const customerIds = customers.map(c => c._id.toString());

            if (req.query.customerId) {
                if (!customerIds.includes(req.query.customerId)) {
                    return res.status(403).json({
                        message: "You are not authorized to view interactions for this customer"
                    });
                }
                query.customerId = req.query.customerId;
            } else {
                query.customerId = {
                    $in: customerIds
                };
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

        // Interaction type filter
        if (req.query.interactionType) {
            query.interactionType = req.query.interactionType;
        }

        // Status filter
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Search in subject or description
        if (req.query.search) {
            query.$or = [
                {
                    subject: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                }
            ];
        }

        const interactions = await Interaction.find(query)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "createdBy",
                "name email role"
            )
            .sort({
                interactionDate: -1,
                createdAt: -1
            });

        res.status(200).json(interactions);

    } catch (error) {
        console.error("GET INTERACTIONS ERROR:", error);
        res.status(500).json({
            message: "Failed to get interactions",
            error: error.message
        });
    }
};


// =====================================================
// GET INTERACTION BY ID
// =====================================================

const getInteractionById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid interaction ID"
            });
        }

        const interaction = await Interaction.findById(req.params.id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "createdBy",
                "name email role"
            );

        if (!interaction) {
            return res.status(404).json({
                message: "Interaction not found"
            });
        }

        // Sales Executive can only access interactions of their own customers
        if (
            req.user.role === "Sales Executive" &&
            (!interaction.customerId ||
                !interaction.customerId.owner ||
                interaction.customerId.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this interaction"
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

        res.status(200).json(interaction);

    } catch (error) {
        console.error("GET INTERACTION BY ID ERROR:", error);
        res.status(500).json({
            message: "Failed to get interaction",
            error: error.message
        });
    }
};


// =====================================================
// CREATE INTERACTION
// =====================================================

const createInteraction = async (req, res) => {
    try {
        const {
            customerId,
            interactionType,
            interactionDate,
            subject,
            description,
            status,
            primaryOption,
            callStatus,
            customerInterest,
            meetingStatus,
            salesConversation,
            digitalCommunicationStatus,
            verificationStatus
        } = req.body;

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

        if (!interactionType) {
            return res.status(400).json({
                message: "Interaction type is required"
            });
        }

        if (!interactionDate) {
            return res.status(400).json({
                message: "Interaction date is required"
            });
        }

        if (!description) {
            return res.status(400).json({
                message: "Description is required"
            });
        }

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Sales Executive can only create interactions for their own customers
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You can only create interactions for your own customers"
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

        // createdBy always comes from authenticated JWT req.user.userId
        const interaction = await Interaction.create({
            customerId,
            createdBy: req.user.userId,
            interactionType,
            interactionDate,
            subject: subject || `${interactionType} interaction`,
            description,
            status: status || "Completed",
            primaryOption,
            callStatus,
            customerInterest,
            meetingStatus,
            salesConversation,
            digitalCommunicationStatus,
            verificationStatus
        });

        const populatedInteraction = await Interaction.findById(interaction._id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "createdBy",
                "name email role"
            );

        res.status(201).json({
            message: "Interaction added successfully",
            interaction: populatedInteraction
        });

    } catch (error) {
        console.error("CREATE INTERACTION ERROR:", error);
        res.status(400).json({
            message: "Failed to add interaction",
            error: error.message
        });
    }
};


// =====================================================
// UPDATE INTERACTION
// =====================================================

const updateInteraction = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid interaction ID"
            });
        }

        const interaction = await Interaction.findById(req.params.id);

        if (!interaction) {
            return res.status(404).json({
                message: "Interaction not found"
            });
        }

        const customer = await Customer.findById(interaction.customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Sales Executive can only update interactions of their own customers
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You are not authorized to update this interaction"
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

        // Never change customerId or createdBy
        delete req.body.createdBy;
        delete req.body.customerId;

        if (req.body.interactionType !== undefined) {
            interaction.interactionType = req.body.interactionType;
        }
        if (req.body.interactionDate !== undefined) {
            interaction.interactionDate = req.body.interactionDate;
        }
        if (req.body.subject !== undefined) {
            interaction.subject = req.body.subject;
        }
        if (req.body.description !== undefined) {
            interaction.description = req.body.description;
        }
        if (req.body.status !== undefined) {
            interaction.status = req.body.status;
        }
        if (req.body.primaryOption !== undefined) {
            interaction.primaryOption = req.body.primaryOption;
        }
        if (req.body.callStatus !== undefined) {
            interaction.callStatus = req.body.callStatus;
        }
        if (req.body.customerInterest !== undefined) {
            interaction.customerInterest = req.body.customerInterest;
        }
        if (req.body.meetingStatus !== undefined) {
            interaction.meetingStatus = req.body.meetingStatus;
        }
        if (req.body.salesConversation !== undefined) {
            interaction.salesConversation = req.body.salesConversation;
        }
        if (req.body.digitalCommunicationStatus !== undefined) {
            interaction.digitalCommunicationStatus = req.body.digitalCommunicationStatus;
        }
        if (req.body.verificationStatus !== undefined) {
            interaction.verificationStatus = req.body.verificationStatus;
        }

        await interaction.save();

        const updatedInteraction = await Interaction.findById(interaction._id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "createdBy",
                "name email role"
            );

        res.status(200).json({
            message: "Interaction updated successfully",
            interaction: updatedInteraction
        });

    } catch (error) {
        console.error("UPDATE INTERACTION ERROR:", error);
        res.status(400).json({
            message: "Failed to update interaction",
            error: error.message
        });
    }
};


// =====================================================
// DELETE INTERACTION
// =====================================================

const deleteInteraction = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid interaction ID"
            });
        }

        const interaction = await Interaction.findById(req.params.id);

        if (!interaction) {
            return res.status(404).json({
                message: "Interaction not found"
            });
        }

        const customer = await Customer.findById(interaction.customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Sales Executive can only delete interactions of their own customers
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this interaction"
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

        await Interaction.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Interaction deleted successfully"
        });

    } catch (error) {
        console.error("DELETE INTERACTION ERROR:", error);
        res.status(500).json({
            message: "Failed to delete interaction",
            error: error.message
        });
    }
};


module.exports = {
    getAllInteractions,
    getInteractionById,
    createInteraction,
    updateInteraction,
    deleteInteraction
};