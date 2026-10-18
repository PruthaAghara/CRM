import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Contacts.css";
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

interface Contact {
    _id: string;
    contactName: string;
    designation?: string;
    email?: string;
    phone?: string;
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
    createdAt?: string;
}

function CustomerContacts() {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerInfo | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchCustomerAndContacts = async () => {
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

                // 2. Fetch Customer Contacts
                const contactsRes = await axios.get(
                    `http://localhost:8000/api/contacts?customerId=${customerId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = contactsRes.data;
                const list = Array.isArray(data) ? data : [];
                setContacts(list);
                setFilteredContacts(list);

            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load contacts for this customer"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerAndContacts();
    }, [customerId]);

    useEffect(() => {
        let list = contacts;

        if (search.trim()) {
            const query = search.toLowerCase();
            list = list.filter((item) =>
                (item.contactName && item.contactName.toLowerCase().includes(query)) ||
                (item.designation && item.designation.toLowerCase().includes(query)) ||
                (item.email && item.email.toLowerCase().includes(query)) ||
                (item.phone && item.phone.toLowerCase().includes(query))
            );
        }

        setFilteredContacts(list);
    }, [search, contacts]);

    const handleDelete = async (contactId: string) => {
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

            await axios.delete(`http://localhost:8000/api/contacts/${contactId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from state
            setContacts((prev) => prev.filter((item) => item._id !== contactId));
        } catch (err: any) {
            alert(
                err.response?.data?.message ||
                "Failed to delete contact"
            );
        }
    };

    if (loading) {
        return (
            <div className="contacts-layout">
                <Sidebar />
                <main className="contacts-main">
                    <p>Loading customer contacts...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="contacts-layout">
            <Sidebar />

            <main className="contacts-main">
                {/* Header */}
                <header className="contacts-header">
                    <div>
                        <h1>
                            Contacts: {customer ? customer.customerName : "Customer"}
                        </h1>
                        <p>
                            Manage key contact persons and representatives for this customer.
                        </p>
                    </div>

                    <div className="contacts-header-actions">
                        <button
                            className="back-button"
                            onClick={() => navigate(`/customers/${customerId}`)}
                        >
                            Back to Customer
                        </button>
                        <button
                            className="add-customer-btn"
                            onClick={() =>
                                navigate(`/customers/${customerId}/contacts/add`)
                            }
                        >
                            + Add Contact
                        </button>
                    </div>
                </header>

                {error && <div className="contacts-error">{error}</div>}

                {/* Customer Context Card */}
                {customer && (
                    <div className="contact-context-banner">
                        <div>
                            <h2>{customer.customerName}</h2>
                            <p>
                                <strong>Company:</strong> {customer.companyName || "N/A"} &nbsp;|&nbsp;
                                <strong> Email:</strong> {customer.email} &nbsp;|&nbsp;
                                <strong> Phone:</strong> {customer.phone}
                            </p>
                        </div>
                        <div>
                            <span className="badge badge-cold" style={{ fontSize: "13px" }}>
                                Owner: {customer.owner?.name || "Unassigned"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="contacts-filters">
                    <div className="contacts-search">
                        <input
                            type="text"
                            placeholder="Search contacts by name, designation, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Contacts Table */}
                <div className="contacts-table-card">
                    {filteredContacts.length === 0 ? (
                        <div className="contacts-empty">
                            <h3>No contacts found</h3>
                            <p>
                                {search
                                    ? "No contacts match your search."
                                    : "No contacts recorded for this customer yet."}
                            </p>
                            {!search && (
                                <button
                                    className="add-customer-btn"
                                    style={{ marginTop: "14px" }}
                                    onClick={() =>
                                        navigate(`/customers/${customerId}/contacts/add`)
                                    }
                                >
                                    + Add First Contact
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="contacts-table">
                            <thead>
                                <tr>
                                    <th>Contact Name</th>
                                    <th>Designation</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Added By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map((contact) => (
                                    <tr key={contact._id}>
                                        <td>
                                            <strong style={{ color: "#111827" }}>
                                                {contact.contactName}
                                            </strong>
                                        </td>
                                        <td>
                                            {contact.designation || (
                                                <span style={{ color: "#9ca3af" }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {contact.email ? (
                                                <a
                                                    href={`mailto:${contact.email}`}
                                                    style={{ color: "#2563eb", textDecoration: "none" }}
                                                >
                                                    {contact.email}
                                                </a>
                                            ) : (
                                                <span style={{ color: "#9ca3af" }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {contact.phone || (
                                                <span style={{ color: "#9ca3af" }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {contact.createdBy?.name || "System"}
                                            {contact.createdBy?.role && (
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#6b7280",
                                                        display: "block"
                                                    }}
                                                >
                                                    ({contact.createdBy.role})
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="contact-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn view-btn"
                                                    onClick={() =>
                                                        navigate(`/contacts/${contact._id}`)
                                                    }
                                                    title="View Contact Details"
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    <span>View</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="action-btn edit-btn"
                                                    onClick={() =>
                                                        navigate(`/contacts/${contact._id}/edit`)
                                                    }
                                                    title="Edit Contact"
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                        <path d="m15 5 4 4" />
                                                    </svg>
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="action-btn delete-btn"
                                                    onClick={() =>
                                                        handleDelete(contact._id)
                                                    }
                                                    title="Delete Contact"
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        <line x1="10" y1="11" x2="10" y2="17" />
                                                        <line x1="14" y1="11" x2="14" y2="17" />
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}

export default CustomerContacts;
