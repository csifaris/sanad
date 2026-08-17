"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const QUICK_LOGIN_USERS = [
  {
    label: "مستفيد",
    email: process.env.NEXT_PUBLIC_SANAD_DEMO_BENEFICIARY_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_SANAD_DEMO_PASSWORD ?? "",
  },
  {
    label: "أخصائي",
    email: process.env.NEXT_PUBLIC_SANAD_DEMO_SPECIALIST_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_SANAD_DEMO_PASSWORD ?? "",
  },
  {
    label: "مشرف",
    email: process.env.NEXT_PUBLIC_SANAD_DEMO_SUPERVISOR_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_SANAD_DEMO_PASSWORD ?? "",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submitLogin(e: string, p: string) {
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: e, password: p }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push(data.redirect);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitLogin(email, password);
  }

  function quickLogin(e: string, p: string) {
    setEmail(e);
    setPassword(p);
    submitLogin(e, p);
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/images/login-background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      {/* actual image element to ensure the photo loads and covers */}
      <img src="/images/login-background.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />

      {/* very subtle overlay to improve readability (<=15% opacity) */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(8,25,50,0.10)' }} />

      <div className="relative z-10 w-full max-w-[480px] mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="inline-block bg-white/25 backdrop-blur-sm px-4 py-1 rounded text-4xl font-heading font-bold text-white tracking-wide">سند</h1>
          <p className="mt-2 text-white/90 text-sm">منصة الدعم الاجتماعي</p>
        </div>

        {/* Glass card */}
        <div
          className="mx-auto rounded-[24px] shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(23,45,82,0.12)',
            padding: '28px',
            backdropFilter: 'blur(12px) saturate(120%)',
          }}
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-right text-2xl font-semibold" style={{ color: '#172D52' }}>تسجيل الدخول</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#64748B] mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل البريد الإلكتروني"
                  required
                  dir="rtl"
                  style={{
                    background: 'rgba(239,246,255,0.85)',
                    border: '1px solid rgba(23,45,82,0.08)',
                    borderRadius: '12px',
                    height: '48px',
                    padding: '0 14px',
                  }}
                  className="w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#2FAE9E] transition"
                />
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-1.5">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  dir="rtl"
                  style={{
                    background: 'rgba(239,246,255,0.85)',
                    border: '1px solid rgba(23,45,82,0.08)',
                    borderRadius: '12px',
                    height: '48px',
                    padding: '0 14px',
                  }}
                  className="w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#2FAE9E] transition"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ background: '#172D52' }}
                className="w-full text-white rounded-[12px] py-3 text-sm font-medium hover:opacity-95 transition disabled:opacity-60 mt-2"
              >
                {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              </button>
            </form>

            {/* Register */}
            <div className="pt-4">
              <p className="text-sm text-center text-[#64748B] mb-3">ليس لديك حساب؟</p>
              <Link href="/register" className="w-full block text-center bg-[#2FAE9E] text-white rounded-[12px] py-3 text-sm font-medium hover:opacity-95 transition">
                إنشاء حساب جديد
              </Link>
            </div>

            {/* Quick login */}
            <div className="pt-4">
              <p className="text-xs text-center text-[#64748B] mb-3">دخول سريع — للعرض التجريبي</p>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_LOGIN_USERS.map(({ label, email: e, password: p }) => (
                  <button
                    key={label}
                    onClick={() => quickLogin(e, p)}
                    disabled={loading || !e || !p}
                    className="bg-white/90 border border-[#172D52] text-[#172D52] text-sm rounded-[10px] py-2 transition disabled:opacity-60"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
