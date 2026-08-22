import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./Attendance.css";

function Attendance() {
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [employee, setEmployee] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [attendance, setAttendance] = useState({
    id: null,
    status: "Not Checked In",
    clockIn: null,
    clockOut: null,
    totalSeconds: 0,
  });

  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD CURRENT EMPLOYEE
     
     IMPORTANT:
     Login.jsx must save:
       sessionStorage.setItem("employee", JSON.stringify(employee));
       sessionStorage.setItem("employeeLoggedIn", "true");
  ===================================================== */

  useEffect(() => {
    loadEmployeeSession();
  }, []);

  const loadEmployeeSession = () => {
    try {
      setLoading(true);
      setError("");

      const storedEmployee = sessionStorage.getItem("employee");
      const loggedIn = sessionStorage.getItem("employeeLoggedIn");

      console.log("=================================");
      console.log("ATTENDANCE EMPLOYEE SESSION");
      console.log("Logged in:", loggedIn);
      console.log("Stored employee:", storedEmployee);
      console.log("=================================");

      if (!storedEmployee || loggedIn !== "true") {
        navigate("/login", { replace: true });
        return;
      }

      const parsedEmployee = JSON.parse(storedEmployee);

      if (!parsedEmployee || !parsedEmployee.id) {
        throw new Error("Invalid employee session.");
      }

      console.log("Current employee:", parsedEmployee.full_name);
      console.log("Current employee ID:", parsedEmployee.id);
      console.log("Employee code:", parsedEmployee.employee_id);

      setEmployee(parsedEmployee);
    } catch (err) {
      console.error("Employee session error:", err);

      sessionStorage.removeItem("employee");
      sessionStorage.removeItem("employeeLoggedIn");

      setEmployee(null);
      setError("Your employee session is invalid. Please login again.");

      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LIVE CLOCK
  ===================================================== */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =====================================================
     LOAD ATTENDANCE
  ===================================================== */

  useEffect(() => {
    if (!employee?.id) return;

    loadAttendance();
  }, [employee?.id, selectedMonth]);

  /* =====================================================
     DATE HELPERS
  ===================================================== */

  const getTodayString = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getMonthRange = () => {
    const [year, month] = selectedMonth.split("-").map(Number);

    const startDate =
      `${year}-${String(month).padStart(2, "0")}-01`;

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    const endDate =
      `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    return {
      startDate,
      endDate,
    };
  };

  /* =====================================================
     CALCULATE SECONDS
  ===================================================== */

  const calculateSeconds = (clockIn, clockOut) => {
    if (!clockIn) return 0;

    const start = new Date(clockIn);
    const end = clockOut ? new Date(clockOut) : new Date();

    return Math.max(
      0,
      Math.floor(
        (end.getTime() - start.getTime()) / 1000
      )
    );
  };

  /* =====================================================
     LOAD ATTENDANCE FROM SUPABASE
  ===================================================== */

  const loadAttendance = async () => {
    if (!employee?.id) return;

    try {
      setError("");

      const { startDate, endDate } = getMonthRange();

      console.log("=================================");
      console.log("LOADING ATTENDANCE");
      console.log("Employee:", employee.full_name);
      console.log("Employee UUID:", employee.id);
      console.log("Employee ID:", employee.employee_id);
      console.log("Month:", selectedMonth);
      console.log("=================================");

      const {
        data,
        error: attendanceError,
      } = await supabase
        .from("attendance")
        .select(`
          id,
          employee_id,
          attendance_date,
          check_in,
          check_out,
          status,
          work_hours,
          remarks,
          created_at,
          updated_at
        `)
        .eq("employee_id", employee.id)
        .gte("attendance_date", startDate)
        .lt("attendance_date", endDate)
        .order("attendance_date", {
          ascending: false,
        });

      if (attendanceError) {
        throw attendanceError;
      }

      console.log("Attendance records:", data);

      const history = (data || []).map((record) => {
        let hours = "0h 0m";

        if (record.check_in && record.check_out) {
          hours = formatHoursMinutes(
            calculateSeconds(
              record.check_in,
              record.check_out
            )
          );
        } else if (
          record.work_hours !== null &&
          record.work_hours !== undefined
        ) {
          hours = formatDecimalHours(record.work_hours);
        }

        return {
          id: record.id,
          date: record.attendance_date,
          clockIn: record.check_in,
          clockOut: record.check_out,
          hours,
          status: record.status || "Present",
        };
      });

      setAttendanceHistory(history);

      /* =================================================
         TODAY'S RECORD
      ================================================= */

      const today = getTodayString();

      const todayRecord = (data || []).find(
        (record) => record.attendance_date === today
      );

      if (!todayRecord) {
        setAttendance({
          id: null,
          status: "Not Checked In",
          clockIn: null,
          clockOut: null,
          totalSeconds: 0,
        });

        return;
      }

      setAttendance({
        id: todayRecord.id,

        status: todayRecord.check_out
          ? "Completed"
          : "Working",

        clockIn: todayRecord.check_in,

        clockOut: todayRecord.check_out,

        totalSeconds: calculateSeconds(
          todayRecord.check_in,
          todayRecord.check_out
        ),
      });
    } catch (err) {
      console.error("Attendance loading error:", err);

      setError(
        err.message || "Unable to load attendance."
      );
    }
  };

  /* =====================================================
     CLOCK IN
  ===================================================== */

  const handleClockIn = async () => {
    if (actionLoading) return;

    if (!employee?.id) {
      setError("Employee information is missing.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const today = getTodayString();
      const now = new Date().toISOString();

      console.log("=================================");
      console.log("CLOCK IN");
      console.log("Employee:", employee.full_name);
      console.log("Employee UUID:", employee.id);
      console.log("Employee ID:", employee.employee_id);
      console.log("Date:", today);
      console.log("=================================");

      /* =================================================
         CHECK EXISTING RECORD
      ================================================= */

      const {
        data: existingRecord,
        error: findError,
      } = await supabase
        .from("attendance")
        .select(`
          id,
          employee_id,
          check_in,
          check_out
        `)
        .eq("employee_id", employee.id)
        .eq("attendance_date", today)
        .maybeSingle();

      if (findError) {
        throw findError;
      }

      /* =================================================
         ALREADY CLOCKED IN
      ================================================= */

      if (existingRecord?.check_in) {
        setAttendance({
          id: existingRecord.id,

          status: existingRecord.check_out
            ? "Completed"
            : "Working",

          clockIn: existingRecord.check_in,

          clockOut: existingRecord.check_out,

          totalSeconds: calculateSeconds(
            existingRecord.check_in,
            existingRecord.check_out
          ),
        });

        return;
      }

      let savedRecord;

      /* =================================================
         UPDATE EMPTY RECORD
      ================================================= */

      if (existingRecord) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from("attendance")
          .update({
            check_in: now,
            status: "Present",
            work_hours: 0,
            updated_at: now,
          })
          .eq("id", existingRecord.id)
          .eq("employee_id", employee.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        savedRecord = data;
      }

      /* =================================================
         CREATE NEW RECORD
      ================================================= */

      else {
        const {
          data,
          error: insertError,
        } = await supabase
          .from("attendance")
          .insert({
            employee_id: employee.id,
            attendance_date: today,
            check_in: now,
            check_out: null,
            status: "Present",
            work_hours: 0,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        savedRecord = data;
      }

      console.log("Clock-in successful:", savedRecord);

      setAttendance({
        id: savedRecord.id,
        status: "Working",
        clockIn: savedRecord.check_in,
        clockOut: savedRecord.check_out || null,
        totalSeconds: 0,
      });

      await loadAttendance();
    } catch (err) {
      console.error("Clock-in error:", err);

      setError(
        err.message || "Unable to clock in."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     CLOCK OUT
  ===================================================== */

  const handleClockOut = async () => {
    if (actionLoading) return;

    if (!attendance.clockIn || !attendance.id) {
      return;
    }

    if (attendance.clockOut) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clock out?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const now = new Date().toISOString();

      const seconds = calculateSeconds(
        attendance.clockIn,
        now
      );

      const workHours = Number(
        (seconds / 3600).toFixed(2)
      );

      console.log("=================================");
      console.log("CLOCK OUT");
      console.log("Employee:", employee.full_name);
      console.log("Employee UUID:", employee.id);
      console.log("Employee ID:", employee.employee_id);
      console.log("Worked:", workHours, "hours");
      console.log("=================================");

      const {
        data,
        error: updateError,
      } = await supabase
        .from("attendance")
        .update({
          check_out: now,
          work_hours: workHours,
          status: "Present",
          updated_at: now,
        })
        .eq("id", attendance.id)
        .eq("employee_id", employee.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setAttendance({
        id: data.id,
        status: "Completed",
        clockIn: data.check_in,
        clockOut: data.check_out,
        totalSeconds: calculateSeconds(
          data.check_in,
          data.check_out
        ),
      });

      await loadAttendance();
    } catch (err) {
      console.error("Clock-out error:", err);

      setError(
        err.message || "Unable to clock out."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     FORMATTING
  ===================================================== */

  const formatHoursMinutes = (seconds) => {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    return `${hours}h ${minutes}m`;
  };

  const formatDecimalHours = (hours) => {
    const numericHours = Number(hours) || 0;

    const wholeHours = Math.floor(numericHours);

    const minutes = Math.round(
      (numericHours - wholeHours) * 60
    );

    return `${wholeHours}h ${minutes}m`;
  };

  const formatClockTime = (date) => {
    if (!date) return "--:--";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  /* =====================================================
     WORKED TIME
  ===================================================== */

  const workedSeconds = useMemo(() => {
    if (!attendance.clockIn) {
      return attendance.totalSeconds || 0;
    }

    return calculateSeconds(
      attendance.clockIn,
      attendance.clockOut
    );
  }, [
    attendance.clockIn,
    attendance.clockOut,
    attendance.totalSeconds,
    currentTime,
  ]);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const summary = useMemo(() => {
    return {
      present: attendanceHistory.filter(
        (x) => x.status === "Present"
      ).length,

      late: attendanceHistory.filter(
        (x) => x.status === "Late"
      ).length,

      absent: attendanceHistory.filter(
        (x) => x.status === "Absent"
      ).length,

      leave: attendanceHistory.filter(
        (x) => x.status === "Leave"
      ).length,

      total: attendanceHistory.length,
    };
  }, [attendanceHistory]);

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "status-present";

      case "Late":
        return "status-late";

      case "Absent":
        return "status-absent";

      case "Leave":
        return "status-leave";

      default:
        return "";
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="attendance-loading">
        <div className="attendance-spinner"></div>
        <p>Loading attendance...</p>
      </div>
    );
  }

  /* =====================================================
     NO SESSION
  ===================================================== */

  if (!employee) {
    return (
      <div className="attendance-loading">
        <p>
          {error || "Employee session not found."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/login", { replace: true })
          }
        >
          Login Again
        </button>
      </div>
    );
  }

  const formattedToday =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="attendance-page">

      {/* HEADER */}

      <header className="attendance-header">

        <div className="attendance-header-left">

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/employee-dashboard")
            }
          >
            ←
          </button>

          <div>
            <span className="attendance-eyebrow">
              EMPLOYEE PORTAL
            </span>

            <h1>Attendance</h1>

            <p>
              Track your workday and attendance
              history.
            </p>
          </div>

        </div>

        <div className="attendance-employee">

          <div className="attendance-avatar">
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

      <main className="attendance-content">

        {/* ERROR */}

        {error && (
          <div className="attendance-error">

            <span>!</span>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>

          </div>
        )}

        {/* TODAY */}

        <section className="attendance-hero">

          <div className="attendance-hero-info">

            <span>TODAY</span>

            <h2>{formattedToday}</h2>

            <p>
              Keep your attendance up to date
              throughout your workday.
            </p>

          </div>

          <div className="attendance-live-clock">

            <span>CURRENT TIME</span>

            <strong>
              {currentTime.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              )}
            </strong>

          </div>

        </section>

        {/* TODAY ATTENDANCE */}

        <section className="today-attendance-card">

          <div className="today-card-top">

            <div>

              <span className="card-eyebrow">
                TODAY'S ATTENDANCE
              </span>

              <h2>
                {attendance.status}
              </h2>

            </div>

            <div
              className={`attendance-status-indicator ${
                attendance.status === "Working"
                  ? "working"
                  : attendance.status ===
                    "Completed"
                  ? "completed"
                  : "idle"
              }`}
            >

              <span></span>

              {attendance.status}

            </div>

          </div>

          <div className="attendance-time-grid">

            <div className="time-item">

              <span>CLOCK IN</span>

              <strong>
                {formatClockTime(
                  attendance.clockIn
                )}
              </strong>

            </div>

            <div className="time-item">

              <span>CLOCK OUT</span>

              <strong>
                {formatClockTime(
                  attendance.clockOut
                )}
              </strong>

            </div>

            <div className="time-item working-time">

              <span>WORKED TODAY</span>

              <strong>
                {formatDuration(
                  workedSeconds
                )}
              </strong>

            </div>

          </div>

          <div className="attendance-actions">

            {!attendance.clockIn && (
              <button
                type="button"
                className="clock-in-button"
                onClick={handleClockIn}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Clocking in..."
                  : "Clock In"}

                <span>→</span>
              </button>
            )}

            {attendance.clockIn &&
              !attendance.clockOut && (
                <button
                  type="button"
                  className="clock-out-button"
                  onClick={handleClockOut}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Clocking out..."
                    : "Clock Out"}

                  <span>→</span>
                </button>
              )}

            {attendance.clockOut && (
              <div className="completed-message">

                <span>✓</span>

                Your workday has been completed.

              </div>
            )}

          </div>

        </section>

        {/* SUMMARY */}

        <section className="attendance-section">

          <div className="attendance-section-heading">

            <div>

              <span>OVERVIEW</span>

              <h2>
                Attendance Summary
              </h2>

            </div>

            <input
              type="month"
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(
                  event.target.value
                )
              }
            />

          </div>

          <div className="attendance-summary-grid">

            <div className="attendance-summary-card">

              <span className="summary-icon">
                ✓
              </span>

              <div>

                <span>PRESENT</span>

                <strong>
                  {summary.present}
                </strong>

                <small>
                  Days present
                </small>

              </div>

            </div>

            <div className="attendance-summary-card">

              <span className="summary-icon late">
                !
              </span>

              <div>

                <span>LATE</span>

                <strong>
                  {summary.late}
                </strong>

                <small>
                  Late arrivals
                </small>

              </div>

            </div>

            <div className="attendance-summary-card">

              <span className="summary-icon absent">
                ×
              </span>

              <div>

                <span>ABSENT</span>

                <strong>
                  {summary.absent}
                </strong>

                <small>
                  Days absent
                </small>

              </div>

            </div>

            <div className="attendance-summary-card">

              <span className="summary-icon leave">
                □
              </span>

              <div>

                <span>LEAVE</span>

                <strong>
                  {summary.leave}
                </strong>

                <small>
                  Leave days
                </small>

              </div>

            </div>

          </div>

        </section>

        {/* HISTORY */}

        <section className="attendance-section">

          <div className="attendance-section-heading">

            <div>

              <span>HISTORY</span>

              <h2>
                Attendance History
              </h2>

            </div>

          </div>

          <div className="attendance-table-container">

            <table className="attendance-table">

              <thead>

                <tr>
                  <th>DATE</th>
                  <th>CLOCK IN</th>
                  <th>CLOCK OUT</th>
                  <th>WORKING HOURS</th>
                  <th>STATUS</th>
                </tr>

              </thead>

              <tbody>

                {attendanceHistory.length === 0 ? (
                  <tr>

                    <td
                      colSpan="5"
                      className="empty-attendance"
                    >
                      No attendance records found.
                    </td>

                  </tr>
                ) : (
                  attendanceHistory.map(
                    (record) => (
                      <tr key={record.id}>

                        <td>

                          <strong>
                            {new Date(
                              `${record.date}T00:00:00`
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </strong>

                        </td>

                        <td>
                          {formatClockTime(
                            record.clockIn
                          )}
                        </td>

                        <td>
                          {formatClockTime(
                            record.clockOut
                          )}
                        </td>

                        <td>

                          <strong>
                            {record.hours}
                          </strong>

                        </td>

                        <td>

                          <span
                            className={`attendance-badge ${getStatusClass(
                              record.status
                            )}`}
                          >

                            <span></span>

                            {record.status}

                          </span>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* INFORMATION */}

        <section className="attendance-information">

          <div className="information-icon">
            i
          </div>

          <div>

            <strong>
              Attendance policy
            </strong>

            <p>
              Please remember to clock in when
              you begin your workday and clock
              out before leaving. Your attendance
              records are maintained securely by
              DayFlow.
            </p>

          </div>

        </section>

      </main>

      <footer className="attendance-footer">

        <span>
          © 2026 DayFlow HRMS
        </span>

        <span>
          Every workday, perfectly aligned.
        </span>

      </footer>

    </div>
  );
}

export default Attendance;