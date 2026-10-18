import { useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./Users.css";

function AddUser() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Sales Executive"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        navigate("/users");
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

        if (!formData.password) {
            setError("Password is required.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
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

            await axios.post(
                "http://localhost:8000/api/users",
                {
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    role: formData.role
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Clean state and redirect
            setFormData({ name: "", email: "", password: "", role: "Sales Executive" });
            navigate("/users");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to create user"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-customer-layout">
            <Sidebar />

            <main className="add-customer-main">
                <div className="add-customer-container">
                    <header className="add-customer-header">
                        <h1>Create User</h1>
                        <p>Register a new system user and define their CRM role.</p>
                    </header>

                    {error && <div className="add-customer-error">{error}</div>}

                    <form className="add-customer-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h2>User Credentials & Profile</h2>

                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Sarah Jenkins"
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
                                    placeholder="e.g. sarah.jenkins@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter secure initial password (min 6 characters)"
                                    value={formData.password}
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
                        </div>

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
                                {loading ? "Creating..." : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default AddUser;
