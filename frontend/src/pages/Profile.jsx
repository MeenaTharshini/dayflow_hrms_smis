import { useNavigate } from "react-router-dom";
import "../App.css";

function Profile() {
  const navigate = useNavigate();

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
            onClick={() => navigate("/login")}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ================= MAIN ================= */}
      <main className="dashboard-container">

        {/* Back button */}
        <button
          className="back-dashboard-button"
          onClick={() => navigate("/employee/dashboard")}
        >
          ← Back to Dashboard
        </button>


        {/* Heading */}
        <section className="dashboard-welcome">

          <p className="dashboard-label">
            EMPLOYEE PROFILE
          </p>

          <h1>
            My Profile
          </h1>

          <p>
            View and manage your personal and professional information.
          </p>

        </section>


        {/* ================= PROFILE HEADER ================= */}
        <section className="profile-header-card">

          <div className="profile-avatar">
            M
          </div>

          <div className="profile-main-info">

            <h2>
              Meena Tharshini
            </h2>

            <p>
              Software Engineer
            </p>

            <span>
              Employee ID: DF001
            </span>

          </div>

          <div className="profile-status">
            Active
          </div>

        </section>


        {/* ================= PERSONAL INFORMATION ================= */}
        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>
              <h2>
                Personal Information
              </h2>

              <p>
                Your basic personal details
              </p>
            </div>

            <button
              className="profile-edit-button"
              onClick={() => alert("Profile editing will be connected to the backend soon.")}
            >
              Edit Profile
            </button>

          </div>


          <div className="profile-details-card">

            <div className="profile-detail">

              <span>
                Full Name
              </span>

              <strong>
                Meena Tharshini
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Email
              </span>

              <strong>
                employee@dayflow.com
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Phone
              </span>

              <strong>
                +91 XXXXX XXXXX
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Date of Birth
              </span>

              <strong>
                15 May 2006
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Gender
              </span>

              <strong>
                Female
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Address
              </span>

              <strong>
                Tamil Nadu, India
              </strong>

            </div>

          </div>

        </section>


        {/* ================= JOB INFORMATION ================= */}
        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>
              <h2>
                Job Information
              </h2>

              <p>
                Your employment details
              </p>
            </div>

          </div>


          <div className="profile-details-card">

            <div className="profile-detail">

              <span>
                Employee ID
              </span>

              <strong>
                DF001
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Department
              </span>

              <strong>
                Computer Science
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Designation
              </span>

              <strong>
                Software Engineer
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Employment Type
              </span>

              <strong>
                Full Time
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Joining Date
              </span>

              <strong>
                01 July 2026
              </strong>

            </div>


            <div className="profile-detail">

              <span>
                Reporting Manager
              </span>

              <strong>
                HR Manager
              </strong>

            </div>

          </div>

        </section>


        {/* ================= SALARY INFORMATION ================= */}
        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>
              <h2>
                Salary Information
              </h2>

              <p>
                Your current compensation details
              </p>
            </div>

            <button
              className="view-payroll-button"
              onClick={() => navigate("/employee/payroll")}
            >
              View Payroll →
            </button>

          </div>


          <div className="profile-salary-card">

            <div>
              <span>
                Monthly Salary
              </span>

              <strong>
                ₹45,000
              </strong>
            </div>


            <div>
              <span>
                Annual Salary
              </span>

              <strong>
                ₹5,40,000
              </strong>
            </div>


            <div>
              <span>
                Payroll Status
              </span>

              <strong className="salary-active">
                Active
              </strong>
            </div>

          </div>

        </section>


        {/* ================= DOCUMENTS ================= */}
        <section className="dashboard-section">

          <div className="profile-section-header">

            <div>
              <h2>
                Documents
              </h2>

              <p>
                Your employee documents
              </p>
            </div>

          </div>


          <div className="documents-grid">

            <div className="document-card">

              <div className="document-icon">
                📄
              </div>

              <div>
                <strong>
                  Offer Letter
                </strong>

                <span>
                  PDF Document
                </span>
              </div>

              <button
                onClick={() => alert("Document viewer will be added later.")}
              >
                View
              </button>

            </div>


            <div className="document-card">

              <div className="document-icon">
                📄
              </div>

              <div>
                <strong>
                  Employment Contract
                </strong>

                <span>
                  PDF Document
                </span>
              </div>

              <button
                onClick={() => alert("Document viewer will be added later.")}
              >
                View
              </button>

            </div>


            <div className="document-card">

              <div className="document-icon">
                🪪
              </div>

              <div>
                <strong>
                  Employee ID
                </strong>

                <span>
                  ID Document
                </span>
              </div>

              <button
                onClick={() => alert("Document viewer will be added later.")}
              >
                View
              </button>

            </div>

          </div>

        </section>


        {/* ================= SECURITY ================= */}
        <section className="dashboard-section">

          <div className="profile-security-card">

            <div>

              <h3>
                🔒 Account Security
              </h3>

              <p>
                Keep your DayFlow account secure by
                regularly updating your password.
              </p>

            </div>

            <button
              onClick={() => alert("Password change will be connected to the backend soon.")}
            >
              Change Password
            </button>

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

export default Profile;