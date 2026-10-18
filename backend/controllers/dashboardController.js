const Customer = require("../models/Customer");
const Contact = require("../models/Contact");
const Interaction = require("../models/Interaction");
const FollowUp = require("../models/FollowUp");
const Task = require("../models/Task");


// GET DASHBOARD SUMMARY
const getDashboard = async (req, res) => {
    try {

        let customerQuery = {};
        let taskQuery = {};
        let followUpQuery = {};
        let interactionQuery = {};


        // SALES EXECUTIVE
        // Only show data belonging to this user
        if (req.user.role === "Sales Executive") {

            // Customers owned by this Sales Executive
            customerQuery.owner = req.user.userId;

            // Tasks assigned to this Sales Executive
            taskQuery.assignedTo = req.user.userId;


            // Find this user's customers
            const customers = await Customer.find({
                owner: req.user.userId
            }).select("_id");


            const customerIds = customers.map(
                customer => customer._id
            );


            // Follow-ups belonging to their customers
            followUpQuery.customerId = {
                $in: customerIds
            };


            // Interactions belonging to their customers
            interactionQuery.customerId = {
                $in: customerIds
            };
        }


        // =========================
        // CUSTOMER STATISTICS
        // =========================

        const totalCustomers =
            await Customer.countDocuments(customerQuery);


        const activeCustomers =
            await Customer.countDocuments({
                ...customerQuery,
                status: "Active"
            });


        const inactiveCustomers =
            await Customer.countDocuments({
                ...customerQuery,
                status: "Inactive"
            });


        // =========================
        // CONTACT STATISTICS
        // =========================

        const totalContacts =
            await Contact.countDocuments(
                req.user.role === "Sales Executive"
                    ? {
                        customerId: {
                            $in: await Customer.find({
                                owner: req.user.userId
                            }).distinct("_id")
                        }
                    }
                    : {}
            );


        // =========================
        // INTERACTION STATISTICS
        // =========================

        const totalInteractions =
            await Interaction.countDocuments(
                interactionQuery
            );


        // =========================
        // FOLLOW-UP STATISTICS
        // =========================

        const pendingFollowUps =
            await FollowUp.countDocuments({
                ...followUpQuery,
                status: "Pending"
            });


        const completedFollowUps =
            await FollowUp.countDocuments({
                ...followUpQuery,
                status: "Completed"
            });


        // Overdue follow-ups
        const overdueFollowUps =
            await FollowUp.countDocuments({
                ...followUpQuery,

                status: "Pending",

                followUpDate: {
                    $lt: new Date()
                }
            });


        // =========================
        // TASK STATISTICS
        // =========================

        const pendingTasks =
            await Task.countDocuments({
                ...taskQuery,

                status: {
                    $in: [
                        "Pending",
                        "In Progress"
                    ]
                }
            });


        const completedTasks =
            await Task.countDocuments({
                ...taskQuery,
                status: "Completed"
            });


        // Overdue tasks
        const overdueTasks =
            await Task.countDocuments({
                ...taskQuery,

                status: {
                    $nin: [
                        "Completed",
                        "Cancelled"
                    ]
                },

                dueDate: {
                    $lt: new Date()
                }
            });


        // =========================
        // LEAD STATISTICS
        // =========================

        const hotLeads =
            await Customer.countDocuments({
                ...customerQuery,
                leadStatus: "Hot"
            });


        const warmLeads =
            await Customer.countDocuments({
                ...customerQuery,
                leadStatus: "Warm"
            });


        const coldLeads =
            await Customer.countDocuments({
                ...customerQuery,
                leadStatus: "Cold"
            });


        // =========================
        // PIPELINE STATISTICS
        // =========================

        const pipelineStats =
            await Customer.aggregate([
                {
                    $match: customerQuery
                },
                {
                    $group: {
                        _id: "$pipeline",
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);


        // =========================
        // FINAL RESPONSE
        // =========================

        res.status(200).json({

            customers: {
                total: totalCustomers,
                active: activeCustomers,
                inactive: inactiveCustomers
            },

            contacts: {
                total: totalContacts
            },

            interactions: {
                total: totalInteractions
            },

            followUps: {
                pending: pendingFollowUps,
                completed: completedFollowUps,
                overdue: overdueFollowUps
            },

            tasks: {
                pending: pendingTasks,
                completed: completedTasks,
                overdue: overdueTasks
            },

            leads: {
                hot: hotLeads,
                warm: warmLeads,
                cold: coldLeads
            },

            pipeline: pipelineStats

        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to get dashboard data",
            error: error.message
        });

    }
};


module.exports = {
    getDashboard
};