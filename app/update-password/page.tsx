"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#07090F" }}>
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)" }}
        >
          <Crown size={16} className="text-[#07090F]" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.2rem", color: "#F0F2F7" }}>
          ResumeIdol
        </span>
      </Link>

      <div className="card p-8 w-full max-w-sm">
        {done ? (
          <div className="text-center py-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <CheckCircle size={26} className="text-[#22c55e]" />
            </div>
            <h2 className="text-[#F0F2F7] font-semibold text-lg mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
              Password updated
            </h2>
            <p className="text-[#6B7A99] text-sm mb-6">Your new password has been saved.</p>
            <Link
              href="/tailor"
              className="btn-gold inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              Go to app →
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-[#F0F2F7] font-semibold text-xl mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
              Set new password
            </h1>
            <p className="text-[#6B7A99] text-sm mb-6">Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordField
                label="New password"
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                placeholder="At least 8 characters"
                autoFocus
              />
              <PasswordField
                label="Confirm password"
                value={confirm}
                onChange={setConfirm}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                placeholder="Repeat your password"
              />

              {error && (
                <div className="flex items-center gap-2 text-xs text-[#f87171]">
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Update password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle, placeholder, autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-[#6B7A99] mb-1.5 block">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151] pointer-events-none" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required
          autoFocus={autoFocus}
          className="input-luxury w-full pl-10 pr-10 py-3 text-sm"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#374151] hover:text-[#6B7A99]"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}
