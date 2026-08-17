"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRequestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    // Basic client-side validation
    if (!title.trim()) {
      setError("عنوان الطلب مطلوب");
      return;
    }
    if (!description.trim()) {
      setError("وصف الطلب مطلوب");
      return;
    }
    if (!category) {
      setError("نوع الطلب مطلوب");
      return;
    }
    if (!priority) {
      setError("الأولوية مطلوبة");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), category, priority }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "حدث خطأ في الخادم");
        setLoading(false);
        return;
      }

      setSuccess("تم إنشاء الطلب بنجاح");

      // Small delay to let user see success
      setTimeout(() => router.push("/beneficiary"), 900);
    } catch (err) {
      console.error("Create request fetch error:", err);
      setError("فشل إرسال الطلب. حاول مرة أخرى.");
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push("/beneficiary");
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1.5">عنوان الطلب</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="أدخل عنوان الطلب"
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1.5">وصف الطلب</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="أدخل وصفاً مفصلاً لطلبك"
          required
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">نوع الطلب</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition bg-white"
          >
            <option value="">اختر النوع</option>
            <option value="housing">السكن</option>
            <option value="health">الصحة</option>
            <option value="mental">الدعم النفسي</option>
            <option value="marriage">الزواج</option>
            <option value="education">التعليم</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">الأولوية</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition bg-white"
          >
            <option value="">اختر الأولوية</option>
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-100 text-navy rounded-xl py-2.5 px-4 text-sm hover:opacity-90"
          disabled={loading}
        >
          إلغاء / العودة
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-navy text-white rounded-xl py-2.5 px-4 text-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "جاري الإرسال..." : "تقديم الطلب"}
        </button>
      </div>
    </form>
  );
}
