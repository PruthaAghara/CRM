const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const User = require("../models/User");

// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
    try {

        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 10, 1),
            100
        );

        const skip = (page - 1) * limit;

        const search = req.query.search || "";

        const status = req.query.status;
        const priority = req.query.priority;
        const category = req.query.category;
        const leadStatus = req.query.leadStatus;


        // SORTING
        const requestedSort =
            req.query.sort || "createdAt";

        const allowedSortFields = [
            "customerName",
            "companyName",
            "email",
            "phone",
            "status",
            "priority",
            "category",
            "source",
            "businessNature",
            "businessType",
            "leadStatus",
            "paymentStatus",
            "createdAt"
        ];

        const sortField = requestedSort.startsWith("-")
            ? requestedSort.substring(1)
            : requestedSort;

        const sort = allowedSortFields.includes(sortField)
            ? requestedSort
            : "createdAt";


        // BASE QUERY
        const query = {};

        // Sales Executive can see only their own customers.
        if (req.user.role === "Sales Executive") {
            query.owner = req.user.userId;
        } else if (
            req.user.role !== "Administrator" &&
            req.user.role !== "Manager"
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }


        // SEARCH

        if (search) {
            query.$or = [
                {
                    customerName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    companyName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    phone: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }


        // FILTERS
        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        if (category) {
            query.category = category;
        }

        if (leadStatus) {
            query.leadStatus = leadStatus;
        }


        // GET CUSTOMERS

        const customers = await Customer.find(query)
            .populate("owner", "name email role")
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalCustomers =
            await Customer.countDocuments(query);


        res.status(200).json({
            customers,
            totalCustomers,
            page,
            limit
        });

    } catch (error) {

        console.error("GET CUSTOMERS ERROR:", error);

        res.status(500).json({
            message: "Failed to get customers",
            error: error.message
        });
    }
};


// GET CUSTOMER BY ID

const getCustomerById = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }


        const customer = await Customer.findById(
            req.params.id
        ).populate(
            "owner",
            "name email role"
        );


        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }


        // Sales Executive can view only their own customers.
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner._id.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to view this customer"
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


        res.status(200).json(customer);

    } catch (error) {

        console.error("GET CUSTOMER ERROR:", error);

        res.status(500).json({
            message: "Failed to get customer",
            error: error.message
        });
    }
};


// =====================================================
// CREATE CUSTOMER
// =====================================================

const createCustomer = async (req, res) => {
    try {

        let ownerId;


        // Sales Executive automatically becomes owner.
        if (req.user.role === "Sales Executive") {

            ownerId = req.user.userId;

        }

        // Administrator / Manager must select owner.
        else if (
            req.user.role === "Administrator" ||
            req.user.role === "Manager"
        ) {

            ownerId = typeof req.body.owner === "object" && req.body.owner?._id
                ? req.body.owner._id
                : req.body.owner;

            if (!ownerId) {
                return res.status(400).json({
                    message:
                        "Sales Executive owner is required"
                });
            }

        }

        else {

            return res.status(403).json({
                message:
                    "You are not authorized to create customers"
            });
        }


        // Validate owner ID.
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {

            return res.status(400).json({
                message:
                    "Invalid Sales Executive ID"
            });
        }


        // Check owner.
        const owner = await User.findById(ownerId);

        if (!owner) {

            return res.status(404).json({
                message:
                    "Sales Executive not found"
            });
        }


        // Owner must be Sales Executive.
        if (owner.role !== "Sales Executive") {

            return res.status(400).json({
                message:
                    "Customer owner must be a Sales Executive"
            });
        }


        const customerData = {
            ...req.body,
            owner: ownerId
        };


        // Sales Executive cannot manually change owner.
        if (req.user.role === "Sales Executive") {
            customerData.owner = req.user.userId;
        }


        const customer =
            await Customer.create(customerData);


        const populatedCustomer =
            await Customer.findById(customer._id)
                .populate(
                    "owner",
                    "name email role"
                );


        res.status(201).json({
            message:
                "Customer added successfully",

            customer:
                populatedCustomer
        });

    } catch (error) {

        console.error("CREATE CUSTOMER ERROR:", error);

        res.status(400).json({
            message:
                "Failed to add customer",

            error:
                error.message
        });
    }
};


// =====================================================
// UPDATE CUSTOMER
// =====================================================

