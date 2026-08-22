import { supabase } from "./supabase";

/*
|--------------------------------------------------------------------------
| ADMIN REGISTRATION
|--------------------------------------------------------------------------
*/

export async function registerAdmin({
  fullName,
  organization,
  email,
  adminCode,
  password,
}) {
  /*
   * IMPORTANT:
   * Do NOT trust an admin code stored only in React.
   *
   * This is only a temporary development check.
   * Later move administrator authorization to the backend.
   */

  const expectedAdminCode = import.meta.env.VITE_ADMIN_REGISTRATION_CODE;

  if (
    expectedAdminCode &&
    adminCode !== expectedAdminCode
  ) {
    throw new Error("Invalid administrator registration code.");
  }

  /*
   * Create Supabase Auth account
   */

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        organization: organization,
        role: "admin",
      },
    },
  });

  if (error) {
    throw error;
  }

  /*
   * If email confirmation is enabled,
   * session will normally be null here.
   */

  if (!data.user) {
    throw new Error("Administrator account could not be created.");
  }

  /*
   * Profile creation should preferably happen
   * through a Supabase database trigger.
   *
   * We do NOT manually insert the password.
   */

  return data;
}


/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
*/

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Administrator login failed.");
  }

  /*
   * Get the user's profile
   */

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error("Administrator profile was not found.");
  }

  /*
   * Check role
   */

  if (profile.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("This account does not have administrator access.");
  }

  return {
    user: data.user,
    profile,
  };
}


/*
|--------------------------------------------------------------------------
| EMPLOYEE LOGIN
|--------------------------------------------------------------------------
*/

export async function loginEmployee(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Employee login failed.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error("Employee profile was not found.");
  }

  if (profile.role !== "employee") {
    await supabase.auth.signOut();
    throw new Error("This account is not an employee account.");
  }

  return {
    user: data.user,
    profile,
  };
}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| CURRENT SESSION
|--------------------------------------------------------------------------
*/

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}