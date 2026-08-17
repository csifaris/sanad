import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";

type Body = {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  priority?: unknown;
};

const ALLOWED_CATEGORIES = ["housing", "health", "mental", "marriage", "education"] as const;
const ALLOWED_PRIORITIES = ["low", "medium", "high"] as const;

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (session.role !== "beneficiary") {
      return NextResponse.json({ error: "Forbidden: only beneficiaries can create requests" }, { status: 403 });
    }

    // Parse body
    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const priority = typeof body.priority === "string" ? body.priority.trim() : "";

    // Validate required fields
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
    if (!priority) return NextResponse.json({ error: "Priority is required" }, { status: 400 });

    if (!ALLOWED_CATEGORIES.includes(category as typeof ALLOWED_CATEGORIES[number])) {
      return NextResponse.json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(", ")}` }, { status: 400 });
    }

    if (!ALLOWED_PRIORITIES.includes(priority as typeof ALLOWED_PRIORITIES[number])) {
      return NextResponse.json({ error: `Invalid priority. Allowed: ${ALLOWED_PRIORITIES.join(", ")}` }, { status: 400 });
    }

    // Use DB to insert request. Note: existing schema does not have a priority column; priority is validated but not persisted separately.
    try {
      const db = getDb();
      const now = new Date().toISOString();

      const stmt = db.prepare(
        `INSERT INTO requests (beneficiary_id, title, description, category, status, assigned_specialist_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );

      const result = stmt.run(session.id, title, description, category, "new", null, now, now);
      const requestId = Number((result as any).lastInsertRowid);

      return NextResponse.json({ success: true, requestId });
    } catch (dbError) {
      console.error("Create request DB error:", dbError);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Create request handler error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.role !== "beneficiary") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const db = getDb();
      const stmt = db.prepare(
        `SELECT id, title, description, category, status, created_at, updated_at
         FROM requests WHERE beneficiary_id = ? ORDER BY created_at DESC`
      );
      const rows = stmt.all(session.id);

      const requests = (rows as any[]).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));

      return NextResponse.json({ requests });
    } catch (dbError) {
      console.error("Get requests DB error:", dbError);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Get requests handler error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
