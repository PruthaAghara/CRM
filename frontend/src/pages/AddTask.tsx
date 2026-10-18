import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";
import "./Tasks.css";

interface SalesExecutive {
    _id: string;
    name: string;
    email: string;
    status: string;
}

function AddTask() {
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState<string>("");
    const [salesExecutives, setSalesExecutives] = useState<SalesExecutive[]>([]);
    const [assignedTo, setAssignedTo] = useState("");

    const [formData, setFormData] = useState({
        taskTitle: "",
        description: "",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "Pending"
    });

    const [loading, setLoading] = useState(false);
    const [loadingContext, setLoadingContext] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContext = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setLoadingContext(false);
                return;
            }

            try {
                let role = "";
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    role = payload.role;
                    setUserRole(role);
                } catch (e) {
                    // Ignore decode error
                }

                if (role === "Administrator" || role === "Manager") {
                    const seRes = await axios.get(
                        "http://localhost:8000/api/users/sales-executives",
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const list = Array.isArray(seRes.data)
                        ? seRes.data.filter((u: SalesExecutive) => u.status !== "Inactive")
                        : [];
                    setSalesExecutives(list);
                    if (list.length > 0) {
                        setAssignedTo(list[0]._id);
                    }
                }
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load user information"
                );
            } finally {
                setLoadingContext(false);
            }
        };

        fetchContext();
    }, []);

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

        if ((userRole === "Administrator" || userRole === "Manager") && !assignedTo) {
            setError("Please assign a Sales Executive.");
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

            const payload: any = {
                taskTitle: formData.taskTitle.trim(),
                description: formData.description.trim(),
                dueDate: formData.dueDate,
                status: formData.status
            };

            if (userRole === "Administrator" || userRole === "Manager") {
                payload.assignedTo = assignedTo;
            }

            await axios.post("http://localhost:8000/api/tasks", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate("/tasks");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to create task"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingContext) {
        return (
            <div className="add-customer-layout">
                <Sidebar />
                <main className="add-customer-main">
                    <p>Loading...</p>
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
                        <h1>Create Task</h1>
                        <p>Assign a new task with deadlines and deliverables.</p>
                    </header>

                    {error && <div className="add-customer-error">{error}</div>}

                    <form className="add-customer-form" onSubmit={handleSubmit}>
                        {/* Assignee Section */}
                        <div className="form-section">
                            <h2>Assignment</h2>
                            {userRole === "Administrator" || userRole === "Manager" ? (
                                <div className="form-group">
                                    <label>Assign to Sales Executive *</label>
                                    <select
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose Sales Executive --</option>
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
                                    <strong>Assignee:</strong> You (Sales Executive - automatically assigned)
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
                                    placeholder="e.g. Prepare product demo for Acme Corp"
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
                                    placeholder="Provide detailed instructions or context for this task..."
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
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-button"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Task"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default AddTask;
