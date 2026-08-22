import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/authService";
import "./Auth.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginAdmin(
        email.trim(),
        password
      );

      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      localStorage.setItem(
        "profile",
        JSON.stringify(result.profile)
      );

      navigate("/admin-dashboard");

    } catch (err) {
      console.error(err);

      if (
        err.message?.toLowerCase().includes("email not confirmed")
      ) {
        setError(
          "Your administrator email has not been confirmed. Please check your email."
        );
      } else {
        setError(
          err.message ||
          "Unable to sign in as administrator."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <div className="auth-header">

          <h1>DaYFlow</h1>

          <p>Administrator Login</p>

          <span>
            Sign in to access the DaYFlow administration dashboard.
          </span>

        </div>

        <div className="approval-notice">

          <strong>Restricted Access</strong>

          <p>
            This area is restricted to authorized
            DaYFlow administrators.
          </p>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          <div className="form-group">

            <label htmlFor="adminLoginEmail">
              Administrator Email
            </label>

            <input
              id="adminLoginEmail"
              type="email"
              placeholder="Enter administrator email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="adminLoginPassword">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="adminLoginPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          <div className="forgot-password">

            <button
              type="button"
              className="link-button"
            >
              Forgot Password?
            </button>

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Admin Sign In"}
          </button>

        </form>

        <div className="auth-footer">

          <p>
            Don't have an administrator account?{" "}

            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/signup")}
            >
              Admin Registration
            </button>
          </p>

          <p>
            Are you an employee?{" "}

            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/login")}
            >
              Employee Login
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;