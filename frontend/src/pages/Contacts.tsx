import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Contacts.css";
import "./Customers.css";

interface ContactItem {
    _id: string;
    contactName: string;
    designation?: string;
    email?: string;
    phone?: string;
    customerId?: {
        _id: string;
        customerName: string;
        companyName: string;
    };
    createdBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    createdAt?: string;
}

function Contacts() {
    const navigate = useNavigate();

    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<ContactItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login again.");
                    setLoading(false);
                    return;
                }

                const res = await axios.get("http://localhost:8000/api/contacts", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const list = Array.isArray(res.data) ? res.data : [];
                setContacts(list);
                setFilteredContacts(list);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load contacts"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    useEffect(() => {
        let list = contacts;

        if (search.trim()) {
            const query = search.toLowerCase();
            list = list.filter((item) =>
                (item.contactName && item.contactName.toLowerCase().includes(query)) ||
                (item.designation && item.designation.toLowerCase().includes(query)) ||
                (item.email && item.email.toLowerCase().includes(query)) ||
                (item.phone && item.phone.toLowerCase().includes(query)) ||
                (item.customerId?.customerName &&
                    item.customerId.customerName.toLowerCase().includes(query)) ||
                (item.customerId?.companyName &&
                    item.customerId.companyName.toLowerCase().includes(query))
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

            setContacts((prev) => prev.filter((item) => item._id !== contactId));
        } catch (err: any) {
            alert(
                err.response?.data?.message ||
                "Failed to delete contact"
            );
        }
    };

    return (
        <div className="contacts-layout">
            <Sidebar />

            <main className="contacts-main">
                {/* Header */}
                <header className="contacts-header">
                    <div>
                        <h1>Contacts</h1>
                        <p>Manage customer contacts and representatives.</p>
                    </div>

                    <div className="contacts-header-actions">
                        <button
                            className="add-customer-btn"
                            onClick={() => navigate("/contacts/add")}
                        >
                            + Add Contact
                        </button>
                    </div>
                </header>

                {error && <div className="contacts-error">{error}</div>}

                {/* Filter and Search */}
                <div className="contacts-filters">
                    <div className="contacts-search">
                        <input
                            type="text"
                            placeholder="Search contacts by name, customer, email, phone, designation..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="contacts-table-card">
                    {loading ? (
                        <div className="contacts-empty">
                            <p>Loading contacts...</p>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="contacts-empty">
                            <h3>No contacts found</h3>
                            <p>
                                {search
                                    ? "No contacts match your search."
                                    : "No contacts available. Start by adding one!"}
                            </p>
                            {!search && (
                                <button
                                    className="add-customer-btn"
                                    style={{ marginTop: "14px" }}
                                    onClick={() => navigate("/contacts/add")}
                                >
                                    + Add Contact
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="contacts-table">
                            <thead>
                                <tr>
                                    <th>Contact Name</th>
                                    <th>Designation</th>
                                    <th>Customer</th>
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
                                            {contact.customerId ? (
                                                <span
                                                    onClick={() =>
                                                        navigate(
                                                            `/customers/${contact.customerId?._id}`
                                                        )
                                                    }
                                                    style={{
                                                        color: "#2563eb",
                                                        cursor: "pointer",
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {contact.customerId.customerName}
                                                    {contact.customerId.companyName && (
                                                        <span
                                                            style={{
                                                                color: "#6b7280",
                                                                fontSize: "12px",
                                                                display: "block"
                                                            }}
                                                        >
                                                            {contact.customerId.companyName}
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#9ca3af" }}>
                                                    Deleted Customer
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {contact.email ? (
                                                <a
                                                    href={`mailto:${contact.email}`}
                                                    style={{
                                                        color: "#2563eb",
                                                        textDecoration: "none",
                                                        wordBreak: "break-all",
                                                        maxWidth: "180px",
                                                        display: "inline-block"
                                                    }}
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

export default Contacts;
