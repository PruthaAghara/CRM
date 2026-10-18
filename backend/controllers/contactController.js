const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const Customer = require("../models/Customer");


// =====================================================
// GET ALL CONTACTS
// =====================================================

const getAllContacts = async (req, res) => {
    try {
        const query = {};

        // Sales Executive can only see contacts belonging to their customers
        if (req.user.role === "Sales Executive") {
            const customers = await Customer.find({
                owner: req.user.userId
            }).select("_id");

            const customerIds = customers.map(c => c._id.toString());

            if (req.query.customerId) {
                if (!customerIds.includes(req.query.customerId)) {
                    return res.status(403).json({
                        message: "You are not authorized to view contacts for this customer"
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

        // Search in contactName, email, phone, designation
        if (req.query.search) {
            const searchRegex = {
                $regex: req.query.search,
                $options: "i"
            };
            query.$or = [
                { contactName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { designation: searchRegex }
            ];
        }

        const contacts = await Contact.find(query)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "createdBy",
                "name email role"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json(contacts);

    } catch (error) {
        console.error("GET CONTACTS ERROR:", error);
        res.status(500).json({
            message: "Failed to get contacts",
            error: error.message
        });
    }
};


// =====================================================
// GET CONTACT BY ID
// =====================================================

const getContactById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid contact ID"
            });
        }

        const contact = await Contact.findById(req.params.id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "createdBy",
                "name email role"
            );

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        // Sales Executive can only access contacts of their own customers
        if (
            req.user.role === "Sales Executive" &&
            (!contact.customerId ||
                !contact.customerId.owner ||
                contact.customerId.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this contact"
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

        res.status(200).json(contact);

    } catch (error) {
        console.error("GET CONTACT BY ID ERROR:", error);
        res.status(500).json({
            message: "Failed to get contact",
            error: error.message
        });
    }
};


// =====================================================
// CREATE CONTACT
// =====================================================

const createContact = async (req, res) => {
    try {
        const {
            customerId,
            contactName,
            designation,
            email,
            phone
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

        if (!contactName || !contactName.trim()) {
            return res.status(400).json({
                message: "Contact name is required"
            });
        }

        // Validate email if provided
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({
                    message: "Invalid email format"
                });
            }
        }

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Sales Executive can only create contacts for their own customers
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You can only create contacts for your own customers"
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
        const contact = await Contact.create({
            customerId,
            createdBy: req.user.userId,
            contactName: contactName.trim(),
            designation: designation ? designation.trim() : "",
            email: email ? email.trim().toLowerCase() : "",
            phone: phone ? phone.trim() : ""
        });

        const populatedContact = await Contact.findById(contact._id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "createdBy",
                "name email role"
            );

        res.status(201).json({
            message: "Contact added successfully",
            contact: populatedContact
        });

    } catch (error) {
        console.error("CREATE CONTACT ERROR:", error);
        res.status(400).json({
            message: "Failed to add contact",
            error: error.message
        });
    }
};


// =====================================================
// UPDATE CONTACT
// =====================================================

const updateContact = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid contact ID"
            });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        const customer = await Customer.findById(contact.customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Sales Executive can only update contacts of their own customers
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You are not authorized to update this contact"
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
        delete req.body.customerId;
        delete req.body.createdBy;

        if (req.body.contactName !== undefined) {
            if (!req.body.contactName || !req.body.contactName.trim()) {
                return res.status(400).json({
                    message: "Contact name is required"
                });
            }
            contact.contactName = req.body.contactName.trim();
        }

        if (req.body.designation !== undefined) {
            contact.designation = req.body.designation.trim();
        }

        if (req.body.email !== undefined) {
            if (req.body.email && req.body.email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(req.body.email.trim())) {
                    return res.status(400).json({
                        message: "Invalid email format"
                    });
                }
                contact.email = req.body.email.trim().toLowerCase();
            } else {
                contact.email = "";
            }
        }

        if (req.body.phone !== undefined) {
            contact.phone = req.body.phone.trim();
        }

        await contact.save();

        const updatedContact = await Contact.findById(contact._id)
            .populate(
                "customerId",
                "customerName companyName email phone owner"
            )
            .populate(
                "createdBy",
                "name email role"
            );

        res.status(200).json({
            message: "Contact updated successfully",
            contact: updatedContact
        });

    } catch (error) {
        console.error("UPDATE CONTACT ERROR:", error);
        res.status(400).json({
            message: "Failed to update contact",
            error: error.message
        });
    }
};


// =====================================================
// DELETE CONTACT
// =====================================================

const deleteContact = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid contact ID"
            });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        const customer = await Customer.findById(contact.customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Sales Executive can only delete contacts of their own customers
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this contact"
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

        await Contact.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Contact deleted successfully"
        });

    } catch (error) {
        console.error("DELETE CONTACT ERROR:", error);
        res.status(500).json({
            message: "Failed to delete contact",
            error: error.message
        });
    }
};


module.exports = {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
};