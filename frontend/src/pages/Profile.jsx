import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD LOGGED-IN EMPLOYEE
  ===================================================== */

  useEffect(() => {
    loadEmployee();
  }, []);

  const loadEmployee = () => {
    try {
      /*
       * Your Login.jsx should save:
       *
       * sessionStorage.setItem(
       *   "employee",
       *   JSON.stringify(employeeSession)
       * );
       *
       * sessionStorage.setItem(
       *   "employeeLoggedIn",
       *   "true"
       * );
       */

      let storedEmployee =
        sessionStorage.getItem("employee");

      let loggedIn =
        sessionStorage.getItem("employeeLoggedIn");

      /*
       * Fallback for old Attendance.jsx/localStorage
       * sessions.
       */
      if (!storedEmployee) {
        storedEmployee =
          localStorage.getItem("employee");
      }

      if (!loggedIn) {
        loggedIn =
          localStorage.getItem("employeeLoggedIn");
      }

      console.log(
        "================================="
      );

      console.log(
        "PROFILE - STORED EMPLOYEE:"
      );

      console.log(
        storedEmployee
      );

      console.log(
        "PROFILE - LOGIN STATUS:",
        loggedIn
      );

      console.log(
        "================================="
      );

      if (
        !storedEmployee ||
        loggedIn !== "true"
      ) {
        console.log(
          "No valid employee session."
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const parsedEmployee =
        JSON.parse(storedEmployee);

      /*
       * VERY IMPORTANT:
       * Every employee must have a unique ID.
       */

      if (!parsedEmployee?.id) {
        throw new Error(
          "Invalid employee session. Employee ID is missing."
        );
      }

      console.log(
        "Logged-in employee:",
        parsedEmployee
      );

      console.log(
        "Employee database ID:",
        parsedEmployee.id
      );

      console.log(
        "Employee ID:",
        parsedEmployee.employee_id
      );

      console.log(
        "Employee name:",
        parsedEmployee.full_name
      );

      setEmployee(parsedEmployee);

    } catch (error) {
      console.error(
        "Profile employee loading error:",
        error
      );

      sessionStorage.removeItem(
        "employee"
      );

      sessionStorage.removeItem(
        "employeeLoggedIn"
      );

      localStorage.removeItem(
        "employee"
      );

      localStorage.removeItem(
        "employeeLoggedIn"
      );

      navigate("/login", {
        replace: true,
      });

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    sessionStorage.removeItem(
      "employee"
    );

    sessionStorage.removeItem(
      "employeeLoggedIn"
    );

    localStorage.removeItem(
      "employee"
    );

    localStorage.removeItem(
      "employeeLoggedIn"
    );

    navigate("/login", {
      replace: true,
    });
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const goToDashboard = () => {
    navigate("/employee-dashboard");
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     FORMAT SALARY
  ===================================================== */

  const formatSalary = (salary) => {
    if (
      salary === null ||
      salary === undefined ||
      salary === ""
    ) {
      return "Not available";
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(Number(salary));
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="dashboard-page">

        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <h2>
            Loading Profile...
          </h2>

          <p>
            Loading your employee information.
          </p>
        </div>

      </div>
    );
  }

  /* =====================================================
     NO EMPLOYEE
  ===================================================== */

  if (!employee) {
    return (
      <div className="dashboard-page">

        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "15px",
          }}
        >

          <h2>
            Employee session not found
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/login", {
                replace: true,
              })
            }
          >
            Login Again
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     EMPLOYEE VALUES
  ===================================================== */

  const firstLetter =
    employee.full_name
      ?.charAt(0)
      ?.toUpperCase() || "E";

  const fullName =
    employee.full_name ||
    "Employee";

  const employeeId =
    employee.employee_id ||
    "Not available";

  const email =
    employee.email ||
    "Not available";

  const phone =
    employee.phone ||
    "Not available";

  const department =
    employee.department ||
    "Not available";

  const designation =
    employee.designation ||
    "Not available";

  const employmentType =
    employee.employment_type ||
    "Not available";

  const joiningDate =
    formatDate(
      employee.joining_date
    );

  const reportingManager =
    employee.reporting_manager ||
    "Not assigned";

  const employmentStatus =
    employee.employment_status ||
    "Active";

  const address =
    employee.address ||
    "Not available";

  const monthlySalary =
    formatSalary(
      employee.monthly_salary
    );

  const annualSalary =
    employee.monthly_salary
      ? formatSalary(
          Number(
            employee.monthly_salary
          ) * 12
        )
      : "Not available";

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="dashboard-navbar">

        <div
          className="dashboard-brand"
          onClick={goToDashboard}
          style={{
            cursor: "pointer",
          }}
        >
          <h2>
            DaYFlow
          </h2>

          <span>
            HRMS
          </span>
        </div>

        <div className="dashboard-user">

          <div className="user-info">

            <strong>
              {fullName}
            </strong>

            <span>
              {employeeId}
            </span>

          </div>

          <div
            className="profile-avatar"
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
            }}
          >
            {firstLetter}
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-container">

        {/* BACK */}

        <button
          type="button"
          className="back-dashboard-button"
          onClick={goToDashboard}
        >
          ← Back to Dashboard
        </button>

        {/* =================================================
            HEADING
        ================================================= */}

        <section className="dashboard-welcome">

          <p className="dashboard-label">
            EMPLOYEE PROFILE
          </p>

          <h1>
            My Profile
          </h1>

          <p>
            View your personal and
            professional information.
          </p>

        </section>

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section className="profile-header-card">

          <div className="profile-avatar">
            {firstLetter}
          </div>

          <div className="profile-main-info">

            <h2>
              {fullName}
            </h2>

            <p>
              {designation}
            </p>

            <span>
              Employee ID: {employeeId}
            </span>

          </div>

          <div className="profile-status">
            {employmentStatus}
          </div>

        </section>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                Your basic personal details
              </p>

            </div>

          </div>

          <div className="profile-details-card">

            <div className="profile-detail">

              <span>
                Full Name
              </span>

              <strong>
                {fullName}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Email
              </span>

              <strong>
                {email}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Phone
              </span>

              <strong>
                {phone}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Address
              </span>

              <strong>
                {address}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Employee Database ID
              </span>

              <strong>
                {employee.id}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Account Status
              </span>

              <strong>
                {employmentStatus}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            JOB INFORMATION
        ================================================= */}

        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>

              <h2>
                Job Information
              </h2>

              <p>
                Your employment details
              </p>

            </div>

          </div>

          <div className="profile-details-card">

            <div className="profile-detail">

              <span>
                Employee ID
              </span>

              <strong>
                {employeeId}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Department
              </span>

              <strong>
                {department}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Designation
              </span>

              <strong>
                {designation}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Employment Type
              </span>

              <strong>
                {employmentType}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Joining Date
              </span>

              <strong>
                {joiningDate}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Reporting Manager
              </span>

              <strong>
                {reportingManager}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            SALARY INFORMATION
        ================================================= */}

        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>

              <h2>
                Salary Information
              </h2>

              <p>
                Your current compensation details
              </p>

            </div>

            <button
              type="button"
              className="view-payroll-button"
              onClick={() =>
                navigate(
                  "/employee/payroll"
                )
              }
            >
              View Payroll →
            </button>

          </div>

          <div className="profile-salary-card">

            <div>

              <span>
                Monthly Salary
              </span>

              <strong>
                {monthlySalary}
              </strong>

            </div>

            <div>

              <span>
                Annual Salary
              </span>

              <strong>
                {annualSalary}
              </strong>

            </div>

            <div>

              <span>
                Payroll Status
              </span>

              <strong className="salary-active">
                {employmentStatus}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            EMERGENCY CONTACT
        ================================================= */}

        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>

              <h2>
                Emergency Contact
              </h2>

              <p>
                Emergency contact information
              </p>

            </div>

          </div>

          <div className="profile-details-card">

            <div className="profile-detail">

              <span>
                Contact Name
              </span>

              <strong>
                {employee.emergency_contact_name ||
                  "Not available"}
              </strong>

            </div>

            <div className="profile-detail">

              <span>
                Contact Phone
              </span>

              <strong>
                {employee.emergency_contact_phone ||
                  "Not available"}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            DOCUMENTS
        ================================================= */}

        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>

              <h2>
                Documents
              </h2>

              <p>
                Your employee documents
              </p>

            </div>

          </div>

          <div className="documents-grid">

            <div className="document-card">

              <div className="document-icon">
                📄
              </div>

              <div>

                <strong>
                  Offer Letter
                </strong>

                <span>
                  PDF Document
                </span>

              </div>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Offer letter viewer will be connected to the backend later."
                  )
                }
              >
                View
              </button>

            </div>

            <div className="document-card">

              <div className="document-icon">
                📄
              </div>

              <div>

                <strong>
                  Employment Contract
                </strong>

                <span>
                  PDF Document
                </span>

              </div>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Employment contract viewer will be connected later."
                  )
                }
              >
                View
              </button>

            </div>

            <div className="document-card">

              <div className="document-icon">
                🪪
              </div>

              <div>

                <strong>
                  Employee ID
                </strong>

                <span>
                  ID Document
                </span>

              </div>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Employee ID viewer will be connected later."
                  )
                }
              >
                View
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            SECURITY
        ================================================= */}

        <section className="dashboard-section">

          <div className="profile-security-card">

            <div>

              <h3>
                🔒 Account Security
              </h3>

              <p>
                Keep your DaYFlow account secure.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                alert(
                  "Password change will be connected to the backend later."
                )
              }
            >
              Change Password
            </button>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="dashboard-footer">

        <p>
          © 2026 DaYFlow HRMS
        </p>

        <span>
          Every workday, perfectly aligned.
        </span>

      </footer>

    </div>
  );
}

export default Profile;