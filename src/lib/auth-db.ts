import fs from "fs";
import path from "path";
import { supabase } from "./supabase";
import { hashPassword, verifyPassword } from "./auth-crypto";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "admin" | "user";
  created_at: string;
}

const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json");

// Ensure global in-memory store persists across hot-reloads
const globalStore = globalThis as unknown as {
  __lahoreDentalUsers?: UserRecord[];
};

// Seed default staff accounts (No patient accounts per platform skill specifications)
const DEFAULT_USERS: UserRecord[] = [
  {
    id: "usr-admin-001",
    name: "Dr. Admin (Owner)",
    email: "admin@lahoredental.pk",
    phone: "03001234567",
    passwordHash: hashPassword(process.env.ADMIN_INITIAL_PASSWORD || "AdminPass2026!"),
    role: "admin",
    created_at: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
];

function loadLocalUsers(): UserRecord[] {
  if (globalStore.__lahoreDentalUsers && globalStore.__lahoreDentalUsers.length > 0) {
    return globalStore.__lahoreDentalUsers;
  }

  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const data = fs.readFileSync(USERS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalStore.__lahoreDentalUsers = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("[auth-db] Failed to read users from disk:", err);
  }

  // Fallback to default users
  globalStore.__lahoreDentalUsers = [...DEFAULT_USERS];
  saveLocalUsers(globalStore.__lahoreDentalUsers);
  return globalStore.__lahoreDentalUsers;
}

function saveLocalUsers(users: UserRecord[]) {
  globalStore.__lahoreDentalUsers = users;
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("[auth-db] Failed to persist users to disk:", err);
  }
}

/**
 * Find user by email or by username "admin"
 */
export async function findUserByEmail(emailOrUsername: string): Promise<UserRecord | null> {
  const normalized = emailOrUsername.trim().toLowerCase();

  // Try Supabase first if available
  if (supabase) {
    try {
      const query = supabase.from("users").select("*");
      if (normalized === "admin") {
        query.or("role.eq.admin,email.eq.admin@lahoredental.pk");
      } else {
        query.eq("email", normalized);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (!error && data) {
        return data as UserRecord;
      }
    } catch (err) {
      console.error("[auth-db] Supabase findUserByEmail error:", err);
    }
  }

  // Fallback / local persistent store
  const users = loadLocalUsers();
  const found = users.find((u) => {
    const uEmail = u.email.toLowerCase();
    if (uEmail === normalized) return true;
    if (normalized === "admin" && (u.role === "admin" || uEmail.startsWith("admin@"))) return true;
    return false;
  });

  return found || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<UserRecord | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        return data as UserRecord;
      }
    } catch (err) {
      console.error("[auth-db] Supabase findUserById error:", err);
    }
  }

  const users = loadLocalUsers();
  return users.find((u) => u.id === id) || null;
}

/**
 * Create a new user.
 * Normal users are ALWAYS assigned the 'user' role automatically.
 */
export async function createUser(params: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: "admin" | "user";
}): Promise<{ success: boolean; user?: Omit<UserRecord, "passwordHash">; error?: string }> {
  try {
    const normalizedEmail = params.email.trim().toLowerCase();

    // Check if user already exists
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return { success: false, error: "An account with this email address already exists." };
    }

    const newUser: UserRecord = {
      id: "usr-" + Math.random().toString(36).substring(2, 10),
      name: params.name.trim(),
      email: normalizedEmail,
      phone: (params.phone || "").trim(),
      passwordHash: hashPassword(params.password),
      // Automatically assign "user" role unless explicitly specified as admin in backend seeds
      role: params.role === "admin" ? "admin" : "user",
      created_at: new Date().toISOString(),
    };

    // Save to Supabase if configured
    if (supabase) {
      try {
        const { error } = await supabase.from("users").insert([newUser]);
        if (error) {
          console.error("[auth-db] Supabase insert user error:", error);
        }
      } catch (err) {
        console.error("[auth-db] Supabase user insert failed:", err);
      }
    }

    // Save locally
    const users = loadLocalUsers();
    users.push(newUser);
    saveLocalUsers(users);

    const { passwordHash: _, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create user account" };
  }
}

/**
 * Get all users (sanitized without password hashes)
 */
export async function getAllUsers(): Promise<Omit<UserRecord, "passwordHash">[]> {
  const users = loadLocalUsers();
  return users.map(({ passwordHash, ...safe }) => safe);
}
