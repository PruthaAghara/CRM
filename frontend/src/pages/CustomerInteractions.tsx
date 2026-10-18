import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Interactions.css";
import "./Customers.css";

interface CustomerInfo {
    _id: string;
    customerName: string;
    companyName: string;
    email: string;
    phone: string;
    owner?: {
        _id: string;
        name: string;
        email: string;
    };
}

interface Interaction {
    _id: string;
    interactionType: "Call" | "Email" | "Meeting" | "Note";
    interactionDate: string;
    subject?: string;
    description: string;
    status?: string;
    callStatus?: string;
    meetingStatus?: string;
    customerInterest?: string;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    customerId: string | {
        _id: string;
        customerName: string;
        companyName: string;
    };
}

function CustomerInteractions() {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerInfo | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [filteredInteractions, setFilteredInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        const fetchCustomerAndInteractions = async () => {
            if (!customerId) {
                setError("Missing customer ID");
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login again.");
                    setLoading(false);
                    return;
                }

                // 1. Fetch Customer info
                const customerRes = await axios.get(
                    `http://localhost:8000/api/customers/${customerId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setCustomer(customerRes.data);

                // 2. Fetch Customer Interactions
                const interactionsRes = await axios.get(
                    `http://localhost:8000/api/interactions?customerId=${customerId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = interactionsRes.data;
                const list = Array.isArray(data) ? data : [];
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

        fetchCustomerAndInteractions();
    }, [customerId]);

    // Filter interactions when search or filters change
    useEffect(() => {
        let list = interactions;

        if (search.trim()) {
            const query = search.toLowerCase();
            list = list.filter((item) =>
                (item.subject && item.subject.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query))
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
        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(
                `http://localhost:8000/api/interactions/${interactionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

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
                        <h1>Customer Interactions</h1>
                        <p>
                            Communication and activity history for{" "}
                            <strong>{customer?.customerName || "Customer"}</strong>
                        </p>
                    </div>

                    <div className="interactions-header-actions">
                        <button
                            className="back-button"
                            onClick={() => navigate(`/customers/${customerId}`)}
                        >
                            Back to Customer
                        </button>

                        <button
                            className="add-customer-button"
                            onClick={() =>
                                navigate(`/customers/${customerId}/interactions/add`)
                            }
                        >
                            + Add Interaction
                        </button>
                    </div>
                </header>

                {error && <div className="interactions-error">{error}</div>}

                {/* Customer Context Card */}
                {customer && (
                    <div className="customer-context-banner">
                        <div>
                            <h2>{customer.customerName}</h2>
                            <p>
                                <strong>Company:</strong> {customer.companyName} |{" "}
                                <strong>Email:</strong> {customer.email} |{" "}
                                <strong>Phone:</strong> {customer.phone}
                            </p>
                        </div>
                        {customer.owner && (
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "12px", color: "#6b7280" }}>Customer Owner</span>
                                <div style={{ fontWeight: 600, color: "#111827" }}>
                                    {customer.owner.name}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Filters */}
                <section className="interactions-filters">
                    <div className="interactions-search">
                        <input
                            type="text"
                            placeholder="Search in subject or description..."
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
                            <p>
                                Record calls, meetings, emails, or notes for this customer.
                            </p>
                            <button
                                className="add-customer-button"
                                style={{ marginTop: "14px" }}
                                onClick={() =>
                                    navigate(`/customers/${customerId}/interactions/add`)
                                }
                            >
                                + Add First Interaction
                            </button>
                        </div>
                    ) : (
                        <table className="interactions-table">
                            <thead>
                                <tr>
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
                                        <td style={{ maxWidth: "260px" }}>
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
                                                    className="view-button"
                                                    onClick={() => navigate(`/interactions/${item._id}`)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="edit-button"
                                                    onClick={() => navigate(`/interactions/${item._id}/edit`)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    Delete
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

export default CustomerInteractions;
