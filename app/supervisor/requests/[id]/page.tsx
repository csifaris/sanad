import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import AssignSpecialist from './AssignSpecialist';

type RequestDetail = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  beneficiary_name: string | null;
  beneficiary_email: string | null;
  specialist_name: string | null;
  specialist_email: string | null;
};

export default async function SupervisorRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'supervisor') redirect('/');

  const { id } = await params;
  const requestId = Number(id);
  if (!requestId || Number.isNaN(requestId)) return notFound();

  const db = getDb();

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
      beneficiary.email AS beneficiary_email,
      specialist.name AS specialist_name,
      specialist.email AS specialist_email,
      specialist.id AS specialist_id
    FROM requests r
    LEFT JOIN users beneficiary ON beneficiary.id = r.beneficiary_id
    LEFT JOIN users specialist ON specialist.id = r.assigned_specialist_id
    WHERE r.id = ?
    LIMIT 1
  `);

  const row = stmt.get(requestId) as RequestDetail | any;
  if (!row) return notFound();

  // Load specialists list for assignment
  let specialists: Array<{ id: number; name: string; email: string }> = [];
  try {
    const sstmt = db.prepare("SELECT id, name, email FROM users WHERE role = ? ORDER BY name");
    specialists = sstmt.all('specialist') as any[];
  } catch (e) {
    specialists = [];
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
  };

  return (
    <div className="min-h-screen bg-[#F1F7F8] relative">
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
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#64748B]">مرحباً، {session.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-6 pb-16 relative z-10" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-[#17345F]">تفاصيل الطلب</h2>
            <p className="mt-2 text-[#64748B] text-sm">معرّف الطلب: {row.id}</p>
          </div>
          <div>
            <a href="/supervisor" className="bg-gray-100 text-[#17345F] rounded-xl py-2.5 px-4 text-sm hover:opacity-90">العودة إلى لوحة المشرف</a>
          </div>
        </div>

        {/* Read-only status summary */}
        <div className="mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3" dir="rtl">
            <div>
              <div className="text-xs text-[#64748B]">الحالة الحالية</div>
              <div className="font-medium">{statusLabel[row.status] ?? row.status}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">الأخصائي المسؤول</div>
              <div className="font-medium">{row.specialist_name ?? 'غير معين'}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">هل الطلب مسند؟</div>
              <div className="font-medium">{row.specialist_id ? 'نعم' : 'لا'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#17345F] mb-2">{row.title}</h3>
          <div className="text-sm text-[#64748B] mb-4">{row.description}</div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-[#64748B]">نوع الطلب</div>
              <div className="font-medium">{categoryLabel[row.category] ?? row.category}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">الحالة</div>
              <div className="font-medium">{statusLabel[row.status] ?? row.status}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">تاريخ الإنشاء</div>
              <div className="font-medium">{row.created_at}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">آخر تحديث</div>
              <div className="font-medium">{row.updated_at}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#64748B]">اسم المستفيد</div>
              <div className="font-medium">{row.beneficiary_name ?? 'غير معروف'}</div>
              <div className="text-xs text-[#64748B]">البريد الإلكتروني</div>
              <div className="font-medium">{row.beneficiary_email ?? '-'}</div>
            </div>

            <div>
              <div className="text-xs text-[#64748B]">اسم الأخصائي المسؤول</div>
              <div className="font-medium">{row.specialist_name ?? 'غير معين'}</div>
              <div className="text-xs text-[#64748B]">البريد الإلكتروني للأخصائي</div>
              <div className="font-medium">{row.specialist_email ?? '-'}</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-[#17345F] mb-2">إدارة الإسناد</h4>
            {/* AssignSpecialist is a client component */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <AssignSpecialist
              requestId={row.id}
              currentAssignedId={row.specialist_id ?? null}
              specialists={specialists}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
