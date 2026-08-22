import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =====================================================
  // LOAD CURRENT LOGGED-IN EMPLOYEE
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadEmployee = () => {
      try {
        const storedEmployee =
          sessionStorage.getItem("employee");

        const loggedIn =
          sessionStorage.getItem("employeeLoggedIn");

        console.log(
          "================================="
        );
        console.log(
          "EMPLOYEE DASHBOARD SESSION"
        );
        console.log(
          "employeeLoggedIn:",
          loggedIn
        );
        console.log(
          "storedEmployee:",
          storedEmployee
        );
        console.log(
          "================================="
        );

        // No employee session
        if (
          loggedIn !== "true" ||
          !storedEmployee
        ) {
          console.warn(
            "No employee session found."
          );

          if (mounted) {
            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        const parsedEmployee =
          JSON.parse(storedEmployee);

        // Validate employee object
        if (
          !parsedEmployee ||
          !parsedEmployee.id ||
          !parsedEmployee.employee_id ||
          !parsedEmployee.full_name ||
          !parsedEmployee.email
        ) {
          throw new Error(
            "Invalid employee session."
          );
        }

        console.log(
          "CURRENT EMPLOYEE:",
          parsedEmployee.full_name
        );

        console.log(
          "CURRENT EMPLOYEE ID:",
          parsedEmployee.employee_id
        );

        console.log(
          "CURRENT EMPLOYEE EMAIL:",
          parsedEmployee.email
        );

        if (mounted) {
          setEmployee(parsedEmployee);
        }
      } catch (error) {
        console.error(
          "Employee session loading error:",
          error
        );

        sessionStorage.removeItem(
          "employee"
        );

        sessionStorage.removeItem(
          "employeeLoggedIn"
        );

        if (mounted) {
          navigate("/login", {
            replace: true,
          });
        }
      }
    };

    loadEmployee();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // =====================================================
  // LIVE CLOCK
  // =====================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    console.log(
      "Logging out:",
      employee?.full_name
    );

    sessionStorage.removeItem("employee");
    sessionStorage.removeItem(
      "employeeLoggedIn"
    );

    setEmployee(null);

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const goTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!employee) {
    return (
      <div className="employee-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // =====================================================
  // EMPLOYEE INFORMATION
  // =====================================================

  const firstLetter =
    employee.full_name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "E";

  const firstName =
    employee.full_name
      ?.trim()
      ?.split(/\s+/)[0] || "Employee";

  const formattedSalary =
    employee.monthly_salary !== null &&
    employee.monthly_salary !== undefined &&
    employee.monthly_salary !== ""
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(
          Number(employee.monthly_salary)
        )
      : "Not available";

  const joiningDate =
    employee.joining_date
      ? new Date(
          `${employee.joining_date}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Not available";

  const today =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  const time =
    currentTime.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="employee-dashboard">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="employee-navbar">

        {/* BRAND */}

        <div
          className="employee-brand"
          onClick={() =>
            goTo("/employee-dashboard")
          }
        >
          <h1>DaYFlow</h1>
          <span>HRMS</span>
        </div>

        {/* NAVIGATION */}

        <nav
          className={`employee-nav ${
            mobileMenuOpen
              ? "mobile-open"
              : ""
          }`}
        >

          <button
            type="button"
            className="employee-nav-link active"
            onClick={() =>
              goTo(
                "/employee-dashboard"
              )
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className="employee-nav-link"
            onClick={() =>
              goTo("/employee/profile")
            }
          >
            <span>👤</span>
            My Profile
          </button>

          <button
            type="button"
            className="employee-nav-link"
            onClick={() =>
              goTo("/employee/attendance")
            }
          >
            <span>◷</span>
            Attendance
          </button>

          <button
            type="button"
            className="employee-nav-link"
            onClick={() =>
              goTo("/employee/leave")
            }
          >
            <span>▣</span>
            Leave
          </button>

          <button
            type="button"
            className="employee-nav-link"
            onClick={() =>
              goTo("/employee/payroll")
            }
          >
            <span>₹</span>
            Payroll
          </button>

        </nav>

        {/* RIGHT */}

        <div className="employee-navbar-right">

          <div className="navbar-employee-profile">

            <div className="navbar-avatar">
              {firstLetter}
            </div>

            <div className="navbar-profile-info">

              <strong>
                {employee.full_name}
              </strong>

              <span>
                {employee.employee_id}
              </span>

            </div>

          </div>

          <button
            type="button"
            className="navbar-logout"
            onClick={handleLogout}
          >
            ↪
            <span>Logout</span>
          </button>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(
                (previous) =>
                  !previous
              )
            }
          >
            {mobileMenuOpen
              ? "✕"
              : "☰"}
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="employee-main">

        {/* PAGE HEADER */}

        <section className="employee-page-header">

          <div>

            <span className="header-label">
              EMPLOYEE PORTAL
            </span>

            <h2>
              My Dashboard
            </h2>

          </div>

          <div className="page-header-employee">

            <div className="page-header-avatar">
              {firstLetter}
            </div>

            <div>

              <strong>
                {employee.full_name}
              </strong>

              <span>
                {employee.designation ||
                  "Employee"}
              </span>

            </div>

          </div>

        </section>

        {/* CONTENT */}

        <div className="employee-content">

          {/* WELCOME */}

          <section className="employee-welcome">

            <div className="welcome-content">

              <span className="welcome-label">
                {today.toUpperCase()}
              </span>

              <h1>
                Good day, {firstName} 👋
              </h1>

              <p>
                Here's everything you need
                to manage your workday in
                one place.
              </p>

            </div>

            <div className="welcome-time">

              <span>
                Current Time
              </span>

              <strong>
                {time}
              </strong>

            </div>

          </section>

          {/* ATTENDANCE */}

          <section className="employee-section">

            <div className="section-heading">

              <div>

                <span>
                  WORKDAY
                </span>

                <h3>
                  Today's Attendance
                </h3>

              </div>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/employee/attendance"
                  )
                }
              >
                View Attendance →
              </button>

            </div>

            <div className="attendance-dashboard-card">

              <div className="attendance-status">

                <div className="attendance-live-icon">
                  ◷
                </div>

                <div>

                  <span>
                    TODAY'S STATUS
                  </span>

                  <strong>
                    Not Checked In
                  </strong>

                  <small>
                    Start your workday by
                    recording your attendance.
                  </small>

                </div>

              </div>

              <button
                type="button"
                className="attendance-action-button"
                onClick={() =>
                  goTo(
                    "/employee/attendance"
                  )
                }
              >
                Clock In
                <span>→</span>
              </button>

            </div>

          </section>

          {/* QUICK ACCESS */}

          <section className="employee-section">

            <div className="section-heading">

              <div>

                <span>
                  QUICK ACCESS
                </span>

                <h3>
                  What would you like
                  to do?
                </h3>

              </div>

            </div>

            <div className="employee-actions">

              <button
                type="button"
                className="employee-action-card"
                onClick={() =>
                  goTo(
                    "/employee/profile"
                  )
                }
              >

                <div className="action-icon">
                  👤
                </div>

                <div>

                  <strong>
                    My Profile
                  </strong>

                  <p>
                    View and manage your
                    personal and employment
                    information.
                  </p>

                </div>

                <span>→</span>

              </button>

              <button
                type="button"
                className="employee-action-card"
                onClick={() =>
                  goTo(
                    "/employee/attendance"
                  )
                }
              >

                <div className="action-icon">
                  ◷
                </div>

                <div>

                  <strong>
                    Mark Attendance
                  </strong>

                  <p>
                    Clock in, clock out and
                    check your working hours.
                  </p>

                </div>

                <span>→</span>

              </button>

              <button
                type="button"
                className="employee-action-card"
                onClick={() =>
                  goTo(
                    "/employee/leave"
                  )
                }
              >

                <div className="action-icon">
                  📝
                </div>

                <div>

                  <strong>
                    Take Leave
                  </strong>

                  <p>
                    Apply for leave and track
                    your requests.
                  </p>

                </div>

                <span>→</span>

              </button>

              <button
                type="button"
                className="employee-action-card"
                onClick={() =>
                  goTo(
                    "/employee/payroll"
                  )
                }
              >

                <div className="action-icon">
                  ₹
                </div>

                <div>

                  <strong>
                    My Payments
                  </strong>

                  <p>
                    Check your salary,
                    payments and payslips.
                  </p>

                </div>

                <span>→</span>

              </button>

            </div>

          </section>

          {/* EMPLOYMENT OVERVIEW */}

          <section className="employee-section">

            <div className="section-heading">

              <div>

                <span>
                  EMPLOYMENT
                </span>

                <h3>
                  My Work Overview
                </h3>

              </div>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/employee/profile"
                  )
                }
              >
                View Profile →
              </button>

            </div>

            <div className="employee-info-grid">

              <div className="info-card">

                <div className="info-icon">
                  👤
                </div>

                <div>

                  <span>
                    Employee ID
                  </span>

                  <strong>
                    {employee.employee_id}
                  </strong>

                </div>

              </div>

              <div className="info-card">

                <div className="info-icon">
                  💼
                </div>

                <div>

                  <span>
                    Designation
                  </span>

                  <strong>
                    {employee.designation ||
                      "Not available"}
                  </strong>

                </div>

              </div>

              <div className="info-card">

                <div className="info-icon">
                  🏢
                </div>

                <div>

                  <span>
                    Department
                  </span>

                  <strong>
                    {employee.department ||
                      "Not available"}
                  </strong>

                </div>

              </div>

              <div className="info-card">

                <div className="info-icon">
                  📅
                </div>

                <div>

                  <span>
                    Joined
                  </span>

                  <strong>
                    {joiningDate}
                  </strong>

                </div>

              </div>

            </div>

          </section>

          {/* EMPLOYMENT DETAILS */}

          <section className="employee-section">

            <div className="section-heading">

              <div>

                <span>
                  MY ACCOUNT
                </span>

                <h3>
                  Employment Details
                </h3>

              </div>

            </div>

            <div className="summary-grid">

              <div className="summary-card">

                <span>
                  Employment Status
                </span>

                <strong className="status-active">
                  {employee.employment_status ||
                    "Active"}
                </strong>

                <small>
                  Current employment status
                </small>

              </div>

              <div className="summary-card">

                <span>
                  Employment Type
                </span>

                <strong>
                  {employee.employment_type ||
                    "Not available"}
                </strong>

                <small>
                  Current work arrangement
                </small>

              </div>

              <div className="summary-card">

                <span>
                  Monthly Salary
                </span>

                <strong>
                  {formattedSalary}
                </strong>

                <small>
                  Current monthly compensation
                </small>

              </div>

              <div className="summary-card">

                <span>
                  Reporting Manager
                </span>

                <strong>
                  {employee.reporting_manager ||
                    "Not assigned"}
                </strong>

                <small>
                  Reporting relationship
                </small>

              </div>

            </div>

          </section>

          {/* LEAVE + PAYROLL */}

          <section className="employee-section">

            <div className="dashboard-two-column">

              <div className="dashboard-mini-card">

                <div className="mini-card-header">

                  <div>

                    <span>
                      TIME OFF
                    </span>

                    <h3>
                      Leave Balance
                    </h3>

                  </div>

                  <div className="mini-card-icon">
                    📝
                  </div>

                </div>

                <div className="leave-balance">

                  <strong>
                    12
                  </strong>

                  <span>
                    Days Available
                  </span>

                </div>

                <div className="leave-progress">

                  <div
                    className="leave-progress-bar"
                    style={{
                      width: "60%",
                    }}
                  ></div>

                </div>

                <p>
                  You have 12 leave days
                  remaining for the current
                  year.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/employee/leave"
                    )
                  }
                >
                  Apply for Leave →
                </button>

              </div>

              <div className="dashboard-mini-card">

                <div className="mini-card-header">

                  <div>

                    <span>
                      PAYROLL
                    </span>

                    <h3>
                      Latest Payment
                    </h3>

                  </div>

                  <div className="mini-card-icon">
                    ₹
                  </div>

                </div>

                <div className="payment-amount">
                  {formattedSalary}
                </div>

                <span className="payment-date">
                  Monthly salary
                </span>

                <div className="payment-status">

                  <span>✓</span>

                  Payment information
                  available

                </div>

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/employee/payroll"
                    )
                  }
                >
                  View Payroll →
                </button>

              </div>

            </div>

          </section>

          {/* NOTICE */}

          <section className="employee-notice">

            <div className="notice-icon">
              ✓
            </div>

            <div>

              <strong>
                Your DaYFlow account is active
              </strong>

              <p>
                You are securely logged in as{" "}
                <b>
                  {employee.full_name}
                </b>
                . You can manage your
                attendance, leave, payroll and
                profile from the navigation
                above.
              </p>

            </div>

          </section>

        </div>

        {/* FOOTER */}

        <footer className="employee-footer">

          <span>
            © 2026 DaYFlow HRMS
          </span>

          <span>
            Every workday, perfectly aligned.
          </span>

        </footer>

      </main>

    </div>
  );
}

export default EmployeeDashboard;