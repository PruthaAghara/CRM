import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ViewCustomer.css";
import "./FollowUps.css";

interface FollowUpDetail {
    _id: string;
    followUpDate: string;
    purpose: string;
    status: "Pending" | "Completed" | "Cancelled";
    followUpOption?: string;
    customerId?: {
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
    };
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

function ViewFollowUp() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [followUp, setFollowUp] = useState<FollowUpDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFollowUp = async () => {
            if (!id) {
                setError("Missing follow-up ID");
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

                const res = await axios.get(`http://localhost:8000/api/followups/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setFollowUp(res.data);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load follow-up details"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFollowUp();
    }, [id]);

    const handleDelete = async () => {
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

            await axios.delete(`http://localhost:8000/api/followups/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate("/follow-ups");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to delete follow-up"
            );
        }
    };

    const handleBack = () => {
        navigate("/follow-ups");
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

    if (loading) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <p>Loading follow-up details...</p>
                </main>
            </div>
        );
    }

    if (error || !followUp) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <div className="view-customer-error">
                        {error || "Follow-up not found"}
                    </div>
                    <button className="back-button" onClick={() => navigate("/follow-ups")}>
                        Back to Follow-ups
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="view-customer-layout">
            <Sidebar />

            <main className="view-customer-main">
                {/* Header */}
                <header className="view-customer-header">
                    <div>
                        <h1>Follow-up Details</h1>
                        <p>
                            For {followUp.customerId?.customerName || "Customer"} scheduled on{" "}
                            {followUp.followUpDate
                                ? new Date(followUp.followUpDate).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>

                    <div className="view-header-actions">
                        <button className="back-button" onClick={handleBack}>
                            &larr; Back to Follow-ups
                        </button>

                        <button
                            className="edit-button"
                            onClick={() => navigate(`/follow-ups/${followUp._id}/edit`)}
                        >
                            Edit Follow-up
                        </button>

                        <button className="delete-btn-view" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </header>

                <section className="customer-details-card">
                    {/* Schedule & Purpose */}
                    <div className="details-section">
                        <h2>Follow-Up Schedule & Purpose</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Date</span>
                                <strong>
                                    {followUp.followUpDate
                                        ? new Date(followUp.followUpDate).toLocaleDateString()
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Status</span>
                                <strong>{getStatusBadge(followUp.status)}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Follow-Up Option / Channel</span>
                                <strong>
                                    {followUp.followUpOption ? (
                                        <span className="followup-badge option">
                                            {followUp.followUpOption}
                                        </span>
                                    ) : (
                                        "None specified"
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                                <span>Purpose / Agenda</span>
                                <p style={{ margin: "6px 0 0", color: "#111827", lineHeight: 1.6 }}>
                                    {followUp.purpose}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Associated Customer */}
                    <div className="details-section">
                        <h2>Associated Customer</h2>
                        {followUp.customerId ? (
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span>Customer Name</span>
                                    <strong>
                                        <span
                                            style={{ color: "#2563eb", cursor: "pointer" }}
                                            onClick={() =>
                                                navigate(`/customers/${followUp.customerId?._id}`)
                                            }
                                        >
                                            {followUp.customerId.customerName}
                                        </span>
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Company Name</span>
                                    <strong>{followUp.customerId.companyName || "N/A"}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Customer Email</span>
                                    <strong>{followUp.customerId.email || "N/A"}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Customer Phone</span>
                                    <strong>{followUp.customerId.phone || "N/A"}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Customer Owner (Sales Executive)</span>
                                    <strong>
                                        {followUp.customerId.owner?.name
                                            ? `${followUp.customerId.owner.name} (${followUp.customerId.owner.email || "No email"})`
                                            : "Not assigned"}
                                    </strong>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: "#9ca3af" }}>Customer record has been removed.</p>
                        )}
                    </div>

                    {/* Assignment & Audit */}
                    <div className="details-section">
                        <h2>Assignment & Audit</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Assigned Sales Executive</span>
                                <strong>
                                    {followUp.assignedTo
                                        ? `${followUp.assignedTo.name} (${followUp.assignedTo.email})`
                                        : "Unassigned"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Created At</span>
                                <strong>
                                    {followUp.createdAt
                                        ? new Date(followUp.createdAt).toLocaleString()
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Last Updated</span>
                                <strong>
                                    {followUp.updatedAt
                                        ? new Date(followUp.updatedAt).toLocaleString()
                                        : "N/A"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default ViewFollowUp;
