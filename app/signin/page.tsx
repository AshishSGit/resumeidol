"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Mode = "signin" | "signup" | "forgot" | "magic" | "sent_magic" | "sent_signup" | "sent_reset";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const reset = (nextMode: Mode) => {
    setError(null);
    setMode(nextMode);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://resumeidol.com/auth/callback",
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        window.location.href = "/tailor";
      } else {
        // Email confirmation required
        setMode("sent_signup");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
          setError("Incorrect email or password. Try again or use magic link.");
        } else {
          setError(error.message);
        }
      } else {
        window.location.href = "/tailor";
      }
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: "https://resumeidol.com/auth/callback" },
    });
    if (error) setError(error.message);
    else setMode("sent_magic");
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://resumeidol.com/auth/callback?next=/update-password",
    });
    if (error) setError(error.message);
    else setMode("sent_reset");
    setLoading(false);
  };

  // ── Sent states ─────────────────────────────────────────────────────────────
  if (mode === "sent_magic" || mode === "sent_signup" || mode === "sent_reset") {
    const headlines: Record<string, string> = {
      sent_magic: "Check your inbox",
      sent_signup: "Confirm your email",
      sent_reset: "Check your inbox",
    };
    const messages: Record<string, string> = {
      sent_magic: " Click it to sign in — no password needed.",
      sent_signup: " Click the confirmation link to activate your account, then sign in.",
      sent_reset: " Click it to choose a new password.",
    };
    const prefix: Record<string, string> = {
      sent_magic: "We sent a magic link to ",
      sent_signup: "We sent a confirmation email to ",
      sent_reset: "We sent a password reset link to ",
    };
    return (
      <Shell>
        <div className="text-center py-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <CheckCircle size={26} className="text-[#22c55e]" />
          </div>
          <h2 className="text-[#F0F2F7] font-semibold text-lg mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
            {headlines[mode]}
          </h2>
          <p className="text-[#6B7A99] text-sm leading-relaxed">
            {prefix[mode]}
            <span className="text-[#DEC27A] font-medium">{email}</span>.
            {messages[mode]}
          </p>
          <p className="text-[#4B5563] text-xs mt-3">Don&apos;t see it? Check your spam folder.</p>
          <button onClick={() => reset("signin")} className="mt-6 text-xs text-[#6B7A99] hover:text-[#9CA3AF] underline underline-offset-2">
            Back to sign in
          </button>
        </div>
      </Shell>
    );
  }

  // ── Forgot password ──────────────────────────────────────────────────────────
  if (mode === "forgot") {
    return (
      <Shell>
        <h1 className="text-[#F0F2F7] font-semibold text-xl mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
          Reset password
        </h1>
        <p className="text-[#6B7A99] text-sm mb-6">
          Enter your email and we&apos;ll send a reset link.
        </p>
        <form onSubmit={handleForgot} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} />
          <ErrorMsg error={error} />
          <SubmitBtn loading={loading} label="Send reset link" />
        </form>
        <button onClick={() => reset("signin")} className="mt-5 w-full text-xs text-center text-[#6B7A99] hover:text-[#9CA3AF]">
          ← Back to sign in
        </button>
      </Shell>
    );
  }

  // ── Magic link ───────────────────────────────────────────────────────────────
  if (mode === "magic") {
    return (
      <Shell>
        <h1 className="text-[#F0F2F7] font-semibold text-xl mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
          Magic link
        </h1>
        <p className="text-[#6B7A99] text-sm mb-6">
          We&apos;ll email you a one-click sign-in link — no password needed.
        </p>
        <form onSubmit={handleMagicLink} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} />
          <ErrorMsg error={error} />
          <SubmitBtn loading={loading} label="Send magic link" />
        </form>
        <button onClick={() => reset("signin")} className="mt-5 w-full text-xs text-center text-[#6B7A99] hover:text-[#9CA3AF]">
          ← Use email &amp; password instead
        </button>
        <TosLine />
      </Shell>
    );
  }

  // ── Sign in / Sign up ────────────────────────────────────────────────────────
  const isSignup = mode === "signup";

  return (
    <Shell>
      <h1 className="text-[#F0F2F7] font-semibold text-xl mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
        {isSignup ? "Create account" : "Welcome back"}
      </h1>
      <p className="text-[#6B7A99] text-sm mb-6">
        {isSignup ? "Start tailoring resumes for free." : "Sign in to your ResumeIdol account."}
      </p>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#E8EAF0",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
      >
        {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-xs text-[#4B5563]">or</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Email + Password form */}
      <form onSubmit={handlePasswordAuth} className="space-y-3">
        <EmailField email={email} setEmail={setEmail} />

        {/* Password */}
        <div>
          <label className="text-xs text-[#6B7A99] mb-1.5 block">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151] pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isSignup ? "Choose a password (8+ chars)" : "Your password"}
              required
              minLength={isSignup ? 8 : 1}
              className="input-luxury w-full pl-10 pr-10 py-3 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#374151] hover:text-[#6B7A99]"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <ErrorMsg error={error} />

        <SubmitBtn loading={loading} label={isSignup ? "Create account" : "Sign in"} />
      </form>

      {/* Footer links */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#4B5563]">
        {!isSignup && (
          <button onClick={() => reset("forgot")} className="hover:text-[#6B7A99] transition-colors">
            Forgot password?
          </button>
        )}
        <button
          onClick={() => reset(isSignup ? "signin" : "signup")}
          className="hover:text-[#6B7A99] transition-colors ml-auto"
        >
          {isSignup ? "Have an account? Sign in" : "New here? Create account"}
        </button>
      </div>

      <div className="mt-3 text-center">
        <button onClick={() => reset("magic")} className="text-xs text-[#4B5563] hover:text-[#6B7A99] transition-colors">
          Use magic link instead →
        </button>
      </div>

      <TosLine />
    </Shell>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
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
      <div className="card p-8 w-full max-w-sm">{children}</div>
    </div>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-[#6B7A99] mb-1.5 block">Email address</label>
      <div className="relative">
        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151] pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
          className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
        />
      </div>
    </div>
  );
}

function ErrorMsg({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-[#f87171]">
      <AlertCircle size={13} />
      {error}
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-gold w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {label}
    </button>
  );
}

function TosLine() {
  return (
    <p className="text-center text-xs text-[#374151] mt-5">
      By continuing you agree to our{" "}
      <Link href="/terms" className="text-[#6B7A99] hover:text-[#9CA3AF]">Terms</Link>{" "}
      and{" "}
      <Link href="/privacy" className="text-[#6B7A99] hover:text-[#9CA3AF]">Privacy Policy</Link>.
    </p>
  );
}
