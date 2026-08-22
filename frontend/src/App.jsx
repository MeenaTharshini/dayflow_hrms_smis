import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/Adminlogin";

// =====================================================
// EMPLOYEE PAGES
// =====================================================

import EmployeeDashboard from "./pages/EmployeeDashboard";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/AdminDashboard";
import AddEmployee from "./pages/AddEmployee";
import AdminPayroll from "./pages/AdminPayroll";

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC / LANDING
        ================================================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        {/* =================================================
            EMPLOYEE LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =================================================
            SIGNUP
        ================================================= */}

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* =================================================
            ADMIN LOGIN
        ================================================= */}

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        {/* =================================================
            EMPLOYEE DASHBOARD
        ================================================= */}

        <Route
          path="/employee-dashboard"
          element={<EmployeeDashboard />}
        />

        {/* =================================================
            EMPLOYEE PROFILE
        ================================================= */}

        <Route
          path="/employee/profile"
          element={<Profile />}
        />

        {/* =================================================
            EMPLOYEE ATTENDANCE
        ================================================= */}

        <Route
          path="/employee/attendance"
          element={<Attendance />}
        />

        {/* =================================================
            EMPLOYEE LEAVE
        ================================================= */}

        <Route
          path="/employee/leave"
          element={<Leave />}
        />

        {/* =================================================
            EMPLOYEE PAYROLL
        ================================================= */}

        <Route
          path="/employee/payroll"
          element={<Payroll />}
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        {/* =================================================
            ADD EMPLOYEE
        ================================================= */}

        <Route
          path="/add-employee"
          element={<AddEmployee />}
        />

        {/* =================================================
            ADMIN PAYROLL
        ================================================= */}

        <Route
          path="/admin/payroll"
          element={<AdminPayroll />}
        />

        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;