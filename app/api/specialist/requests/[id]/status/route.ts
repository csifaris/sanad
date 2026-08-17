import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";

type Body = { status?: unknown };
const ALLOWED_TARGETS = ["in_review", "resolved"];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (session.role !== "specialist") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const requestId = Number(id);
    if (!requestId || Number.isNaN(requestId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const target = typeof body.status === "string" ? body.status : "";
    if (!ALLOWED_TARGETS.includes(target)) return NextResponse.json({ error: "Invalid target status" }, { status: 400 });

    const db = getDb();

    // Fetch current request
    const row = db.prepare("SELECT id, status, assigned_specialist_id FROM requests WHERE id = ?").get(requestId) as any;
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentStatus = row.status as string;
    const assignedId = row.assigned_specialist_id as number | null;

    // Validate permissions and transitions
    // Accepting a new request: new -> in_review
    if (target === "in_review") {
      if (currentStatus !== "new") {
        return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
      }
      const now = new Date().toISOString();
      try {
        const upd = db.prepare("UPDATE requests SET assigned_specialist_id = ?, status = ?, updated_at = ? WHERE id = ? AND status = ?");
        const result = upd.run(session.id, "in_review", now, requestId, "new");
        if ((result as any).changes === 0) {
          return NextResponse.json({ error: "Invalid status transition or concurrent change" }, { status: 400 });
        }

        try {
          const i = db.prepare("INSERT INTO request_updates (request_id, author_id, note, old_status, new_status, created_at) VALUES (?, ?, ?, ?, ?, ?)");
          i.run(requestId, session.id, "استلام الطلب من قبل الأخصائي", "new", "in_review", now);
        } catch (e) {
          // ignore if table doesn't exist
        }

        return NextResponse.json({ success: true, status: "in_review" });
      } catch (e) {
        console.error("DB update error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
    }

    // For other transitions, request must be assigned to current specialist
    if (assignedId !== session.id) {
      return NextResponse.json({ error: "Forbidden: not assigned to you" }, { status: 403 });
    }

    // in_review -> resolved
    if (target === "resolved") {
      if (currentStatus !== "in_review") {
        return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
      }
      const now = new Date().toISOString();
      try {
        const upd = db.prepare("UPDATE requests SET status = ?, updated_at = ? WHERE id = ? AND status = ?");
        const result = upd.run("resolved", now, requestId, "in_review");
        if ((result as any).changes === 0) {
          return NextResponse.json({ error: "Invalid status transition or concurrent change" }, { status: 400 });
        }

        try {
          const i = db.prepare("INSERT INTO request_updates (request_id, author_id, note, old_status, new_status, created_at) VALUES (?, ?, ?, ?, ?, ?)");
          i.run(requestId, session.id, "إكمال الطلب", currentStatus, "resolved", now);
        } catch (e) {}

        return NextResponse.json({ success: true, status: "resolved" });
      } catch (e) {
        console.error("DB update error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid transition" }, { status: 400 });
  } catch (err) {
    console.error("Status handler error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
