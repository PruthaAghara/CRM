import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./Contacts.css";

interface CustomerOption {
    _id: string;
    customerName: string;
    companyName: string;
    email: string;
}

function AddContact() {
    const { customerId: routeCustomerId } = useParams<{ customerId?: string }>();
    const [searchParams] = useSearchParams();
    const queryCustomerId = searchParams.get("customerId");
    const activeCustomerId = routeCustomerId || queryCustomerId || "";

    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerOption | null>(null);
    const [allCustomers, setAllCustomers] = useState<CustomerOption[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(activeCustomerId);

    const [formData, setFormData] = useState({
        contactName: "",
        designation: "",
        email: "",
        phone: ""
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
                    // Fetch accessible customers list for dropdown selection
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
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        if (activeCustomerId) {
            navigate(`/customers/${activeCustomerId}/contacts`);
        } else {
            navigate("/contacts");
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedCustomerId) {
            setError("Please select an existing customer.");
            return;
        }

        if (!formData.contactName.trim()) {
            setError("Contact name is required.");
            return;
        }

        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                setError("Please enter a valid email address.");
                return;
            }
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login again.");
                setLoading(false);
                return;
            }

            await axios.post(
                "http://localhost:8000/api/contacts",
                {
                    customerId: selectedCustomerId,
                    contactName: formData.contactName.trim(),
                    designation: formData.designation.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim()
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (activeCustomerId) {
                navigate(`/customers/${activeCustomerId}/contacts`);
            } else {
                navigate("/contacts");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to add contact"
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
                        <h1>Add Contact</h1>
                        <p>
                            {customer
                                ? `Add a new contact person for ${customer.customerName}`
                                : "Add a contact person for an existing customer"}
                        </p>
                    </header>

                    {error && <div className="add-customer-error">{error}</div>}

                    <form className="add-customer-form" onSubmit={handleSubmit}>
                        {/* Customer Association */}
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

                        {/* Contact Details */}
                        <div className="form-section">
                            <h2>Contact Details</h2>

                            <div className="form-group">
                                <label>Contact Name *</label>
                                <input
                                    type="text"
                                    name="contactName"
                                    placeholder="e.g. John Doe"
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Designation / Role</label>
                                <input
                                    type="text"
                                    name="designation"
                                    placeholder="e.g. VP of Procurement, Operations Lead"
                                    value={formData.designation}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="e.g. john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="e.g. +1 555-0192"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Actions */}
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
                                {loading ? "Saving..." : "Add Contact"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default AddContact;
