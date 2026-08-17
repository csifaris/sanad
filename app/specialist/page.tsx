import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

export default async function SpecialistPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'specialist') redirect('/');

  const db = getDb();
  // Show requests that are new or assigned to this specialist
  const stmt = db.prepare(
    `SELECT id, title, description, category, status, created_at, updated_at, assigned_specialist_id
     FROM requests WHERE status = 'new' OR assigned_specialist_id = ? ORDER BY created_at DESC`
  );
  const rows = stmt.all(session.id) as any[];

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

  return (
    <div className="min-h-screen bg-[#F1F7F8] relative">
      {/* geometric header */}
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-[#17345F]">لوحة الأخصائي</h2>
            <p className="mt-2 text-[#64748B] text-sm">مرحباً {session.name}</p>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-lg font-semibold text-[#17345F] mb-4">الطلبات</h3>

          {rows.length === 0 ? (
            <p className="text-[#64748B]">لا توجد طلبات حالياً</p>
          ) : (
            <div className="grid gap-4">
              {rows.map((r) => (
                <a key={r.id} href={`/specialist/requests/${r.id}`} className="block bg-white rounded-[16px] p-4 shadow-sm border border-[#E2E8EE] hover:shadow-lg hover:-translate-y-1 transform transition" dir="rtl">
                  <h4 className="font-semibold text-[#17345F] text-lg">{r.title}</h4>
                  <div className="mt-2 text-sm text-[#64748B] grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-[#64748B]">نوع الطلب</div>
                      <div className="font-medium">{categoryLabel[r.category] ?? r.category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">الحالة</div>
                      <div className="font-medium">{statusLabel[r.status] ?? r.status}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">تاريخ الإنشاء</div>
                      <div className="font-medium">{r.created_at}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">الوصف</div>
                      <div className="font-medium text-sm text-[#17345F] truncate">{r.description}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
