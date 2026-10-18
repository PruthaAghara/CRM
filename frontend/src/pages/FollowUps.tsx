import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./FollowUps.css";
import "./Customers.css";

interface FollowUpItem {
    _id: string;
    followUpDate: string;
    purpose: string;
    status: "Pending" | "Completed" | "Cancelled";
    followUpOption?: string;
    customerId?: {
        _id: string;
        customerName: string;
        companyName: string;
        email?: string;
        phone?: string;
    };
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    createdAt?: string;
}

type TabType = "all" | "upcoming" | "overdue" | "Pending" | "Completed" | "Cancelled";

function FollowUps() {
    const navigate = useNavigate();

    const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
    const [filteredFollowUps, setFilteredFollowUps] = useState<FollowUpItem[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const fetchFollowUps = async (tab: TabType) => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setLoading(false);
                return;
            }

            let endpoint = "http://localhost:8000/api/followups";
            if (tab === "upcoming") {
                endpoint += "?upcoming=true";
            } else if (tab === "overdue") {
                endpoint += "?overdue=true";
            } else if (tab === "Pending" || tab === "Completed" || tab === "Cancelled") {
                endpoint += `?status=${tab}`;
            }

            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const list = Array.isArray(res.data) ? res.data : [];
            setFollowUps(list);
            setFilteredFollowUps(list);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to load follow-ups"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowUps(activeTab);
    }, [activeTab]);

    useEffect(() => {
        let list = followUps;

        if (search.trim()) {
            const query = search.toLowerCase();
            list = list.filter((item) =>
                (item.purpose && item.purpose.toLowerCase().includes(query)) ||
                (item.followUpOption && item.followUpOption.toLowerCase().includes(query)) ||
                (item.customerId?.customerName &&
                    item.customerId.customerName.toLowerCase().includes(query)) ||
                (item.customerId?.companyName &&
                    item.customerId.companyName.toLowerCase().includes(query)) ||
                (item.assignedTo?.name &&
                    item.assignedTo.name.toLowerCase().includes(query))
            );
        }

        setFilteredFollowUps(list);
    }, [search, followUps]);

    const handleDelete = async (followUpId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this follow-up?"
        );
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(`http://localhost:8000/api/followups/${followUpId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFollowUps((prev) => prev.filter((item) => item._id !== followUpId));
        } catch (err: any) {
            alert(
                err.response?.data?.message ||
                "Failed to delete follow-up"
            );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Completed":
                return <span className="followup-badge completed">Completed</span>;
            case "Cancelled":
                return <span className="followup-badge cancelled">Cancelled</span>;
            case "Pending":
            default:
                return <span className="followup-badge pending">Pending</span>;
        }
    };

    return (
        <div className="followups-layout">
            <Sidebar />

            <main className="followups-main">
                {/* Header */}
                <header className="followups-header">
                    <div>
                        <h1>Follow-ups</h1>
                        <p>Manage customer reminders, meetings, and pending actions.</p>
                    </div>

                    <div className="followups-header-actions">
                        <button
                            className="add-customer-btn"
                            onClick={() => navigate("/follow-ups/add")}
                        >
                            + Add Follow-up
                        </button>
                    </div>
                </header>

                {error && <div className="followups-error">{error}</div>}

                {/* Filter Tabs using backend endpoints */}
                <div className="followups-tabs">
                    <button
                        className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All Follow-ups
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
                        onClick={() => setActiveTab("upcoming")}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "overdue" ? "active" : ""}`}
                        onClick={() => setActiveTab("overdue")}
                    >
                        Overdue
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "Pending" ? "active" : ""}`}
                        onClick={() => setActiveTab("Pending")}
                    >
                        Pending
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "Completed" ? "active" : ""}`}
                        onClick={() => setActiveTab("Completed")}
                    >
                        Completed
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "Cancelled" ? "active" : ""}`}
                        onClick={() => setActiveTab("Cancelled")}
                    >
                        Cancelled
                    </button>
                </div>

                {/* Search Bar */}
                <div className="followups-filters">
                    <div className="followups-search">
                        <input
                            type="text"
                            placeholder="Search by purpose, customer, company, option, or assignee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="followups-table-card">
                    {loading ? (
                        <div className="followups-empty">
                            <p>Loading follow-ups...</p>
                        </div>
                    ) : filteredFollowUps.length === 0 ? (
                        <div className="followups-empty">
                            <h3>No follow-ups found</h3>
                            <p>
                                {search
                                    ? "No follow-ups match your search."
                                    : "No follow-up records found for this filter."}
                            </p>
                            {!search && activeTab === "all" && (
                                <button
                                    className="add-customer-btn"
                                    style={{ marginTop: "14px" }}
                                    onClick={() => navigate("/follow-ups/add")}
                                >
                                    + Add Follow-up
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="followups-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Company</th>
                                    <th>Follow-Up Date</th>
                                    <th>Purpose</th>
                                    <th>Status</th>
                                    <th>Option</th>
                                    <th>Assigned To</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFollowUps.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            {item.customerId ? (
                                                <span
                                                    onClick={() =>
                                                        navigate(
                                                            `/customers/${item.customerId?._id}`
                                                        )
                                                    }
                                                    style={{
                                                        color: "#2563eb",
                                                        cursor: "pointer",
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {item.customerId.customerName}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#9ca3af" }}>
                                                    Deleted Customer
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {item.customerId?.companyName || (
                                                <span style={{ color: "#9ca3af" }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <strong>
                                                {item.followUpDate
                                                    ? new Date(item.followUpDate).toLocaleDateString()
                                                    : "N/A"}
                                            </strong>
                                        </td>
                                        <td>{item.purpose}</td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td>
                                            {item.followUpOption ? (
                                                <span className="followup-badge option">
                                                    {item.followUpOption}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#9ca3af" }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {item.assignedTo?.name || "Unassigned"}
                                            {item.assignedTo?.role && (
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#6b7280",
                                                        display: "block"
                                                    }}
                                                >
                                                    ({item.assignedTo.role})
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="followup-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn view-btn"
                                                    onClick={() =>
                                                        navigate(`/follow-ups/${item._id}`)
                                                    }
                                                    title="View Follow-up Details"
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    <span>View</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="action-btn edit-btn"
                                                    onClick={() =>
                                                        navigate(`/follow-ups/${item._id}/edit`)
                                                    }
                                                    title="Edit Follow-up"
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                        <path d="m15 5 4 4" />
                                                    </svg>
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="action-btn delete-btn"
                                                    onClick={() =>
                                                        handleDelete(item._id)
                                                    }
                                                    title="Delete Follow-up"
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        <line x1="10" y1="11" x2="10" y2="17" />
                                                        <line x1="14" y1="11" x2="14" y2="17" />
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}

export default FollowUps;
