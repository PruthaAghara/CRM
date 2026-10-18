import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./Contacts.css";

interface CustomerSummary {
    _id: string;
    customerName: string;
    companyName: string;
}

function EditContact() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerSummary | null>(null);

    const [formData, setFormData] = useState({
        contactName: "",
        designation: "",
        email: "",
        phone: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContact = async () => {
            if (!id) {
                setError("Missing contact ID");
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
                    `http://localhost:8000/api/contacts/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const item = res.data;
                if (item.customerId) {
                    setCustomer(item.customerId);
                }

                setFormData({
                    contactName: item.contactName || "",
                    designation: item.designation || "",
                    email: item.email || "",
                    phone: item.phone || ""
                });
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load contact information"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        navigate("/contacts");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

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
            setSaving(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login again.");
                setSaving(false);
                return;
            }

            await axios.put(
                `http://localhost:8000/api/contacts/${id}`,
                {
                    contactName: formData.contactName.trim(),
                    designation: formData.designation.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim()
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            navigate("/contacts");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to update contact"
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
                    <p>Loading contact details...</p>
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
                        <h1>Edit Contact</h1>
                        <p>
                            Update contact information for{" "}
                            {customer?.customerName || "Customer"}
                        </p>
                    </header>

                    {error && <div className="add-customer-error">{error}</div>}

                    <form className="add-customer-form" onSubmit={handleSubmit}>
                        {/* Customer Info (Locked) */}
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

                        {/* Contact Details */}
                        <div className="form-section">
                            <h2>Contact Details</h2>

                            <div className="form-group">
                                <label>Contact Name *</label>
                                <input
                                    type="text"
                                    name="contactName"
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
                                    value={formData.designation}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
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

export default EditContact;
