const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const contactRoutes = require("./routes/contactRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// CONNECT MONGODB
// ===============================

connectDB();


// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "CRM Backend is running!"
    });
});


// ===============================
// CRM ROUTES
// ===============================

app.use("/api/customers", customerRoutes);

app.use("/api/contacts", contactRoutes);

app.use("/api/interactions", interactionRoutes);

app.use("/api/followups", followUpRoutes);

app.use("/api/tasks", taskRoutes);


// ===============================
// AUTH ROUTES
// ===============================

app.use("/api/auth", authRoutes);


// ===============================
// USER ROUTES
// ===============================

app.use("/api/users", userRoutes);


// ===============================
// DASHBOARD ROUTES
// ===============================

app.use("/api/dashboard", dashboardRoutes);


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 8000;

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});