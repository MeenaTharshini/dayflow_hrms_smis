import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-navbar">
        <div className="brand">
          <span className="brand-name">DaYFlow</span>
        </div>

        <div className="nav-actions">
          <button
            className="nav-login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="nav-signup"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <p className="hero-label">HUMAN RESOURCE MANAGEMENT SYSTEM</p>

          <h1>
            Every workday,
            <br />
            <span>perfectly aligned.</span>
          </h1>

          <p className="hero-description">
            DaYFlow brings employees, attendance, leave management,
            approvals, and payroll together in one simple platform.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="secondary-button"
              onClick={() => navigate("/signup")}
            >
              Request Access
            </button>
          </div>
        </div>

        {/* Right-side visual */}
        <div className="hero-visual">
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <p className="small-text">Welcome to</p>
                <h2>DaYFlow</h2>
              </div>

              <div className="status-dot"></div>
            </div>

            <div className="dashboard-stats">
              <div className="stat-card">
                <span>Attendance</span>
                <strong>Present</strong>
              </div>

              <div className="stat-card">
                <span>Leave</span>
                <strong>0 Days</strong>
              </div>

              <div className="stat-card">
                <span>Requests</span>
                <strong>2 Pending</strong>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Workday Progress</span>
                <span>75%</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 DaYFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;