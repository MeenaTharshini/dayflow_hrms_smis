import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  const goToEmployeeLogin = () => {
    navigate("/login");
  };

  const goToAdminRegistration = () => {
    navigate("/signup");
  };

  return (
    <div className="landing-page">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="landing-navbar">

        {/* Brand */}
        <button
          type="button"
          className="brand-name"
          onClick={() => navigate("/")}
          aria-label="Go to DaYFlow home"
        >
          DaYFlow
        </button>

        {/* Navigation actions */}
        <div className="nav-actions">

          <button
            type="button"
            className="nav-login"
            onClick={goToEmployeeLogin}
          >
            Employee Login
          </button>

          <button
            type="button"
            className="nav-admin"
            onClick={goToAdminRegistration}
          >
            Admin Registration
          </button>

        </div>
      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="landing-main">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="hero-section">

          <div className="hero-content">

            <p className="hero-label">
              HUMAN RESOURCE MANAGEMENT SYSTEM
            </p>

            <h1>
              Every workday,
              <br />
              <span>perfectly aligned.</span>
            </h1>

            <p className="hero-description">
              DaYFlow brings employees and administrators together
              through a secure, simple platform for attendance,
              leave, payroll, approvals, and workforce management.
            </p>

          </div>


          {/* =================================================
              ACCESS CARDS
          ================================================= */}

          <div className="role-selection">

            {/* =================================================
                EMPLOYEE CARD
            ================================================= */}

            <article className="role-card employee-card">

              <div className="role-icon employee-icon">
                <span aria-hidden="true">◉</span>
              </div>

              <div className="role-content">

                <span className="role-label">
                  EMPLOYEE ACCESS
                </span>

                <h2>
                  Employee
                </h2>

                <p>
                  Sign in to access your attendance, leave requests,
                  payroll, profile, and workplace services.
                </p>

              </div>

              <button
                type="button"
                className="role-button employee-button"
                onClick={goToEmployeeLogin}
              >
                <span>
                  Employee Login
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </button>

            </article>


            {/* =================================================
                ADMIN CARD
            ================================================= */}

            <article className="role-card admin-card">

              <div className="role-icon admin-icon">
                <span aria-hidden="true">◆</span>
              </div>

              <div className="role-content">

                <span className="role-label">
                  ADMINISTRATOR ACCESS
                </span>

                <h2>
                  Administrator
                </h2>

                <p>
                  Create an administrator account to manage
                  employees, attendance, leave, payroll,
                  approvals, and HR operations.
                </p>

              </div>

              <button
                type="button"
                className="role-button admin-button"
                onClick={goToAdminRegistration}
              >
                <span>
                  Admin Registration
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </button>

            </article>

          </div>

        </section>


        {/* ===================================================
            INFORMATION STRIP
        =================================================== */}

        <section className="landing-features">

          <div className="feature-item">

            <span className="feature-icon">
              ✓
            </span>

            <div>
              <strong>
                Secure Access
              </strong>

              <p>
                Role-based authentication
              </p>
            </div>

          </div>


          <div className="feature-item">

            <span className="feature-icon">
              ◷
            </span>

            <div>
              <strong>
                Attendance
              </strong>

              <p>
                Simple workforce tracking
              </p>
            </div>

          </div>


          <div className="feature-item">

            <span className="feature-icon">
              ◆
            </span>

            <div>
              <strong>
                HR Management
              </strong>

              <p>
                Leave and payroll management
              </p>
            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="landing-footer">

        <p>
          © 2026 DaYFlow. All rights reserved.
        </p>

        <span>
          Secure • Simple • Connected
        </span>

      </footer>

    </div>
  );
}

export default Landing;