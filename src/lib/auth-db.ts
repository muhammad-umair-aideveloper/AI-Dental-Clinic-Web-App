import { supabase } from "./supabase";
import { hashPassword } from "./auth-crypto";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "admin" | "user";
  created_at: string;
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set the required server environment variables.");
  }
  return supabase;
}

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone || ""),
    passwordHash: String(row.password_hash || ""),
    role: row.role === "admin" ? "admin" : "user",
    created_at: String(row.created_at),
  };
}

export async function findUserByEmail(emailOrUsername: string): Promise<UserRecord | null> {
  const normalized = emailOrUsername.trim().toLowerCase();
  const query = requireSupabase().from("users").select("*");
  if (normalized === "admin") {
    query.or("role.eq.admin,email.eq.admin@lahoredental.pk");
  } else {
    query.eq("email", normalized);
  }
  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw new Error(`Failed to find user: ${error.message}`);
  return data ? mapUser(data) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const { data, error } = await requireSupabase()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to find user: ${error.message}`);
  return data ? mapUser(data) : null;
}

export async function createUser(params: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: "admin" | "user";
}): Promise<{ success: boolean; user?: Omit<UserRecord, "passwordHash">; error?: string }> {
  try {
    const normalizedEmail = params.email.trim().toLowerCase();
    if (await findUserByEmail(normalizedEmail)) {
      return { success: false, error: "An account with this email address already exists." };
    }

    const { data, error } = await requireSupabase()
      .from("users")
      .insert({
        name: params.name.trim(),
        email: normalizedEmail,
        phone: (params.phone || "").trim(),
        password_hash: hashPassword(params.password),
        role: params.role === "admin" ? "admin" : "user",
      })
      .select("*")
      .single();
    if (error) throw error;

    const { passwordHash: _, ...safeUser } = mapUser(data);
    return { success: true, user: safeUser };
  } catch (error) {
    console.error("[auth-db] Failed to create user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user account",
    };
  }
}

export async function getAllUsers(): Promise<Omit<UserRecord, "passwordHash">[]> {
  const { data, error } = await requireSupabase()
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch users: ${error.message}`);
  return (data || []).map((row) => {
    const { passwordHash: _, ...safeUser } = mapUser(row);
    return safeUser;
  });
}
