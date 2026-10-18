import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Interactions.css";
import "./Customers.css";

interface InteractionItem {
    _id: string;
    interactionType: "Call" | "Email" | "Meeting" | "Note";
    interactionDate: string;
    subject?: string;
    description: string;
    status?: string;
    callStatus?: string;
    meetingStatus?: string;
    customerInterest?: string;
    customerId?: {
        _id: string;
        customerName: string;
        companyName: string;
    };
    createdBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
}

function Interactions() {
    const navigate = useNavigate();

    const [interactions, setInteractions] = useState<InteractionItem[]>([]);
    const [filteredInteractions, setFilteredInteractions] = useState<InteractionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        const fetchInteractions = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login again.");
                    setLoading(false);
                    return;
                }

                const res = await axios.get("http://localhost:8000/api/interactions", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const list = Array.isArray(res.data) ? res.data : [];
                setInteractions(list);
                setFilteredInteractions(list);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load interactions"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInteractions();
    }, []);

    useEffect(() => {
        let list = interactions;

        if (search.trim()) {
            const query = search.toLowerCase();
            list = list.filter((item) =>
                (item.subject && item.subject.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query)) ||
                (item.customerId?.customerName &&
                    item.customerId.customerName.toLowerCase().includes(query)) ||
                (item.customerId?.companyName &&
                    item.customerId.companyName.toLowerCase().includes(query))
            );
        }

        if (typeFilter) {
            list = list.filter((item) => item.interactionType === typeFilter);
        }

        if (statusFilter) {
            list = list.filter((item) => item.status === statusFilter);
        }

        setFilteredInteractions(list);
    }, [search, typeFilter, statusFilter, interactions]);

    const handleDelete = async (interactionId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this interaction?"
        );
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(`http://localhost:8000/api/interactions/${interactionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInteractions((prev) => prev.filter((i) => i._id !== interactionId));
            setError("");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to delete interaction"
            );
        }
    };

    if (loading) {
        return (
            <div className="interactions-layout">
                <Sidebar />
                <main className="interactions-main">
                    <p>Loading interactions...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="interactions-layout">
            <Sidebar />

            <main className="interactions-main">
                <header className="interactions-header">
                    <div>
                        <h1>Interactions</h1>
                        <p>Track calls, emails, meetings, notes, and activity history.</p>
                    </div>

                    <div className="interactions-header-actions">
                        <button
                            className="add-customer-button"
                            onClick={() => navigate("/interactions/add")}
                        >
                            + Add Interaction
                        </button>
                    </div>
                </header>

                {error && <div className="interactions-error">{error}</div>}

                {/* Filters */}
                <section className="interactions-filters">
                    <div className="interactions-search">
                        <input
                            type="text"
                            placeholder="Search by customer, subject, or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filter-row">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="Call">Call</option>
                            <option value="Email">Email</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Note">Note</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </section>

                {/* Interactions Table */}
                <section className="interactions-table-card">
                    {filteredInteractions.length === 0 ? (
                        <div className="interactions-empty">
                            <h3>No interactions found</h3>
                            <p>Record your communication history with customers.</p>
                        </div>
                    ) : (
                        <table className="interactions-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Subject / Title</th>
                                    <th>Notes / Description</th>
                                    <th>Status</th>
                                    <th>Logged By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInteractions.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            {item.customerId ? (
                                                <div
                                                    style={{ cursor: "pointer", color: "#2563eb", fontWeight: 600 }}
                                                    onClick={() => navigate(`/customers/${item.customerId?._id}`)}
                                                >
                                                    {item.customerId.customerName}
                                                    <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 400 }}>
                                                        {item.customerId.companyName}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: "#9ca3af" }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`type-badge ${item.interactionType.toLowerCase()}`}
                                            >
                                                {item.interactionType}
                                            </span>
                                        </td>
                                        <td>
                                            {item.interactionDate
                                                ? new Date(item.interactionDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {item.subject || `${item.interactionType} interaction`}
                                        </td>
                                        <td style={{ maxWidth: "240px" }}>
                                            <div
                                                style={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}
                                            >
                                                {item.description}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="priority-badge average">
                                                {item.status || "Completed"}
                                            </span>
                                        </td>
                                        <td>
                                            {item.createdBy?.name || "-"}
                                        </td>
                                        <td>
                                            <div className="interaction-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn view-btn"
                                                    onClick={() => navigate(`/interactions/${item._id}`)}
                                                    title="View Interaction Details"
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
                                                    onClick={() => navigate(`/interactions/${item._id}/edit`)}
                                                    title="Edit Interaction"
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
                                                    onClick={() => handleDelete(item._id)}
                                                    title="Delete Interaction"
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
                </section>
            </main>
        </div>
    );
}

export default Interactions;
