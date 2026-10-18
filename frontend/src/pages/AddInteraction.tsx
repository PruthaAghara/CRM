import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./Interactions.css";

interface CustomerOption {
    _id: string;
    customerName: string;
    companyName: string;
    email: string;
}

function AddInteraction() {
    const { customerId: routeCustomerId } = useParams<{ customerId?: string }>();
    const [searchParams] = useSearchParams();
    const queryCustomerId = searchParams.get("customerId");
    const activeCustomerId = routeCustomerId || queryCustomerId || "";

    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerOption | null>(null);
    const [allCustomers, setAllCustomers] = useState<CustomerOption[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(activeCustomerId);

    const [formData, setFormData] = useState({
        interactionType: "Call",
        interactionDate: new Date().toISOString().slice(0, 10),
        subject: "",
        description: "",
        status: "Completed",
        callStatus: "Connected",
        meetingStatus: "",
        customerInterest: "Interested"
    });

    const [loading, setLoading] = useState(false);
    const [loadingCustomer, setLoadingCustomer] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContext = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setLoadingCustomer(false);
                return;
            }

            try {
                if (activeCustomerId) {
                    // Fetch this specific customer
                    const res = await axios.get(
                        `http://localhost:8000/api/customers/${activeCustomerId}`,
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    setCustomer(res.data);
                    setSelectedCustomerId(res.data._id);
                } else {
                    // Fetch accessible customers list for dropdown fallback
                    const res = await axios.get(
                        "http://localhost:8000/api/customers",
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    const list = Array.isArray(res.data)
                        ? res.data
                        : res.data.customers || [];
                    setAllCustomers(list);
                    if (list.length > 0) {
                        setSelectedCustomerId(list[0]._id);
                    }
                }
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load customer information"
                );
            } finally {
                setLoadingCustomer(false);
            }
        };

        fetchContext();
    }, [activeCustomerId]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        if (activeCustomerId) {
            navigate(`/customers/${activeCustomerId}/interactions`);
        } else {
            navigate("/interactions");
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const targetCustId = activeCustomerId || selectedCustomerId;

        if (!targetCustId) {
            setError("Please select a customer.");
            setLoading(false);
            return;
        }

        if (!formData.description.trim()) {
            setError("Please enter a description or notes for this interaction.");
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

            const payload = {
                customerId: targetCustId,
                interactionType: formData.interactionType,
                interactionDate: formData.interactionDate,
                subject: formData.subject.trim() || `${formData.interactionType} with ${customer?.customerName || "Customer"}`,
                description: formData.description.trim(),
                status: formData.status,
                callStatus: formData.interactionType === "Call" ? formData.callStatus : undefined,
                meetingStatus: formData.interactionType === "Meeting" ? formData.meetingStatus : undefined,
                customerInterest: formData.customerInterest
            };

            await axios.post("http://localhost:8000/api/interactions", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (activeCustomerId) {
                navigate(`/customers/${activeCustomerId}/interactions`);
            } else {
                navigate("/interactions");
            }
        } catch (err: any) {
            console.error("ADD INTERACTION ERROR:", err);
            setError(
                err.response?.data?.message ||
                "Failed to add interaction"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingCustomer) {
        return (
            <div className="add-customer-layout">
                <Sidebar />
                <main className="add-customer-main">
                    <p>Loading customer details...</p>
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
                        <h1>Add Interaction</h1>
                        <p>
                            Log communication or activity for{" "}
                            <strong>{customer ? customer.customerName : "Customer"}</strong>
                        </p>
                    </div>
                </header>

                {error && <div className="customer-error">{error}</div>}

                <section className="add-customer-card">
                    <form onSubmit={handleSubmit} className="customer-form">
                        {/* CUSTOMER SELECTION / DISPLAY */}
                        <div className="form-section">
                            <h2>Customer Information</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Customer</label>
                                    {customer ? (
                                        <input
                                            type="text"
                                            value={`${customer.customerName} (${customer.companyName})`}
                                            disabled
                                            style={{
                                                backgroundColor: "#f3f4f6",
                                                color: "#111827",
                                                fontWeight: 600,
                                                cursor: "not-allowed"
                                            }}
                                        />
                                    ) : (
                                        <select
                                            value={selectedCustomerId}
                                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Customer</option>
                                            {allCustomers.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.customerName} - {c.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
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
                                        placeholder="e.g. Discussed proposal, Product demo"
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

                        {/* SPECIFIC OUTCOME DETAILS */}
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
                                        placeholder="Record key discussion points, customer feedback, next steps..."
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

                        {/* ACTIONS */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-button"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Save Interaction"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default AddInteraction;
