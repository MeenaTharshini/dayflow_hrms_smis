
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const storedEmployee =
      sessionStorage.getItem("employee");

    const loggedIn =
      sessionStorage.getItem("employeeLoggedIn");

    if (!storedEmployee || loggedIn !== "true") {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setEmployee(JSON.parse(storedEmployee));
    } catch (error) {
      console.error(
        "Unable to load employee session:",
        error
      );

      sessionStorage.removeItem("employee");
      sessionStorage.removeItem("employeeLoggedIn");

      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("employee");
    sessionStorage.removeItem("employeeLoggedIn");

    navigate("/login", { replace: true });
  };

  if (!employee) {
    return (
      <div className="employee-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const firstLetter =
    employee.full_name?.charAt(0)?.toUpperCase() || "E";

  const formattedSalary =
    employee.monthly_salary != null
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(Number(employee.monthly_salary))
      : "Not available";

  return (
    <div className="employee-dashboard">

      {/* ============================================
          SIDEBAR
      ============================================ */}

      <aside className="employee-sidebar">

        <div className="employee-sidebar-brand">
          <h1>DaYFlow</h1>
          <span>HRMS</span>
        </div>

        <nav className="employee-navigation">

          <button
            className="employee-nav-item active"
            onClick={() =>
              navigate("/employee-dashboard")
            }
          >
            <span>⌂</span>
            <div>
              <strong>Dashboard</strong>
              <small>Overview</small>
            </div>
          </button>

          <button
            className="employee-nav-item"
            onClick={() =>
              navigate("/employee/profile")
            }
          >
            <span>👤</span>
            <div>
              <strong>My Profile</strong>
              <small>Personal information</small>
            </div>
          </button>

          <button
            className="employee-nav-item"
            onClick={() =>
              navigate("/employee/attendance")
            }
          >
            <span>◷</span>
            <div>
              <strong>Attendance</strong>
              <small>Working hours</small>
            </div>
          </button>

          <button
            className="employee-nav-item"
            onClick={() =>
              navigate("/employee/leave")
            }
          >
            <span>▣</span>
            <div>
              <strong>Leave</strong>
              <small>Leave requests</small>
            </div>
          </button>

          <button
            className="employee-nav-item"
            onClick={() =>
              navigate("/employee/payroll")
            }
          >
            <span>₹</span>
            <div>
              <strong>Payroll</strong>
              <small>Salary details</small>
            </div>
          </button>

        </nav>

        <div className="employee-sidebar-bottom">

          <div className="employee-mini-profile">

            <div className="employee-mini-avatar">
              {firstLetter}
            </div>

            <div>
              <strong>
                {employee.full_name}
              </strong>

              <span>
                {employee.designation}
              </span>
            </div>

          </div>

          <button
            className="employee-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* ============================================
          MAIN
      ============================================ */}

      <main className="employee-main">

        {/* HEADER */}

        <header className="employee-header">

          <div>
            <span className="header-label">
              EMPLOYEE PORTAL
            </span>

            <h2>Dashboard</h2>
          </div>

          <div className="employee-header-profile">

            <div className="employee-header-avatar">
              {firstLetter}
            </div>

            <div>
              <strong>
                {employee.full_name}
              </strong>

              <span>
                {employee.employee_id}
              </span>
            </div>

          </div>

        </header>

        {/* ============================================
            CONTENT
        ============================================ */}

        <div className="employee-content">

          {/* WELCOME */}

          <section className="employee-welcome">

            <div>

              <span className="welcome-label">
                WELCOME BACK
              </span>

              <h1>
                Hello, {employee.full_name?.split(" ")[0]} 👋
              </h1>

              <p>
                Here's your work overview for today.
              </p>

            </div>

            <div className="welcome-symbol">
              ✦
            </div>

          </section>

          {/* ==========================================
              EMPLOYEE INFORMATION
          ========================================== */}

          <section className="employee-section">

            <div className="section-heading">

              <div>
                <span>YOUR INFORMATION</span>
                <h3>Employment Overview</h3>
              </div>

              <button
                onClick={() =>
                  navigate("/employee/profile")
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
                  <span>Employee ID</span>
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
                  <span>Designation</span>
                  <strong>
                    {employee.designation}
                  </strong>
                </div>

              </div>

              <div className="info-card">

                <div className="info-icon">
                  🏢
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {employee.department}
                  </strong>
                </div>

              </div>

              <div className="info-card">

                <div className="info-icon">
                  📅
                </div>

                <div>
                  <span>Joining Date</span>
                  <strong>
                    {employee.joining_date
                      ? new Date(
                          employee.joining_date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Not available"}
                  </strong>
                </div>

              </div>

            </div>

          </section>

          {/* ==========================================
              QUICK ACTIONS
          ========================================== */}

          <section className="employee-section">

            <div className="section-heading">

              <div>
                <span>QUICK ACCESS</span>
                <h3>Manage Your Work</h3>
              </div>

            </div>

            <div className="employee-actions">

              <button
                className="employee-action-card"
                onClick={() =>
                  navigate("/employee/profile")
                }
              >

                <div className="action-icon">
                  👤
                </div>

                <div>
                  <strong>My Profile</strong>

                  <p>
                    View your personal and
                    employment information.
                  </p>
                </div>

                <span>→</span>

              </button>

              <button
                className="employee-action-card"
                onClick={() =>
                  navigate("/employee/attendance")
                }
              >

                <div className="action-icon">
                  ◷
                </div>

                <div>
                  <strong>Attendance</strong>

                  <p>
                    View your attendance and
                    working hours.
                  </p>
                </div>

                <span>→</span>

              </button>

              <button
                className="employee-action-card"
                onClick={() =>
                  navigate("/employee/leave")
                }
              >

                <div className="action-icon">
                  📝
                </div>

                <div>
                  <strong>Leave Requests</strong>

                  <p>
                    Apply for leave and track
                    your requests.
                  </p>
                </div>

                <span>→</span>

              </button>

              <button
                className="employee-action-card"
                onClick={() =>
                  navigate("/employee/payroll")
                }
              >

                <div className="action-icon">
                  ₹
                </div>

                <div>
                  <strong>Payroll</strong>

                  <p>
                    View your salary information.
                  </p>
                </div>

                <span>→</span>

              </button>

            </div>

          </section>

          {/* ==========================================
              SUMMARY
          ========================================== */}

          <section className="employee-section">

            <div className="section-heading">

              <div>
                <span>ACCOUNT SUMMARY</span>
                <h3>Current Details</h3>
              </div>

            </div>

            <div className="summary-grid">

              <div className="summary-card">

                <span>Employment Status</span>

                <strong className="status-active">
                  {employee.employment_status}
                </strong>

                <small>
                  Current employment status
                </small>

              </div>

              <div className="summary-card">

                <span>Employment Type</span>

                <strong>
                  {employee.employment_type}
                </strong>

                <small>
                  Current work arrangement
                </small>

              </div>

              <div className="summary-card">

                <span>Monthly Salary</span>

                <strong>
                  {formattedSalary}
                </strong>

                <small>
                  Current monthly salary
                </small>

              </div>

              <div className="summary-card">

                <span>Reporting Manager</span>

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

          {/* ==========================================
              ACCOUNT MESSAGE
          ========================================== */}

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
                <b>{employee.full_name}</b>.
                Use the menu to manage your
                employee information.
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