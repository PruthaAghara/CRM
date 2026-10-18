import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

interface PipelineBucket {
    _id: string | null;
    count: number;
}

interface DashboardData {
    customers: {
        total: number;
        active: number;
        inactive: number;
    };
    contacts: {
        total: number;
    };
    interactions: {
        total: number;
    };
    followUps: {
        pending: number;
        completed: number;
        overdue: number;
    };
    tasks: {
        pending: number;
        completed: number;
        overdue: number;
    };
    leads: {
        hot: number;
        warm: number;
        cold: number;
    };
    pipeline: PipelineBucket[];
}

function Dashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setLoading(false);
                return;
            }

            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUserRole(payload.role || "");
            } catch (e) {
                // Ignore parse errors
            }

            const response = await axios.get("http://localhost:8000/api/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setDashboard(response.data);
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else if (err.response?.status === 403) {
                setError("You are not authorized to view dashboard data.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard data. Please check your connection."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <header className="dashboard-header">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Loading your CRM statistics...</p>
                        </div>
                    </header>
                    <p style={{ color: "#6b7280", marginTop: "40px" }}>Loading dashboard...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <header className="dashboard-header">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Overview of your CRM activities.</p>
                        </div>
                    </header>

                    <div className="dashboard-error-box">
                        <strong>Error: {error}</strong>
                        <button className="retry-btn" onClick={fetchDashboard}>
                            Retry
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>
                            {userRole === "Sales Executive"
                                ? "Overview of your assigned customers, activities, and tasks."
                                : "Organization-wide overview of CRM performance and activities."}
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {userRole && (
                            <span className="dashboard-header-badge">
                                Role: {userRole}
                            </span>
                        )}
                        {userRole === "Administrator" && (
                            <button
                                className="dashboard-manage-btn"
                                onClick={() => navigate("/users")}
                                title="Manage System Users"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span>Manage Users</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Primary Overview Metric Cards (Clickable) */}
                <section className="dashboard-cards">
                    <div
                        className="dashboard-card"
                        onClick={() => navigate("/customers")}
                        title="View Customers"
                    >
                        <div className="dashboard-card-top">
                            <span>Total Customers</span>
                            <span className="card-tag info">View &rarr;</span>
                        </div>
                        <strong>{dashboard?.customers.total ?? 0}</strong>
                    </div>

                    <div
                        className="dashboard-card"
                        onClick={() => navigate("/contacts")}
                        title="View Contacts"
                    >
                        <div className="dashboard-card-top">
                            <span>Total Contacts</span>
                            <span className="card-tag info">View &rarr;</span>
                        </div>
                        <strong>{dashboard?.contacts.total ?? 0}</strong>
                    </div>

                    <div
                        className="dashboard-card"
                        onClick={() => navigate("/interactions")}
                        title="View Interactions"
                    >
                        <div className="dashboard-card-top">
                            <span>Total Interactions</span>
                            <span className="card-tag info">View &rarr;</span>
                        </div>
                        <strong>{dashboard?.interactions.total ?? 0}</strong>
                    </div>

                    <div
                        className="dashboard-card"
                        onClick={() => navigate("/follow-ups")}
                        title="View Follow-ups"
                    >
                        <div className="dashboard-card-top">
                            <span>Pending Follow-ups</span>
                            {(dashboard?.followUps.overdue ?? 0) > 0 && (
                                <span className="card-tag warning">
                                    {dashboard?.followUps.overdue} Overdue
                                </span>
                            )}
                        </div>
                        <strong>{dashboard?.followUps.pending ?? 0}</strong>
                    </div>

                    <div
                        className="dashboard-card"
                        onClick={() => navigate("/tasks")}
                        title="View Tasks"
                    >
                        <div className="dashboard-card-top">
                            <span>Pending Tasks</span>
                            {(dashboard?.tasks.overdue ?? 0) > 0 && (
                                <span className="card-tag warning">
                                    {dashboard?.tasks.overdue} Overdue
                                </span>
                            )}
                        </div>
                        <strong>{dashboard?.tasks.pending ?? 0}</strong>
                    </div>

                    <div
                        className="dashboard-card"
                        onClick={() => navigate("/customers")}
                        title="View Hot Leads"
                    >
                        <div className="dashboard-card-top">
                            <span>Hot Leads</span>
                            <span className="card-tag info">Priority</span>
                        </div>
                        <strong style={{ color: "#dc2626" }}>
                            {dashboard?.leads.hot ?? 0}
                        </strong>
                    </div>
                </section>

                {/* Structured Summaries Grid */}
                <section className="dashboard-sections-grid">
                    {/* Customer Breakdown */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <h3>Customer Status</h3>
                            <button
                                className="view-link-btn"
                                onClick={() => navigate("/customers")}
                            >
                                View All &rarr;
                            </button>
                        </div>
                        <div className="stat-pills-row">
                            <div className="stat-pill success">
                                <span className="stat-pill-label">Active</span>
                                <span className="stat-pill-num">
                                    {dashboard?.customers.active ?? 0}
                                </span>
                            </div>
                            <div className="stat-pill">
                                <span className="stat-pill-label">Inactive</span>
                                <span className="stat-pill-num">
                                    {dashboard?.customers.inactive ?? 0}
                                </span>
                            </div>
                            <div className="stat-pill">
                                <span className="stat-pill-label">Total</span>
                                <span className="stat-pill-num">
                                    {dashboard?.customers.total ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Follow-up Breakdown */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <h3>Follow-ups</h3>
                            <button
                                className="view-link-btn"
                                onClick={() => navigate("/follow-ups")}
                            >
                                View All &rarr;
                            </button>
                        </div>
                        <div className="stat-pills-row">
                            <div className="stat-pill warning">
                                <span className="stat-pill-label">Pending</span>
                                <span className="stat-pill-num">
                                    {dashboard?.followUps.pending ?? 0}
                                </span>
                            </div>
                            <div className="stat-pill success">
                                <span className="stat-pill-label">Completed</span>
                                <span className="stat-pill-num">
                                    {dashboard?.followUps.completed ?? 0}
                                </span>
                            </div>
                            <div
                                className={`stat-pill ${(dashboard?.followUps.overdue ?? 0) > 0 ? "danger" : ""}`}
                            >
                                <span className="stat-pill-label">Overdue</span>
                                <span className="stat-pill-num">
                                    {dashboard?.followUps.overdue ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Task Breakdown */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <h3>Tasks</h3>
                            <button
                                className="view-link-btn"
                                onClick={() => navigate("/tasks")}
                            >
                                View All &rarr;
                            </button>
                        </div>
                        <div className="stat-pills-row">
                            <div className="stat-pill warning">
                                <span className="stat-pill-label">Pending / In Progress</span>
                                <span className="stat-pill-num">
                                    {dashboard?.tasks.pending ?? 0}
                                </span>
                            </div>
                            <div className="stat-pill success">
                                <span className="stat-pill-label">Completed</span>
                                <span className="stat-pill-num">
                                    {dashboard?.tasks.completed ?? 0}
                                </span>
                            </div>
                            <div
                                className={`stat-pill ${(dashboard?.tasks.overdue ?? 0) > 0 ? "danger" : ""}`}
                            >
                                <span className="stat-pill-label">Overdue</span>
                                <span className="stat-pill-num">
                                    {dashboard?.tasks.overdue ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Leads Breakdown */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <h3>Lead Temperature</h3>
                            <button
                                className="view-link-btn"
                                onClick={() => navigate("/customers")}
                            >
                                View All &rarr;
                            </button>
                        </div>
                        <div className="stat-pills-row">
                            <div className="stat-pill danger">
                                <span className="stat-pill-label">Hot</span>
                                <span className="stat-pill-num">
                                    {dashboard?.leads.hot ?? 0}
                                </span>
                            </div>
                            <div className="stat-pill warning">
                                <span className="stat-pill-label">Warm</span>
                                <span className="stat-pill-num">
                                    {dashboard?.leads.warm ?? 0}
                                </span>
                            </div>
                            <div className="stat-pill">
                                <span className="stat-pill-label">Cold</span>
                                <span className="stat-pill-num">
                                    {dashboard?.leads.cold ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pipeline Summary (Backend Aggregation) */}
                <section className="pipeline-card">
                    <h3>Pipeline Aggregation</h3>
                    {dashboard?.pipeline && dashboard.pipeline.length > 0 ? (
                        <div className="pipeline-grid">
                            {dashboard.pipeline.map((stage, idx) => (
                                <div key={idx} className="pipeline-stage-box">
                                    <span className="pipeline-stage-name">
                                        {stage._id ? stage._id : "Unassigned Pipeline"}
                                    </span>
                                    <span className="pipeline-stage-count">
                                        {stage.count} customer{stage.count !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                            No pipeline stages recorded yet.
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Dashboard;