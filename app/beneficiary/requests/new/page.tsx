import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import NewRequestForm from "./NewRequestForm";

export default async function NewRequestPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Middleware also guards role, but double-check server-side
  if (session.role !== "beneficiary") redirect("/beneficiary");

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
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 pt-6 pb-16 relative z-10">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-heading font-bold text-[#17345F]">إنشاء طلب جديد</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <NewRequestForm />
          </div>
        </div>
      </main>

    </div>
  );
}
