const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        // =====================================================
        // BASIC CUSTOMER INFORMATION
        // =====================================================

        // Name of the main person/contact associated with the customer.
        customerName: {
            type: String,
            required: true,
            trim: true
        },

        // Company or organization associated with the customer.
        companyName: {
            type: String,
            required: true,
            trim: true
        },

        // Customer's email address.
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        // Customer's phone number.
        phone: {
            type: String,
            required: true,
            trim: true
        },


        // =====================================================
        // CUSTOMER CLASSIFICATION
        // =====================================================

        // Shows whether the customer is currently active.
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        },

        // Indicates the business priority of the customer.
        priority: {
            type: String,
            enum: ["HIGH", "MEDIUM", "LOW", "AVERAGE"],
            default: "AVERAGE"
        },

        // General classification of the customer.
        // Example: Enterprise, Government, Small Business, etc.
        category: {
            type: String,
            trim: true
        },

        // Shows where the customer or lead came from.
        // Example: Website, Referral, Advertisement, Cold Call, etc.
        source: {
            type: String,
            trim: true
        },


        // =====================================================
        // BUSINESS INFORMATION
        // =====================================================

        // Nature or industry of the customer's business.
        businessNature: {
            type: String,
            trim: true
        },

        // Type or structure of the business.
        businessType: {
            type: String,
            trim: true
        },


        // =====================================================
        // LEAD INFORMATION
        // =====================================================

        // Indicates how interested the customer currently is.
        leadStatus: {
            type: String,
            enum: ["Hot", "Warm", "Cold"],
            default: "Cold"
        },

        // Describes what the customer is interested in.
        customerInterest: {
            type: String,
            trim: true
        },


        // =====================================================
        // PAYMENT INFORMATION
        // =====================================================

        // Stores the customer's current payment status.
        // Detailed payment history can be handled separately later.
        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Partial",
                "Paid",
                "Overdue"
            ],
            default: "Pending"
        },


        // =====================================================
        // VERIFICATION
        // =====================================================

        // Stores the verification state of customer information.
        verificationStatus: {
            type: String,
            enum: [
                "Not Verified",
                "Verified",
                "Pending"
            ],
            default: "Not Verified"
        },


        // =====================================================
        // OWNERSHIP
        // =====================================================

        // Sales Executive responsible for managing this customer.
        // Sales Executive -> assigned automatically by backend.
        // Administrator / Manager -> can assign a Sales Executive.
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },

    {
        // Automatically creates createdAt and updatedAt.
        timestamps: true
    }
);


module.exports = mongoose.model("Customer", customerSchema);