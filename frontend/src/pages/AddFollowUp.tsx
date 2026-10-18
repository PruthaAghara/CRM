import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./FollowUps.css";

interface CustomerOption {
    _id: string;
    customerName: string;
    companyName: string;
    email: string;
}

interface SalesExecutive {
    _id: string;
    name: string;
    email: string;
}

function AddFollowUp() {
    const { customerId: routeCustomerId } = useParams<{ customerId?: string }>();
    const [searchParams] = useSearchParams();
    const queryCustomerId = searchParams.get("customerId");
    const activeCustomerId = routeCustomerId || queryCustomerId || "";

    const navigate = useNavigate();

    const [userRole, setUserRole] = useState<string>("");
    const [customer, setCustomer] = useState<CustomerOption | null>(null);
    const [allCustomers, setAllCustomers] = useState<CustomerOption[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(activeCustomerId);

    const [salesExecutives, setSalesExecutives] = useState<SalesExecutive[]>([]);
    const [assignedTo, setAssignedTo] = useState("");

    const [formData, setFormData] = useState({
        followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        purpose: "",
        status: "Pending",
        followUpOption: "Call"
    });

    const [loading, setLoading] = useState(false);
    const [loadingContext, setLoadingContext] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContext = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setLoadingContext(false);
                return;
            }

            try {
                // Decode role from token payload if possible
                let role = "";
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    role = payload.role;
                    setUserRole(role);
                } catch (e) {
                    // Ignore decode error
                }

                // If Admin or Manager, fetch Sales Executives
                if (role === "Administrator" || role === "Manager") {
                    try {
                        const seRes = await axios.get(
                            "http://localhost:8000/api/users/sales-executives",
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const list = Array.isArray(seRes.data) ? seRes.data : [];
                        setSalesExecutives(list);
                        if (list.length > 0) {
                            setAssignedTo(list[0]._id);
                        }
                    } catch (e) {
                        console.error("Failed to fetch sales executives:", e);
                    }
                }

                // Fetch customer details if activeCustomerId exists
                if (activeCustomerId) {
                    const res = await axios.get(
                        `http://localhost:8000/api/customers/${activeCustomerId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setCustomer(res.data);
                    setSelectedCustomerId(res.data._id);
                } else {
                    // Fetch customers for dropdown
                    const res = await axios.get(
                        "http://localhost:8000/api/customers",
                        { headers: { Authorization: `Bearer ${token}` } }
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
                    "Failed to load required information"
                );
            } finally {
                setLoadingContext(false);
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
            navigate(`/customers/${activeCustomerId}/follow-ups`);
        } else {
            navigate("/follow-ups");
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedCustomerId) {
            setError("Please select an existing customer.");
            return;
        }

        if (!formData.followUpDate) {
            setError("Follow-up date is required.");
            return;
        }

        if (!formData.purpose.trim()) {
            setError("Purpose is required.");
            return;
        }

        if ((userRole === "Administrator" || userRole === "Manager") && !assignedTo) {
            setError("Please assign a Sales Executive.");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setLoading(false);
                return;
            }

            const payload: any = {
                customerId: selectedCustomerId,
                followUpDate: formData.followUpDate,
                purpose: formData.purpose.trim(),
                status: formData.status,
                followUpOption: formData.followUpOption
            };

            if (userRole === "Administrator" || userRole === "Manager") {
                payload.assignedTo = assignedTo;
            }

            await axios.post("http://localhost:8000/api/followups", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (activeCustomerId) {
                navigate(`/customers/${activeCustomerId}/follow-ups`);
            } else {
                navigate("/follow-ups");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to add follow-up"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingContext) {
        return (
            <div className="add-customer-layout">
                <Sidebar />
                <main className="add-customer-main">
                    <p>Loading...</p>
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
                        <h1>Add Follow-up</h1>
                        <p>
                            {customer
                                ? `Schedule follow-up for ${customer.customerName}`
                                : "Schedule a follow-up for an existing customer"}
                        </p>
                    </header>

                    {error && <div className="add-customer-error">{error}</div>}

                    <form className="add-customer-form" onSubmit={handleSubmit}>
                        {/* Customer Section */}
                        <div className="form-section">
                            <h2>Customer Information</h2>

                            {customer ? (
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
                                        {customer.customerName}
                                    </div>
                                    <div style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
                                        {customer.companyName && <span>Company: {customer.companyName} | </span>}
                                        <span>Email: {customer.email}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Select Customer *</label>
                                    <select
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose Customer --</option>
                                        {allCustomers.map((cust) => (
                                            <option key={cust._id} value={cust._id}>
                                                {cust.customerName} {cust.companyName ? `(${cust.companyName})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Assignment Section for Admin / Manager */}
                        {(userRole === "Administrator" || userRole === "Manager") && (
                            <div className="form-section">
                                <h2>Assignment</h2>
                                <div className="form-group">
                                    <label>Assign to Sales Executive *</label>
                                    <select
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose Sales Executive --</option>
                                        {salesExecutives.map((se) => (
                                            <option key={se._id} value={se._id}>
                                                {se.name} ({se.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

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
                                    placeholder="e.g. Discuss revised proposal pricing and contract timeline"
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
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-button"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Add Follow-up"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default AddFollowUp;
