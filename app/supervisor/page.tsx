import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';

type RequestRow = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  beneficiary_name: string | null;
  specialist_name: string | null;
};

export default async function SupervisorPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'supervisor') redirect('/');

  const db = getDb();

  // Statistics
  let totalRequests = 0;
  let totalBeneficiaries = 0;
  let totalSpecialists = 0;

  try {
    const r = db.prepare('SELECT COUNT(*) AS count FROM requests').get() as any;
    totalRequests = r?.count ?? 0;
  } catch (e) {
    totalRequests = 0;
  }

  try {
    const b = db
      .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'beneficiary'")
      .get() as any;
    totalBeneficiaries = b?.count ?? 0;
  } catch (e) {
    totalBeneficiaries = 0;
  }

  try {
    const s = db
      .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'specialist'")
      .get() as any;
    totalSpecialists = s?.count ?? 0;
  } catch (e) {
    totalSpecialists = 0;
  }

  // Requests list with left joins to get beneficiary and specialist names
  let rows: RequestRow[] = [];
  try {
    const stmt = db.prepare(`
      SELECT
        r.id,
        r.title,
        r.description,
        r.category,
        r.status,
        r.created_at,
        r.updated_at,
        beneficiary.name AS beneficiary_name,
        specialist.name AS specialist_name
      FROM requests r
      LEFT JOIN users beneficiary ON beneficiary.id = r.beneficiary_id
      LEFT JOIN users specialist ON specialist.id = r.assigned_specialist_id
      ORDER BY r.created_at DESC
    `);
    rows = stmt.all() as RequestRow[];
  } catch (e) {
    rows = [];
  }

  // Specialists list and per-specialist stats
  let specialists: Array<{ id: number; name: string; email: string }> = [];
  try {
    const sstmt = db.prepare("SELECT id, name, email FROM users WHERE role = ? ORDER BY name");
    specialists = sstmt.all('specialist') as any[];
  } catch (e) {
    specialists = [];
  }

  const specialistStats = specialists.map((sp) => {
    try {
      const a = db.prepare('SELECT COUNT(*) AS count FROM requests WHERE assigned_specialist_id = ?').get(sp.id) as any;
      const c = db
        .prepare("SELECT COUNT(*) AS count FROM requests WHERE assigned_specialist_id = ? AND status = 'resolved'")
        .get(sp.id) as any;
      return { ...sp, assignedCount: a?.count ?? 0, completedCount: c?.count ?? 0 };
    } catch (e) {
      return { ...sp, assignedCount: 0, completedCount: 0 };
    }
  });

  // Beneficiaries list and per-beneficiary stats
  let beneficiaries: Array<{ id: number; name: string; email: string }> = [];
  try {
    const bstmt = db.prepare("SELECT id, name, email FROM users WHERE role = ? ORDER BY name");
    beneficiaries = bstmt.all('beneficiary') as any[];
  } catch (e) {
    beneficiaries = [];
  }

  const beneficiaryStats = beneficiaries.map((b) => {
    try {
      const total = db.prepare('SELECT COUNT(*) AS count FROM requests WHERE beneficiary_id = ?').get(b.id) as any;
      const completed = db
        .prepare("SELECT COUNT(*) AS count FROM requests WHERE beneficiary_id = ? AND status = 'resolved'")
        .get(b.id) as any;
      return { ...b, requestsCount: total?.count ?? 0, completedCount: completed?.count ?? 0 };
    } catch (e) {
      return { ...b, requestsCount: 0, completedCount: 0 };
    }
  });

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

      <main className="max-w-6xl mx-auto px-6 pt-6 pb-16 relative z-10" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-[#17345F]">لوحة المشرف</h2>
            <p className="mt-2 text-[#64748B] text-sm">مرحباً {session.name}</p>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-[#E2E8EE]">
            <div className="text-xs text-[#64748B]">إجمالي الطلبات</div>
            <div className="text-2xl font-semibold text-[#17345F]">{totalRequests}</div>
          </div>
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-[#E2E8EE]">
            <div className="text-xs text-[#64748B]">إجمالي المستفيدين</div>
            <div className="text-2xl font-semibold text-[#17345F]">{totalBeneficiaries}</div>
          </div>
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-[#E2E8EE]">
            <div className="text-xs text-[#64748B]">إجمالي الأخصائيين</div>
            <div className="text-2xl font-semibold text-[#17345F]">{totalSpecialists}</div>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-semibold text-[#17345F] mb-4">الأخصائيون</h3>

          {specialistStats.length === 0 ? (
            <p className="text-[#64748B]">لا يوجد أخصائيون حالياً</p>
          ) : (
            <div className="grid gap-4">
              {specialistStats.map((sp) => (
                <div key={sp.id} className="bg-white rounded-[16px] p-4 shadow-sm border border-[#E2E8EE]" dir="rtl">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <div className="text-xs text-[#64748B]">اسم الأخصائي</div>
                      <div className="font-medium text-[#17345F]">{sp.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">البريد الإلكتروني</div>
                      <div className="font-medium">{sp.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">عدد الطلبات المسندة إليه</div>
                      <div className="font-medium">{sp.assignedCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">عدد الطلبات المكتملة</div>
                      <div className="font-medium">{sp.completedCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold text-[#17345F] mb-4">الطلبات</h3>

          {rows.length === 0 ? (
            <p className="text-[#64748B]">لا توجد طلبات حالياً</p>
          ) : (
            <div className="space-y-4">
              {rows.map((r) => (
                <a key={r.id} href={`/supervisor/requests/${r.id}`} className="block bg-white rounded-[16px] p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition border border-[#E2E8EE]" dir="rtl">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-[#64748B]">رقم الطلب</div>
                      <div className="font-medium">{r.id}</div>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]">عنوان الطلب</div>
                      <div className="font-medium">{r.title}</div>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]">نوع الطلب</div>
                      <div className="font-medium">{categoryLabel[r.category] ?? r.category}</div>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]">المستفيد</div>
                      <div className="font-medium">{r.beneficiary_name ?? 'غير معروف'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]">الأخصائي المسؤول</div>
                      <div className="font-medium">{r.specialist_name ?? 'غير معين'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]">الحالة</div>
                      <div className="font-medium">{statusLabel[r.status] ?? r.status}</div>
                    </div>

                    <div className="sm:col-span-3">
                      <div className="text-xs text-[#64748B]">تاريخ الإنشاء</div>
                      <div className="font-medium">{r.created_at}</div>
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
