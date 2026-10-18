import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ViewCustomer.css";
import "./Contacts.css";

interface ContactDetail {
    _id: string;
    contactName: string;
    designation?: string;
    email?: string;
    phone?: string;
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
    createdBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

function ViewContact() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [contact, setContact] = useState<ContactDetail | null>(null);
    const [loading, setLoading] = useState(true);
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

                const res = await axios.get(`http://localhost:8000/api/contacts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setContact(res.data);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load contact details"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, [id]);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this contact?"
        );
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(`http://localhost:8000/api/contacts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate("/contacts");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to delete contact"
            );
        }
    };

    const handleBack = () => {
        navigate("/contacts");
    };

    if (loading) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <p>Loading contact details...</p>
                </main>
            </div>
        );
    }

    if (error || !contact) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <div className="view-customer-error">
                        {error || "Contact not found"}
                    </div>
                    <button className="back-button" onClick={() => navigate("/contacts")}>
                        Back to Contacts
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
                        <h1>{contact.contactName}</h1>
                        <p>
                            {contact.designation
                                ? `${contact.designation} at ${contact.customerId?.companyName || contact.customerId?.customerName || "Customer"}`
                                : `Contact for ${contact.customerId?.customerName || "Customer"}`}
                        </p>
                    </div>

                    <div className="view-header-actions">
                        <button className="back-button" onClick={handleBack}>
                            &larr; Back to Contacts
                        </button>

                        <button
                            className="edit-button"
                            onClick={() => navigate(`/contacts/${contact._id}/edit`)}
                        >
                            Edit Contact
                        </button>

                        <button className="delete-btn-view" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </header>

                <section className="customer-details-card">
                    {/* Basic Info */}
                    <div className="details-section">
                        <h2>Contact Information</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Contact Name</span>
                                <strong>{contact.contactName}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Designation</span>
                                <strong>{contact.designation || "Not specified"}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Email</span>
                                <strong>
                                    {contact.email ? (
                                        <a
                                            href={`mailto:${contact.email}`}
                                            style={{ color: "#2563eb", textDecoration: "none" }}
                                        >
                                            {contact.email}
                                        </a>
                                    ) : (
                                        "Not provided"
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Phone</span>
                                <strong>
                                    {contact.phone ? (
                                        <a
                                            href={`tel:${contact.phone}`}
                                            style={{ color: "#2563eb", textDecoration: "none" }}
                                        >
                                            {contact.phone}
                                        </a>
                                    ) : (
                                        "Not provided"
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Associated Customer */}
                    <div className="details-section">
                        <h2>Associated Customer</h2>
                        {contact.customerId ? (
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span>Customer Name</span>
                                    <strong>
                                        <span
                                            style={{ color: "#2563eb", cursor: "pointer" }}
                                            onClick={() =>
                                                navigate(`/customers/${contact.customerId?._id}`)
                                            }
                                        >
                                            {contact.customerId.customerName}
                                        </span>
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Company Name</span>
                                    <strong>{contact.customerId.companyName || "N/A"}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Customer Email</span>
                                    <strong>{contact.customerId.email || "N/A"}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Customer Phone</span>
                                    <strong>{contact.customerId.phone || "N/A"}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Customer Owner (Sales Executive)</span>
                                    <strong>
                                        {contact.customerId.owner?.name
                                            ? `${contact.customerId.owner.name} (${contact.customerId.owner.email || "No email"})`
                                            : "Not assigned"}
                                    </strong>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: "#9ca3af" }}>Customer record has been removed.</p>
                        )}
                    </div>

                    {/* Audit / System Info */}
                    <div className="details-section">
                        <h2>Audit & System Details</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Created By</span>
                                <strong>
                                    {contact.createdBy
                                        ? `${contact.createdBy.name} (${contact.createdBy.role})`
                                        : "System"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Created At</span>
                                <strong>
                                    {contact.createdAt
                                        ? new Date(contact.createdAt).toLocaleString()
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Last Updated</span>
                                <strong>
                                    {contact.updatedAt
                                        ? new Date(contact.updatedAt).toLocaleString()
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

export default ViewContact;
