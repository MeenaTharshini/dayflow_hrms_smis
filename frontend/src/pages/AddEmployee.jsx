
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./Auth.css";

function AddEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    joiningDate: "",
    employmentType: "Full Time",
    monthlySalary: "",
    reportingManager: "",
    employmentStatus: "Active",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    // Required fields
    if (
      !form.employeeId.trim() ||
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.department ||
      !form.designation.trim() ||
      !form.joiningDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Phone validation
    if (
      form.phone &&
      !/^[0-9+\-\s()]{7,15}$/.test(form.phone)
    ) {
      setError("Please enter a valid phone number.");
      return;
    }

    // Emergency phone validation
    if (
      form.emergencyContactPhone &&
      !/^[0-9+\-\s()]{7,15}$/.test(
        form.emergencyContactPhone
      )
    ) {
      setError(
        "Please enter a valid emergency contact number."
      );
      return;
    }

    // Salary validation
    if (
      form.monthlySalary &&
      Number(form.monthlySalary) < 0
    ) {
      setError("Monthly salary cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      /*
       * ============================================
       * CHECK DUPLICATE EMPLOYEE ID
       * ============================================
       */

      const {
        data: existingEmployee,
        error: employeeCheckError,
      } = await supabase
        .from("employees")
        .select("id")
        .eq(
          "employee_id",
          form.employeeId.trim()
        )
        .maybeSingle();

      if (employeeCheckError) {
        throw employeeCheckError;
      }

      if (existingEmployee) {
        throw new Error(
          "An employee with this Employee ID already exists."
        );
      }

      /*
       * ============================================
       * CHECK DUPLICATE EMAIL
       * ============================================
       */

      const {
        data: existingEmail,
        error: emailCheckError,
      } = await supabase
        .from("employees")
        .select("id")
        .eq(
          "email",
          form.email.trim().toLowerCase()
        )
        .maybeSingle();

      if (emailCheckError) {
        throw emailCheckError;
      }

      if (existingEmail) {
        throw new Error(
          "An employee with this email already exists."
        );
      }

      /*
       * ============================================
       * INSERT EMPLOYEE
       *
       * IMPORTANT:
       * These names exactly match your Supabase table.
       * ============================================
       */

      const { error: insertError } = await supabase
        .from("employees")
        .insert({
          employee_id: form.employeeId.trim(),

          full_name: form.fullName.trim(),

          email: form.email.trim().toLowerCase(),

          phone:
            form.phone.trim() || null,

          department:
            form.department,

          designation:
            form.designation.trim(),

          joining_date:
            form.joiningDate,

          employment_type:
            form.employmentType,

          monthly_salary:
            form.monthlySalary
              ? Number(form.monthlySalary)
              : null,

          reporting_manager:
            form.reportingManager.trim() || null,

          employment_status:
            form.employmentStatus,

          address:
            form.address.trim() || null,

          emergency_contact_name:
            form.emergencyContactName.trim() || null,

          emergency_contact_phone:
            form.emergencyContactPhone.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      /*
       * ============================================
       * SUCCESS
       * ============================================
       */

      setMessage(
        "Employee added successfully."
      );

      /*
       * Clear form
       */

      setForm({
        employeeId: "",
        fullName: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        joiningDate: "",
        employmentType: "Full Time",
        monthlySalary: "",
        reportingManager: "",
        employmentStatus: "Active",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
      });

      /*
       * Return to dashboard
       */

      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1200);
    } catch (err) {
      console.error(
        "Add employee error:",
        err
      );

      setError(
        err?.message ||
          "Unable to add employee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page add-employee-page">

      <div className="auth-card add-employee-card">

        {/* Back */}

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/admin-dashboard")
          }
          disabled={loading}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}

        <div className="auth-header">

          <h1>DaYFlow</h1>

          <p>Add Employee</p>

          <span>
            Create a new employee record and add
            them to your organization.
          </span>

        </div>

        {/* Error */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Success */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <form
          className="auth-form employee-form"
          onSubmit={handleSubmit}
        >

          {/* =========================================
              BASIC INFORMATION
          ========================================= */}

          <div className="form-section-title">

            <h3>Basic Information</h3>

            <span>
              Employee identification details
            </span>

          </div>

          <div className="form-grid">

            {/* Employee ID */}

            <div className="form-group">

              <label htmlFor="employeeId">
                Employee ID *
              </label>

              <input
                id="employeeId"
                name="employeeId"
                type="text"
                placeholder="Example: DF-EMP-001"
                value={form.employeeId}
                onChange={handleChange}
                required
              />

            </div>

            {/* Full Name */}

            <div className="form-group">

              <label htmlFor="fullName">
                Full Name *
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter employee name"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
              />

            </div>

            {/* Email */}

            <div className="form-group">

              <label htmlFor="email">
                Official Email *
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="employee@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

            </div>

            {/* Phone */}

            <div className="form-group">

              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />

            </div>

          </div>

          {/* =========================================
              EMPLOYMENT INFORMATION
          ========================================= */}

          <div className="form-section-title">

            <h3>
              Employment Information
            </h3>

            <span>
              Role and organization details
            </span>

          </div>

          <div className="form-grid">

            {/* Department */}

            <div className="form-group">

              <label htmlFor="department">
                Department *
              </label>

              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Department
                </option>

                <option value="Human Resources">
                  Human Resources
                </option>

                <option value="Finance">
                  Finance
                </option>

                <option value="Information Technology">
                  Information Technology
                </option>

                <option value="Engineering">
                  Engineering
                </option>

                <option value="Marketing">
                  Marketing
                </option>

                <option value="Sales">
                  Sales
                </option>

                <option value="Operations">
                  Operations
                </option>

                <option value="Administration">
                  Administration
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {/* Designation */}

            <div className="form-group">

              <label htmlFor="designation">
                Designation *
              </label>

              <input
                id="designation"
                name="designation"
                type="text"
                placeholder="Example: Software Engineer"
                value={form.designation}
                onChange={handleChange}
                required
              />

            </div>

            {/* Joining Date */}

            <div className="form-group">

              <label htmlFor="joiningDate">
                Joining Date *
              </label>

              <input
                id="joiningDate"
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
                required
              />

            </div>

            {/* Employment Type */}

            <div className="form-group">

              <label htmlFor="employmentType">
                Employment Type
              </label>

              <select
                id="employmentType"
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
              >

                <option value="Full Time">
                  Full Time
                </option>

                <option value="Part Time">
                  Part Time
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Intern">
                  Intern
                </option>

              </select>

            </div>

            {/* Monthly Salary */}

            <div className="form-group">

              <label htmlFor="monthlySalary">
                Monthly Salary
              </label>

              <input
                id="monthlySalary"
                name="monthlySalary"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter monthly salary"
                value={form.monthlySalary}
                onChange={handleChange}
              />

            </div>

            {/* Reporting Manager */}

            <div className="form-group">

              <label htmlFor="reportingManager">
                Reporting Manager
              </label>

              <input
                id="reportingManager"
                name="reportingManager"
                type="text"
                placeholder="Manager name"
                value={form.reportingManager}
                onChange={handleChange}
              />

            </div>

            {/* Employment Status */}

            <div className="form-group">

              <label htmlFor="employmentStatus">
                Employment Status
              </label>

              <select
                id="employmentStatus"
                name="employmentStatus"
                value={form.employmentStatus}
                onChange={handleChange}
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

                <option value="On Leave">
                  On Leave
                </option>

                <option value="Probation">
                  Probation
                </option>

              </select>

            </div>

          </div>

          {/* =========================================
              CONTACT INFORMATION
          ========================================= */}

          <div className="form-section-title">

            <h3>
              Contact Information
            </h3>

            <span>
              Additional employee details
            </span>

          </div>

          {/* Address */}

          <div className="form-group">

            <label htmlFor="address">
              Address
            </label>

            <textarea
              id="address"
              name="address"
              rows="3"
              placeholder="Enter employee address"
              value={form.address}
              onChange={handleChange}
            />

          </div>

          {/* Emergency Contact */}

          <div className="form-grid">

            <div className="form-group">

              <label htmlFor="emergencyContactName">
                Emergency Contact Name
              </label>

              <input
                id="emergencyContactName"
                name="emergencyContactName"
                type="text"
                placeholder="Emergency contact"
                value={form.emergencyContactName}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label htmlFor="emergencyContactPhone">
                Emergency Contact Phone
              </label>

              <input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                placeholder="Emergency phone number"
                value={form.emergencyContactPhone}
                onChange={handleChange}
              />

            </div>

          </div>

          {/* =========================================
              ACTIONS
          ========================================= */}

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/admin-dashboard")
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading
                ? "Adding Employee..."
                : "Add Employee"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddEmployee;