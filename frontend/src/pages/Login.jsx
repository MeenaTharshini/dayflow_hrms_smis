import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmployee } from "../services/authService";
import "./Auth.css";

function Login() {
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
      const result = await loginEmployee(
        email.trim(),
        password
      );

      /*
       * Save user information locally.
       * Supabase itself manages the authentication session.
       */

      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      localStorage.setItem(
        "profile",
        JSON.stringify(result.profile)
      );

      /*
       * Employee → Employee Dashboard
       */

      navigate("/employee-dashboard");

    } catch (err) {
      console.error("Employee login error:", err);

      if (
        err.message?.toLowerCase().includes("email not confirmed")
      ) {
        setError(
          "Your email has not been confirmed. Please check your email."
        );
      } else {
        setError(
          err.message ||
          "Unable to sign in. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

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

          <p>Employee Login</p>

          <span>
            Sign in to access your DaYFlow workspace.
          </span>

        </div>


        {/* Error */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* Login Form */}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          {/* Email */}

          <div className="form-group">

            <label htmlFor="loginEmail">
              Employee Email
            </label>

            <input
              id="loginEmail"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              required
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label htmlFor="loginPassword">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="loginPassword"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
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
                  setShowPassword(
                    (value) => !value
                  )
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>


          {/* Forgot Password */}

          <div className="forgot-password">

            <button
              type="button"
              className="link-button"
            >
              Forgot Password?
            </button>

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Employee Sign In"}
          </button>

        </form>


        {/* Footer */}

        <div className="auth-footer">

          <p>
            Don't have an employee account?
          </p>

          <p>
            Please contact your administrator
            to create your employee account.
          </p>

          <p>

            Administrator?{" "}

            <button
              type="button"
              className="link-button"
              onClick={() =>
                navigate("/admin-login")
              }
            >
              Admin Login
            </button>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;