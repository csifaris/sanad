import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (session.role !== 'supervisor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const requestId = Number(id);
    if (!requestId || Number.isNaN(requestId)) return NextResponse.json({ error: 'Invalid request id' }, { status: 400 });

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const specialistId = typeof body.specialistId === 'number' ? body.specialistId : Number(body.specialistId);
    if (!specialistId || Number.isNaN(specialistId)) return NextResponse.json({ error: 'Invalid specialistId' }, { status: 400 });

    const db = getDb();

    // Verify specialist exists and has role = 'specialist'
    const sp = db.prepare('SELECT id, role FROM users WHERE id = ?').get(specialistId) as any;
    if (!sp) return NextResponse.json({ error: 'Specialist not found' }, { status: 404 });
    if (sp.role !== 'specialist') return NextResponse.json({ error: 'User is not a specialist' }, { status: 400 });

    // Verify request exists
    const reqRow = db.prepare('SELECT id FROM requests WHERE id = ?').get(requestId) as any;
    if (!reqRow) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    const now = new Date().toISOString();
    try {
      const upd = db.prepare('UPDATE requests SET assigned_specialist_id = ?, updated_at = ? WHERE id = ?');
      upd.run(specialistId, now, requestId);
      return NextResponse.json({ success: true });
    } catch (e) {
      console.error('Assign DB error:', e);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  } catch (err) {
    console.error('Assign handler error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
