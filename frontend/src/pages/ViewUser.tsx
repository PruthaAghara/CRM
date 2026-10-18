import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ViewCustomer.css";
import "./Users.css";

interface UserDetail {
    _id: string;
    name: string;
    email: string;
    role: "Administrator" | "Manager" | "Sales Executive";
    status: "Active" | "Inactive";
    createdAt?: string;
    updatedAt?: string;
}

function ViewUser() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) {
                setError("Missing user ID");
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

                const res = await axios.get(`http://localhost:8000/api/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(res.data);
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setError("Access Denied: Only Administrators can view user details.");
                } else if (err.response?.status === 404) {
                    setError("User not found.");
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load user details"
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const handleDelete = async () => {
        if (!user) return;
        const confirmed = window.confirm(`Are you sure you want to delete user "${user.name}"?`);
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(`http://localhost:8000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate("/users");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to delete user");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "Administrator":
                return <span className="role-badge admin">Administrator</span>;
            case "Manager":
                return <span className="role-badge manager">Manager</span>;
            case "Sales Executive":
            default:
                return <span className="role-badge sales">Sales Executive</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === "Inactive") {
            return <span className="status-badge inactive">Inactive</span>;
        }
        return <span className="status-badge active">Active</span>;
    };

    if (loading) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <p>Loading user details...</p>
                </main>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <div className="view-customer-error">
                        {error || "User not found"}
                    </div>
                    <button className="back-button" onClick={() => navigate("/users")}>
                        Back to Users
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
                        <h1>{user.name}</h1>
                        <p>{user.email}</p>
                    </div>

                    <div className="view-header-actions">
                        <button className="back-button" onClick={() => navigate("/users")}>
                            Back to Users
                        </button>

                        <button
                            className="edit-button"
                            onClick={() => navigate(`/users/${user._id}/edit`)}
                        >
                            Edit User
                        </button>

                        <button className="delete-btn-view" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </header>

                <section className="customer-details-card">
                    {/* Basic Info */}
                    <div className="details-section">
                        <h2>User Profile</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Full Name</span>
                                <strong>{user.name}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Email Address</span>
                                <strong>
                                    <a
                                        href={`mailto:${user.email}`}
                                        style={{ color: "#2563eb", textDecoration: "none" }}
                                    >
                                        {user.email}
                                    </a>
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>System Role</span>
                                <strong>{getRoleBadge(user.role)}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Account Status</span>
                                <strong>{getStatusBadge(user.status)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Audit Information */}
                    <div className="details-section">
                        <h2>System Audit Details</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Account Created</span>
                                <strong>
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleString()
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Last Updated</span>
                                <strong>
                                    {user.updatedAt
                                        ? new Date(user.updatedAt).toLocaleString()
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

export default ViewUser;
