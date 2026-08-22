// src/services/attendanceService.js

import { supabase } from "./supabase";

/* =========================================================
   GET EMPLOYEE DATABASE ID
   ========================================================= */

export async function getEmployeeByEmployeeId(
  employeeCode
) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("employee_id", employeeCode)
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   GET TODAY'S ATTENDANCE
   ========================================================= */

export async function getTodayAttendance(
  employeeUuid
) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeUuid)
    .eq("attendance_date", today)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   GET ATTENDANCE HISTORY
   ========================================================= */

export async function getAttendanceHistory(
  employeeUuid,
  month
) {
  const startDate = `${month}-01`;

  const [year, monthNumber] =
    month.split("-").map(Number);

  const nextMonth = new Date(
    year,
    monthNumber,
    1
  );

  const endDate =
    nextMonth.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeUuid)
    .gte("attendance_date", startDate)
    .lt("attendance_date", endDate)
    .order("attendance_date", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}


/* =========================================================
   CLOCK IN
   ========================================================= */

export async function clockIn(
  employeeUuid
) {
  const now = new Date();

  const attendanceDate =
    now.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .insert({
      employee_id: employeeUuid,
      attendance_date: attendanceDate,
      check_in: now.toISOString(),
      status: "Present",
      work_hours: 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   CLOCK OUT
   ========================================================= */

export async function clockOut(
  attendanceId,
  checkIn
) {
  const now = new Date();

  const checkInTime =
    new Date(checkIn);

  const workSeconds = Math.max(
    0,
    Math.floor(
      (now.getTime() -
        checkInTime.getTime()) /
        1000
    )
  );

  const workHours =
    workSeconds / 3600;

  const roundedHours =
    Math.round(workHours * 100) / 100;

  const { data, error } =
    await supabase
      .from("attendance")
      .update({
        check_out: now.toISOString(),
        work_hours: roundedHours,
        status: "Present",
        updated_at: now.toISOString(),
      })
      .eq("id", attendanceId)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}