import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';

type RequestRow = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'beneficiary') redirect('/beneficiary');

  const { id } = await params;
  const requestId = Number(id);
  if (!requestId || Number.isNaN(requestId)) return notFound();

  const db = getDb();

  const stmt = db.prepare(
    `SELECT id, title, description, category, status, created_at, updated_at FROM requests WHERE id = ? AND beneficiary_id = ?`
  );
  const row = stmt.get(requestId, session.id) as RequestRow | undefined;
  if (!row) return notFound();

  // Try to fetch updates if table exists
  let updates: Array<{ id: number; author_id: number; note: string | null; old_status: string | null; new_status: string | null; created_at: string }> = [];
  try {
    const ustmt = db.prepare(
      `SELECT id, author_id, note, old_status, new_status, created_at FROM request_updates WHERE request_id = ? ORDER BY created_at ASC`
    );
    updates = ustmt.all(requestId) as any[];
  } catch (err) {
    // Table may not exist — ignore and leave updates empty
    updates = [];
  }

  const categoryLabel: Record<string, string> = {
    housing: 'السكن',
    health: 'الصحة',
    mental: 'الدعم النفسي',
    marriage: 'الزواج',
    education: 'التعليم',
  };

  const statusLabel: Record<string, string> = {
    new: 'جديد',
    in_review: 'قيد المراجعة',
    resolved: 'مكتمل',
    rejected: 'مرفوض',
  };

  const timeline = ['new', 'in_review', 'resolved'];

  function statusIndex(s: string) {
    const idx = timeline.indexOf(s);
    if (idx !== -1) return idx;
    // map known aliases for backward compatibility
    if (s === 'under_review') return 1;
    if (s === 'completed') return 2;
    return -1;
  }

  const currentIndex = statusIndex(row.status);

  return (
    <div className="min-h-screen bg-[#F1F7F8] relative">
      {/* geometric header behind */}
      <div
        className="absolute inset-x-0 top-0 z-0 pointer-events-none"
        style={{
          height: 120,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #E9F2F6 0%, #F1F7F8 100%)',
        }}
      >
        <svg viewBox="0 0 1440 140" className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
          <rect x="0" y="0" width="1440" height="140" fill="#F1F7F8" />
          <polygon points="0,140 0,20 380,8" fill="#17345F" fillOpacity="0.9" />
          <polygon points="220,140 480,24 660,140" fill="#DDF4F0" fillOpacity="0.74" />
          <polygon points="560,140 760,10 980,140" fill="#BFD8E8" fillOpacity="0.86" />
          <polygon points="860,140 1040,28 1220,140" fill="#2FAE9E" fillOpacity="0.74" />
          <polygon points="1160,140 1360,20 1440,140" fill="#17345F" fillOpacity="0.78" />
          <polygon points="1280,140 1420,50 1440,140" fill="#BFD8E8" fillOpacity="0.68" />
          <polygon points="420,140 560,40 700,140" fill="#F1F7F8" fillOpacity="0.96" />
        </svg>
      </div>

      <header className="max-w-[1100px] mx-auto px-6 relative z-20 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-3xl font-heading font-bold text-[#17345F]">سند</h1>
            <p className="text-sm text-[#64748B]">منصة الدعم الاجتماعي</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#64748B]">مرحباً، {session.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-6 pb-16 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-[#17345F]">تفاصيل الطلب</h2>
            <p className="mt-2 text-[#64748B] text-sm">معرّف الطلب: {row.id}</p>
          </div>
          <div>
            <a href="/beneficiary" className="btn btn-secondary">العودة إلى طلباتي</a>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-[#E2E8EE]" dir="rtl">
          <h3 className="text-lg font-semibold text-[#17345F] mb-2">{row.title}</h3>
          <div className="text-sm text-[#64748B] mb-4">{row.description}</div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-[#64748B]">نوع الطلب</div>
              <div className="font-medium text-[#17345F]">{categoryLabel[row.category] ?? row.category}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">الحالة الحالية</div>
              <div className="font-medium text-[#17345F]">{statusLabel[row.status] ?? row.status}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">تاريخ الإنشاء</div>
              <div className="font-medium text-[#17345F]">{row.created_at}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">آخر تحديث</div>
              <div className="font-medium text-[#17345F]">{row.updated_at}</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#17345F] mb-2">مخطط الحالة</h4>
            <div className="flex flex-col gap-2">
              {timeline.map((t, i) => {
                const active = currentIndex === i;
                const done = currentIndex > i;
                return (
                  <div key={t} className={`flex items-center gap-3 ${active ? 'text-[#17345F]' : 'text-[#64748B]'}`}>
                    <div className={`w-3 h-3 rounded-full ${active ? 'bg-[#17345F]' : done ? 'bg-[#2FAE9E]' : 'bg-gray-300'}`} />
                    <div className="text-sm">{statusLabel[t] ?? t}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#17345F] mb-2">تاريخ التتبع والتحديثات</h4>
            {updates.length === 0 ? (
              <p className="text-[#64748B]">لا توجد تحديثات حالياً</p>
            ) : (
              <ul className="space-y-3">
                {updates.map((u) => (
                  <li key={u.id} className="bg-[#FFFFFF] rounded-md p-3 border border-[#E2E8EE]">
                    <div className="text-xs text-[#64748B]">{u.created_at}</div>
                    <div className="mt-1 text-sm text-[#17345F]">{u.note ?? ''}</div>
                    <div className="mt-1 text-xs text-[#64748B]">{(u.new_status && (statusLabel[u.new_status] ?? u.new_status)) || ''}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
