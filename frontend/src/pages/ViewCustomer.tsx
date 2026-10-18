import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import "./ViewCustomer.css";

interface Customer {
    _id: string;
    customerName: string;
    companyName: string;
    email: string;
    phone: string;
    status: "Active" | "Inactive";
    priority: "HIGH" | "MEDIUM" | "LOW" | "AVERAGE";
    category?: string;
    source?: string;
    businessNature?: string;
    businessType?: string;
    leadStatus: "Hot" | "Warm" | "Cold";
    customerInterest?: string;
    paymentStatus?: string;
    verificationStatus?: string;
    owner?: {
        _id: string;
        name?: string;
        email?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

function ViewCustomer() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchCustomer = async () => {

            try {

                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Please login again.");
                    return;
                }

                const response = await axios.get(
                    `http://localhost:8000/api/customers/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setCustomer(response.data);

            } catch (error: any) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load customer"
                );

            } finally {

                setLoading(false);

            }
        };

        if (id) {
            fetchCustomer();
        }

    }, [id]);


    const handleDelete = async () => {
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
                `http://localhost:8000/api/customers/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            navigate("/customers");

        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to delete customer"
            );
        }
    };

    if (loading) {

        return (
            <div className="view-customer-layout">

                <Sidebar />

                <main className="view-customer-main">

                    <p>Loading customer...</p>

                </main>

            </div>
        );
    }


    if (error || !customer) {

        return (
            <div className="view-customer-layout">

                <Sidebar />

                <main className="view-customer-main">

                    <div className="view-customer-error">
                        {error || "Customer not found"}
                    </div>

                    <button
                        className="back-button"
                        onClick={() => navigate("/customers")}
                    >
                        Back to Customers
                    </button>

                </main>

            </div>
        );
    }


    return (
        <div className="view-customer-layout">

            <Sidebar />

            <main className="view-customer-main">

                <header className="view-customer-header">

                    <div>

                        <h1>Customer Details</h1>

                        <p>
                            View customer information.
                        </p>

                    </div>

                    <div className="view-header-actions">

                        <button
                            className="back-button"
                            onClick={() => navigate("/customers")}
                        >
                            &larr; Back to Customers
                        </button>

                        <button
                            className="edit-button"
                            onClick={() =>
                                navigate(`/customers/${customer._id}/edit`)
                            }
                        >
                            Edit Customer
                        </button>

                        <button
                            className="delete-btn-view"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>

                    </div>

                </header>


                <section className="customer-details-card">

                    <div className="details-section">

                        <h2>Basic Information</h2>

                        <div className="details-grid">

                            <div className="detail-item">
                                <span>Customer Name</span>
                                <strong>
                                    {customer.customerName}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Company Name</span>
                                <strong>
                                    {customer.companyName}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Email</span>
                                <strong>
                                    {customer.email}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Phone</span>
                                <strong>
                                    {customer.phone}
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div className="details-section">

                        <h2>Customer Classification</h2>

                        <div className="details-grid">

                            <div className="detail-item">
                                <span>Status</span>

                                <strong>
                                    {customer.status}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Priority</span>

                                <strong>
                                    {customer.priority}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Category</span>

                                <strong>
                                    {customer.category || "Not specified"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Source</span>

                                <strong>
                                    {customer.source || "Not specified"}
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div className="details-section">

                        <h2>Business Information</h2>

                        <div className="details-grid">

                            <div className="detail-item">
                                <span>Business Nature</span>

                                <strong>
                                    {customer.businessNature || "Not specified"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Business Type</span>

                                <strong>
                                    {customer.businessType || "Not specified"}
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div className="details-section">

                        <h2>Lead Information</h2>

                        <div className="details-grid">

                            <div className="detail-item">
                                <span>Lead Status</span>

                                <strong>
                                    {customer.leadStatus}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Customer Interest</span>

                                <strong>
                                    {customer.customerInterest ||
                                        "Not specified"}
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div className="details-section">

                        <h2>Payment & Verification</h2>

                        <div className="details-grid">

                            <div className="detail-item">
                                <span>Payment Status</span>

                                <strong>
                                    {customer.paymentStatus ||
                                        "Not specified"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Verification</span>

                                <strong>
                                    {customer.verificationStatus ||
                                        "Not specified"}
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div className="details-section">

                        <h2>Customer Ownership</h2>

                        <div className="details-grid">

                            <div className="detail-item">
                                <span>Owner (Sales Executive)</span>

                                <strong>
                                    {customer.owner?.name
                                        ? `${customer.owner.name} (${customer.owner.email || "No email"})`
                                        : "Not assigned"}
                                </strong>
                            </div>

                        </div>

                    </div>




                    <div className="details-section">

                        <h2>System Information</h2>

                        <div className="details-grid">

                            <div className="detail-item">
                                <span>Created</span>

                                <strong>
                                    {customer.createdAt
                                        ? new Date(
                                            customer.createdAt
                                        ).toLocaleDateString()
                                        : "Not available"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Last Updated</span>

                                <strong>
                                    {customer.updatedAt
                                        ? new Date(
                                            customer.updatedAt
                                        ).toLocaleDateString()
                                        : "Not available"}
                                </strong>
                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default ViewCustomer;