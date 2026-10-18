import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Tasks.css";
import "./Customers.css";

interface TaskItem {
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
}

type TabType = "all" | "upcoming" | "overdue" | "Pending" | "In Progress" | "Completed" | "Cancelled";

function Tasks() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const fetchTasks = async (tab: TabType) => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                setLoading(false);
                return;
            }

            let endpoint = "http://localhost:8000/api/tasks";
            if (tab === "upcoming") {
                endpoint += "?upcoming=true";
            } else if (tab === "overdue") {
                endpoint += "?overdue=true";
            } else if (tab !== "all") {
                endpoint += `?status=${encodeURIComponent(tab)}`;
            }

            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const list = Array.isArray(res.data) ? res.data : [];
            setTasks(list);
            setFilteredTasks(list);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to load tasks"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks(activeTab);
    }, [activeTab]);

    useEffect(() => {
        let list = tasks;

        if (search.trim()) {
            const query = search.toLowerCase();
            list = list.filter((item) =>
                item.taskTitle.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query)) ||
                (item.assignedTo?.name && item.assignedTo.name.toLowerCase().includes(query)) ||
                item.status.toLowerCase().includes(query)
            );
        }

        setFilteredTasks(list);
    }, [search, tasks]);

    const handleDelete = async (taskId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this task?");
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(`http://localhost:8000/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTasks((prev) => prev.filter((item) => item._id !== taskId));
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete task");
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

    return (
        <div className="tasks-layout">
            <Sidebar />

            <main className="tasks-main">
                {/* Header */}
                <header className="tasks-header">
                    <div>
                        <h1>Tasks</h1>
                        <p>Track assignments, deadlines, and project deliverables.</p>
                    </div>

                    <div className="tasks-header-actions">
                        <button
                            className="add-customer-btn"
                            onClick={() => navigate("/tasks/add")}
                        >
                            + Add Task
                        </button>
                    </div>
                </header>

                {error && <div className="tasks-error">{error}</div>}

                {/* Filter Tabs using backend endpoints */}
                <div className="tasks-tabs">
                    <button
                        className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All Tasks
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
                        onClick={() => setActiveTab("upcoming")}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "overdue" ? "active" : ""}`}
                        onClick={() => setActiveTab("overdue")}
                    >
                        Overdue
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "Pending" ? "active" : ""}`}
                        onClick={() => setActiveTab("Pending")}
                    >
                        Pending
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "In Progress" ? "active" : ""}`}
                        onClick={() => setActiveTab("In Progress")}
                    >
                        In Progress
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "Completed" ? "active" : ""}`}
                        onClick={() => setActiveTab("Completed")}
                    >
                        Completed
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "Cancelled" ? "active" : ""}`}
                        onClick={() => setActiveTab("Cancelled")}
                    >
                        Cancelled
                    </button>
                </div>

                {/* Search Bar */}
                <div className="tasks-filters">
                    <div className="tasks-search">
                        <input
                            type="text"
                            placeholder="Search tasks by title, description, assignee, status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="tasks-table-card">
                    {loading ? (
                        <div className="tasks-empty">
                            <p>Loading tasks...</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="tasks-empty">
                            <h3>No tasks found</h3>
                            <p>
                                {search
                                    ? "No tasks match your search."
                                    : "No tasks found for this filter."}
                            </p>
                            {!search && activeTab === "all" && (
                                <button
                                    className="add-customer-btn"
                                    style={{ marginTop: "14px" }}
                                    onClick={() => navigate("/tasks/add")}
                                >
                                    + Add Task
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="tasks-table">
                            <thead>
                                <tr>
                                    <th>Task Title</th>
                                    <th>Description</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <strong
                                                style={{
                                                    color: "#111827",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() =>
                                                    navigate(`/tasks/${item._id}`)
                                                }
                                            >
                                                {item.taskTitle}
                                            </strong>
                                        </td>
                                        <td style={{ maxWidth: "260px", color: "#6b7280" }}>
                                            {item.description || "-"}
                                        </td>
                                        <td>
                                            <strong>
                                                {item.dueDate
                                                    ? new Date(item.dueDate).toLocaleDateString()
                                                    : "N/A"}
                                            </strong>
                                        </td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td>
                                            {item.assignedTo?.name || "Unassigned"}
                                            {item.assignedTo?.role && (
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#6b7280",
                                                        display: "block"
                                                    }}
                                                >
                                                    ({item.assignedTo.role})
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="task-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn view-btn"
                                                    onClick={() =>
                                                        navigate(`/tasks/${item._id}`)
                                                    }
                                                    title="View Task Details"
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
                                                        navigate(`/tasks/${item._id}/edit`)
                                                    }
                                                    title="Edit Task"
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
                                                        handleDelete(item._id)
                                                    }
                                                    title="Delete Task"
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

export default Tasks;
