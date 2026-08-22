import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();

    // Backend login API will be connected here later.
    console.log("Login submitted");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <div className="auth-header">
          <h1>DaYFlow</h1>
          <p>Welcome back</p>
          <span>Sign in to continue to your workspace</span>
        </div>

        <form onSubmit={handleLogin} className="auth-form">

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() => console.log("Forgot password")}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="link-button"
            >
              Sign Up
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;