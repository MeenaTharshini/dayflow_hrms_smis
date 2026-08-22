import { useNavigate } from "react-router-dom";
import "../App.css";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* ================= NAVBAR ================= */}
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
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ================= MAIN CONTENT ================= */}
      <main className="dashboard-container">

        {/* Welcome */}
        <section className="dashboard-welcome">

          <div>
            <p className="dashboard-label">
              EMPLOYEE PORTAL
            </p>

            <h1>
              Welcome back 👋
            </h1>

            <p>
              Manage your profile, attendance, leave,
              and payroll from one place.
            </p>
          </div>

        </section>


        {/* ================= QUICK ACCESS ================= */}
        <section className="dashboard-section">

          <h2>Quick Access</h2>

          <div className="dashboard-grid">

            {/* Profile */}
            <button
              className="dashboard-card"
              onClick={() => navigate("/employee/profile")}
            >
              <div className="dashboard-icon">
                👤
              </div>

              <div>
                <h3>My Profile</h3>

                <p>
                  View and update your personal
                  and job information.
                </p>
              </div>

              <span className="card-arrow">
                →
              </span>
            </button>


            {/* Attendance */}
            <button
              className="dashboard-card"
              onClick={() => navigate("/employee/dashboard")}
            >
              <div className="dashboard-icon">
                📅
              </div>

              <div>
                <h3>Attendance</h3>

                <p>
                  Check your daily and weekly
                  attendance records.
                </p>
              </div>

              <span className="card-arrow">
                →
              </span>
            </button>


            {/* Leave */}
            <button
              className="dashboard-card"
              onClick={() => navigate("/employee/leave")}
            >
              <div className="dashboard-icon">
                📝
              </div>

              <div>
                <h3>Leave Requests</h3>

                <p>
                  Apply for leave and track
                  your request status.
                </p>
              </div>

              <span className="card-arrow">
                →
              </span>
            </button>


            {/* Payroll */}
            <button
              className="dashboard-card"
              onClick={() => navigate("/employee/payroll")}
            >
              <div className="dashboard-icon">
                💰
              </div>

              <div>
                <h3>Payroll</h3>

                <p>
                  View your salary and
                  payroll information.
                </p>
              </div>

              <span className="card-arrow">
                →
              </span>
            </button>

          </div>

        </section>


        {/* ================= TODAY'S STATUS ================= */}
        <section className="dashboard-section">

          <h2>Today's Status</h2>

          <div className="status-grid">

            <div className="status-card">

              <span className="status-title">
                Attendance
              </span>

              <strong className="status-value present">
                Present
              </strong>

              <span className="status-description">
                Check-in: 09:15 AM
              </span>

            </div>


            <div className="status-card">

              <span className="status-title">
                Working Hours
              </span>

              <strong className="status-value">
                06h 45m
              </strong>

              <span className="status-description">
                Today's working time
              </span>

            </div>


            <div className="status-card">

              <span className="status-title">
                Leave Balance
              </span>

              <strong className="status-value">
                12 Days
              </strong>

              <span className="status-description">
                Available leave
              </span>

            </div>

          </div>

        </section>


        {/* ================= RECENT ACTIVITY ================= */}
        <section className="dashboard-section">

          <div className="section-header">

            <h2>Recent Activity</h2>

            <span>
              Latest updates
            </span>

          </div>

          <div className="activity-card">

            <div className="activity-item">

              <div className="activity-dot"></div>

              <div>
                <strong>
                  Attendance marked
                </strong>

                <p>
                  You checked in at 09:15 AM.
                </p>
              </div>

              <span>
                Today
              </span>

            </div>


            <div className="activity-item">

              <div className="activity-dot"></div>

              <div>
                <strong>
                  Profile available
                </strong>

                <p>
                  Your employee profile is ready to view.
                </p>
              </div>

              <span>
                Recently
              </span>

            </div>


            <div className="activity-item">

              <div className="activity-dot"></div>

              <div>
                <strong>
                  DayFlow account created
                </strong>

                <p>
                  Welcome to the DayFlow HRMS platform.
                </p>
              </div>

              <span>
                Recently
              </span>

            </div>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}
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

export default EmployeeDashboard;