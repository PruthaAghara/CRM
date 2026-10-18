import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./Users.css";

function EditUser() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "Sales Executive",
        status: "Active"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

                const item = res.data;
                setFormData({
                    name: item.name || "",
                    email: item.email || "",
                    role: item.role || "Sales Executive",
                    status: item.status || "Active"
                });
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setError("Access Denied: Only Administrators can edit users.");
                } else if (err.response?.status === 404) {
                    setError("User not found.");
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load user information"
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        navigate(`/users/${id}`);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email is required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError("Please enter a valid email address.");
            return;
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
                `http://localhost:8000/api/users/${id}`,
                {
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    role: formData.role,
                    status: formData.status
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            navigate(`/users/${id}`);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to update user"
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
                    <p>Loading user details...</p>
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
                        <h1>Edit User</h1>
                        <p>Update system role or activate/deactivate account.</p>
                    </header>

                    {error && <div className="add-customer-error">{error}</div>}

                    <form className="add-customer-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h2>User Profile & Permissions</h2>

                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>System Role *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Administrator">Administrator</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Sales Executive">Sales Executive</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Account Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

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

export default EditUser;
