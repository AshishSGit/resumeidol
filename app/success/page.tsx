"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Target, ArrowRight, Zap } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const plan = params.get("plan") ?? "pro";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/checkout?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paid) {
          // Store pro status in localStorage
          localStorage.setItem("resumeidol_pro", "true");
          localStorage.setItem("resumeidol_plan", plan);
          if (data.email) {
            localStorage.setItem("resumeidol_email", data.email);
            setEmail(data.email);
          }
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId, plan]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 text-[#6B7A99]">
        <Loader2 size={40} className="animate-spin text-[#C9A84C]" />
        <p>Verifying your payment…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center">
        <p className="text-[#F0F2F7] text-lg mb-2">Something went wrong verifying your payment.</p>
        <p className="text-[#6B7A99] text-sm mb-6">
          Your payment may still have succeeded. Check your email for a receipt from Stripe,
          then <a href="mailto:hello@resumeidol.com" className="text-[#C9A84C] hover:underline">contact us</a> and we will sort it out.
        </p>
        <Link href="/" className="btn-ghost px-6 py-2.5 rounded-xl text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  const isLifetime = plan === "lifetime";

  return (
    <div className="text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
      >
        <CheckCircle size={36} className="text-[#22c55e]" />
      </div>

      <div className="badge-gold mb-4 mx-auto w-fit">
        <Zap size={11} />
        <span>{isLifetime ? "Lifetime Access" : "Pro Activated"}</span>
      </div>

      <h1
        className="text-[#F0F2F7] mb-3"
        style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700 }}
      >
        You&apos;re in. Welcome to{" "}
        <span className="text-gold-gradient">ResumeIdol {isLifetime ? "Lifetime" : "Pro"}.</span>
      </h1>

      {email && (
        <p className="text-[#6B7A99] text-sm mb-2">
          Receipt sent to <span className="text-[#DEC27A]">{email}</span>
        </p>
      )}

      <p className="text-[#6B7A99] mb-10 max-w-md mx-auto">
        {isLifetime
          ? "You now have unlimited resume tailoring, forever. No renewals, no expiry."
          : "You now have unlimited resume tailoring every month. Start landing more interviews."}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/tailor"
          className="btn-gold px-8 py-3.5 rounded-xl text-base flex items-center gap-2"
        >
          <Zap size={16} />
          Tailor Your Resume Now
          <ArrowRight size={16} />
        </Link>
        <Link href="/search" className="btn-ghost px-8 py-3.5 rounded-xl text-base">
          Search Jobs
        </Link>
      </div>

      <div
        className="mt-12 rounded-2xl p-6 text-left max-w-sm mx-auto"
        style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}
      >
        <p className="text-[#DEC27A] text-xs font-semibold uppercase tracking-widest mb-3">
          What&apos;s unlocked
        </p>
        <ul className="space-y-2">
          {(isLifetime
            ? [
                "Unlimited AI resume tailoring — forever",
                "ATS score + keyword gap analysis",
                "DOCX + PDF download",
                "Word-level diff comparison",
                "All future Pro features included",
              ]
            : [
                "Unlimited AI resume tailoring / month",
                "ATS score + keyword gap analysis",
                "DOCX + PDF download",
                "Word-level diff comparison",
              ]
          ).map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-[#9CA3AF]">
              <CheckCircle size={14} className="text-[#C9A84C] shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#07090F" }}>
      {/* Minimal nav */}
      <nav className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)" }}
          >
            <Target size={16} className="text-[#07090F]" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: "Playfair Display, serif",
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "#F0F2F7",
            }}
          >
            ResumeIdol
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-xl">
          <Suspense
            fallback={
              <div className="flex justify-center">
                <Loader2 size={32} className="animate-spin text-[#C9A84C]" />
              </div>
            }
          >
            <SuccessContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
