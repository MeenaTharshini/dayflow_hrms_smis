import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdmin } from "../services/authService";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !fullName.trim() ||
      !organization.trim() ||
      !email.trim() ||
      !adminCode.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerAdmin({
        fullName: fullName.trim(),
        organization: organization.trim(),
        email: email.trim(),
        adminCode: adminCode.trim(),
        password,
      });

      // Registration successful
      navigate("/admin-login", {
        state: {
          message:
            "Administrator account created successfully. Please login to continue.",
          email: email.trim(),
        },
      });

    } catch (err) {
      setError(
        err.message ||
          "Unable to create administrator account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card signup-card">

        {/* Back */}
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        {/* Header */}
        <div className="auth-header">
          <h1>DaYFlow</h1>

          <p>Administrator Registration</p>

          <span>
            Create an administrator account to manage
            your organization's HR operations.
          </span>
        </div>

        {/* Security Notice */}
        <div className="approval-notice">
          <strong>Administrator Access</strong>

          <p>
            Administrator accounts have access to employee,
            attendance, leave, payroll, and HR information.
            Only authorized administrators should register.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSignup}
        >

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError("");
              }}
              autoComplete="name"
              required
            />
          </div>

          {/* Organization */}
          <div className="form-group">
            <label htmlFor="organization">
              Organization
            </label>

            <input
              id="organization"
              type="text"
              placeholder="Enter organization name"
              value={organization}
              onChange={(e) => {
                setOrganization(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="adminEmail">
              Official Email
            </label>

            <input
              id="adminEmail"
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

          {/* Admin Code */}
          <div className="form-group">
            <label htmlFor="adminCode">
              Administrator Registration Code
            </label>

            <input
              id="adminCode"
              type="password"
              placeholder="Enter administrator code"
              value={adminCode}
              onChange={(e) => {
                setAdminCode(e.target.value);
                setError("");
              }}
              autoComplete="off"
              required
            />

            <small className="form-hint">
              Required to create an administrator account.
            </small>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="adminPassword">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="adminPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
                minLength={8}
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

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="password-wrapper">

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>

            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Administrator Account"}
          </button>

        </form>

        {/* Footer */}
        <div className="auth-footer">

          <p>
            Already have an administrator account?{" "}

            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/admin-login")}
            >
              Admin Login
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

export default Signup;