import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./FollowUps.css";

interface CustomerSummary {
    _id: string;
    customerName: string;
    companyName: string;
}

interface SalesExecutive {
    _id: string;
    name: string;
    email: string;
}

function EditFollowUp() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState<string>("");
    const [customer, setCustomer] = useState<CustomerSummary | null>(null);
    const [salesExecutives, setSalesExecutives] = useState<SalesExecutive[]>([]);
    const [assignedTo, setAssignedTo] = useState("");
    const [assignedToName, setAssignedToName] = useState("");

    const [formData, setFormData] = useState({
        followUpDate: "",
        purpose: "",
        status: "Pending",
        followUpOption: "Call"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFollowUpAndContext = async () => {
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

                // Decode role
                let role = "";
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    role = payload.role;
                    setUserRole(role);
                } catch (e) {
                    // Ignore
                }

                // If Admin/Manager, fetch Sales Executives
                if (role === "Administrator" || role === "Manager") {
                    try {
                        const seRes = await axios.get(
                            "http://localhost:8000/api/users/sales-executives",
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setSalesExecutives(Array.isArray(seRes.data) ? seRes.data : []);
                    } catch (e) {
                        console.error("Failed to load sales executives:", e);
                    }
                }

                const res = await axios.get(
                    `http://localhost:8000/api/followups/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const item = res.data;
                if (item.customerId) {
                    setCustomer(item.customerId);
                }

                if (item.assignedTo) {
                    setAssignedTo(item.assignedTo._id || item.assignedTo);
                    setAssignedToName(item.assignedTo.name || "Assigned User");
                }

                const rawDate = item.followUpDate ? new Date(item.followUpDate).toISOString().slice(0, 10) : "";

                setFormData({
                    followUpDate: rawDate,
                    purpose: item.purpose || "",
                    status: item.status || "Pending",
                    followUpOption: item.followUpOption || "Call"
                });

            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load follow-up information"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFollowUpAndContext();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        navigate("/follow-ups");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.followUpDate) {
            setError("Follow-up date is required.");
            return;
        }

        if (!formData.purpose.trim()) {
            setError("Purpose is required.");
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setSaving(false);
                return;
            }

            const payload: any = {
                followUpDate: formData.followUpDate,
                purpose: formData.purpose.trim(),
                status: formData.status,
                followUpOption: formData.followUpOption
            };

            if (userRole === "Administrator" || userRole === "Manager") {
                payload.assignedTo = assignedTo;
            }

            await axios.put(`http://localhost:8000/api/followups/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate("/follow-ups");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to update follow-up"
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
                    <p>Loading follow-up...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="add-customer-layout">
            <Sidebar />

            <main className="add-customer-main">
                <div className="add-customer-container">
                    <header className="add-customer-header">
                        <h1>Edit Follow-up</h1>
                        <p>
                            Update scheduled details for{" "}
                            {customer?.customerName || "Customer"}
                        </p>
                    </header>

                    {error && <div className="add-customer-error">{error}</div>}

                    <form className="add-customer-form" onSubmit={handleSubmit}>
                        {/* Customer Section (Locked) */}
                        <div className="form-section">
                            <h2>Associated Customer</h2>
                            <div
                                style={{
                                    background: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    padding: "14px 18px",
                                    marginBottom: "10px"
                                }}
                            >
                                <div style={{ fontWeight: 600, color: "#111827", fontSize: "16px" }}>
                                    {customer?.customerName || "N/A"}
                                </div>
                                {customer?.companyName && (
                                    <div style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
                                        Company: {customer.companyName}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assignment Section */}
                        <div className="form-section">
                            <h2>Assignment</h2>
                            {userRole === "Administrator" || userRole === "Manager" ? (
                                <div className="form-group">
                                    <label>Assigned Sales Executive *</label>
                                    <select
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        required
                                    >
                                        {salesExecutives.map((se) => (
                                            <option key={se._id} value={se._id}>
                                                {se.name} ({se.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        background: "#f9fafb",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        padding: "14px 18px",
                                        color: "#374151",
                                        fontSize: "14px"
                                    }}
                                >
                                    <strong>Assigned to:</strong> {assignedToName || "You (Sales Executive)"}
                                </div>
                            )}
                        </div>

                        {/* Follow-Up Details */}
                        <div className="form-section">
                            <h2>Follow-Up Schedule & Details</h2>

                            <div className="form-group">
                                <label>Follow-Up Date *</label>
                                <input
                                    type="date"
                                    name="followUpDate"
                                    value={formData.followUpDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Follow-Up Option / Channel</label>
                                <select
                                    name="followUpOption"
                                    value={formData.followUpOption}
                                    onChange={handleChange}
                                >
                                    <option value="Call">Call</option>
                                    <option value="Email">Email</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Visit">In-person Visit</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Purpose / Agenda *</label>
                                <textarea
                                    name="purpose"
                                    rows={4}
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
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
                </div>
            </main>
        </div>
    );
}

export default EditFollowUp;
