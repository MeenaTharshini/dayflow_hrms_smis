import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Prevent duplicate login requests
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      /* =====================================================
         CLEAN INPUT
      ===================================================== */

      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        throw new Error(
          "Please enter your email and password."
        );
      }

      console.log("=================================");
      console.log("EMPLOYEE LOGIN");
      console.log("Email:", cleanEmail);
      console.log("=================================");

      /* =====================================================
         FIND EMPLOYEE FROM employees TABLE
         
         IMPORTANT:
         We are NOT using Supabase Auth here.

         Employee credentials are stored in:
           employees.email
           employees.login_password
      ===================================================== */

      const {
        data: employee,
        error: employeeError,
      } = await supabase
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
          auth_user_id,
          login_password
        `)
        .eq("email", cleanEmail)
        .maybeSingle();

      console.log(
        "Employee result:",
        employee
      );

      /* =====================================================
         DATABASE ERROR
      ===================================================== */

      if (employeeError) {
        console.error(
          "Employee database error:",
          employeeError
        );

        throw new Error(
          employeeError.message ||
            "Unable to check employee account."
        );
      }

      /* =====================================================
         EMPLOYEE NOT FOUND
      ===================================================== */

      if (!employee) {
        throw new Error(
          "No employee account found with this email."
        );
      }

      /* =====================================================
         PASSWORD NOT CREATED
      ===================================================== */

      if (
        !employee.login_password ||
        employee.login_password === ""
      ) {
        throw new Error(
          "Login credentials have not been created for this employee."
        );
      }

      /* =====================================================
         CHECK PASSWORD
      ===================================================== */

      if (
        employee.login_password !==
        cleanPassword
      ) {
        throw new Error(
          "Invalid email or password."
        );
      }

      /* =====================================================
         CHECK EMPLOYMENT STATUS
      ===================================================== */

      if (
        employee.employment_status &&
        employee.employment_status
          .toLowerCase() !== "active"
      ) {
        throw new Error(
          `This employee account is ${employee.employment_status}.`
        );
      }

      /* =====================================================
         CREATE EMPLOYEE SESSION

         IMPORTANT:
         DO NOT save login_password.
      ===================================================== */

      const employeeSession = {
        id: employee.id,

        employee_id:
          employee.employee_id,

        full_name:
          employee.full_name,

        email:
          employee.email,

        phone:
          employee.phone,

        department:
          employee.department,

        designation:
          employee.designation,

        joining_date:
          employee.joining_date,

        employment_type:
          employee.employment_type,

        monthly_salary:
          employee.monthly_salary,

        reporting_manager:
          employee.reporting_manager,

        employment_status:
          employee.employment_status,

        address:
          employee.address,

        emergency_contact_name:
          employee.emergency_contact_name,

        emergency_contact_phone:
          employee.emergency_contact_phone,

        auth_user_id:
          employee.auth_user_id || null,
      };

      /* =====================================================
         CLEAR OLD EMPLOYEE SESSION
      ===================================================== */

      sessionStorage.removeItem(
        "employee"
      );

      sessionStorage.removeItem(
        "employeeLoggedIn"
      );

      /* =====================================================
         SAVE NEW EMPLOYEE SESSION
         
         Attendance.jsx also uses sessionStorage.
      ===================================================== */

      sessionStorage.setItem(
        "employee",
        JSON.stringify(employeeSession)
      );

      sessionStorage.setItem(
        "employeeLoggedIn",
        "true"
      );

      /* =====================================================
         VERIFY SESSION WAS SAVED
      ===================================================== */

      console.log(
        "Saved employee session:",
        JSON.stringify(
          employeeSession
        )
      );

      console.log(
        "Employee login status:",
        sessionStorage.getItem(
          "employeeLoggedIn"
        )
      );

      /* =====================================================
         LOGIN SUCCESS
      ===================================================== */

      console.log(
        "Employee login successful:",
        employee.full_name
      );

      /* =====================================================
         IMPORTANT ROUTE

         App.jsx contains:

         <Route
           path="/employee-dashboard"
           element={<EmployeeDashboard />}
         />

         Therefore we MUST navigate to:
         /employee-dashboard
      ===================================================== */

      navigate(
        "/employee-dashboard",
        {
          replace: true,
        }
      );

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err?.message ||
          "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="login-header">

          <h1>
            DaYFlow
          </h1>

          <span>
            HRMS
          </span>

        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h2>
          Employee Login
        </h2>

        <p>
          Login using the credentials provided
          by your administrator.
        </p>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form
          onSubmit={handleLogin}
        >

          {/* EMAIL */}

          <div className="form-group">

            <label>
              Official Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="employee@company.com"
              autoComplete="email"
              disabled={loading}
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              required
            />

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >

            {loading
              ? "Checking..."
              : "Login"}

          </button>

        </form>

        {/* =================================================
            ADMIN LOGIN
        ================================================= */}

        <button
          type="button"
          className="admin-login-button"
          onClick={() =>
            navigate(
              "/admin-login"
            )
          }
          disabled={loading}
        >
          Administrator Login
        </button>

      </div>

    </div>
  );
}

export default Login;