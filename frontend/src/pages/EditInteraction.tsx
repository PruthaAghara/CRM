import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./Interactions.css";

interface CustomerSummary {
    _id: string;
    customerName: string;
    companyName: string;
}

function EditInteraction() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerSummary | null>(null);

    const [formData, setFormData] = useState({
        interactionType: "Call",
        interactionDate: "",
        subject: "",
        description: "",
        status: "Completed",
        callStatus: "Connected",
        meetingStatus: "",
        customerInterest: "Interested"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

                const item = res.data;
                if (item.customerId) {
                    setCustomer(item.customerId);
                }

                setFormData({
                    interactionType: item.interactionType || "Call",
                    interactionDate: item.interactionDate
                        ? item.interactionDate.slice(0, 10)
                        : "",
                    subject: item.subject || "",
                    description: item.description || "",
                    status: item.status || "Completed",
                    callStatus: item.callStatus || "Connected",
                    meetingStatus: item.meetingStatus || "",
                    customerInterest: item.customerInterest || "Interested"
                });

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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        navigate("/interactions");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        if (!formData.description.trim()) {
            setError("Description is required.");
            setSaving(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setSaving(false);
                return;
            }

            const payload = {
                interactionType: formData.interactionType,
                interactionDate: formData.interactionDate,
                subject: formData.subject.trim(),
                description: formData.description.trim(),
                status: formData.status,
                callStatus: formData.interactionType === "Call" ? formData.callStatus : undefined,
                meetingStatus: formData.interactionType === "Meeting" ? formData.meetingStatus : undefined,
                customerInterest: formData.customerInterest
            };

            await axios.put(
                `http://localhost:8000/api/interactions/${id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            navigate("/interactions");
        } catch (err: any) {
            console.error("UPDATE INTERACTION ERROR:", err);
            setError(
                err.response?.data?.message ||
                "Failed to update interaction"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="add-customer-layout">
                <Sidebar />
                <main className="add-customer-main">
                    <p>Loading interaction data...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="add-customer-layout">
            <Sidebar />

            <main className="add-customer-main">
                <header className="add-customer-header">
                    <div>
                        <h1>Edit Interaction</h1>
                        <p>
                            Update details for this interaction with{" "}
                            <strong>{customer?.customerName || "Customer"}</strong>
                        </p>
                    </div>
                </header>

                {error && <div className="customer-error">{error}</div>}

                <section className="add-customer-card">
                    <form onSubmit={handleSubmit} className="customer-form">
                        {/* CUSTOMER (PRESERVED & READ ONLY) */}
                        <div className="form-section">
                            <h2>Associated Customer</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Customer (Locked)</label>
                                    <input
                                        type="text"
                                        value={
                                            customer
                                                ? `${customer.customerName} (${customer.companyName})`
                                                : "Customer"
                                        }
                                        disabled
                                        style={{
                                            backgroundColor: "#f3f4f6",
                                            color: "#111827",
                                            fontWeight: 600,
                                            cursor: "not-allowed"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* INTERACTION DETAILS */}
                        <div className="form-section">
                            <h2>Interaction Details</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Interaction Type *</label>
                                    <select
                                        name="interactionType"
                                        value={formData.interactionType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Call">Call</option>
                                        <option value="Email">Email</option>
                                        <option value="Meeting">Meeting</option>
                                        <option value="Note">Note</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        name="interactionDate"
                                        value={formData.interactionDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Subject / Title</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Completed">Completed</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SPECIFIC OUTCOME */}
                        <div className="form-section">
                            <h2>Outcome & Interest</h2>
                            <div className="form-grid">
                                {formData.interactionType === "Call" && (
                                    <div className="form-group">
                                        <label>Call Status</label>
                                        <select
                                            name="callStatus"
                                            value={formData.callStatus}
                                            onChange={handleChange}
                                        >
                                            <option value="Connected">Connected</option>
                                            <option value="Call Not Pick Up">Call Not Pick Up</option>
                                            <option value="Busy">Busy</option>
                                            <option value="Left Voicemail">Left Voicemail</option>
                                        </select>
                                    </div>
                                )}

                                {formData.interactionType === "Meeting" && (
                                    <div className="form-group">
                                        <label>Meeting Status</label>
                                        <select
                                            name="meetingStatus"
                                            value={formData.meetingStatus}
                                            onChange={handleChange}
                                        >
                                            <option value="Completed">Completed</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Rescheduled">Rescheduled</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Customer Interest</label>
                                    <select
                                        name="customerInterest"
                                        value={formData.customerInterest}
                                        onChange={handleChange}
                                    >
                                        <option value="Hot Lead">Hot Lead</option>
                                        <option value="Warm Lead">Warm Lead</option>
                                        <option value="Cold Lead">Cold Lead</option>
                                        <option value="Interested">Interested</option>
                                        <option value="Not Interested">Not Interested</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* NOTES & DESCRIPTION */}
                        <div className="form-section">
                            <h2>Notes & Description *</h2>
                            <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                                <div className="form-group">
                                    <textarea
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #d1d5db",
                                            fontSize: "14px",
                                            fontFamily: "inherit"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SINGLE CANCEL BUTTON AND SAVE BUTTON */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-button"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default EditInteraction;
