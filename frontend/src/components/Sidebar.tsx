import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.role === "Administrator") {
                    setIsAdmin(true);
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                CRM
            </div>

            <nav className="sidebar-nav">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/customers"
                    className="nav-link"
                >
                    Customers
                </NavLink>

                <NavLink
                    to="/contacts"
                    className="nav-link"
                >
                    Contacts
                </NavLink>

                <NavLink
                    to="/interactions"
                    className="nav-link"
                >
                    Interactions
                </NavLink>

                <NavLink
                    to="/follow-ups"
                    className="nav-link"
                >
                    Follow-ups
                </NavLink>

                <NavLink
                    to="/tasks"
                    className="nav-link"
                >
                    Tasks
                </NavLink>

                {isAdmin && (
                    <NavLink
                        to="/users"
                        className="nav-link"
                    >
                        Users
                    </NavLink>
                )}

            </nav>

            <div className="sidebar-footer">
                <button
                    type="button"
                    className="sidebar-logout-btn"
                    onClick={handleLogout}
                    title="Logout from CRM"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;