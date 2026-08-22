
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState("");

  /*
   * =====================================================
   * LOAD EMPLOYEES
   * =====================================================
   */

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setEmployeeError("");

    try {
      const { data, error } = await supabase
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
          created_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error(
        "Error loading employees:",
        error
      );

      setEmployeeError(
        error.message ||
          "Unable to load employees."
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  /*
   * =====================================================
   * LOAD DATA WHEN DASHBOARD OPENS
   * =====================================================
   */

  useEffect(() => {
    fetchEmployees();
  }, []);

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/admin-login");
  };

  /*
   * =====================================================
   * MENU
   * =====================================================
   */

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "⌂",
    },
    {
      id: "employees",
      label: "Employees",
      icon: "♙",
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: "◷",
    },
    {
      id: "leave",
      label: "Leave",
      icon: "▣",
    },
    {
      id: "payroll",
      label: "Payroll",
      icon: "₹",
    },
  ];

  /*
   * =====================================================
   * FORMAT DATE
   * =====================================================
   */

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * =====================================================
   * FORMAT SALARY
   * =====================================================
   */

  const formatSalary = (salary) => {
    if (
      salary === null ||
      salary === undefined ||
      salary === ""
    ) {
      return "—";
    }

    return `₹${Number(salary).toLocaleString(
      "en-IN"
    )}`;
  };

  /*
   * =====================================================
   * DELETE EMPLOYEE
   * =====================================================
   */

  const handleDeleteEmployee = async (
    employee
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.full_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employee.id);

      if (error) {
        throw error;
      }

      /*
       * Remove employee immediately from UI
       */

      setEmployees((previous) =>
        previous.filter(
          (item) => item.id !== employee.id
        )
      );
    } catch (error) {
      console.error(
        "Delete employee error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete employee."
      );
    }
  };

  /*
   * =====================================================
   * MAIN UI
   * =====================================================
   */

  return (
    <div className="admin-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        <div className="sidebar-brand">

          <h1>DaYFlow</h1>

          <span>ADMIN PORTAL</span>

        </div>

        <nav className="sidebar-menu">

          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                activeSection === item.id
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() =>
                setActiveSection(item.id)
              }
            >

              <span className="sidebar-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <button
            type="button"
            className="sidebar-item"
            onClick={() =>
              navigate("/profile")
            }
          >

            <span className="sidebar-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>

          </button>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <p className="header-label">
              ADMINISTRATOR
            </p>

            <h2>

              {activeSection === "overview" &&
                "Dashboard"}

              {activeSection === "employees" &&
                "Employee Management"}

              {activeSection === "attendance" &&
                "Attendance"}

              {activeSection === "leave" &&
                "Leave Management"}

              {activeSection === "payroll" &&
                "Payroll"}

            </h2>

          </div>

          <div className="admin-header-actions">

            <button
              type="button"
              className="notification-button"
              title="Notifications"
            >
              🔔

              <span className="notification-count">
                0
              </span>

            </button>

            <div className="admin-profile">

              <div className="admin-avatar">
                M
              </div>

              <div>

                <strong>
                  Administrator
                </strong>

                <span>
                  DaYFlow HR
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        {activeSection === "overview" && (
          <section className="dashboard-content">

            <div className="welcome-card">

              <div>

                <span>
                  GOOD MORNING
                </span>

                <h1>
                  Welcome to DaYFlow 👋
                </h1>

                <p>
                  Here's what's happening across
                  your organization today.
                </p>

              </div>

              <div className="welcome-decoration">
                ✦
              </div>

            </div>

            {/* STATISTICS */}

            <div className="stats-grid">

              <div className="stat-card">

                <div className="stat-icon">
                  ♙
                </div>

                <div>

                  <span>
                    Total Employees
                  </span>

                  <strong>
                    {employees.length}
                  </strong>

                  <small>
                    Active workforce records
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  ◷
                </div>

                <div>

                  <span>
                    Present Today
                  </span>

                  <strong>
                    0
                  </strong>

                  <small>
                    Attendance records
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  ▣
                </div>

                <div>

                  <span>
                    Leave Requests
                  </span>

                  <strong>
                    0
                  </strong>

                  <small>
                    Awaiting approval
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  ₹
                </div>

                <div>

                  <span>
                    Payroll Status
                  </span>

                  <strong>
                    Ready
                  </strong>

                  <small>
                    Current payroll cycle
                  </small>

                </div>

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <section className="dashboard-section">

              <div className="section-heading">

                <div>

                  <span>
                    QUICK ACTIONS
                  </span>

                  <h3>
                    Manage your organization
                  </h3>

                </div>

              </div>

              <div className="quick-actions">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/add-employee")
                  }
                  className="quick-action"
                >

                  <span>
                    ＋
                  </span>

                  <div>

                    <strong>
                      Add Employee
                    </strong>

                    <small>
                      Create a new employee record
                    </small>

                  </div>

                  <b>
                    →
                  </b>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      "attendance"
                    )
                  }
                  className="quick-action"
                >

                  <span>
                    ◷
                  </span>

                  <div>

                    <strong>
                      Attendance
                    </strong>

                    <small>
                      View employee attendance
                    </small>

                  </div>

                  <b>
                    →
                  </b>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSection("leave")
                  }
                  className="quick-action"
                >

                  <span>
                    ▣
                  </span>

                  <div>

                    <strong>
                      Review Leave
                    </strong>

                    <small>
                      Approve or reject requests
                    </small>

                  </div>

                  <b>
                    →
                  </b>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSection("payroll")
                  }
                  className="quick-action"
                >

                  <span>
                    ₹
                  </span>

                  <div>

                    <strong>
                      Payroll
                    </strong>

                    <small>
                      Manage employee salaries
                    </small>

                  </div>

                  <b>
                    →
                  </b>

                </button>

              </div>

            </section>

            {/* RECENT EMPLOYEES */}

            <section className="dashboard-section">

              <div className="section-heading">

                <div>

                  <span>
                    WORKFORCE
                  </span>

                  <h3>
                    Recently added employees
                  </h3>

                </div>

              </div>

              {employees.length === 0 ? (

                <div className="empty-state">

                  <div>
                    ♙
                  </div>

                  <h3>
                    No employees yet
                  </h3>

                  <p>
                    Add your first employee to
                    start managing your workforce.
                  </p>

                </div>

              ) : (

                <div className="management-card">

                  <div className="employee-table-wrapper">

                    <table className="employee-table">

                      <thead>

                        <tr>

                          <th>
                            Employee
                          </th>

                          <th>
                            Employee ID
                          </th>

                          <th>
                            Department
                          </th>

                          <th>
                            Designation
                          </th>

                          <th>
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {employees
                          .slice(0, 5)
                          .map((employee) => (

                            <tr key={employee.id}>

                              <td>

                                <div className="employee-name-cell">

                                  <div className="employee-small-avatar">
                                    {employee.full_name
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                  </div>

                                  <div>

                                    <strong>
                                      {employee.full_name}
                                    </strong>

                                    <span>
                                      {employee.email}
                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td>
                                {employee.employee_id}
                              </td>

                              <td>
                                {employee.department}
                              </td>

                              <td>
                                {employee.designation}
                              </td>

                              <td>

                                <span
                                  className={`status-badge ${employee.employment_status
                                    ?.toLowerCase()
                                    .replace(
                                      /\s+/g,
                                      "-"
                                    )}`}
                                >
                                  {employee.employment_status}
                                </span>

                              </td>

                            </tr>

                          ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}

            </section>

          </section>
        )}

        {/* =====================================================
            EMPLOYEES
        ===================================================== */}

        {activeSection === "employees" && (
          <section className="dashboard-content">

            <div className="page-toolbar">

              <div>

                <span>
                  WORKFORCE
                </span>

                <h2>
                  Employee Management
                </h2>

                <p>
                  Add, view and manage employees.
                </p>

              </div>

              <button
                type="button"
                className="primary-action"
                onClick={() =>
                  navigate("/add-employee")
                }
              >
                ＋ Add Employee
              </button>

            </div>

            {/* ERROR */}

            {employeeError && (
              <div className="error-message">
                {employeeError}
              </div>
            )}

            {/* LOADING */}

            {loadingEmployees ? (

              <div className="management-card">

                <div className="empty-state">

                  <div>
                    ◌
                  </div>

                  <h3>
                    Loading employees...
                  </h3>

                  <p>
                    Fetching employee records.
                  </p>

                </div>

              </div>

            ) : employees.length === 0 ? (

              <div className="management-card">

                <div className="empty-state">

                  <div>
                    ♙
                  </div>

                  <h3>
                    No employees yet
                  </h3>

                  <p>
                    Start by adding your first
                    employee.
                  </p>

                  <button
                    type="button"
                    className="primary-action"
                    onClick={() =>
                      navigate("/add-employee")
                    }
                  >
                    Add First Employee
                  </button>

                </div>

              </div>

            ) : (

              <div className="management-card">

                <div className="employee-table-wrapper">

                  <table className="employee-table">

                    <thead>

                      <tr>

                        <th>
                          Employee
                        </th>

                        <th>
                          Employee ID
                        </th>

                        <th>
                          Department
                        </th>

                        <th>
                          Designation
                        </th>

                        <th>
                          Joining Date
                        </th>

                        <th>
                          Salary
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {employees.map(
                        (employee) => (

                          <tr
                            key={employee.id}
                          >

                            <td>

                              <div className="employee-name-cell">

                                <div className="employee-small-avatar">

                                  {employee.full_name
                                    ?.charAt(0)
                                    ?.toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {employee.full_name}
                                  </strong>

                                  <span>
                                    {employee.email}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>
                              {employee.employee_id}
                            </td>

                            <td>
                              {employee.department}
                            </td>

                            <td>
                              {employee.designation}
                            </td>

                            <td>
                              {formatDate(
                                employee.joining_date
                              )}
                            </td>

                            <td>
                              {formatSalary(
                                employee.monthly_salary
                              )}
                            </td>

                            <td>

                              <span
                                className={`status-badge ${employee.employment_status
                                  ?.toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )}`}
                              >
                                {
                                  employee.employment_status
                                }
                              </span>

                            </td>

                            <td>

                              <button
                                type="button"
                                className="delete-employee-button"
                                onClick={() =>
                                  handleDeleteEmployee(
                                    employee
                                  )
                                }
                              >
                                Delete
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

          </section>
        )}

        {/* =====================================================
            ATTENDANCE
        ===================================================== */}

        {activeSection === "attendance" && (
          <section className="dashboard-content">

            <div className="page-toolbar">

              <div>

                <span>
                  WORKFORCE TRACKING
                </span>

                <h2>
                  Attendance
                </h2>

                <p>
                  Monitor employee attendance and
                  work hours.
                </p>

              </div>

              <input
                type="date"
                className="date-input"
                defaultValue={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
              />

            </div>

            <div className="attendance-summary">

              <div>
                <span>
                  Employees
                </span>

                <strong>
                  {employees.length}
                </strong>
              </div>

              <div>
                <span>
                  Present
                </span>

                <strong>
                  0
                </strong>
              </div>

              <div>
                <span>
                  Absent
                </span>

                <strong>
                  0
                </strong>
              </div>

              <div>
                <span>
                  On Leave
                </span>

                <strong>
                  0
                </strong>
              </div>

            </div>

            <div className="management-card">

              <div className="empty-state">

                <div>
                  ◷
                </div>

                <h3>
                  Attendance records
                </h3>

                <p>
                  Attendance records will appear
                  here when the attendance feature
                  is connected.
                </p>

              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            LEAVE
        ===================================================== */}

        {activeSection === "leave" && (
          <section className="dashboard-content">

            <div className="page-toolbar">

              <div>

                <span>
                  TIME OFF
                </span>

                <h2>
                  Leave Management
                </h2>

                <p>
                  Review and manage employee leave
                  requests.
                </p>

              </div>

            </div>

            <div className="leave-summary">

              <div>
                <span>
                  Pending
                </span>

                <strong>
                  0
                </strong>
              </div>

              <div>
                <span>
                  Approved
                </span>

                <strong>
                  0
                </strong>
              </div>

              <div>
                <span>
                  Rejected
                </span>

                <strong>
                  0
                </strong>
              </div>

            </div>

            <div className="management-card">

              <div className="empty-state">

                <div>
                  ▣
                </div>

                <h3>
                  No leave requests
                </h3>

                <p>
                  Employee leave requests will
                  appear here.
                </p>

              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            PAYROLL
        ===================================================== */}

        {activeSection === "payroll" && (
          <section className="dashboard-content">

            <div className="page-toolbar">

              <div>

                <span>
                  COMPENSATION
                </span>

                <h2>
                  Payroll
                </h2>

                <p>
                  Manage employee salaries and
                  payroll.
                </p>

              </div>

              <button
                type="button"
                className="primary-action"
              >
                Generate Payroll
              </button>

            </div>

            <div className="payroll-summary">

              <div>

                <span>
                  Employees
                </span>

                <strong>
                  {employees.length}
                </strong>

              </div>

              <div>

                <span>
                  Gross Payroll
                </span>

                <strong>
                  ₹
                  {employees
                    .reduce(
                      (total, employee) =>
                        total +
                        Number(
                          employee.monthly_salary ||
                            0
                        ),
                      0
                    )
                    .toLocaleString("en-IN")}
                </strong>

              </div>

              <div>

                <span>
                  Net Payroll
                </span>

                <strong>
                  ₹0
                </strong>

              </div>

              <div>

                <span>
                  Status
                </span>

                <strong>
                  Ready
                </strong>

              </div>

            </div>

            <div className="management-card">

              <div className="empty-state">

                <div>
                  ₹
                </div>

                <h3>
                  Payroll management
                </h3>

                <p>
                  Employee salary data is now
                  connected to the dashboard.
                </p>

              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;
