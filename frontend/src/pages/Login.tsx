import { useState, type FormEvent } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:8000/api/auth/login",
                {
                    email,
                    password
                }
            );

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("role", user.role);

            console.log("Login successful:", user);

            // Temporary for now.
            // We will replace this with React Router
            // when Dashboard is created.
            window.location.href = "/dashboard";

        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* LEFT BRAND SECTION */}
            <div className="login-brand">

                <div className="brand-content">

                    <div className="brand-logo">
                        CRM
                    </div>

                    <h1>CRM Management System</h1>

                    <p>
                        Manage customers, interactions, tasks
                        and sales activities in one place.
                    </p>

                    <div className="brand-features">

                        <div>
                            <span>✓</span>
                            Customer Management
                        </div>

                        <div>
                            <span>✓</span>
                            Sales Activity Tracking
                        </div>

                        <div>
                            <span>✓</span>
                            Follow-ups & Tasks
                        </div>

                    </div>

                </div>

            </div>


            {/* RIGHT LOGIN SECTION */}
            <div className="login-section">

                <div className="login-card">

                    <div className="login-header">

                        <h2>Welcome back</h2>

                        <p>
                            Sign in to your CRM account
                        </p>

                    </div>


                    <form onSubmit={handleLogin}>

                        {/* EMAIL */}
                        <div className="form-group">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />

                        </div>


                        {/* PASSWORD */}
                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="show-password"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* ERROR */}
                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}


                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>

                    </form>


                    {/* FOOTER */}
                    <div className="login-footer">

                        <p>CRM Management System</p>

                        <span>
                            Secure business management platform
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;