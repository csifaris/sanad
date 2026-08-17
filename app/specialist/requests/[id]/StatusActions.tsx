"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  requestId: number;
  status: string;
  assignedSpecialistId: number | null;
  currentSpecialistId: number;
};

export default function StatusActions({ requestId, status, assignedSpecialistId, currentSpecialistId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  function canAccept() {
    return status === "new";
  }

  function canComplete() {
    return status === "in_review" && assignedSpecialistId === currentSpecialistId;
  }

  async function postStatus(target: string) {
    if (loading) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/specialist/requests/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "حدث خطأ");
        setLoading(false);
        return;
      }

      // Show contextual success message
      if (target === "in_review") setMessage("تم استلام الطلب بنجاح");
      else if (target === "resolved") setMessage("تم إكمال الطلب بنجاح");

      // Refresh server component data
      setTimeout(() => {
        router.refresh();
      }, 300);
    } catch (err) {
      console.error("Status update error:", err);
      setMessage("فشل تحديث الحالة. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      {message && <div className="text-green-600 mb-3">{message}</div>}

      <div className="flex gap-3 justify-end">
        {canAccept() && (
          <button
            onClick={() => postStatus("in_review")}
            disabled={loading}
            className="bg-teal text-white rounded-xl py-2.5 px-4 text-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "جاري..." : "استلام الطلب"}
          </button>
        )}

        {canComplete() && (
          <button
            onClick={() => postStatus("resolved")}
            disabled={loading}
            className="bg-navy text-white rounded-xl py-2.5 px-4 text-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "جاري..." : "إكمال الطلب"}
          </button>
        )}

        {status === "resolved" && (
          <div className="text-green-600 font-medium">تم إكمال الطلب</div>
        )}
      </div>
    </div>
  );
}
