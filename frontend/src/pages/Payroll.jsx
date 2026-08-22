import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../App.css";

function Payroll() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     GET LOGGED-IN EMPLOYEE
     ===================================================== */

  const getCurrentEmployee = async () => {
  try {
    setError("");

    // ============================================
    // GET USER SAVED DURING LOGIN
    // ============================================

    const storedUser = localStorage.getItem("user");

    console.log("DaYFlow stored user:", storedUser);

    if (!storedUser) {
      throw new Error(
        "No logged-in employee found. Please log in again."
      );
    }

    let loggedInUser;

    try {
      loggedInUser = JSON.parse(storedUser);
    } catch (err) {
      console.error("Invalid user data:", err);

      throw new Error(
        "Invalid login information. Please log in again."
      );
    }

    console.log("DaYFlow logged-in user:", loggedInUser);

    // ============================================
    // POSSIBLE EMPLOYEE IDENTIFIERS
    // ============================================

    const employeeId =
      loggedInUser.employee_id ||
      loggedInUser.employeeId ||
      loggedInUser.emp_id ||
      loggedInUser.empId;

    const email =
      loggedInUser.email ||
      loggedInUser.user_email;

    const databaseId =
      loggedInUser.id ||
      loggedInUser.employee_db_id;

    console.log("Employee ID:", employeeId);
    console.log("Email:", email);
    console.log("Database ID:", databaseId);

    // ============================================
    // 1. TRY DATABASE ID
    // ============================================

    if (databaseId) {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          employee_id,
          full_name,
          email,
          department,
          designation,
          monthly_salary,
          employment_status
        `)
        .eq("id", databaseId)
        .limit(1);

      if (error) {
        console.error("Database ID lookup error:", error);
      }

      if (data && data.length > 0) {
        console.log("Employee found using database ID:", data[0]);

        setEmployee(data[0]);

        return data[0];
      }
    }

    // ============================================
    // 2. TRY EMPLOYEE ID
    // ============================================

    if (employeeId) {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          employee_id,
          full_name,
          email,
          department,
          designation,
          monthly_salary,
          employment_status
        `)
        .eq("employee_id", employeeId)
        .limit(1);

      if (error) {
        console.error(
          "Employee ID lookup error:",
          error
        );
      }

      if (data && data.length > 0) {
        console.log(
          "Employee found using employee_id:",
          data[0]
        );

        setEmployee(data[0]);

        return data[0];
      }
    }

    // ============================================
    // 3. TRY EMAIL
    // ============================================

    if (email) {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          employee_id,
          full_name,
          email,
          department,
          designation,
          monthly_salary,
          employment_status
        `)
        .eq("email", email)
        .limit(1);

      if (error) {
        console.error(
          "Email lookup error:",
          error
        );
      }

      if (data && data.length > 0) {
        console.log(
          "Employee found using email:",
          data[0]
        );

        setEmployee(data[0]);

        return data[0];
      }
    }

    // ============================================
    // NOTHING FOUND
    // ============================================

    console.error(
      "Could not match logged-in user with employees table."
    );

    throw new Error(
      "Your login account is not linked to an employee record."
    );

  } catch (err) {
    console.error(
      "Error loading employee:",
      err
    );

    setError(
      err?.message ||
        "Unable to identify employee."
    );

    return null;
  }
};

  /* =====================================================
     FETCH PAYROLL CREATED BY ADMIN
     ===================================================== */

  const fetchPayroll = async (employeeData) => {
    if (!employeeData?.id) {
      return;
    }

    try {
      setError("");

      /*
       * IMPORTANT:
       *
       * We only query payroll.
       *
       * DO NOT USE:
       *
       * .select("*, employees(*)")
       *
       * because your database does not currently expose
       * a Supabase relationship between payroll and employees.
       */

      const { data, error: payrollError } = await supabase
        .from("payroll")
        .select(`
          id,
          employee_id,
          payroll_month,
          basic_salary,
          allowances,
          deductions,
          net_salary,
          payment_status,
          remarks,
          created_at,
          updated_at
        `)
        .eq("employee_id", employeeData.id)
        .order("payroll_month", {
          ascending: false,
        });

      if (payrollError) {
        throw payrollError;
      }

      setPayrollRecords(data || []);
    } catch (err) {
      console.error("Payroll error:", err);

      setError(
        err?.message ||
          "Unable to load payroll records."
      );

      setPayrollRecords([]);
    }
  };

  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      const employeeData = await getCurrentEmployee();

      if (mounted && employeeData) {
        await fetchPayroll(employeeData);
      }

      if (mounted) {
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     REAL-TIME ADMIN PAYROLL UPDATES
     ===================================================== */

  useEffect(() => {
    if (!employee?.id) {
      return;
    }

    const channel = supabase
      .channel(`employee-payroll-${employee.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payroll",
          filter: `employee_id=eq.${employee.id}`,
        },
        async () => {
          await fetchPayroll(employee);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employee]);

  /* =====================================================
     FORMAT MONEY
     ===================================================== */

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  /* =====================================================
     FORMAT MONTH
     ===================================================== */

  const formatMonth = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(
      value.length === 7
        ? `${value}-01T00:00:00`
        : `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  /* =====================================================
     SALARY CALCULATIONS
     ===================================================== */

  const getGrossSalary = (record) => {
    return (
      Number(record.basic_salary || 0) +
      Number(record.allowances || 0)
    );
  };

  const getNetSalary = (record) => {
    /*
     * Admin-created net salary takes priority.
     */
    if (
      record.net_salary !== null &&
      record.net_salary !== undefined
    ) {
      return Number(record.net_salary);
    }

    return (
      Number(record.basic_salary || 0) +
      Number(record.allowances || 0) -
      Number(record.deductions || 0)
    );
  };

  /* =====================================================
     CURRENT PAYROLL
     ===================================================== */

  const currentPayroll = useMemo(() => {
    if (!payrollRecords.length) {
      return null;
    }

    return payrollRecords[0];
  }, [payrollRecords]);

  /* =====================================================
     LOGOUT
     ===================================================== */

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="dashboard-page">

        <header className="dashboard-navbar">
          <div className="dashboard-brand">
            <h2>DaYFlow</h2>
            <span>HRMS</span>
          </div>
        </header>

        <main className="dashboard-container">

          <div className="empty-state">
            <div>◌</div>

            <h3>
              Loading payroll...
            </h3>

            <p>
              Fetching your latest payroll information.
            </p>
          </div>

        </main>

      </div>
    );
  }

  /* =====================================================
     MAIN UI
     ===================================================== */

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <header className="dashboard-navbar">

        <div className="dashboard-brand">
          <h2>DaYFlow</h2>
          <span>HRMS</span>
        </div>

        <div className="dashboard-user">

          <div className="user-info">

            <strong>
              {employee?.full_name || "Employee"}
            </strong>

            <span>
              Employee Portal
            </span>

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

      {/* MAIN */}

      <main className="dashboard-container">

        <button
          type="button"
          className="back-dashboard-button"
          onClick={() =>
            navigate("/employee/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}

        <section className="dashboard-welcome">

          <p className="dashboard-label">
            PAYROLL MANAGEMENT
          </p>

          <h1>
            My Payroll
          </h1>

          <p>
            View your salary structure and payroll information.
          </p>

        </section>

        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* EMPLOYEE */}

        {employee && (
          <section className="dashboard-section">

            <div className="employee-payroll-info">

              <div>
                <span>EMPLOYEE</span>
                <strong>
                  {employee.full_name}
                </strong>
              </div>

              <div>
                <span>EMPLOYEE ID</span>
                <strong>
                  {employee.employee_id}
                </strong>
              </div>

              <div>
                <span>DEPARTMENT</span>
                <strong>
                  {employee.department || "—"}
                </strong>
              </div>

              <div>
                <span>DESIGNATION</span>
                <strong>
                  {employee.designation || "—"}
                </strong>
              </div>

            </div>

          </section>
        )}

        {/* NO PAYROLL */}

        {!error && payrollRecords.length === 0 && (
          <section className="dashboard-section">

            <div className="empty-state">

              <div>₹</div>

              <h3>
                No Payroll Records
              </h3>

              <p>
                Your administrator has not created
                any payroll records for you yet.
              </p>

            </div>

          </section>
        )}

        {/* CURRENT PAYROLL */}

        {currentPayroll && (
          <>
            {/* CURRENT SALARY */}

            <section className="dashboard-section">

              <h2>
                Current Salary
              </h2>

              <div className="salary-highlight">

                <div>

                  <span>
                    Monthly Net Salary
                  </span>

                  <strong>
                    {formatMoney(
                      getNetSalary(currentPayroll)
                    )}
                  </strong>

                  <small>
                    After applicable deductions
                  </small>

                </div>

                <div className="salary-period">

                  {formatMonth(
                    currentPayroll.payroll_month
                  )}

                </div>

              </div>

            </section>

            {/* SALARY STRUCTURE */}

            <section className="dashboard-section">

              <h2>
                Salary Structure
              </h2>

              <div className="salary-grid">

                <div className="salary-card">

                  <span>
                    Basic Salary
                  </span>

                  <strong>
                    {formatMoney(
                      currentPayroll.basic_salary
                    )}
                  </strong>

                </div>

                <div className="salary-card">

                  <span>
                    Allowances
                  </span>

                  <strong>
                    {formatMoney(
                      currentPayroll.allowances
                    )}
                  </strong>

                </div>

                <div className="salary-card">

                  <span>
                    Gross Salary
                  </span>

                  <strong>
                    {formatMoney(
                      getGrossSalary(currentPayroll)
                    )}
                  </strong>

                </div>

                <div className="salary-card deduction">

                  <span>
                    Deductions
                  </span>

                  <strong>
                    {formatMoney(
                      currentPayroll.deductions
                    )}
                  </strong>

                </div>

              </div>

            </section>

            {/* PAYMENT */}

            <section className="dashboard-section">

              <h2>
                Payment Information
              </h2>

              <div className="payroll-payment-card">

                <div>

                  <span>
                    Payroll Month
                  </span>

                  <strong>
                    {formatMonth(
                      currentPayroll.payroll_month
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Payment Status
                  </span>

                  <strong
                    className={
                      currentPayroll.payment_status
                        ?.toLowerCase() === "paid"
                        ? "payment-paid"
                        : "payment-pending"
                    }
                  >
                    {currentPayroll.payment_status ||
                      "Pending"}
                  </strong>

                </div>

                <div>

                  <span>
                    Net Salary
                  </span>

                  <strong>
                    {formatMoney(
                      getNetSalary(currentPayroll)
                    )}
                  </strong>

                </div>

              </div>

              {currentPayroll.remarks && (
                <div className="payroll-remarks">

                  <strong>
                    Admin Remarks
                  </strong>

                  <p>
                    {currentPayroll.remarks}
                  </p>

                </div>
              )}

            </section>
          </>
        )}

        {/* HISTORY */}

        {payrollRecords.length > 0 && (
          <section className="dashboard-section">

            <h2>
              Payroll History
            </h2>

            <div className="payroll-table-card">

              <div className="payroll-table-header">

                <span>Month</span>
                <span>Gross Salary</span>
                <span>Deductions</span>
                <span>Net Salary</span>
                <span>Status</span>

              </div>

              {payrollRecords.map((record) => {

                const gross =
                  getGrossSalary(record);

                const deductions =
                  Number(record.deductions || 0);

                const net =
                  getNetSalary(record);

                return (
                  <div
                    className="payroll-table-row"
                    key={record.id}
                  >

                    <span>
                      {formatMonth(
                        record.payroll_month
                      )}
                    </span>

                    <span>
                      {formatMoney(gross)}
                    </span>

                    <span>
                      {formatMoney(deductions)}
                    </span>

                    <strong>
                      {formatMoney(net)}
                    </strong>

                    <span
                      className={
                        record.payment_status
                          ?.toLowerCase() === "paid"
                          ? "payment-paid"
                          : "payment-pending"
                      }
                    >
                      {record.payment_status ||
                        "Pending"}
                    </span>

                  </div>
                );
              })}

            </div>

          </section>
        )}

        {/* READ ONLY */}

        <div className="payroll-notice">

          <strong>
            🔒 Payroll information is read-only
          </strong>

          <p>
            Salary information can only be modified
            by authorized HR/Admin personnel.
          </p>

        </div>

      </main>

      {/* FOOTER */}

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

export default Payroll;