"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#07090F" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
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

      <div className="card p-8 w-full max-w-sm">
        {sent ? (
          <div className="text-center py-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <CheckCircle size={26} className="text-[#22c55e]" />
            </div>
            <h2
              className="text-[#F0F2F7] font-semibold text-lg mb-2"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Check your inbox
            </h2>
            <p className="text-[#6B7A99] text-sm leading-relaxed">
              We sent a magic link to{" "}
              <span className="text-[#DEC27A] font-medium">{email}</span>.
              Click it to sign in — no password needed.
            </p>
          </div>
        ) : (
          <>
            <h1
              className="text-[#F0F2F7] font-semibold text-xl mb-1"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Sign in
            </h1>
            <p className="text-[#6B7A99] text-sm mb-6">
              Enter your email and we&apos;ll send you a magic link.
            </p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs text-[#6B7A99] mb-1.5 block">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151] pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-[#f87171]">
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-gold w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Send magic link
              </button>
            </form>

            <p className="text-center text-xs text-[#374151] mt-5">
              By signing in you agree to our{" "}
              <Link href="/terms" className="text-[#6B7A99] hover:text-[#9CA3AF]">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#6B7A99] hover:text-[#9CA3AF]">
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
