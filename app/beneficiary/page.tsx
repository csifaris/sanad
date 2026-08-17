import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { getDb } from "@/lib/db";

export default async function BeneficiaryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const db = getDb();
  const stmt = db.prepare(
    `SELECT id, title, description, category, status, created_at, updated_at FROM requests WHERE beneficiary_id = ? ORDER BY created_at DESC`
  );
  const rows = stmt.all(session.id) as Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;

  const categoryLabel: Record<string, string> = {
    housing: "السكن",
    health: "الصحة",
    mental: "الدعم النفسي",
    marriage: "الزواج",
    education: "التعليم",
  };

  const statusLabel: Record<string, string> = {
    new: "جديد",
    in_review: "قيد المراجعة",
    resolved: "تم الحل",
  };

  // helper: category icon
  function CategoryIcon({ cat }: { cat: string }) {
    const common = { width: 28, height: 28 };
    // simple decorative icons with light teal background (#EEF9F7) and teal strokes
    if (cat === 'health') return (
      <svg {...common} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#EEF9F7" />
        <path d="M12 7v10M7 12h10" stroke="#2FAE9E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (cat === 'housing') return (
      <svg {...common} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#EEF9F7" />
        <path d="M3 12L12 4l9 8v6a1 1 0 0 1-1 1h-16a1 1 0 0 1-1-1v-6z" stroke="#2FAE9E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
    if (cat === 'mental') return (
      <svg {...common} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#EEF9F7" />
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="#2FAE9E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
    if (cat === 'marriage') return (
      <svg {...common} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#EEF9F7" />
        <path d="M7 12c0-2.5 2-4.5 5-1 3-3.5 5-1 5 1.5" stroke="#2FAE9E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
    // education default
    return (
      <svg {...common} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#EEF9F7" />
        <path d="M12 3l9 4-9 4-9-4 9-4zM3 11v5a2 2 0 002 2h14a2 2 0 002-2v-5" stroke="#2FAE9E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
  }

  function StatusBadge({ status }: { status: string }) {
    if (status === 'new') return (<span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#EEF6FF', color: '#17345F' }}>جديد</span>);
    if (status === 'in_review') return (<span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#FFF7E8', color: '#8A5A00' }}>قيد المراجعة</span>);
    if (status === 'resolved') return (<span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#E8F7F3', color: '#167568' }}>مكتمل</span>);
    return <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{status}</span>;
  }

  return (
    <div className="min-h-screen bg-[#F1F7F8] relative">
      {/* Geometric polygon header (behind the header, pointer-events none) */}
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

          {/* LEFT: large navy shape */}
          <polygon points="0,140 0,20 380,8" fill="#17345F" fillOpacity="0.9" />

          {/* LEFT-MID: light teal large */}
          <polygon points="220,140 480,24 660,140" fill="#DDF4F0" fillOpacity="0.74" />

          {/* CENTER: soft blue / light teal polygon */}
          <polygon points="560,140 760,10 980,140" fill="#BFD8E8" fillOpacity="0.86" />

          {/* CENTER-RIGHT: teal accent */}
          <polygon points="860,140 1040,28 1220,140" fill="#2FAE9E" fillOpacity="0.74" />

          {/* RIGHT: navy and blue-gray accents */}
          <polygon points="1160,140 1360,20 1440,140" fill="#17345F" fillOpacity="0.78" />
          <polygon points="1280,140 1420,50 1440,140" fill="#BFD8E8" fillOpacity="0.68" />

          {/* white negative space */}
          <polygon points="420,140 560,40 700,140" fill="#F1F7F8" fillOpacity="0.96" />

        </svg>
      </div>

      {/* Header sits above the geometric */}
      <header className="max-w-[1100px] mx-auto px-6 relative z-20 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-3xl font-heading font-bold text-[#17345F]">سند</h1>
            <p className="text-sm text-[#64748B]">منصة الدعم الاجتماعي</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#64748B]">مرحباً، {session.name}</span>
            <div className="logout-wrap">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .logout-wrap button {
              background: #FFFFFF;
              color: #17345F;
              border: 1px solid #D5E2E8;
              border-radius: 8px;
              padding: 7px 14px;
              font-size: 13px;
              font-weight: 500;
              box-shadow: 0 1px 2px rgba(16,42,76,0.04);
              transition: background 120ms ease, border-color 120ms ease, color 120ms ease, transform 120ms ease;
            }
            .logout-wrap button:hover {
              background: #EEF9F7;
              color: #17345F;
              border-color: #2FAE9E;
            }
            .logout-wrap button:active { transform: translateY(1px); }
          `,
        }}
      />
      <main className="max-w-[1100px] mx-auto px-6 pt-6 pb-16 relative z-10">
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[32px] font-bold text-[#17345F]">لوحة المستفيد</h2>
              <p className="mt-2 text-[15px] text-[#64748B]">مرحباً {session.name}</p>
            </div>
            <div>
              <a href="/beneficiary/requests/new" className="inline-flex items-center gap-2 bg-[#2FAE9E] text-white rounded-[12px] py-2.5 px-4 font-medium shadow-sm hover:bg-[#279f8b] transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                إنشاء طلب جديد
              </a>
            </div>
          </div>

          <section className="mt-6">
            <h3 className="text-[24px] font-bold text-[#17345F] mb-4">طلباتي</h3>

            {rows.length === 0 ? (
              <p className="text-[#64748B]">لا توجد طلبات حتى الآن</p>
            ) : (
              <div className="grid gap-3">
                {rows.map((r) => (
                  <a key={r.id} href={`/beneficiary/requests/${r.id}`} className="block bg-white rounded-[16px] p-6 shadow-sm border border-[#E5EAF0] hover:shadow-lg hover:-translate-y-1 transform transition" dir="rtl">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="bg-[#EEF9F7] rounded-[10px] p-2">
                          <CategoryIcon cat={r.category} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          {/* Right: title + category (text-right) */}
                          <div className="text-right min-w-0">
                            <h4 className="text-[17px] font-semibold text-[#17345F] truncate">{r.title}</h4>
                            <div className="mt-1 text-sm text-[#2FAE9E]">{categoryLabel[r.category] ?? r.category}</div>
                          </div>

                          {/* Left: status badge */}
                          <div className="flex-shrink-0">
                            <StatusBadge status={r.status} />
                          </div>
                        </div>

                        <p className="mt-4 text-[14px] leading-[1.8] text-[#64748B] line-clamp-4">{r.description}</p>

                        <div className="mt-4 text-[12px] text-[#94A3B8] flex items-center justify-between">
                          <div>تاريخ الإنشاء: <span className="text-[#17345F]">{r.created_at}</span></div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
