import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import "./Customers.css";

interface Customer {
    _id: string;
    customerName: string;
    companyName: string;
    email: string;
    phone: string;
    status: "Active" | "Inactive";
    priority: "HIGH" | "MEDIUM" | "LOW" | "AVERAGE";
    leadStatus: "Hot" | "Warm" | "Cold";
    owner?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
}

function Customers() {

    const navigate = useNavigate();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [leadFilter, setLeadFilter] = useState("");

    const filteredCustomers = customers.filter((customer) => {
        if (search.trim()) {
            const query = search.toLowerCase().trim();
            const matchesName = customer.customerName?.toLowerCase().includes(query);
            const matchesCompany = customer.companyName?.toLowerCase().includes(query);
            const matchesEmail = customer.email?.toLowerCase().includes(query);
            const matchesPhone = customer.phone?.toLowerCase().includes(query);
            const matchesOwner = customer.owner?.name?.toLowerCase().includes(query);
            if (!matchesName && !matchesCompany && !matchesEmail && !matchesPhone && !matchesOwner) {
                return false;
            }
        }

        if (statusFilter && customer.status !== statusFilter) {
            return false;
        }

        if (priorityFilter && customer.priority !== priorityFilter) {
            return false;
        }

        if (leadFilter && customer.leadStatus !== leadFilter) {
            return false;
        }

        return true;
    });


    // =====================================================
    // FETCH CUSTOMERS
    // =====================================================

    useEffect(() => {

        const fetchCustomers = async () => {

            try {

                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Please login again.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    "http://localhost:8000/api/customers",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = response.data;

                if (Array.isArray(data)) {

                    setCustomers(data);

                } else if (Array.isArray(data.customers)) {

                    setCustomers(data.customers);

                } else {

                    setCustomers([]);

                }

            } catch (error: any) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load customers"
                );

            } finally {

                setLoading(false);

            }
        };

        fetchCustomers();

    }, []);


    // =====================================================
    // DELETE CUSTOMER
    // =====================================================

    const handleDelete = async (customerId: string) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this customer?"
        );

        if (!confirmed) {
            return;
        }

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(
                `http://localhost:8000/api/customers/${customerId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Remove deleted customer immediately
            // without refreshing the page.
            setCustomers((previousCustomers) =>
                previousCustomers.filter(
                    (customer) => customer._id !== customerId
                )
            );

            setError("");

        } catch (error: any) {

            setError(
                error.response?.data?.message ||
                "Failed to delete customer"
            );

        }
    };


    // =====================================================
    // VIEW CUSTOMER
    // =====================================================

    const handleView = (customerId: string) => {

        navigate(`/customers/${customerId}`);

    };


    // =====================================================
    // EDIT CUSTOMER
    // =====================================================

    const handleEdit = (customerId: string) => {

        navigate(`/customers/${customerId}/edit`);

    };


    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="customers-layout">

            <Sidebar />

            <main className="customers-main">

                {/* HEADER */}

                <header className="customers-header">

                    <div>

                        <h1>Customers</h1>

                        <p>
                            Manage and view your customers.
                        </p>

                    </div>

                    <button
                        className="add-customer-button"
                        onClick={() =>
                            navigate("/customers/add")
                        }
                    >
                        + Add Customer
                    </button>

                </header>


                {/* ERROR */}

                {error && (
                    <div className="customer-error">
                        {error}
                    </div>
                )}


                {/* FILTERS */}
                <section className="customer-filters">
                    <div className="customer-search">
                        <input
                            type="text"
                            placeholder="Search by name, company, email, phone, or owner..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() => setSearch("")}
                                title="Clear search"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="filter-row">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="">All Priorities</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                            <option value="AVERAGE">Average</option>
                        </select>

                        <select
                            value={leadFilter}
                            onChange={(e) => setLeadFilter(e.target.value)}
                        >
                            <option value="">All Leads</option>
                            <option value="Hot">Hot</option>
                            <option value="Warm">Warm</option>
                            <option value="Cold">Cold</option>
                        </select>

                        {(search || statusFilter || priorityFilter || leadFilter) && (
                            <button
                                type="button"
                                className="reset-filters-btn"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("");
                                    setPriorityFilter("");
                                    setLeadFilter("");
                                }}
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </section>

                {/* CUSTOMER TABLE */}
                <section className="customer-table-card">
                    {loading ? (
                        <div className="customer-loading">
                            Loading customers...
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="customer-empty">
                            <h3>No customers found</h3>
                            <p>
                                {search || statusFilter || priorityFilter || leadFilter
                                    ? "No customers match your current search or filter criteria."
                                    : "Add your first customer to get started."}
                            </p>
                            {(search || statusFilter || priorityFilter || leadFilter) && (
                                <button
                                    type="button"
                                    className="reset-filters-btn"
                                    style={{ marginTop: "14px" }}
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("");
                                        setPriorityFilter("");
                                        setLeadFilter("");
                                    }}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="customer-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Company</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Lead</th>
                                    <th>Owner</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer._id}>
                                        {/* CUSTOMER */}
                                        <td>
                                            <div className="customer-name">
                                                {customer.customerName}
                                            </div>
                                            <div className="customer-email">
                                                {customer.email}
                                            </div>
                                        </td>

                                        {/* COMPANY */}
                                        <td>
                                            <div className="company-name">
                                                {customer.companyName || "-"}
                                            </div>
                                        </td>

                                        {/* PHONE */}
                                        <td>
                                            <div className="customer-phone">
                                                {customer.phone || "-"}
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td>
                                            <span
                                                className={`status-badge ${customer.status?.toLowerCase() || ""}`}
                                            >
                                                {customer.status}
                                            </span>
                                        </td>

                                        {/* PRIORITY */}
                                        <td>
                                            <span
                                                className={`priority-badge ${customer.priority?.toLowerCase() || ""}`}
                                            >
                                                {customer.priority}
                                            </span>
                                        </td>

                                        {/* LEAD */}
                                        <td>
                                            <span
                                                className={`lead-badge ${customer.leadStatus?.toLowerCase() || ""}`}
                                            >
                                                {customer.leadStatus}
                                            </span>
                                        </td>

                                        {/* OWNER */}
                                        <td>
                                            <span className="customer-owner-name">
                                                {customer.owner?.name || "Unassigned"}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td>
                                            <div className="customer-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn-styled view-btn-styled"
                                                    onClick={() => handleView(customer._id)}
                                                    title="View Customer Details"
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
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
                                                    className="action-btn-styled edit-btn-styled"
                                                    onClick={() => handleEdit(customer._id)}
                                                    title="Edit Customer"
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
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
                                                    className="action-btn-styled delete-btn-styled"
                                                    onClick={() => handleDelete(customer._id)}
                                                    title="Delete Customer"
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
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
                </section>

            </main>

        </div>
    );
}

export default Customers;