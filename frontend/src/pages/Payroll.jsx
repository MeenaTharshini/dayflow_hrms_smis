import { useNavigate } from "react-router-dom";
import "../App.css";

function Payroll() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <header className="dashboard-navbar">

        <div className="dashboard-brand">
          <h2>DaYFlow</h2>
          <span>HRMS</span>
        </div>

        <div className="dashboard-user">

          <div className="user-info">
            <strong>Employee</strong>
            <span>Employee Portal</span>
          </div>

          <button
            className="logout-button"
            onClick={() => navigate("/login")}
          >
            Logout
          </button>

        </div>

      </header>


      {/* Main */}
      <main className="dashboard-container">

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/employee/dashboard")}
        >
          ← Back to Dashboard
        </button>


        {/* Heading */}
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


        {/* Current Salary */}
        <section className="dashboard-section">

          <h2>Current Salary</h2>

          <div className="salary-highlight">

            <div>
              <span>
                Monthly Net Salary
              </span>

              <strong>
                ₹45,000
              </strong>

              <small>
                After applicable deductions
              </small>
            </div>

            <div className="salary-period">
              August 2026
            </div>

          </div>

        </section>


        {/* Salary Structure */}
        <section className="dashboard-section">

          <h2>Salary Structure</h2>

          <div className="salary-grid">

            <div className="salary-card">

              <span>
                Basic Salary
              </span>

              <strong>
                ₹25,000
              </strong>

            </div>


            <div className="salary-card">

              <span>
                HRA
              </span>

              <strong>
                ₹10,000
              </strong>

            </div>


            <div className="salary-card">

              <span>
                Allowances
              </span>

              <strong>
                ₹8,000
              </strong>

            </div>


            <div className="salary-card">

              <span>
                Other Benefits
              </span>

              <strong>
                ₹5,000
              </strong>

            </div>

          </div>

        </section>


        {/* Deductions */}
        <section className="dashboard-section">

          <h2>Current Deductions</h2>

          <div className="salary-grid">

            <div className="salary-card deduction">

              <span>
                Provident Fund
              </span>

              <strong>
                ₹1,800
              </strong>

            </div>


            <div className="salary-card deduction">

              <span>
                Professional Tax
              </span>

              <strong>
                ₹200
              </strong>

            </div>


            <div className="salary-card deduction">

              <span>
                Other Deductions
              </span>

              <strong>
                ₹1,000
              </strong>

            </div>

          </div>

        </section>


        {/* Payroll History */}
        <section className="dashboard-section">

          <h2>Payroll History</h2>

          <div className="payroll-table-card">

            <div className="payroll-table-header">

              <span>
                Month
              </span>

              <span>
                Gross Salary
              </span>

              <span>
                Deductions
              </span>

              <span>
                Net Salary
              </span>

            </div>


            <div className="payroll-table-row">

              <span>
                August 2026
              </span>

              <span>
                ₹48,000
              </span>

              <span>
                ₹3,000
              </span>

              <strong>
                ₹45,000
              </strong>

            </div>


            <div className="payroll-table-row">

              <span>
                July 2026
              </span>

              <span>
                ₹48,000
              </span>

              <span>
                ₹3,000
              </span>

              <strong>
                ₹45,000
              </strong>

            </div>


            <div className="payroll-table-row">

              <span>
                June 2026
              </span>

              <span>
                ₹48,000
              </span>

              <span>
                ₹3,000
              </span>

              <strong>
                ₹45,000
              </strong>

            </div>

          </div>

        </section>


        {/* Notice */}
        <div className="payroll-notice">

          <strong>
            🔒 Payroll information is read-only
          </strong>

          <p>
            Salary information can only be modified by
            authorized HR/Admin personnel.
          </p>

        </div>

      </main>


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