const updateCustomer = async (req, res) => {
    try {

        // =====================================================
        // VALIDATE CUSTOMER ID
        // =====================================================

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({
                message:
                    "Invalid customer ID"
            });
        }


        // =====================================================
        // FIND CUSTOMER
        // =====================================================

        const customer =
            await Customer.findById(req.params.id);


        if (!customer) {

            return res.status(404).json({
                message:
                    "Customer not found"
            });
        }


        // =====================================================
        // PERMISSION
        // =====================================================

        // Sales Executive can update only their own customer.
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to update this customer"
            });
        }

        if (
            req.user.role !== "Administrator" &&
            req.user.role !== "Manager" &&
            req.user.role !== "Sales Executive"
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to update customers"
            });
        }


        // UPDATE CUSTOMER FIELDS

        if (req.body.customerName !== undefined) {
            customer.customerName =
                req.body.customerName;
        }

        if (req.body.companyName !== undefined) {
            customer.companyName =
                req.body.companyName;
        }

        if (req.body.email !== undefined) {
            customer.email =
                req.body.email;
        }

        if (req.body.phone !== undefined) {
            customer.phone =
                req.body.phone;
        }

        if (req.body.status !== undefined) {
            customer.status =
                req.body.status;
        }

        if (req.body.priority !== undefined) {
            customer.priority =
                req.body.priority;
        }

        if (req.body.category !== undefined) {
            customer.category =
                req.body.category;
        }

        if (req.body.source !== undefined) {
            customer.source =
                req.body.source;
        }

        if (req.body.businessNature !== undefined) {
            customer.businessNature =
                req.body.businessNature;
        }

        if (req.body.businessType !== undefined) {
            customer.businessType =
                req.body.businessType;
        }

        if (req.body.leadStatus !== undefined) {
            customer.leadStatus =
                req.body.leadStatus;
        }

        if (req.body.customerInterest !== undefined) {
            customer.customerInterest =
                req.body.customerInterest;
        }

        if (req.body.paymentStatus !== undefined) {
            customer.paymentStatus =
                req.body.paymentStatus;
        }

        if (req.body.verificationStatus !== undefined) {
            customer.verificationStatus =
                req.body.verificationStatus;
        }


        // OWNER

        // Only Administrator / Manager can change owner.
        // Sales Executive cannot change owner.
        // Preserves existing owner unless explicitly changed by Administrator or Manager.
        if (
            (
                req.user.role === "Administrator" ||
                req.user.role === "Manager"
            ) &&
            req.body.owner !== undefined &&
            req.body.owner !== null &&
            req.body.owner !== ""
        ) {
            const newOwnerId =
                typeof req.body.owner === "object" && req.body.owner?._id
                    ? req.body.owner._id
                    : req.body.owner;

            if (!mongoose.Types.ObjectId.isValid(newOwnerId)) {
                return res.status(400).json({
                    message:
                        "Invalid Sales Executive ID"
                });
            }


            const newOwner =
                await User.findById(newOwnerId);


            if (!newOwner) {
                return res.status(404).json({
                    message:
                        "Sales Executive not found"
                });
            }


            if (newOwner.role !== "Sales Executive") {
                return res.status(400).json({
                    message:
                        "Customer owner must be a Sales Executive"
                });
            }


            customer.owner =
                newOwner._id;
        }


        // SAVE

        await customer.save();


        const updatedCustomer =
            await Customer.findById(customer._id)
                .populate(
                    "owner",
                    "name email role"
                );


        res.status(200).json({
            message:
                "Customer updated successfully",

            customer:
                updatedCustomer
        });

    } catch (error) {

        console.error("UPDATE CUSTOMER ERROR:", error);

        res.status(400).json({
            message:
                "Failed to update customer",

            error:
                error.message
        });
    }
};


// DELETE CUSTOMER

const deleteCustomer = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({
                message:
                    "Invalid customer ID"
            });
        }


        const customer =
            await Customer.findById(req.params.id);


        if (!customer) {

            return res.status(404).json({
                message:
                    "Customer not found"
            });
        }


        // Sales Executive can delete only their own customer.
        if (
            req.user.role === "Sales Executive" &&
            (!customer.owner || customer.owner.toString() !== req.user.userId)
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this customer"
            });
        }

        if (
            req.user.role !== "Administrator" &&
            req.user.role !== "Manager" &&
            req.user.role !== "Sales Executive"
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete customers"
            });
        }


        await Customer.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({
            message:
                "Customer deleted successfully"
        });

    } catch (error) {

        console.error("DELETE CUSTOMER ERROR:", error);

        res.status(500).json({
            message:
                "Failed to delete customer",

            error:
                error.message
        });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
};