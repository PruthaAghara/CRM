import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ViewCustomer.css";
import "./Tasks.css";

interface TaskDetail {
    _id: string;
    taskTitle: string;
    description?: string;
    dueDate: string;
    status: "Pending" | "In Progress" | "Completed" | "Cancelled";
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

function ViewTask() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTask = async () => {
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

                const res = await axios.get(`http://localhost:8000/api/tasks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTask(res.data);
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setError("You are not authorized to view this task.");
                } else if (err.response?.status === 404) {
                    setError("Task not found.");
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load task details. Please check your network connection."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [id]);

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this task?");
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(`http://localhost:8000/api/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate("/tasks");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to delete task");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "In Progress":
                return <span className="task-badge in-progress">In Progress</span>;
            case "Completed":
                return <span className="task-badge completed">Completed</span>;
            case "Cancelled":
                return <span className="task-badge cancelled">Cancelled</span>;
            case "Pending":
            default:
                return <span className="task-badge pending">Pending</span>;
        }
    };

    if (loading) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <p>Loading task details...</p>
                </main>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="view-customer-layout">
                <Sidebar />
                <main className="view-customer-main">
                    <div className="view-customer-error">
                        {error || "Task not found"}
                    </div>
                    <button className="back-button" onClick={() => navigate("/tasks")}>
                        Back to Tasks
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
                        <h1>{task.taskTitle}</h1>
                        <p>
                            Due on{" "}
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>

                    <div className="view-header-actions">
                        <button className="back-button" onClick={() => navigate("/tasks")}>
                            &larr; Back to Tasks
                        </button>

                        <button
                            className="edit-button"
                            onClick={() => navigate(`/tasks/${task._id}/edit`)}
                        >
                            Edit Task
                        </button>

                        <button className="delete-btn-view" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </header>

                <section className="customer-details-card">
                    {/* Task Overview */}
                    <div className="details-section">
                        <h2>Task Information</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Task Title</span>
                                <strong>{task.taskTitle}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Status</span>
                                <strong>{getStatusBadge(task.status)}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Due Date</span>
                                <strong>
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString()
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                                <span>Description</span>
                                <p style={{ margin: "6px 0 0", color: "#111827", lineHeight: 1.6 }}>
                                    {task.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Assignee Information */}
                    <div className="details-section">
                        <h2>Assigned User</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Assignee Name</span>
                                <strong>
                                    {task.assignedTo?.name || "Unassigned"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Assignee Email</span>
                                <strong>
                                    {task.assignedTo?.email ? (
                                        <a
                                            href={`mailto:${task.assignedTo.email}`}
                                            style={{ color: "#2563eb", textDecoration: "none" }}
                                        >
                                            {task.assignedTo.email}
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Role</span>
                                <strong>
                                    {task.assignedTo?.role || "N/A"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Audit Details */}
                    <div className="details-section">
                        <h2>System Audit Details</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Created At</span>
                                <strong>
                                    {task.createdAt
                                        ? new Date(task.createdAt).toLocaleString()
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Last Updated</span>
                                <strong>
                                    {task.updatedAt
                                        ? new Date(task.updatedAt).toLocaleString()
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

export default ViewTask;
