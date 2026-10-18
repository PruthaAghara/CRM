import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ViewCustomer.css";
import "./Interactions.css";

interface InteractionDetail {
    _id: string;
    interactionType: "Call" | "Email" | "Meeting" | "Note";
    interactionDate: string;
    subject?: string;
    description: string;
    status?: string;
    callStatus?: string;
    meetingStatus?: string;
    customerInterest?: string;
    salesConversation?: string;
    digitalCommunicationStatus?: string;
    verificationStatus?: string;
    customerId?: {
        _id: string;
        customerName: string;
        companyName: string;
        email: string;
        phone: string;
        owner?: {
            _id: string;
            name: string;
        };
    };
    createdBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

function ViewInteraction() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [interaction, setInteraction] = useState<InteractionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInteraction = async () => {
            if (!id) {
                setError("Missing interaction ID");
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

                const res = await axios.get(
                    `http://localhost:8000/api/interactions/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setInteraction(res.data);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load interaction"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInteraction();
    }, [id]);

    const handleBack = () => {
        navigate("/interactions");
    };

    const handleDelete = async () => {
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

            await axios.delete(`http://localhost:8000/api/interactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            handleBack();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to delete interaction"
            );
        }
    };

    if (loading) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <p>Loading interaction...</p>
                </main>
            </div>
        );
    }

    if (error || !interaction) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <div className="view-customer-error">
                        {error || "Interaction not found"}
                    </div>
                    <button className="back-button" onClick={() => navigate("/interactions")}>
                        Back to Interactions
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="view-customer-layout">
            <Sidebar />

            <main className="view-customer-main">
                <header className="view-customer-header">
                    <div>
                        <h1>Interaction Details</h1>
                        <p>
                            {interaction.interactionType} log on{" "}
                            {interaction.interactionDate
                                ? new Date(interaction.interactionDate).toLocaleDateString()
                                : ""}
                        </p>
                    </div>

                    <div className="view-header-actions">
                        <button className="back-button" onClick={handleBack}>
                            &larr; Back to Interactions
                        </button>

                        <button
                            className="edit-button"
                            onClick={() => navigate(`/interactions/${id}/edit`)}
                        >
                            Edit Interaction
                        </button>

                        <button className="delete-btn-view" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </header>

                <section className="customer-details-card">
                    {/* Basic Info */}
                    <div className="details-section">
                        <h2>Interaction Overview</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Subject</span>
                                <strong>
                                    {interaction.subject || `${interaction.interactionType} interaction`}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Type</span>
                                <div>
                                    <span
                                        className={`type-badge ${interaction.interactionType.toLowerCase()}`}
                                    >
                                        {interaction.interactionType}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <span>Date</span>
                                <strong>
                                    {interaction.interactionDate
                                        ? new Date(interaction.interactionDate).toLocaleDateString()
                                        : "Not specified"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Status</span>
                                <strong>{interaction.status || "Completed"}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Associated Customer */}
                    <div className="details-section">
                        <h2>Associated Customer</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Customer Name</span>
                                <strong>
                                    {interaction.customerId?.customerName || "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Company</span>
                                <strong>
                                    {interaction.customerId?.companyName || "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Email</span>
                                <strong>
                                    {interaction.customerId?.email || "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Phone</span>
                                <strong>
                                    {interaction.customerId?.phone || "N/A"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Outcome & Details */}
                    <div className="details-section">
                        <h2>Outcome & Feedback</h2>
                        <div className="details-grid">
                            {interaction.callStatus && (
                                <div className="detail-item">
                                    <span>Call Status</span>
                                    <strong>{interaction.callStatus}</strong>
                                </div>
                            )}

                            {interaction.meetingStatus && (
                                <div className="detail-item">
                                    <span>Meeting Status</span>
                                    <strong>{interaction.meetingStatus}</strong>
                                </div>
                            )}

                            {interaction.customerInterest && (
                                <div className="detail-item">
                                    <span>Customer Interest</span>
                                    <strong>{interaction.customerInterest}</strong>
                                </div>
                            )}

                            <div className="detail-item">
                                <span>Logged By</span>
                                <strong>
                                    {interaction.createdBy?.name || "System"} (
                                    {interaction.createdBy?.role || "User"})
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Description */}
                    <div className="details-section">
                        <h2>Notes & Description</h2>
                        <div
                            style={{
                                background: "#f9fafb",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                lineHeight: "1.6",
                                color: "#1f2937",
                                whiteSpace: "pre-wrap"
                            }}
                        >
                            {interaction.description}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="details-section">
                        <h2>System Information</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Created At</span>
                                <strong>
                                    {interaction.createdAt
                                        ? new Date(interaction.createdAt).toLocaleString()
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Last Updated</span>
                                <strong>
                                    {interaction.updatedAt
                                        ? new Date(interaction.updatedAt).toLocaleString()
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

export default ViewInteraction;
