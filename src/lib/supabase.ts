import { createClient } from "@supabase/supabase-js";
import { Student, Submission, Scenario } from "../types";
import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS, KHO_TINH_HUONG } from "../data";

// Fallback credentials provided by the user
const DEFAULT_SUPABASE_URL = "https://rnidxzmzlhipynhmavyo.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaWR4em16bGhpcHluaG1hdnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjQxOTUsImV4cCI6MjA5NzYwMDE5NX0.5fKT9bwAkPrV0R4ArhV9_2okNsyijU0nWA0VAxehG6Q";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Map DB student row to TS Student interface
function mapStudentFromDB(row: any): Student {
  return {
    id: row.id,
    name: row.name,
    class: row.class,
    points: row.points || 0,
    badges: Array.isArray(row.badges) ? row.badges : [],
    history: Array.isArray(row.history) ? row.history : [],
  };
}

// Map DB submission row to TS Submission interface
function mapSubmissionFromDB(row: any): Submission {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    className: row.class_name,
    title: row.title,
    type: row.type,
    description: row.description || "",
    content: row.content || "",
    status: row.status as "Đã chấm" | "Chờ chấm",
    score: row.score !== null ? Number(row.score) : null,
    feedback: row.feedback || "",
    badgeAwarded: row.badge_awarded || "",
    date: row.date || new Date().toISOString().split("T")[0],
  };
}

// Map TS Submission interface to DB row
function mapSubmissionToDB(sub: Submission) {
  return {
    id: sub.id,
    student_id: sub.studentId,
    student_name: sub.studentName,
    class_name: sub.className,
    title: sub.title,
    type: sub.type,
    description: sub.description,
    content: sub.content,
    status: sub.status,
    score: sub.score,
    feedback: sub.feedback,
    badge_awarded: sub.badgeAwarded,
    date: sub.date,
  };
}

// Map DB scenario row to TS Scenario interface
function mapScenarioFromDB(row: any): Scenario {
  return {
    id: row.id,
    grade: row.grade,
    category: row.category,
    title: row.title,
    scenario: row.scenario,
    choices: Array.isArray(row.choices) ? row.choices : [],
  };
}

/**
 * --------------------------------------------
 * STUDENTS API
 * --------------------------------------------
 */
export async function dbGetStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("points", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      // Auto seed students to Supabase if empty
      await dbSeedStudents(INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    return data.map(mapStudentFromDB);
  } catch (err) {
    console.warn("Lỗi kết nối Supabase, sử dụng dữ liệu offline:", err);
    throw err;
  }
}

export async function dbUpsertStudent(student: Student): Promise<void> {
  const { error } = await supabase
    .from("students")
    .upsert({
      id: student.id,
      name: student.name,
      class: student.class,
      points: student.points,
      badges: student.badges,
      history: student.history,
    });
  if (error) throw error;
}

export async function dbDeleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

export async function dbSeedStudents(students: Student[]): Promise<void> {
  const rows = students.map((s) => ({
    id: s.id,
    name: s.name,
    class: s.class,
    points: s.points,
    badges: s.badges,
    history: s.history,
  }));
  const { error } = await supabase.from("students").upsert(rows);
  if (error) console.error("Lỗi Seeding Students:", error);
}

/**
 * --------------------------------------------
 * SUBMISSIONS API
 * --------------------------------------------
 */
export async function dbGetSubmissions(): Promise<Submission[]> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      // Auto seed submissions to Supabase if empty
      await dbSeedSubmissions(INITIAL_SUBMISSIONS);
      return INITIAL_SUBMISSIONS;
    }
    return data.map(mapSubmissionFromDB);
  } catch (err) {
    console.warn("Lỗi kết nối Supabase, sử dụng dữ liệu offline:", err);
    throw err;
  }
}

export async function dbUpsertSubmission(sub: Submission): Promise<void> {
  const row = mapSubmissionToDB(sub);
  const { error } = await supabase.from("submissions").upsert(row);
  if (error) throw error;
}

export async function dbDeleteSubmission(id: string): Promise<void> {
  const { error } = await supabase.from("submissions").delete().eq("id", id);
  if (error) throw error;
}

export async function dbSeedSubmissions(submissions: Submission[]): Promise<void> {
  const rows = submissions.map(mapSubmissionToDB);
  const { error } = await supabase.from("submissions").upsert(rows);
  if (error) console.error("Lỗi Seeding Submissions:", error);
}

/**
 * --------------------------------------------
 * SCENARIOS API
 * --------------------------------------------
 */
export async function dbGetScenarios(): Promise<Scenario[]> {
  try {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      // Auto seed scenarios to Supabase if empty
      await dbSeedScenarios(KHO_TINH_HUONG);
      return KHO_TINH_HUONG;
    }
    return data.map(mapScenarioFromDB);
  } catch (err) {
    console.warn("Lỗi kết nối Supabase, sử dụng dữ liệu offline:", err);
    throw err;
  }
}

export async function dbUpsertScenario(scenario: Scenario): Promise<void> {
  const { error } = await supabase
    .from("scenarios")
    .upsert({
      id: scenario.id,
      grade: scenario.grade,
      category: scenario.category,
      title: scenario.title,
      scenario: scenario.scenario,
      choices: scenario.choices,
    });
  if (error) throw error;
}

export async function dbDeleteScenario(id: string): Promise<void> {
  const { error } = await supabase.from("scenarios").delete().eq("id", id);
  if (error) throw error;
}

export async function dbSeedScenarios(scenarios: Scenario[]): Promise<void> {
  const rows = scenarios.map((s) => ({
    id: s.id,
    grade: s.grade,
    category: s.category,
    title: s.title,
    scenario: s.scenario,
    choices: s.choices,
  }));
  const { error } = await supabase.from("scenarios").upsert(rows);
  if (error) console.error("Lỗi Seeding Scenarios:", error);
}
