/* =========================================================
   Leave.jsx
   DaYFlow HRMS — Employee Leave Management
   Supabase Database Version
   ========================================================= */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./Leave.css";

function Leave() {
  const navigate = useNavigate();

  /* =======================================================
     STATE
     ======================================================= */

  const [employee, setEmployee] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [activeFilter, setActiveFilter] = useState("All");

  /* =======================================================
     TODAY
     ======================================================= */

  const today = new Date().toISOString().split("T")[0];

  /* =======================================================
     LOAD LOGGED-IN EMPLOYEE
     ======================================================= */

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const storedEmployee =
          sessionStorage.getItem("employee");

        const loggedIn =
          sessionStorage.getItem("employeeLoggedIn");

        if (!storedEmployee || loggedIn !== "true") {
          navigate("/login", { replace: true });
          return;
        }

        const parsedEmployee = JSON.parse(storedEmployee);

        if (!parsedEmployee?.id) {
          throw new Error(
            "Employee information is incomplete."
          );
        }

        setEmployee(parsedEmployee);
      } catch (error) {
        console.error(
          "Unable to load employee:",
          error
        );

        sessionStorage.removeItem("employee");
        sessionStorage.removeItem("employeeLoggedIn");

        navigate("/login", { replace: true });
      }
    };

    loadEmployee();
  }, [navigate]);

  /* =======================================================
     LOAD LEAVE DATA
     ======================================================= */

  useEffect(() => {
    if (!employee?.id) return;

    loadLeaveData();
  }, [employee]);

  /* =======================================================
     FETCH LEAVE BALANCES + REQUESTS
     ======================================================= */

  const loadLeaveData = async () => {
    if (!employee?.id) return;

    try {
      setLoading(true);

      setMessage({
        type: "",
        text: "",
      });

      /* -----------------------------------------------
         LEAVE BALANCES
         ----------------------------------------------- */

      const {
        data: balances,
        error: balanceError,
      } = await supabase
        .from("leave_balances")
        .select(`
          id,
          employee_id,
          leave_type,
          total_days,
          used_days,
          remaining_days,
          created_at,
          updated_at
        `)
        .eq("employee_id", employee.id)
        .order("leave_type", {
          ascending: true,
        });

      if (balanceError) {
        throw balanceError;
      }

      setLeaveBalances(balances || []);

      /* -----------------------------------------------
         LEAVE REQUESTS
         ----------------------------------------------- */

      const {
        data: requests,
        error: requestError,
      } = await supabase
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
        .eq("employee_id", employee.id)
        .order("created_at", {
          ascending: false,
        });

      if (requestError) {
        throw requestError;
      }

      setLeaveRequests(requests || []);

      /* -----------------------------------------------
         SET DEFAULT LEAVE TYPE
         ----------------------------------------------- */

      if (
        !form.leaveType &&
        balances &&
        balances.length > 0
      ) {
        setForm((previous) => ({
          ...previous,
          leaveType: balances[0].leave_type,
        }));
      }
    } catch (error) {
      console.error(
        "Unable to load leave data:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to load leave information.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     REAL-TIME REQUEST UPDATES
     ======================================================= */

  useEffect(() => {
    if (!employee?.id) return;

    const channel = supabase
      .channel(`employee-leave-${employee.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leave_requests",
          filter: `employee_id=eq.${employee.id}`,
        },
        () => {
          loadLeaveData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employee]);

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  /* =======================================================
     CALCULATE WORKING DAYS
     ======================================================= */

  const calculateWorkingDays = (
    startDate,
    endDate
  ) => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(
      `${startDate}T00:00:00`
    );

    const end = new Date(
      `${endDate}T00:00:00`
    );

    if (end < start) {
      return 0;
    }

    let count = 0;

    const current = new Date(start);

    while (current <= end) {
      const day = current.getDay();

      // Sunday = 0
      // Saturday = 6
      if (day !== 0 && day !== 6) {
        count++;
      }

      current.setDate(
        current.getDate() + 1
      );
    }

    return count;
  };

  /* =======================================================
     REQUESTED DAYS
     ======================================================= */

  const requestedDays = useMemo(() => {
    return calculateWorkingDays(
      form.startDate,
      form.endDate
    );
  }, [
    form.startDate,
    form.endDate,
  ]);

  /* =======================================================
     SELECTED LEAVE BALANCE
     ======================================================= */

  const selectedBalance = useMemo(() => {
    const balance = leaveBalances.find(
      (item) =>
        item.leave_type === form.leaveType
    );

    return Number(
      balance?.remaining_days || 0
    );
  }, [
    leaveBalances,
    form.leaveType,
  ]);

  /* =======================================================
     TOTAL REMAINING LEAVE
     ======================================================= */

  const totalRemainingLeave = useMemo(() => {
    return leaveBalances.reduce(
      (total, item) =>
        total +
        Number(item.remaining_days || 0),
      0
    );
  }, [leaveBalances]);

  /* =======================================================
     TOTAL USED LEAVE
     ======================================================= */

  const totalUsedLeave = useMemo(() => {
    return leaveBalances.reduce(
      (total, item) =>
        total +
        Number(item.used_days || 0),
      0
    );
  }, [leaveBalances]);

  /* =======================================================
     TOTAL ALLOCATED LEAVE
     ======================================================= */

  const totalAllocatedLeave = useMemo(() => {
    return leaveBalances.reduce(
      (total, item) =>
        total +
        Number(item.total_days || 0),
      0
    );
  }, [leaveBalances]);

  /* =======================================================
     FILTERED REQUESTS
     ======================================================= */

  const filteredRequests = useMemo(() => {
    if (activeFilter === "All") {
      return leaveRequests;
    }

    return leaveRequests.filter(
      (request) =>
        request.status === activeFilter
    );
  }, [
    leaveRequests,
    activeFilter,
  ]);

  /* =======================================================
     REQUEST COUNTS
     ======================================================= */

  const pendingCount = useMemo(() => {
    return leaveRequests.filter(
      (request) =>
        request.status === "Pending"
    ).length;
  }, [leaveRequests]);

  const approvedCount = useMemo(() => {
    return leaveRequests.filter(
      (request) =>
        request.status === "Approved"
    ).length;
  }, [leaveRequests]);

  const rejectedCount = useMemo(() => {
    return leaveRequests.filter(
      (request) =>
        request.status === "Rejected"
    ).length;
  }, [leaveRequests]);

  /* =======================================================
     VALIDATE FORM
     ======================================================= */

  const validateForm = () => {
    if (!form.leaveType) {
      return "Please select a leave type.";
    }

    if (!form.startDate) {
      return "Please select a start date.";
    }

    if (!form.endDate) {
      return "Please select an end date.";
    }

    if (form.startDate < today) {
      return "Leave cannot be requested for a past date.";
    }

    if (form.endDate < form.startDate) {
      return "End date cannot be before start date.";
    }

    if (requestedDays <= 0) {
      return "The selected dates contain no working days.";
    }

    if (selectedBalance <= 0) {
      return `You have no ${form.leaveType} balance remaining.`;
    }

    if (requestedDays > selectedBalance) {
      return `You only have ${selectedBalance} days of ${form.leaveType} available.`;
    }

    if (!form.reason.trim()) {
      return "Please provide a reason for your leave.";
    }

    if (form.reason.trim().length < 10) {
      return "Please provide at least 10 characters for the reason.";
    }

    return "";
  };

  /* =======================================================
     SUBMIT LEAVE REQUEST
     ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setMessage({
        type: "error",
        text: validationError,
      });

      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);

      setMessage({
        type: "",
        text: "",
      });

      /* -----------------------------------------------
         CHECK FOR OVERLAPPING PENDING/APPROVED LEAVE
         ----------------------------------------------- */

      const {
        data: existingRequests,
        error: existingError,
      } = await supabase
        .from("leave_requests")
        .select(`
          id,
          start_date,
          end_date,
          status
        `)
        .eq("employee_id", employee.id)
        .in("status", [
          "Pending",
          "Approved",
        ]);

      if (existingError) {
        throw existingError;
      }

      const hasOverlap =
        existingRequests?.some((request) => {
          return (
            form.startDate <=
              request.end_date &&
            form.endDate >=
              request.start_date
          );
        });

      if (hasOverlap) {
        setMessage({
          type: "error",
          text:
            "You already have a pending or approved leave request covering part of these dates.",
        });

        return;
      }

      /* -----------------------------------------------
         INSERT REQUEST
         ----------------------------------------------- */

      const {
        data: newRequest,
        error,
      } = await supabase
        .from("leave_requests")
        .insert({
          employee_id: employee.id,
          leave_type: form.leaveType,
          start_date: form.startDate,
          end_date: form.endDate,
          reason: form.reason.trim(),
          status: "Pending",
        })
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

      /* -----------------------------------------------
         UPDATE UI
         ----------------------------------------------- */

      setLeaveRequests((previous) => [
        newRequest,
        ...previous,
      ]);

      setForm({
        leaveType:
          leaveBalances[0]?.leave_type || "",
        startDate: "",
        endDate: "",
        reason: "",
      });

      setMessage({
        type: "success",
        text:
          "Leave request submitted successfully.",
      });
    } catch (error) {
      console.error(
        "Leave submission error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to submit leave request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     CANCEL PENDING REQUEST
     ======================================================= */

  const handleCancel = async (requestId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this pending leave request?"
      );

    if (!confirmed) return;

    try {
      const {
        error,
      } = await supabase
        .from("leave_requests")
        .delete()
        .eq("id", requestId)
        .eq("employee_id", employee.id)
        .eq("status", "Pending");

      if (error) {
        throw error;
      }

      setLeaveRequests((previous) =>
        previous.filter(
          (request) =>
            request.id !== requestId
        )
      );

      setMessage({
        type: "success",
        text:
          "Leave request cancelled successfully.",
      });
    } catch (error) {
      console.error(
        "Cancel request error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to cancel leave request.",
      });
    }
  };

  /* =======================================================
     FORMAT DATE
     ======================================================= */

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =======================================================
     FORMAT DATE TIME
     ======================================================= */

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
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
     STATUS CLASS
     ======================================================= */

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "leave-status-approved";

      case "Rejected":
        return "leave-status-rejected";

      case "Pending":
        return "leave-status-pending";

      default:
        return "";
    }
  };

  /* =======================================================
     LOADING
     ======================================================= */

  if (!employee || loading) {
    return (
      <div className="leave-loading">
        <div className="leave-spinner"></div>

        <p>
          Loading leave management...
        </p>
      </div>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="leave-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="leave-header">

        <div className="leave-header-left">

          <button
            type="button"
            className="leave-back-button"
            onClick={() =>
              navigate(
                "/employee-dashboard"
              )
            }
          >
            ←
          </button>

          <div>
            <span className="leave-eyebrow">
              EMPLOYEE PORTAL
            </span>

            <h1>
              Leave Management
            </h1>

            <p>
              Request time off and track
              your leave applications.
            </p>
          </div>

        </div>

        <div className="leave-employee">

          <div className="leave-avatar">
            {employee.full_name
              ?.charAt(0)
              ?.toUpperCase() || "E"}
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

      {/* =================================================
          MAIN
          ================================================= */}

      <main className="leave-content">

        {/* MESSAGE */}

        {message.text && (
          <div
            className={`leave-message ${message.type}`}
          >
            <span>
              {message.type === "success"
                ? "✓"
                : "!"}
            </span>

            <p>
              {message.text}
            </p>

            <button
              type="button"
              onClick={() =>
                setMessage({
                  type: "",
                  text: "",
                })
              }
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            BALANCE SUMMARY
            ================================================= */}

        <section className="leave-balance-hero">

          <div>
            <span>
              TIME OFF
            </span>

            <h2>
              Your Leave Balance
            </h2>

            <p>
              Current leave balances from
              your HRMS account.
            </p>
          </div>

          <div className="total-leave">
            <strong>
              {totalRemainingLeave}
            </strong>

            <span>
              Days Available
            </span>
          </div>

        </section>

        {/* =================================================
            BALANCE STATISTICS
            ================================================= */}

        <section className="leave-balance-grid">

          {leaveBalances.length === 0 ? (
            <div className="no-leave-balance">
              <h3>
                No leave balance found
              </h3>

              <p>
                Your administrator has not
                assigned any leave balance yet.
              </p>
            </div>
          ) : (
            leaveBalances.map((balance) => {

              const remaining =
                Number(
                  balance.remaining_days || 0
                );

              const total =
                Number(
                  balance.total_days || 0
                );

              const used =
                Number(
                  balance.used_days || 0
                );

              return (
                <div
                  className="leave-balance-card"
                  key={balance.id}
                >

                  <div className="leave-balance-icon">
                    {balance.leave_type
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div>

                    <span>
                      {balance.leave_type}
                    </span>

                    <strong>
                      {remaining}
                    </strong>

                    <small>
                      {used} used / {total} total
                    </small>

                  </div>

                </div>
              );
            })
          )}

        </section>

        {/* =================================================
            LEAVE APPLICATION
            ================================================= */}

        <section className="leave-application-section">

          <div className="leave-section-heading">

            <div>
              <span>
                NEW REQUEST
              </span>

              <h2>
                Request Leave
              </h2>
            </div>

          </div>

          <form
            className="leave-form"
            onSubmit={handleSubmit}
          >

            {/* LEAVE TYPE */}

            <div className="form-field">

              <label htmlFor="leaveType">
                Leave Type
              </label>

              <select
                id="leaveType"
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                disabled={
                  leaveBalances.length === 0
                }
              >

                <option value="">
                  Select leave type
                </option>

                {leaveBalances.map(
                  (balance) => (
                    <option
                      key={balance.id}
                      value={
                        balance.leave_type
                      }
                    >
                      {balance.leave_type}
                    </option>
                  )
                )}

              </select>

              {form.leaveType && (
                <small>
                  Available:{" "}
                  <strong>
                    {selectedBalance}
                  </strong>{" "}
                  days
                </small>
              )}

            </div>

            {/* START DATE */}

            <div className="form-field">

              <label htmlFor="startDate">
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                name="startDate"
                value={form.startDate}
                min={today}
                onChange={handleChange}
              />

            </div>

            {/* END DATE */}

            <div className="form-field">

              <label htmlFor="endDate">
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                name="endDate"
                value={form.endDate}
                min={
                  form.startDate || today
                }
                onChange={handleChange}
              />

            </div>

            {/* DAYS PREVIEW */}

            <div className="leave-days-preview">

              <span>
                REQUESTED DAYS
              </span>

              <strong>
                {requestedDays}
              </strong>

              <small>
                Working days
              </small>

            </div>

            {/* REASON */}

            <div className="form-field form-field-full">

              <label htmlFor="reason">
                Reason for Leave
              </label>

              <textarea
                id="reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Please explain the reason for your leave..."
                rows="5"
                maxLength="500"
              />

              <small className="character-count">
                {form.reason.length}/500
              </small>

            </div>

            {/* FORM FOOTER */}

            <div className="leave-form-footer">

              <p>
                Your request will be
                submitted with Pending status
                for administrator/manager review.
              </p>

              <button
                type="submit"
                className="submit-leave-button"
                disabled={
                  submitting ||
                  leaveBalances.length === 0
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Leave Request"}

                {!submitting && (
                  <span>
                    →
                  </span>
                )}

              </button>

            </div>

          </form>

        </section>

        {/* =================================================
            REQUEST HISTORY
            ================================================= */}

        <section className="leave-history-section">

          <div className="leave-section-heading history-heading">

            <div>
              <span>
                REQUESTS
              </span>

              <h2>
                My Leave Requests
              </h2>
            </div>

            <div className="leave-filters">

              {[
                "All",
                "Pending",
                "Approved",
                "Rejected",
              ].map((filter) => (

                <button
                  key={filter}
                  type="button"
                  className={
                    activeFilter === filter
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveFilter(filter)
                  }
                >
                  {filter}
                </button>

              ))}

            </div>

          </div>

          {/* REQUEST SUMMARY */}

          <div className="leave-request-summary">

            <div>
              <strong>
                {leaveRequests.length}
              </strong>
              <span>
                Total Requests
              </span>
            </div>

            <div>
              <strong>
                {pendingCount}
              </strong>
              <span>
                Pending
              </span>
            </div>

            <div>
              <strong>
                {approvedCount}
              </strong>
              <span>
                Approved
              </span>
            </div>

            <div>
              <strong>
                {rejectedCount}
              </strong>
              <span>
                Rejected
              </span>
            </div>

          </div>

          {/* REQUEST LIST */}

          <div className="leave-request-list">

            {filteredRequests.length === 0 ? (

              <div className="no-leave-requests">

                <div>
                  +
                </div>

                <h3>
                  No leave requests
                </h3>

                <p>
                  You don't have any{" "}
                  {activeFilter.toLowerCase()}{" "}
                  leave requests.
                </p>

              </div>

            ) : (

              filteredRequests.map(
                (request) => {

                  const duration =
                    calculateWorkingDays(
                      request.start_date,
                      request.end_date
                    );

                  return (
                    <article
                      className="leave-request-card"
                      key={request.id}
                    >

                      <div className="request-type-icon">
                        {request.leave_type
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div className="request-main">

                        {/* TITLE */}

                        <div className="request-title-row">

                          <div>

                            <h3>
                              {request.leave_type}
                            </h3>

                            <span>
                              Submitted{" "}
                              {formatDateTime(
                                request.created_at
                              )}
                            </span>

                          </div>

                          <span
                            className={`leave-status ${getStatusClass(
                              request.status
                            )}`}
                          >
                            <span></span>

                            {request.status}
                          </span>

                        </div>

                        {/* DETAILS */}

                        <div className="request-details">

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
                              {duration === 1
                                ? "Day"
                                : "Days"}
                            </strong>

                          </div>

                          <div>

                            <span>
                              REASON
                            </span>

                            <strong>
                              {request.reason ||
                                "—"}
                            </strong>

                          </div>

                        </div>

                        {/* APPROVAL INFORMATION */}

                        {request.status ===
                          "Approved" &&
                          request.approved_at && (
                            <div className="leave-approval-info">

                              <strong>
                                Approved
                              </strong>

                              <span>
                                {formatDateTime(
                                  request.approved_at
                                )}
                              </span>

                            </div>
                          )}

                        {/* REJECTION REASON */}

                        {request.status ===
                          "Rejected" &&
                          request.rejection_reason && (
                            <div className="leave-rejection-reason">

                              <strong>
                                Rejection reason:
                              </strong>

                              <span>
                                {
                                  request.rejection_reason
                                }
                              </span>

                            </div>
                          )}

                        {/* CANCEL */}

                        {request.status ===
                          "Pending" && (

                          <button
                            type="button"
                            className="cancel-leave-button"
                            onClick={() =>
                              handleCancel(
                                request.id
                              )
                            }
                          >
                            Cancel Request
                          </button>

                        )}

                      </div>

                    </article>
                  );
                }
              )

            )}

          </div>

        </section>

        {/* =================================================
            INFORMATION
            ================================================= */}

        <section className="leave-information">

          <div className="leave-information-icon">
            i
          </div>

          <div>

            <strong>
              About leave requests
            </strong>

            <p>
              New requests are stored in
              the HRMS database with
              Pending status. Your manager
              or administrator can approve
              or reject them. Approved and
              rejected requests will appear
              here automatically.
            </p>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="leave-footer">

        <span>
          © 2026 DaYFlow HRMS
        </span>

        <span>
          Every workday, perfectly aligned.
        </span>

      </footer>

    </div>
  );
}

export default Leave;