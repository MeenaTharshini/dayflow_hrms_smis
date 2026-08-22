import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const handleSignup = (event) => {
    event.preventDefault();

    // Backend signup API will be connected here later.
    console.log("Signup request submitted");
  };

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <div className="auth-header">
          <h1>DaYFlow</h1>
          <p>Request an account</p>

          <span>
            Submit your details for Admin approval.
          </span>
        </div>

        <div className="approval-notice">
          <strong>Admin Approval Required</strong>
          <p>
            Your account will remain pending until an Admin reviews
            and approves your registration request.
          </p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">

          <div className="form-group">
            <label htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              placeholder="Enter your employee ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signupEmail">Email</label>
            <input
              id="signupEmail"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signupPassword">Password</label>
            <input
              id="signupPassword"
              type="password"
              placeholder="Create a password"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="auth-button">
            Submit Registration
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="link-button"
            >
              Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Signup;