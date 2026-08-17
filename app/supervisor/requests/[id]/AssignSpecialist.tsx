"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Specialist = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  requestId: number;
  currentAssignedId: number | null;
  specialists: Specialist[];
};

export default function AssignSpecialist({ requestId, currentAssignedId, specialists }: Props) {
  const [selected, setSelected] = useState<string>(currentAssignedId ? String(currentAssignedId) : '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    if (loading) return;
    setError(null);
    setMessage(null);
    if (!selected) {
      setError('يرجى اختيار أخصائي');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/supervisor/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialistId: Number(selected) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'حدث خطأ أثناء الإسناد');
        setLoading(false);
        return;
      }
      setMessage('تم إسناد الطلب بنجاح');
      setTimeout(() => {
        router.refresh();
      }, 300);
    } catch (e) {
      console.error('Assign error', e);
      setError('فشل الإتصال. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="text-xs text-gray-500 mb-2">الأخصائي المسؤول</div>
      <div className="flex gap-3 items-center">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border rounded-xl px-3 py-2"
        >
          <option value="">-- اختر أخصائي --</option>
          {specialists.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.email}
            </option>
          ))}
        </select>

        <button
          onClick={submit}
          disabled={loading}
          className="bg-teal text-white rounded-xl py-2.5 px-4 text-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'جاري الإسناد...' : 'إسناد الطلب'}
        </button>
      </div>

      {message && <div className="text-green-600 mt-3">{message}</div>}
      {error && <div className="text-red-600 mt-3">{error}</div>}
    </div>
  );
}
