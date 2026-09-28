import fs from "fs";
import path from "path";
import { supabase } from "./supabase";
import {
  AISettings,
  DEFAULT_AI_SETTINGS,
} from "./ai-types";

export * from "./ai-types";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "data", "ai-knowledge.json");

// In-memory persistent cache across hot-reloads
const globalStore = globalThis as unknown as {
  __lahoreDentalAISettings?: AISettings;
};

export function loadAISettings(): AISettings {
  if (globalStore.__lahoreDentalAISettings) {
    return globalStore.__lahoreDentalAISettings;
  }

  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && parsed.knowledge && parsed.instructions) {
        globalStore.__lahoreDentalAISettings = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("[ai-knowledge-db] Error reading settings from disk:", err);
  }

  // Fallback to default settings
  globalStore.__lahoreDentalAISettings = JSON.parse(JSON.stringify(DEFAULT_AI_SETTINGS));
  saveAISettings(globalStore.__lahoreDentalAISettings!);
  return globalStore.__lahoreDentalAISettings!;
}

export function saveAISettings(settings: AISettings): boolean {
  try {
    settings.updated_at = new Date().toISOString();
    globalStore.__lahoreDentalAISettings = settings;

    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");

    // Also persist to Supabase if available
    if (supabase) {
      (async () => {
        try {
          const { error } = await supabase
            .from("ai_settings")
            .upsert([{ id: "default", settings, updated_at: settings.updated_at }]);
          if (error) console.warn("[ai-knowledge-db] Supabase upsert note:", error.message);
        } catch (e) {
          // ignore
        }
      })();
    }

    return true;
  } catch (err) {
    console.error("[ai-knowledge-db] Error saving settings:", err);
    return false;
  }
}

/**
 * Returns settings with the API key masked for client/admin view
 * to never leak the raw key to client-side.
 */
export function getMaskedAISettings(): AISettings {
  const current = loadAISettings();
  const rawKey = current.instructions.apiKey || process.env.OPENAI_API_KEY || "";
  const maskedKey = rawKey
    ? rawKey.length > 8
      ? `${rawKey.slice(0, 3)}••••••••${rawKey.slice(-4)}`
      : "••••••••"
    : "";

  return {
    ...current,
    instructions: {
      ...current.instructions,
      apiKey: maskedKey,
    },
  };
}

/**
 * Returns the effective API key (from DB settings if configured, else environment variable)
 */
export function getEffectiveApiKey(): string {
  const current = loadAISettings();
  const dbKey = current.instructions.apiKey?.trim();
  // If dbKey is a real key (not the masked placeholder)
  if (dbKey && !dbKey.includes("••••")) {
    return dbKey;
  }
  return process.env.OPENAI_API_KEY || "";
}
