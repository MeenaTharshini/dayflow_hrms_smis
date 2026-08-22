/* =========================================================
   AdminDashboard.jsx
   DaYFlow HRMS — Administrator Dashboard

   Features:
   - Employee management
   - Pending leave count
   - Leave request management
   - Approve leave
   - Reject leave
   - Rejection reason
   - Leave request filters
   - Real-time leave updates
   - Admin Payroll integration
   ========================================================= */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";

import AdminPayroll from "./AdminPayroll";

import "./AdminDashboard.css";


function AdminDashboard() {

  const navigate = useNavigate();


  /* =======================================================
     ACTIVE SECTION
     ======================================================= */

  const [activeSection, setActiveSection] =
    useState("overview");


  /* =======================================================
     EMPLOYEES
     ======================================================= */

  const [employees, setEmployees] =
    useState([]);

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [employeeError, setEmployeeError] =
    useState("");


  /* =======================================================
     LEAVE REQUESTS
     ======================================================= */

  const [leaveRequests, setLeaveRequests] =
    useState([]);

  const [loadingLeaves, setLoadingLeaves] =
    useState(true);

  const [leaveError, setLeaveError] =
    useState("");

  const [leaveFilter, setLeaveFilter] =
    useState("Pending");


  /* =======================================================
     REJECTION
     ======================================================= */

  const [rejectingRequest, setRejectingRequest] =
    useState(null);

  const [rejectionReason, setRejectionReason] =
    useState("");


  /* =======================================================
     ACTION STATE
     ======================================================= */

  const [processingRequestId, setProcessingRequestId] =
    useState(null);


  /* =======================================================
     LOAD EMPLOYEES
     ======================================================= */

  const fetchEmployees = useCallback(async () => {

    setLoadingEmployees(true);
    setEmployeeError("");

    try {

      const { data, error } =
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

  }, []);


  /* =======================================================
     LOAD LEAVE REQUESTS
     ======================================================= */

  const fetchLeaveRequests = useCallback(
    async () => {

      setLoadingLeaves(true);
      setLeaveError("");

      try {

        const { data, error } =
          await supabase
            .from("leave_requests")
            .select(`
              id,
              employee_id,
              leave_type,
              start_date,
              end_date,
              reason,
              status,
              approved_by,
              approved_at,
              rejection_reason,
              created_at,
              updated_at
            `)
            .order("created_at", {
              ascending: false,
            });

        if (error) {
          throw error;
        }


        /*
         * Attach employee information.
         */

        const requestsWithEmployee =
          (data || []).map((request) => {

            const employee =
              employees.find(
                (item) =>
                  item.id ===
                  request.employee_id
              );

            return {
              ...request,
              employee:
                employee || null,
            };

          });


        setLeaveRequests(
          requestsWithEmployee
        );

      } catch (error) {

        console.error(
          "Error loading leave requests:",
          error
        );

        setLeaveError(
          error.message ||
          "Unable to load leave requests."
        );

      } finally {

        setLoadingLeaves(false);

      }

    },
    [employees]
  );


  /* =======================================================
     INITIAL EMPLOYEE LOAD
     ======================================================= */

  useEffect(() => {

    fetchEmployees();

  }, [fetchEmployees]);


  /* =======================================================
     LOAD LEAVES AFTER EMPLOYEES
     ======================================================= */

  useEffect(() => {

    if (!loadingEmployees) {
      fetchLeaveRequests();
    }

  }, [
    loadingEmployees,
    fetchLeaveRequests,
  ]);


  /* =======================================================
     REAL-TIME LEAVE UPDATES
     ======================================================= */

  useEffect(() => {

    const channel =
      supabase
        .channel(
          "admin-leave-requests"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "leave_requests",
          },
          () => {
            fetchLeaveRequests();
          }
        )
        .subscribe();


    return () => {

      supabase.removeChannel(
        channel
      );

    };

  }, [fetchLeaveRequests]);


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = async () => {

    await supabase.auth.signOut();

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/admin-login");

  };


  /* =======================================================
     MENU
     ======================================================= */

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


  /* =======================================================
     LEAVE COUNTS
     ======================================================= */

  const pendingLeaveCount =
    useMemo(() => {

      return leaveRequests.filter(
        (request) =>
          request.status ===
          "Pending"
      ).length;

    }, [leaveRequests]);


  const approvedLeaveCount =
    useMemo(() => {

      return leaveRequests.filter(
        (request) =>
          request.status ===
          "Approved"
      ).length;

    }, [leaveRequests]);


  const rejectedLeaveCount =
    useMemo(() => {

      return leaveRequests.filter(
        (request) =>
          request.status ===
          "Rejected"
      ).length;

    }, [leaveRequests]);


  /* =======================================================
     FILTERED LEAVE REQUESTS
     ======================================================= */

  const filteredLeaveRequests =
    useMemo(() => {

      if (leaveFilter === "All") {
        return leaveRequests;
      }

      return leaveRequests.filter(
        (request) =>
          request.status ===
          leaveFilter
      );

    }, [
      leaveRequests,
      leaveFilter,
    ]);


  /* =======================================================
     FORMAT DATE
     ======================================================= */

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* =======================================================
     FORMAT DATE TIME
     ======================================================= */

  const formatDateTime = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  /* =======================================================
     CALCULATE WORKING DAYS
     ======================================================= */

  const calculateWorkingDays = (
    startDate,
    endDate
  ) => {

    if (
      !startDate ||
      !endDate
    ) {
      return 0;
    }

    const start =
      new Date(
        `${startDate}T00:00:00`
      );

    const end =
      new Date(
        `${endDate}T00:00:00`
      );

    if (end < start) {
      return 0;
    }

    let count = 0;

    const current =
      new Date(start);

    while (current <= end) {

      const day =
        current.getDay();

      if (
        day !== 0 &&
        day !== 6
      ) {
        count++;
      }

      current.setDate(
        current.getDate() + 1
      );

    }

    return count;

  };


  /* =======================================================
     FORMAT SALARY
     ======================================================= */

  const formatSalary = (salary) => {

    if (
      salary === null ||
      salary === undefined ||
      salary === ""
    ) {
      return "—";
    }

    return `₹${Number(
      salary
    ).toLocaleString("en-IN")}`;

  };


  /* =======================================================
     DELETE EMPLOYEE
     ======================================================= */

  const handleDeleteEmployee =
    async (employee) => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${employee.full_name}?`
        );

      if (!confirmed) {
        return;
      }

      try {

        const { error } =
          await supabase
            .from("employees")
            .delete()
            .eq(
              "id",
              employee.id
            );

        if (error) {
          throw error;
        }

        setEmployees(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                employee.id
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


  /* =======================================================
     APPROVE LEAVE
     ======================================================= */

  const handleApproveLeave =
    async (request) => {

      const confirmed =
        window.confirm(
          `Approve ${request.leave_type} for ${
            request.employee?.full_name ||
            "this employee"
          }?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setProcessingRequestId(
          request.id
        );

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "leave_requests"
            )
            .update({
              status: "Approved",
              approved_at:
                new Date().toISOString(),
              rejection_reason:
                null,
            })
            .eq(
              "id",
              request.id
            )
            .eq(
              "status",
              "Pending"
            )
            .select(`
              id,
              employee_id,
              leave_type,
              start_date,
              end_date,
              reason,
              status,
              approved_by,
              approved_at,
              rejection_reason,
              created_at,
              updated_at
            `)
            .single();

        if (error) {
          throw error;
        }

        setLeaveRequests(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                request.id
                  ? {
                      ...data,
                      employee:
                        item.employee,
                    }
                  : item
            )
        );

        alert(
          "Leave request approved successfully."
        );

      } catch (error) {

        console.error(
          "Approve leave error:",
          error
        );

        alert(
          error.message ||
          "Unable to approve leave request."
        );

      } finally {

        setProcessingRequestId(
          null
        );

      }

    };


  /* =======================================================
     OPEN REJECT DIALOG
     ======================================================= */

  const openRejectDialog =
    (request) => {

      setRejectingRequest(
        request
      );

      setRejectionReason("");

    };


  /* =======================================================
     CLOSE REJECT DIALOG
     ======================================================= */

  const closeRejectDialog =
    () => {

      if (
        processingRequestId
      ) {
        return;
      }

      setRejectingRequest(
        null
      );

      setRejectionReason("");

    };


  /* =======================================================
     REJECT LEAVE
     ======================================================= */

  const handleRejectLeave =
    async () => {

      if (
        !rejectingRequest
      ) {
        return;
      }

      const reason =
        rejectionReason.trim();

      if (!reason) {

        alert(
          "Please provide a rejection reason."
        );

        return;
      }

      if (reason.length < 5) {

        alert(
          "Please provide a more detailed rejection reason."
        );

        return;
      }

      try {

        setProcessingRequestId(
          rejectingRequest.id
        );

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "leave_requests"
            )
            .update({
              status: "Rejected",
              rejection_reason:
                reason,
              approved_at:
                null,
            })
            .eq(
              "id",
              rejectingRequest.id
            )
            .eq(
              "status",
              "Pending"
            )
            .select(`
              id,
              employee_id,
              leave_type,
              start_date,
              end_date,
              reason,
              status,
              approved_by,
              approved_at,
              rejection_reason,
              created_at,
              updated_at
            `)
            .single();

        if (error) {
          throw error;
        }

        setLeaveRequests(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                rejectingRequest.id
                  ? {
                      ...data,
                      employee:
                        item.employee,
                    }
                  : item
            )
        );

        setRejectingRequest(
          null
        );

        setRejectionReason("");

        alert(
          "Leave request rejected successfully."
        );

      } catch (error) {

        console.error(
          "Reject leave error:",
          error
        );

        alert(
          error.message ||
          "Unable to reject leave request."
        );

      } finally {

        setProcessingRequestId(
          null
        );

      }

    };


  /* =======================================================
     STATUS CLASS
     ======================================================= */

  const getStatusClass =
    (status) => {

      switch (status) {

        case "Approved":
          return "approved";

        case "Rejected":
          return "rejected";

        case "Pending":
          return "pending";

        default:
          return "";

      }

    };


  /* =======================================================
     LOADING
     ======================================================= */

  if (loadingEmployees) {

    return (

      <div className="admin-loading">

        <div className="admin-spinner"></div>

        <p>
          Loading administrator dashboard...
        </p>

      </div>

    );

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="admin-dashboard">


      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside className="admin-sidebar">

        <div className="sidebar-brand">

          <h1>
            DaYFlow
          </h1>

          <span>
            ADMIN PORTAL
          </span>

        </div>


        <nav className="sidebar-menu">

          {menuItems.map(
            (item) => (

              <button
                key={item.id}
                type="button"
                className={
                  activeSection ===
                  item.id
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() =>
                  setActiveSection(
                    item.id
                  )
                }
              >

                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>


                {item.id ===
                  "leave" &&
                  pendingLeaveCount >
                    0 && (

                    <span className="sidebar-badge">
                      {pendingLeaveCount}
                    </span>

                  )}

              </button>

            )
          )}

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
            onClick={
              handleLogout
            }
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
          ================================================= */}

      <main className="admin-main">


        {/* =================================================
            HEADER
            ================================================= */}

        <header className="admin-header">

          <div>

            <p className="header-label">
              ADMINISTRATOR
            </p>

            <h2>

              {activeSection ===
                "overview" &&
                "Dashboard"}

              {activeSection ===
                "employees" &&
                "Employee Management"}

              {activeSection ===
                "attendance" &&
                "Attendance"}

              {activeSection ===
                "leave" &&
                "Leave Management"}

              {activeSection ===
                "payroll" &&
                "Payroll"}

            </h2>

          </div>


          <div className="admin-header-actions">

            <button
              type="button"
              className="notification-button"
              title="Notifications"
              onClick={() =>
                setActiveSection(
                  "leave"
                )
              }
            >

              🔔

              {pendingLeaveCount >
                0 && (

                <span className="notification-count">
                  {pendingLeaveCount}
                </span>

              )}

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


        {/* =================================================
            OVERVIEW
            ================================================= */}

        {activeSection ===
          "overview" && (

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
                  Here's what's happening
                  across your organization
                  today.
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
                    Active workforce
                    records
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


              <div
                className="stat-card"
                onClick={() =>
                  setActiveSection(
                    "leave"
                  )
                }
                style={{
                  cursor:
                    "pointer",
                }}
              >

                <div className="stat-icon">
                  ▣
                </div>

                <div>

                  <span>
                    Leave Requests
                  </span>

                  <strong>
                    {pendingLeaveCount}
                  </strong>

                  <small>
                    Awaiting approval
                  </small>

                </div>

              </div>


              <div
                className="stat-card"
                onClick={() =>
                  setActiveSection(
                    "payroll"
                  )
                }
                style={{
                  cursor:
                    "pointer",
                }}
              >

                <div className="stat-icon">
                  ₹
                </div>

                <div>

                  <span>
                    Payroll
                  </span>

                  <strong>
                    Ready
                  </strong>

                  <small>
                    Open payroll management
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
                    navigate(
                      "/add-employee"
                    )
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
                      Create a new
                      employee record
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
                      View employee
                      attendance
                    </small>

                  </div>

                  <b>
                    →
                  </b>

                </button>


                <button
                  type="button"
                  onClick={() => {

                    setActiveSection(
                      "leave"
                    );

                    setLeaveFilter(
                      "Pending"
                    );

                  }}
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
                      {pendingLeaveCount}{" "}
                      request
                      {pendingLeaveCount !==
                      1
                        ? "s"
                        : ""}{" "}
                      awaiting
                      approval
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
                      "payroll"
                    )
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
                      Manage employee
                      payroll
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


              {employees.length ===
              0 ? (

                <div className="empty-state">

                  <div>
                    ♙
                  </div>

                  <h3>
                    No employees yet
                  </h3>

                  <p>
                    Add your first employee
                    to start managing your
                    workforce.
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
                          .slice(
                            0,
                            5
                          )
                          .map(
                            (employee) => (

                              <tr
                                key={
                                  employee.id
                                }
                              >

                                <td>

                                  <div className="employee-name-cell">

                                    <div className="employee-small-avatar">

                                      {employee.full_name
                                        ?.charAt(
                                          0
                                        )
                                        ?.toUpperCase()}

                                    </div>

                                    <div>

                                      <strong>
                                        {
                                          employee.full_name
                                        }
                                      </strong>

                                      <span>
                                        {
                                          employee.email
                                        }
                                      </span>

                                    </div>

                                  </div>

                                </td>


                                <td>
                                  {
                                    employee.employee_id
                                  }
                                </td>

                                <td>
                                  {
                                    employee.department
                                  }
                                </td>

                                <td>
                                  {
                                    employee.designation
                                  }
                                </td>

                                <td>

                                  <span
                                    className={`status-badge ${
                                      employee.employment_status
                                        ?.toLowerCase()
                                        .replace(
                                          /\s+/g,
                                          "-"
                                        )
                                    }`}
                                  >
                                    {
                                      employee.employment_status
                                    }
                                  </span>

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

          </section>

        )}


        {/* =================================================
            EMPLOYEES
            ================================================= */}

        {activeSection ===
          "employees" && (

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
                  Add, view and manage
                  employees.
                </p>

              </div>


              <button
                type="button"
                className="primary-action"
                onClick={() =>
                  navigate(
                    "/add-employee"
                  )
                }
              >
                ＋ Add Employee
              </button>

            </div>


            {employeeError && (

              <div className="error-message">
                {employeeError}
              </div>

            )}


            {employees.length ===
            0 ? (

              <div className="empty-state">

                <div>
                  ♙
                </div>

                <h3>
                  No employees yet
                </h3>

                <p>
                  Add your first employee.
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
                            key={
                              employee.id
                            }
                          >

                            <td>

                              <div className="employee-name-cell">

                                <div className="employee-small-avatar">

                                  {employee.full_name
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {
                                      employee.full_name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      employee.email
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>


                            <td>
                              {
                                employee.employee_id
                              }
                            </td>

                            <td>
                              {
                                employee.department
                              }
                            </td>

                            <td>
                              {
                                employee.designation
                              }
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
                                className={`status-badge ${
                                  employee.employment_status
                                    ?.toLowerCase()
                                    .replace(
                                      /\s+/g,
                                      "-"
                                    )
                                }`}
                              >
                                {
                                  employee.employment_status
                                }
                              </span>

                            </td>


                            <td>

                              <button
                                type="button"
                                className="delete-button"
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


        {/* =================================================
            ATTENDANCE
            ================================================= */}

        {activeSection ===
          "attendance" && (

          <section className="dashboard-content">

            <div className="page-toolbar">

              <div>

                <span>
                  WORKFORCE
                </span>

                <h2>
                  Attendance
                </h2>

                <p>
                  Monitor employee
                  attendance records.
                </p>

              </div>

            </div>


            <div className="empty-state">

              <div>
                ◷
              </div>

              <h3>
                Attendance Management
              </h3>

              <p>
                Attendance management
                can be connected to your
                attendance table here.
              </p>

            </div>

          </section>

        )}


        {/* =================================================
            LEAVE MANAGEMENT
            ================================================= */}

        {activeSection ===
          "leave" && (

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
                  Review and manage
                  employee leave requests.
                </p>

              </div>


              <button
                type="button"
                className="secondary-action"
                onClick={
                  fetchLeaveRequests
                }
              >
                ↻ Refresh
              </button>

            </div>


            {leaveError && (

              <div className="error-message">
                {leaveError}
              </div>

            )}


            {/* LEAVE STATISTICS */}

            <div className="stats-grid">

              <div className="stat-card">

                <div className="stat-icon">
                  ▣
                </div>

                <div>

                  <span>
                    Total Requests
                  </span>

                  <strong>
                    {
                      leaveRequests.length
                    }
                  </strong>

                  <small>
                    All leave applications
                  </small>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">
                  ⏳
                </div>

                <div>

                  <span>
                    Pending
                  </span>

                  <strong>
                    {
                      pendingLeaveCount
                    }
                  </strong>

                  <small>
                    Awaiting approval
                  </small>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">
                  ✓
                </div>

                <div>

                  <span>
                    Approved
                  </span>

                  <strong>
                    {
                      approvedLeaveCount
                    }
                  </strong>

                  <small>
                    Approved requests
                  </small>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">
                  ✕
                </div>

                <div>

                  <span>
                    Rejected
                  </span>

                  <strong>
                    {
                      rejectedLeaveCount
                    }
                  </strong>

                  <small>
                    Rejected requests
                  </small>

                </div>

              </div>

            </div>


            {/* FILTERS */}

            <section className="dashboard-section">

              <div className="section-heading">

                <div>

                  <span>
                    REQUESTS
                  </span>

                  <h3>
                    Leave Applications
                  </h3>

                </div>


                <div className="leave-filters">

                  {[
                    "Pending",
                    "Approved",
                    "Rejected",
                    "All",
                  ].map(
                    (filter) => (

                      <button
                        key={filter}
                        type="button"
                        className={
                          leaveFilter ===
                          filter
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setLeaveFilter(
                            filter
                          )
                        }
                      >
                        {filter}
                      </button>

                    )
                  )}

                </div>

              </div>


              {loadingLeaves ? (

                <div className="empty-state">

                  <div>
                    ◌
                  </div>

                  <h3>
                    Loading leave requests...
                  </h3>

                  <p>
                    Fetching requests
                    from the database.
                  </p>

                </div>

              ) : filteredLeaveRequests.length ===
                0 ? (

                <div className="empty-state">

                  <div>
                    ✓
                  </div>

                  <h3>
                    No{" "}
                    {leaveFilter.toLowerCase()}{" "}
                    leave requests
                  </h3>

                  <p>
                    There are currently no
                    leave applications in
                    this category.
                  </p>

                </div>

              ) : (

                <div className="leave-admin-list">

                  {filteredLeaveRequests.map(
                    (request) => {

                      const employee =
                        request.employee;

                      const duration =
                        calculateWorkingDays(
                          request.start_date,
                          request.end_date
                        );

                      const isProcessing =
                        processingRequestId ===
                        request.id;


                      return (

                        <article
                          className="admin-leave-card"
                          key={
                            request.id
                          }
                        >

                          <div className="admin-leave-top">

                            <div className="admin-leave-employee">

                              <div className="employee-small-avatar">

                                {employee?.full_name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "E"}

                              </div>

                              <div>

                                <strong>
                                  {
                                    employee?.full_name ||
                                    "Unknown Employee"
                                  }
                                </strong>

                                <span>
                                  Employee ID:{" "}
                                  {
                                    employee?.employee_id ||
                                    request.employee_id
                                  }
                                </span>

                              </div>

                            </div>


                            <span
                              className={`leave-admin-status ${getStatusClass(
                                request.status
                              )}`}
                            >
                              {
                                request.status
                              }
                            </span>

                          </div>


                          <div className="admin-leave-details">

                            <div>

                              <span>
                                LEAVE TYPE
                              </span>

                              <strong>
                                {
                                  request.leave_type
                                }
                              </strong>

                            </div>


                            <div>

                              <span>
                                DATES
                              </span>

                              <strong>

                                {formatDate(
                                  request.start_date
                                )}

                                {request.start_date !==
                                  request.end_date &&
                                  ` — ${formatDate(
                                    request.end_date
                                  )}`}

                              </strong>

                            </div>


                            <div>

                              <span>
                                DURATION
                              </span>

                              <strong>
                                {duration}{" "}
                                {duration ===
                                1
                                  ? "Day"
                                  : "Days"}
                              </strong>

                            </div>


                            <div>

                              <span>
                                SUBMITTED
                              </span>

                              <strong>
                                {formatDateTime(
                                  request.created_at
                                )}
                              </strong>

                            </div>

                          </div>


                          <div className="admin-leave-reason">

                            <span>
                              EMPLOYEE REASON
                            </span>

                            <p>
                              {
                                request.reason ||
                                "No reason provided."
                              }
                            </p>

                          </div>


                          {request.status ===
                            "Approved" &&
                            request.approved_at && (

                              <div className="admin-leave-result approved">

                                <strong>
                                  ✓ Leave Approved
                                </strong>

                                <span>
                                  Approved on{" "}
                                  {formatDateTime(
                                    request.approved_at
                                  )}
                                </span>

                              </div>

                            )}


                          {request.status ===
                            "Rejected" &&
                            request.rejection_reason && (

                              <div className="admin-leave-result rejected">

                                <strong>
                                  ✕ Rejection Reason
                                </strong>

                                <span>
                                  {
                                    request.rejection_reason
                                  }
                                </span>

                              </div>

                            )}


                          {request.status ===
                            "Pending" && (

                            <div className="admin-leave-actions">

                              <button
                                type="button"
                                className="approve-leave-button"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleApproveLeave(
                                    request
                                  )
                                }
                              >

                                {isProcessing
                                  ? "Processing..."
                                  : "✓ Approve"}

                              </button>


                              <button
                                type="button"
                                className="reject-leave-button"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  openRejectDialog(
                                    request
                                  )
                                }
                              >
                                ✕ Reject
                              </button>

                            </div>

                          )}

                        </article>

                      );

                    }
                  )}

                </div>

              )}

            </section>

          </section>

        )}


        {/* =================================================
            PAYROLL
            ================================================= */}

        {activeSection ===
          "payroll" && (

          <section className="dashboard-content">

            <div className="page-toolbar">

              <div>

                <span>
                  FINANCE
                </span>

                <h2>
                  Admin Payroll
                </h2>

                <p>
                  Manage employee salaries,
                  payroll processing and
                  payroll records.
                </p>

              </div>

            </div>


            {/* =================================================
                IMPORTANT:
                Actual AdminPayroll component
                ================================================= */}

            <AdminPayroll
              employees={employees}
            />

          </section>

        )}

      </main>


      {/* =================================================
          REJECTION MODAL
          ================================================= */}

      {rejectingRequest && (

        <div
          className="leave-modal-overlay"
          onClick={
            closeRejectDialog
          }
        >

          <div
            className="leave-rejection-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="leave-modal-header">

              <div>

                <span>
                  LEAVE REQUEST
                </span>

                <h3>
                  Reject Leave Request
                </h3>

              </div>


              <button
                type="button"
                onClick={
                  closeRejectDialog
                }
                disabled={
                  processingRequestId !==
                  null
                }
              >
                ×
              </button>

            </div>


            <div className="leave-modal-body">

              <p>

                You are rejecting the leave
                request from{" "}

                <strong>
                  {
                    rejectingRequest
                      .employee
                      ?.full_name ||
                    "this employee"
                  }
                </strong>
                .

              </p>


              <div className="rejection-request-summary">

                <span>
                  Leave Type
                </span>

                <strong>
                  {
                    rejectingRequest.leave_type
                  }
                </strong>


                <span>
                  Dates
                </span>

                <strong>

                  {formatDate(
                    rejectingRequest.start_date
                  )}

                  {rejectingRequest.start_date !==
                    rejectingRequest.end_date &&
                    ` — ${formatDate(
                      rejectingRequest.end_date
                    )}`}

                </strong>

              </div>


              <label htmlFor="rejectionReason">
                Rejection Reason
              </label>


              <textarea
                id="rejectionReason"
                value={
                  rejectionReason
                }
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                placeholder="Explain why this leave request is being rejected..."
                rows="5"
                maxLength="500"
                autoFocus
              />


              <small>
                {
                  rejectionReason.length
                }
                /500
              </small>

            </div>


            <div className="leave-modal-footer">

              <button
                type="button"
                className="modal-cancel-button"
                onClick={
                  closeRejectDialog
                }
                disabled={
                  processingRequestId !==
                  null
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="reject-leave-button"
                onClick={
                  handleRejectLeave
                }
                disabled={
                  processingRequestId !==
                  null
                }
              >

                {processingRequestId
                  ? "Rejecting..."
                  : "Reject Leave"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default AdminDashboard;