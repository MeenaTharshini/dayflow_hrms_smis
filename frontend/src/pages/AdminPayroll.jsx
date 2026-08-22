import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../App.css";

function AdminPayroll() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [payMonth, setPayMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [basicSalary, setBasicSalary] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("Pending");

  const [remarks, setRemarks] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    loadEmployees();
    loadPayrolls();
  }, []);

  /* =====================================================
     LOAD EMPLOYEES
  ===================================================== */

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, employee_id, full_name")
        .order("full_name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setEmployees(data || []);
    } catch (err) {
      console.error(
        "Employee loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load employees."
      );
    }
  };

  /* =====================================================
     LOAD PAYROLL
  ===================================================== */

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("payroll")
        .select(`
          id,
          employee_id,
          pay_month,
          basic_salary,
          allowances,
          deductions,
          net_salary,
          payment_status,
          paid_at,
          remarks,
          created_at,
          updated_at,
          employees (
            employee_id,
            full_name
          )
        `)
        .order("pay_month", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setPayrolls(data || []);
    } catch (err) {
      console.error(
        "Payroll loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load payroll."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FORM RESET
  ===================================================== */

  const resetForm = () => {
    setSelectedEmployee("");
    setPayMonth(
      new Date().toISOString().slice(0, 7)
    );
    setBasicSalary("");
    setAllowances("");
    setDeductions("");
    setPaymentStatus("Pending");
    setRemarks("");
    setEditingId(null);
  };

  /* =====================================================
     SAVE PAYROLL
  ===================================================== */

  const handleSavePayroll = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!selectedEmployee) {
      setError("Please select an employee.");
      return;
    }

    if (!basicSalary) {
      setError("Please enter the basic salary.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const monthDate = `${payMonth}-01`;

      const payrollData = {
        employee_id: selectedEmployee,
        pay_month: monthDate,
        basic_salary: Number(basicSalary),
        allowances: Number(allowances) || 0,
        deductions: Number(deductions) || 0,
        payment_status: paymentStatus,
        remarks:
          remarks.trim() || null,
        updated_at: new Date().toISOString(),
      };

      /* ================================================
         UPDATE EXISTING PAYROLL
      ================================================ */

      if (editingId) {
        const { error } = await supabase
          .from("payroll")
          .update(payrollData)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        alert(
          "Payroll updated successfully."
        );
      }

      /* ================================================
         CREATE NEW PAYROLL
      ================================================ */

      else {
        const { error } = await supabase
          .from("payroll")
          .insert({
            ...payrollData,
            created_at:
              new Date().toISOString(),
          });

        if (error) {
          throw error;
        }

        alert(
          "Payroll created successfully."
        );
      }

      resetForm();
      await loadPayrolls();
    } catch (err) {
      console.error(
        "Payroll save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save payroll."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     EDIT PAYROLL
  ===================================================== */

  const handleEdit = (record) => {
    setEditingId(record.id);

    setSelectedEmployee(
      record.employee_id
    );

    setPayMonth(
      record.pay_month.slice(0, 7)
    );

    setBasicSalary(
      record.basic_salary
    );

    setAllowances(
      record.allowances
    );

    setDeductions(
      record.deductions
    );

    setPaymentStatus(
      record.payment_status
    );

    setRemarks(
      record.remarks || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     DELETE PAYROLL
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payroll record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const { error } = await supabase
        .from("payroll")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      await loadPayrolls();
    } catch (err) {
      console.error(
        "Payroll delete error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete payroll."
      );
    }
  };

  /* =====================================================
     MARK AS PAID
  ===================================================== */

  const handleMarkPaid = async (record) => {
    try {
      setError("");

      const { error } = await supabase
        .from("payroll")
        .update({
          payment_status: "Paid",
          paid_at:
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", record.id);

      if (error) {
        throw error;
      }

      await loadPayrolls();
    } catch (err) {
      console.error(
        "Payment update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update payment status."
      );
    }
  };

  /* =====================================================
     FORMAT MONEY
  ===================================================== */

  const formatMoney = (amount) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(Number(amount) || 0);
  };

  /* =====================================================
     FORMAT MONTH
  ===================================================== */

  const formatMonth = (date) => {
    if (!date) return "-";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-container">
          <h2>Loading payroll...</h2>
        </main>
      </div>
    );
  }

  /* =====================================================
     RENDER
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
            <strong>Admin</strong>
            <span>Admin Portal</span>
          </div>

          <button
            className="logout-button"
            onClick={() =>
              navigate("/login")
            }
          >
            Logout
          </button>

        </div>

      </header>

      {/* MAIN */}

      <main className="dashboard-container">

        <button
          className="back-dashboard-button"
          onClick={() =>
            navigate("/admin-dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        {/* HEADING */}

        <section className="dashboard-welcome">

          <p className="dashboard-label">
            PAYROLL MANAGEMENT
          </p>

          <h1>
            Employee Payroll
          </h1>

          <p>
            Create, manage and process
            employee salary records.
          </p>

        </section>

        {/* ERROR */}

        {error && (
          <div className="attendance-error">
            <span>!</span>

            <p>{error}</p>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* PAYROLL FORM */}

        <section className="dashboard-section">

          <h2>
            {editingId
              ? "Edit Payroll"
              : "Create Payroll"}
          </h2>

          <form
            onSubmit={
              handleSavePayroll
            }
            className="payroll-form"
          >

            {/* EMPLOYEE */}

            <div className="form-group">

              <label>
                Employee
              </label>

              <select
                value={
                  selectedEmployee
                }
                onChange={(event) =>
                  setSelectedEmployee(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select Employee
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={
                        employee.id
                      }
                      value={
                        employee.id
                      }
                    >
                      {employee.full_name}
                      {" - "}
                      {
                        employee.employee_id
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* MONTH */}

            <div className="form-group">

              <label>
                Payroll Month
              </label>

              <input
                type="month"
                value={payMonth}
                onChange={(event) =>
                  setPayMonth(
                    event.target.value
                  )
                }
                required
              />

            </div>

            {/* BASIC */}

            <div className="form-group">

              <label>
                Basic Salary
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={basicSalary}
                onChange={(event) =>
                  setBasicSalary(
                    event.target.value
                  )
                }
                placeholder="Enter basic salary"
                required
              />

            </div>

            {/* ALLOWANCES */}

            <div className="form-group">

              <label>
                Allowances
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={allowances}
                onChange={(event) =>
                  setAllowances(
                    event.target.value
                  )
                }
                placeholder="Enter allowances"
              />

            </div>

            {/* DEDUCTIONS */}

            <div className="form-group">

              <label>
                Deductions
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={deductions}
                onChange={(event) =>
                  setDeductions(
                    event.target.value
                  )
                }
                placeholder="Enter deductions"
              />

            </div>

            {/* STATUS */}

            <div className="form-group">

              <label>
                Payment Status
              </label>

              <select
                value={
                  paymentStatus
                }
                onChange={(event) =>
                  setPaymentStatus(
                    event.target.value
                  )
                }
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="Paid">
                  Paid
                </option>

              </select>

            </div>

            {/* REMARKS */}

            <div className="form-group">

              <label>
                Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(event) =>
                  setRemarks(
                    event.target.value
                  )
                }
                placeholder="Optional remarks"
                rows="3"
              />

            </div>

            {/* BUTTONS */}

            <div className="payroll-form-actions">

              <button
                type="submit"
                className="clock-in-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Payroll"
                  : "Create Payroll"}

                <span>→</span>
              </button>

              {editingId && (
                <button
                  type="button"
                  className="clock-out-button"
                  onClick={
                    resetForm
                  }
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* PAYROLL HISTORY */}

        <section className="dashboard-section">

          <div className="attendance-section-heading">

            <div>

              <span>
                RECORDS
              </span>

              <h2>
                Payroll History
              </h2>

            </div>

          </div>

          <div className="payroll-table-card">

            <div className="payroll-table-header">

              <span>
                Employee
              </span>

              <span>
                Month
              </span>

              <span>
                Basic
              </span>

              <span>
                Allowances
              </span>

              <span>
                Deductions
              </span>

              <span>
                Net Salary
              </span>

              <span>
                Status
              </span>

              <span>
                Actions
              </span>

            </div>

            {payrolls.length === 0 ? (

              <div className="payroll-table-row">

                <span>
                  No payroll records found.
                </span>

              </div>

            ) : (

              payrolls.map(
                (record) => (

                  <div
                    className="payroll-table-row"
                    key={record.id}
                  >

                    <span>
                      <strong>
                        {
                          record.employees
                            ?.full_name ||
                          "Unknown Employee"
                        }
                      </strong>

                      <small>
                        {
                          record.employees
                            ?.employee_id ||
                          "-"
                        }
                      </small>
                    </span>

                    <span>
                      {formatMonth(
                        record.pay_month
                      )}
                    </span>

                    <span>
                      {formatMoney(
                        record.basic_salary
                      )}
                    </span>

                    <span>
                      {formatMoney(
                        record.allowances
                      )}
                    </span>

                    <span>
                      {formatMoney(
                        record.deductions
                      )}
                    </span>

                    <strong>
                      {formatMoney(
                        record.net_salary
                      )}
                    </strong>

                    <span>
                      <strong>
                        {
                          record.payment_status
                        }
                      </strong>
                    </span>

                    <span className="payroll-actions">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            record
                          )
                        }
                      >
                        Edit
                      </button>

                      {record.payment_status !==
                        "Paid" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkPaid(
                              record
                            )
                          }
                        >
                          Mark Paid
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            record.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </span>

                  </div>

                )
              )

            )}

          </div>

        </section>

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

export default AdminPayroll;