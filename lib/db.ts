import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPathFromEnv = process.env.SANAD_DB_PATH;
const DB_PATH = dbPathFromEnv
  ? path.isAbsolute(dbPathFromEnv)
    ? dbPathFromEnv
    : path.join(process.cwd(), dbPathFromEnv)
  : path.join(process.cwd(), "data", "sanad.db");
const DATA_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  // eslint-disable-next-line no-var
  var __sanad_db: Database.Database | undefined;
}

function initSchemaOnDb(db: Database.Database): void {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('beneficiary', 'specialist', 'supervisor')),
        category TEXT NULL
      );

      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        beneficiary_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('housing', 'health', 'mental', 'marriage', 'education')),
        status TEXT NOT NULL CHECK(status IN ('new', 'in_review', 'resolved')),
        assigned_specialist_id INTEGER NULL REFERENCES users(id),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS request_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL REFERENCES requests(id),
        author_id INTEGER NOT NULL REFERENCES users(id),
        note TEXT NOT NULL,
        old_status TEXT NULL,
        new_status TEXT NULL,
        created_at TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    throw error;
  }
}

function seedTestData(db: Database.Database): void {
  try {
    const userCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count;
    if (userCount > 0) {
      return; // Already seeded
    }

    const bcrypt = require("bcrypt");
    const hashPassword = (pwd: string) => bcrypt.hashSync(pwd, 10);
    const demoPassword = process.env.SANAD_DEMO_PASSWORD;
    if (!demoPassword) {
      throw new Error("Missing SANAD_DEMO_PASSWORD environment variable");
    }
    
    const insertUser = db.prepare(
      "INSERT INTO users (name, email, password, role, category) VALUES (?, ?, ?, ?, ?)"
    );

    insertUser.run("عمر الأحمد", "omar@example.com", hashPassword(demoPassword), "beneficiary", null);
    insertUser.run("سارة المطيري", "sarah@example.com", hashPassword(demoPassword), "beneficiary", null);
    insertUser.run("خالد العتيبي", "khaled@example.com", hashPassword(demoPassword), "beneficiary", null);
    insertUser.run("ريم السالم", "rim@example.com", hashPassword(demoPassword), "specialist", "housing");
    insertUser.run("فاطمة الزهراني", "fatima@example.com", hashPassword(demoPassword), "specialist", "health");
    insertUser.run("يوسف الغامدي", "yousuf@example.com", hashPassword(demoPassword), "specialist", "mental");
    insertUser.run("نورة العمري", "nura@example.com", hashPassword(demoPassword), "specialist", "marriage");
    insertUser.run("محمد الشمري", "mohammad@example.com", hashPassword(demoPassword), "specialist", "education");
    insertUser.run("عبدالله البلوي", "abdullah@example.com", hashPassword(demoPassword), "supervisor", null);

    console.log("Test data seeded successfully");
  } catch (error) {
    console.error("Failed to seed test data:", error);
    // Don't throw - application should work even if seeding fails
  }
}

function openDb(): Database.Database {
  try {
    console.log("[DB] Opening database at:", DB_PATH);
    const db = new Database(DB_PATH);
    console.log("[DB] Database opened successfully");
    
    try {
      // Try to set pragmas, but don't fail if they don't work
      db.pragma("foreign_keys = ON");
      console.log("[DB] Foreign keys enabled");
    } catch (pragmaError) {
      console.warn("[DB] Warning setting foreign_keys pragma:", pragmaError);
    }
    
    // Initialize schema if database is empty
    try {
      const checkTable = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'");
      const result = checkTable.get();
      const tableCount = (result as { count: number }).count;
      console.log("[DB] Table count:", tableCount);
      
      if (tableCount === 0) {
        console.log("[DB] Initializing schema...");
        initSchemaOnDb(db);
        console.log("[DB] Schema initialized");
        
        console.log("[DB] Seeding test data...");
        seedTestData(db);
        console.log("[DB] Test data seeded");
      }
    } catch (checkError) {
      console.error("[DB] Error checking/initializing database:", checkError);
    }
    
    console.log("[DB] Database ready");
    return db;
  } catch (error) {
    console.error("[DB] Failed to open database:", error);
    throw error;
  }
}

export function getDb(): Database.Database {
  try {
    if (!global.__sanad_db) {
      console.log("[DB] Creating database connection...");
      global.__sanad_db = openDb();
      console.log("[DB] Database connection created");
    }
    return global.__sanad_db;
  } catch (error) {
    console.error("[DB] Error in getDb:", error);
    throw error;
  }
}

export function initSchema(): void {
  const db = getDb();
  initSchemaOnDb(db);
}
