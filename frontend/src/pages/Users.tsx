import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Users.css";
import "./Customers.css";

interface UserItem {
    _id: string;
    name: string;
    email: string;
    role: "Administrator" | "Manager" | "Sales Executive";
    status: "Active" | "Inactive";
    createdAt?: string;
}

function Users() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserItem[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login again.");
                    setLoading(false);
                    return;
                }

                // Decode role
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    if (payload.role !== "Administrator") {
                        setIsAuthorized(false);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    // Ignore
                }

                const res = await axios.get("http://localhost:8000/api/users", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const list = Array.isArray(res.data) ? res.data : [];
                setUsers(list);
                setFilteredUsers(list);
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setIsAuthorized(false);
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load users"
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        let list = users;

        if (search.trim()) {
            const query = search.toLowerCase();
            list = list.filter((item) =>
                item.name.toLowerCase().includes(query) ||
                item.email.toLowerCase().includes(query) ||
                item.role.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(list);
    }, [search, users]);

    const handleDelete = async (userId: string, userName: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete user "${userName}"?`);
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(`http://localhost:8000/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers((prev) => prev.filter((item) => item._id !== userId));
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete user");
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

    if (!isAuthorized) {
        return (
            <div className="users-layout">
                <Sidebar />
                <main className="users-main">
                    <div className="users-error">
                        Access Denied: User Management is only accessible to Administrators.
                    </div>
                    <button className="back-button" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="users-layout">
            <Sidebar />

            <main className="users-main">
                {/* Header */}
                <header className="users-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Manage system users, access roles, and account statuses.</p>
                    </div>

                    <div className="users-header-actions">
                        <button
                            className="add-customer-btn"
                            onClick={() => navigate("/users/add")}
                        >
                            + Add User
                        </button>
                    </div>
                </header>

                {error && <div className="users-error">{error}</div>}

                {/* Search Bar */}
                <div className="users-filters">
                    <div className="users-search">
                        <input
                            type="text"
                            placeholder="Search users by name, email, role, or status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="users-table-card">
                    {loading ? (
                        <div className="users-empty">
                            <p>Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="users-empty">
                            <h3>No users found</h3>
                            <p>
                                {search
                                    ? "No users match your search."
                                    : "No users registered in the system."}
                            </p>
                            {!search && (
                                <button
                                    className="add-customer-btn"
                                    style={{ marginTop: "14px" }}
                                    onClick={() => navigate("/users/add")}
                                >
                                    + Add User
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <strong
                                                style={{
                                                    color: "#111827",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() =>
                                                    navigate(`/users/${item._id}`)
                                                }
                                            >
                                                {item.name}
                                            </strong>
                                        </td>
                                        <td>
                                            <a
                                                href={`mailto:${item.email}`}
                                                style={{ color: "#2563eb", textDecoration: "none" }}
                                            >
                                                {item.email}
                                            </a>
                                        </td>
                                        <td>{getRoleBadge(item.role)}</td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td>
                                            <div className="user-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn view-btn"
                                                    onClick={() =>
                                                        navigate(`/users/${item._id}`)
                                                    }
                                                    title="View User Details"
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
                                                        navigate(`/users/${item._id}/edit`)
                                                    }
                                                    title="Edit User"
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
                                                        handleDelete(item._id, item.name)
                                                    }
                                                    title="Delete User"
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

export default Users;
