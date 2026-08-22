import { useNavigate } from "react-router-dom";
import "../App.css";

function Leave() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend/API connection will be added later.
    alert("Leave request submitted for admin approval.");
  };

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
            TIME OFF MANAGEMENT
          </p>

          <h1>
            Leave Requests
          </h1>

          <p>
            Apply for leave and track the status of your requests.
          </p>

        </section>


        {/* Leave Balance */}
        <section className="dashboard-section">

          <h2>Leave Balance</h2>

          <div className="status-grid">

            <div className="status-card">
              <span className="status-title">
                Paid Leave
              </span>

              <strong className="status-value">
                8 Days
              </strong>

              <span className="status-description">
                Available
              </span>
            </div>

            <div className="status-card">
              <span className="status-title">
                Sick Leave
              </span>

              <strong className="status-value">
                4 Days
              </strong>

              <span className="status-description">
                Available
              </span>
            </div>

            <div className="status-card">
              <span className="status-title">
                Unpaid Leave
              </span>

              <strong className="status-value">
                Flexible
              </strong>

              <span className="status-description">
                Subject to approval
              </span>
            </div>

          </div>

        </section>


        {/* Apply Leave */}
        <section className="dashboard-section">

          <h2>Apply for Leave</h2>

          <div className="form-card">

            <form
              className="leave-form"
              onSubmit={handleSubmit}
            >

              <div className="form-row">

                <div className="form-group">
                  <label>Leave Type</label>

                  <select required>
                    <option value="">
                      Select leave type
                    </option>

                    <option value="paid">
                      Paid Leave
                    </option>

                    <option value="sick">
                      Sick Leave
                    </option>

                    <option value="unpaid">
                      Unpaid Leave
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date</label>

                  <input
                    type="date"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>

                  <input
                    type="date"
                    required
                  />
                </div>

              </div>


              <div className="form-group">

                <label>
                  Remarks
                </label>

                <textarea
                  placeholder="Enter reason or additional remarks..."
                  rows="4"
                ></textarea>

              </div>


              <button
                type="submit"
                className="auth-button leave-submit"
              >
                Submit Leave Request
              </button>

            </form>

          </div>

        </section>


        {/* Previous Requests */}
        <section className="dashboard-section">

          <h2>Recent Leave Requests</h2>

          <div className="leave-table-card">

            <div className="leave-table-header">
              <span>Type</span>
              <span>Dates</span>
              <span>Days</span>
              <span>Status</span>
            </div>


            <div className="leave-table-row">

              <span>
                Paid Leave
              </span>

              <span>
                10 Aug - 11 Aug
              </span>

              <span>
                2
              </span>

              <span className="leave-status approved">
                Approved
              </span>

            </div>


            <div className="leave-table-row">

              <span>
                Sick Leave
              </span>

              <span>
                02 Aug
              </span>

              <span>
                1
              </span>

              <span className="leave-status pending">
                Pending
              </span>

            </div>


            <div className="leave-table-row">

              <span>
                Paid Leave
              </span>

              <span>
                20 Jul - 21 Jul
              </span>

              <span>
                2
              </span>

              <span className="leave-status rejected">
                Rejected
              </span>

            </div>

          </div>

        </section>

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

export default Leave;