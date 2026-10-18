import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./Tasks.css";

interface SalesExecutive {
    _id: string;
    name: string;
    email: string;
    status: string;
}

function EditTask() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState<string>("");
    const [salesExecutives, setSalesExecutives] = useState<SalesExecutive[]>([]);
    const [assignedTo, setAssignedTo] = useState("");
    const [assignedToName, setAssignedToName] = useState("");

    const [formData, setFormData] = useState({
        taskTitle: "",
        description: "",
        dueDate: "",
        status: "Pending"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTaskAndContext = async () => {
            if (!id) {
                setError("Missing task ID");
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

                // Decode role
                let role = "";
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    role = payload.role;
                    setUserRole(role);
                } catch (e) {
                    // Ignore decode error
                }

                // If Admin or Manager, fetch active Sales Executives
                if (role === "Administrator" || role === "Manager") {
                    try {
                        const seRes = await axios.get(
                            "http://localhost:8000/api/users/sales-executives",
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const list = Array.isArray(seRes.data)
                            ? seRes.data.filter((u: SalesExecutive) => u.status !== "Inactive")
                            : [];
                        setSalesExecutives(list);
                    } catch (e) {
                        console.error("Failed to load sales executives:", e);
                    }
                }

                const res = await axios.get(`http://localhost:8000/api/tasks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const item = res.data;
                if (item.assignedTo) {
                    setAssignedTo(item.assignedTo._id || item.assignedTo);
                    setAssignedToName(item.assignedTo.name || "Assigned User");
                }

                const rawDate = item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : "";

                setFormData({
                    taskTitle: item.taskTitle || "",
                    description: item.description || "",
                    dueDate: rawDate,
                    status: item.status || "Pending"
                });

            } catch (err: any) {
                if (err.response?.status === 403) {
                    setError("You are not authorized to edit this task.");
                } else if (err.response?.status === 404) {
                    setError("Task not found.");
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load task information"
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTaskAndContext();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        navigate("/tasks");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.taskTitle.trim()) {
            setError("Task title is required.");
            return;
        }

        if (!formData.dueDate) {
            setError("Due date is required.");
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

            const payload: any = {
                taskTitle: formData.taskTitle.trim(),
                description: formData.description.trim(),
                dueDate: formData.dueDate,
                status: formData.status
            };

            if (userRole === "Administrator" || userRole === "Manager") {
                payload.assignedTo = assignedTo;
            }

            await axios.put(`http://localhost:8000/api/tasks/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate("/tasks");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to update task"
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
                    <p>Loading task details...</p>
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
                        <h1>Edit Task</h1>
                        <p>Update task assignments, deadlines, or status.</p>
                    </header>

                    {error && <div className="add-customer-error">{error}</div>}

                    <form className="add-customer-form" onSubmit={handleSubmit}>
                        {/* Assignment Section */}
                        <div className="form-section">
                            <h2>Assignment</h2>
                            {userRole === "Administrator" || userRole === "Manager" ? (
                                <div className="form-group">
                                    <label>Assigned Sales Executive *</label>
                                    <select
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        required
                                    >
                                        {salesExecutives.map((se) => (
                                            <option key={se._id} value={se._id}>
                                                {se.name} ({se.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        background: "#f9fafb",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        padding: "14px 18px",
                                        color: "#374151",
                                        fontSize: "14px"
                                    }}
                                >
                                    <strong>Assignee:</strong> {assignedToName || "You (Sales Executive)"}
                                </div>
                            )}
                        </div>

                        {/* Task Details Section */}
                        <div className="form-section">
                            <h2>Task Details</h2>

                            <div className="form-group">
                                <label>Task Title *</label>
                                <input
                                    type="text"
                                    name="taskTitle"
                                    value={formData.taskTitle}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Due Date *</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
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

export default EditTask;
