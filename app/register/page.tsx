"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1..4
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    // Redirect to dashboard after successful registration
    router.push(data.redirect);
  }

  function nextStep() {
    setError("");
    if (step === 1) {
      if (!fullName.trim()) {
        setError("الرجاء إدخال الاسم الكامل");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!email.trim()) {
        setError("الرجاء إدخال البريد الإلكتروني");
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (password.length < 6) {
        setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
        return;
      }
      if (password !== confirmPassword) {
        setError("كلمة المرور وتأكيدها لا يتطابقان");
        return;
      }
      setStep(4);
      return;
    }
  }

  function prevStep() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  const steps = [
    { pct: '20%', label: 'الاسم الكامل' },
    { pct: '50%', label: 'البريد الإلكتروني' },
    { pct: '80%', label: 'كلمة المرور' },
    { pct: '100%', label: 'تأكيد الحساب' },
  ];

  return (
      <div className="register-page min-h-screen flex items-center justify-center p-6" style={{ backgroundImage: "linear-gradient(135deg, rgba(16,42,76,0.55), rgba(23,52,95,0.45)), url('/images/login-background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {/* decorative abstract SVG shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <svg className="w-full h-full" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="1440" height="720" fill="none" />
                    <polygon points="0,0 420,0 220,220" fill="#102A4C" opacity="0.06" />
                    <polygon points="350,0 760,0 540,220" fill="#17345F" opacity="0.05" />
                    <polygon points="720,0 1100,0 900,220" fill="#2FAE9E" opacity="0.04" />
                    <polygon points="1000,0 1300,0 1120,200" fill="#D9E8F2" opacity="0.04" />
        </svg>
      </div>

      <div className="relative z-20 max-w-5xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Left: progress (hidden on small) */}
          <aside className="hidden md:block md:col-span-1">
            <div className="text-right mb-6" style={{ color: '#FFFFFF' }}>
                          <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>إنشاء حساب جديد</h1>
                            <p className="mt-2 text-sm" style={{ color: '#D9E8F2' }}>أنشئ حسابك في منصة سند</p>
            </div>

            <div className="bg-transparent p-4">
              <ul className="space-y-6">
                {steps.map((s, i) => {
                  const idx = i + 1;
                  const completed = step > idx;
                  const active = step === idx;
                  return (
                    <li key={s.label} className="flex items-start gap-3">
                      <div className="w-12 text-right">
                        <div className={`text-sm progress-perc ${active ? 'font-bold' : ''}`}>{s.pct}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${completed ? 'bg-[#2FAE9E]' : active ? 'bg-white ring-2 ring-[#2FAE9E]' : 'bg-[#D9E8F2]'}`} />
                          <div className={`step-label ${active ? 'text-white font-semibold' : ''}`}>{s.label}</div>
                        </div>
                        <div className="h-12 ml-2">
                          {/* vertical connector */}
                          {i < steps.length - 1 && (
                                                      <div style={{ width: 2, height: 48, background: step > idx ? '#2FAE9E' : 'rgba(217,232,242,0.30)' }} />
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Right: form card */}
          <div className="md:col-span-2">
            <div className="max-w-xl mx-auto register-card p-8 rounded-[20px]" >
              <div className="text-right mb-4">
                <h2 className="text-2xl font-bold" style={{ color: '#17345F' }}>{step === 4 ? 'تأكيد الحساب' : 'إنشاء حساب جديد'}</h2>
                              <p className="text-sm" style={{ color: '#D9E8F2' }}>{step === 1 && 'أدخل اسمك الكامل'}{step === 2 && 'أدخل بريدك الإلكتروني'}{step === 3 && 'أنشئ كلمة مرور آمنة'}{step === 4 && 'أكمل بيانات حسابك'}</p>
              </div>

              <form onSubmit={handleSubmit} dir="rtl">
                {/* Step content */}
                {step === 1 && (
                  <div className="space-y-4">
                    <label className="block text-sm text-[#64748B]">الاسم الكامل</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      required
                                          className="w-full bg-[#EAF2FF] border border-[#D9E8F2] rounded-xl px-4 py-3 text-sm text-[#17345F] focus:outline-none focus:ring-2 focus:ring-[#2FAE9E] transition"
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <label className="block text-sm text-[#64748B]">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني"
                      required
                                          className="w-full bg-[#EAF2FF] border border-[#D9E8F2] rounded-xl px-4 py-3 text-sm text-[#17345F] focus:outline-none focus:ring-2 focus:ring-[#2FAE9E] transition"
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <label className="block text-sm text-[#64748B]">كلمة المرور</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة مرور قوية"
                      required
                                          className="w-full bg-[#EAF2FF] border border-[#D9E8F2] rounded-xl px-4 py-3 text-sm text-[#17345F] focus:outline-none focus:ring-2 focus:ring-[#2FAE9E] transition"
                    />
                    <label className="block text-sm text-[#64748B]">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور"
                      required
                                          className="w-full bg-[#EAF2FF] border border-[#D9E8F2] rounded-xl px-4 py-3 text-sm text-[#17345F] focus:outline-none focus:ring-2 focus:ring-[#2FAE9E] transition"
                    />
                    <p className="text-xs text-[#64748B]">يجب أن تكون على الأقل 6 أحرف</p>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="bg-white border border-[#E2E8EE] rounded-lg p-4">
                      <div className="text-sm text-[#64748B]">الاسم الكامل</div>
                      <div className="font-medium text-[#17345F]">{fullName || '—'}</div>
                    </div>
                    <div className="bg-white border border-[#E2E8EE] rounded-lg p-4">
                      <div className="text-sm text-[#64748B]">البريد الإلكتروني</div>
                      <div className="font-medium text-[#17345F]">{email || '—'}</div>
                    </div>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                <div className="mt-6 flex items-center gap-3">
                  {step > 1 && (
                    <button type="button" onClick={prevStep} className="btn btn-secondary">
                      السابق
                    </button>
                  )}

                  {step < 4 ? (
                    <button type="button" onClick={nextStep} className="btn btn-primary ml-auto">
                      التالي
                    </button>
                  ) : (
                    <button type="submit" disabled={loading} className="btn btn-navy ml-auto">
                      {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center">
                              <p className="text-sm" style={{ color: '#64748B' }}>لديك حساب بالفعل؟ <Link href="/login" className="text-[#2FAE9E] font-medium">تسجيل الدخول</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{` 
        .register-card { 
                  background: #FFFFFF; 
          border: 1px solid rgba(255,255,255,0.8) !important; 
          border-radius: 20px; 
          box-shadow: 0 15px 40px rgba(16,42,76,0.30) !important; 
        }
        .register-card input::placeholder { color: #94A3B8; }
        .register-page .btn-primary:hover { background: #247F79 !important; }
                .progress-perc { color: #D9E8F2; }
                .step-label { color: #FFFFFF; }
        @media (max-width: 768px) { .progress-perc { color: #D9E8F2; } }
      `}</style>

    </div>
  );
}

