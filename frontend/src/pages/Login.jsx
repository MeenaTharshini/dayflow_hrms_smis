
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const loginEmail = email.trim().toLowerCase();

    // ============================================
    // VALIDATION
    // ============================================

    if (!loginEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // ============================================
      // FIND EMPLOYEE
      // ============================================

      const { data: employee, error: employeeError } =
        await supabase
          .from("employees")
          .select(`
            id,
            employee_id,
            full_name,
            email,
            phone,
            department,
            designation,
            joining_date,
            employment_type,
            monthly_salary,
            reporting_manager,
            employment_status,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            created_at,
            updated_at,
            login_password
          `)
          .eq("email", loginEmail)
          .maybeSingle();

      if (employeeError) {
        throw employeeError;
      }

      // ============================================
      // EMPLOYEE NOT FOUND
      // ============================================

      if (!employee) {
        setError("Invalid email or password.");
        return;
      }

      // ============================================
      // CHECK PASSWORD
      // ============================================

      if (
        !employee.login_password ||
        employee.login_password !== password
      ) {
        setError("Invalid email or password.");
        return;
      }

      // ============================================
      // CHECK EMPLOYMENT STATUS
      // ============================================

      if (
        employee.employment_status !== "Active"
      ) {
        setError(
          `Your employee account is currently ${employee.employment_status}. Please contact the administrator.`
        );
        return;
      }

      // ============================================
      // STORE LOGGED-IN EMPLOYEE
      // ============================================

      const employeeSession = {
        id: employee.id,
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        joining_date: employee.joining_date,
        employment_type: employee.employment_type,
        monthly_salary: employee.monthly_salary,
        reporting_manager: employee.reporting_manager,
        employment_status: employee.employment_status,
        address: employee.address,
        emergency_contact_name:
          employee.emergency_contact_name,
        emergency_contact_phone:
          employee.emergency_contact_phone,
      };

      sessionStorage.setItem(
        "employee",
        JSON.stringify(employeeSession)
      );

      sessionStorage.setItem(
        "employeeLoggedIn",
        "true"
      );

      // ============================================
      // GO TO EMPLOYEE DASHBOARD
      // ============================================

      navigate("/employee-dashboard");

    } catch (err) {
      console.error(
        "Employee login error:",
        err
      );

      setError(
        err?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="auth-header">

          <h1>DaYFlow</h1>

          <p>Employee Login</p>

          <span>
            Login to access your employee dashboard.
          </span>

        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* ========================================
            LOGIN FORM
        ======================================== */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              Official Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="employee@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              autoComplete="email"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              autoComplete="current-password"
              required
            />

          </div>

          {/* LOGIN */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </button>

        </form>

        {/* ========================================
            ADMIN LOGIN
        ======================================== */}

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/admin-login")
            }
          >
            Administrator Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;
