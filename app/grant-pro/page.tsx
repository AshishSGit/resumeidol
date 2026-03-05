"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Crown, CheckCircle, XCircle } from "lucide-react";

function GrantProInner() {
  const searchParams = useSearchParams();
  const secret = searchParams.get("key");
  const [status, setStatus] = useState<"checking" | "success" | "fail">("checking");

  useEffect(() => {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (adminKey && secret === adminKey) {
      localStorage.setItem("resumeidol_pro", "true");
      setStatus("success");
    } else {
      setStatus("fail");
    }
  }, [secret]);

  if (status === "checking") return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#07090F" }}>
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)" }}>
          <Crown size={16} className="text-[#07090F]" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.2rem", color: "#F0F2F7" }}>
          ResumeIdol
        </span>
      </Link>

      {status === "success" ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle size={28} className="text-[#22c55e]" />
          </div>
          <h1 className="text-[#F0F2F7] text-xl font-semibold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
            Pro access granted
          </h1>
          <p className="text-[#6B7A99] text-sm mb-8">
            This browser now has unlimited resume tailoring.
          </p>
          <Link href="/tailor" className="btn-gold px-8 py-3 rounded-xl text-sm font-semibold">
            Go to Resume Tailor
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <XCircle size={28} className="text-[#ef4444]" />
          </div>
          <h1 className="text-[#F0F2F7] text-xl font-semibold mb-2">Invalid key</h1>
          <p className="text-[#6B7A99] text-sm mb-8">That link isn&apos;t valid.</p>
          <Link href="/" className="text-[#C9A84C] text-sm hover:underline">← Back to home</Link>
        </div>
      )}
    </div>
  );
}

export default function GrantProPage() {
  return (
    <Suspense fallback={null}>
      <GrantProInner />
    </Suspense>
  );
}
