
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// =====================================================
// PAGES
// =====================================================

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/Adminlogin";

import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddEmployee from "./pages/AddEmployee";


// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            LANDING
        ================================================= */}

        <Route
          path="/"
          element={<Landing />}
        />


        {/* =================================================
            EMPLOYEE AUTHENTICATION
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            ADMIN REGISTRATION
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
