"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown, Mail, Lock, Eye, EyeOff, Loader2,
  CheckCircle, AlertCircle,
} from "lucide-react";
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

// ── Mini SVG score ring ──────────────────────────────────────────────────────
function MiniScoreRing({ score, size = 96, gold = false }: { score: number; size?: number; gold?: boolean }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={gold ? "#C9A84C" : "#2A3040"}
          strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={gold ? { filter: "drop-shadow(0 0 8px rgba(201,168,76,0.65))" } : {}}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: size * 0.24, fontWeight: 700, color: gold ? "#DEC27A" : "#4B5563" }}>
          {score}
        </span>
      </div>
    </div>
  );
}

// ── Left showcase panel ───────────────────────────────────────────────────────
function ShowcasePanel() {
  const stats = [
    { icon: "✦", label: "Keywords injected", value: "+28" },
    { icon: "🛡", label: "ATS compatibility",  value: "94%"   },
    { icon: "▲", label: "Score lift",          value: "+42 pts" },
  ];

  return (
    <div
      className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{ background: "#07090F", borderRight: "1px solid rgba(201,168,76,0.08)" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(201,168,76,0.14) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: 0.5,
        }}
      />
      {/* Gold bloom */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.11) 0%, transparent 65%)" }}
      />
      {/* Purple accent bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }}
      />

      {/* Logo */}
      <div className="flex items-center gap-2.5 relative z-10">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)", boxShadow: "0 0 16px rgba(201,168,76,0.35)" }}
        >
          <Crown size={15} style={{ color: "#07090F" }} strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.15rem", color: "#F0F2F7" }}>
          ResumeIdol
        </span>
      </div>

      {/* Score visualization + stats */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Before → After */}
        <div className="flex items-center gap-7 mb-2">
          <div className="text-center">
            <MiniScoreRing score={52} size={88} gold={false} />
            <p
              className="mt-2.5 font-semibold tracking-widest uppercase"
              style={{ fontSize: "0.58rem", color: "#3A4558", letterSpacing: "0.1em" }}
            >
              Before
            </p>
          </div>
          <div style={{ color: "#C9A84C", fontSize: "1.6rem", lineHeight: 1, opacity: 0.8 }}>→</div>
          <div className="text-center">
            <div className="relative">
              <div
                className="absolute inset-[-10px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%)" }}
              />
              <MiniScoreRing score={94} size={112} gold={true} />
            </div>
            <p
              className="mt-2.5 font-semibold tracking-widest uppercase"
              style={{ fontSize: "0.58rem", color: "#C9A84C", letterSpacing: "0.1em" }}
            >
              After
            </p>
          </div>
        </div>
        <p
          className="mb-9 tracking-widest uppercase"
          style={{ fontSize: "0.58rem", color: "#2A3040", letterSpacing: "0.14em" }}
        >
          ATS Match Score
        </p>

        {/* Stat cards */}
        {stats.map(({ icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.15, duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[268px] flex items-center justify-between px-4 py-2.5 rounded-xl mb-2.5"
            style={{
              background: "rgba(201,168,76,0.04)",
              border: "1px solid rgba(201,168,76,0.1)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs">{icon}</span>
              <span className="text-xs" style={{ color: "#6B7A99" }}>{label}</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "#DEC27A" }}>{value}</span>
          </motion.div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="relative z-10 pt-6 border-t border-[rgba(255,255,255,0.05)]">
        <p className="text-sm leading-relaxed" style={{ color: "#4B5563", fontStyle: "italic" }}>
          &ldquo;Got 3 interviews in a week. Score went from 58 to 96 on the first try.&rdquo;
        </p>
        <div className="flex items-center gap-2.5 mt-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.22)" }}
          >
            M
          </div>
          <span className="text-xs" style={{ color: "#374151" }}>Marcus L. — hired at Netflix</span>
        </div>
      </div>
    </div>
  );
}

// ── Shell (right side) ───────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: "#07090F" }}>
      <ShowcasePanel />
      <div className="flex flex-col items-center justify-center px-8 py-16 relative overflow-hidden">
        {/* Subtle right-side bloom */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 60%)" }}
        />

        {/* Logo with pulsing ring */}
        <Link href="/" className="flex items-center gap-3 mb-10 relative z-10">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 0 0px rgba(201,168,76,0.55)",
                  "0 0 0 10px rgba(201,168,76,0)",
                  "0 0 0 0px rgba(201,168,76,0)",
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #B8952F)",
                boxShadow: "0 0 24px rgba(201,168,76,0.5)",
              }}
            >
              <Crown size={18} className="text-[#07090F]" strokeWidth={2.5} />
            </div>
          </div>
          <span
            style={{
              fontFamily: "Playfair Display, serif",
              fontWeight: 700,
              fontSize: "1.35rem",
              color: "#F0F2F7",
              letterSpacing: "-0.01em",
            }}
          >
            ResumeIdol
          </span>
        </Link>

        <motion.div
          className="w-full max-w-[390px] relative z-10"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {children}
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-8 text-xs relative z-10"
          style={{ color: "#2A3040" }}
        >
          ✦ Trusted by{" "}
          <span style={{ color: "#4B5563" }}>2,847</span>{" "}
          job seekers this week
        </motion.p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SignInPage() {
  const [mode, setMode]               = useState<Mode>("signin");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);

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
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists. Sign in instead.");
        setLoading(false);
        return;
      } else if (data.session) {
        window.location.href = "/tailor";
      } else {
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

  // ── Stagger helper ──────────────────────────────────────────────────────────
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay, ease: "easeOut" as const },
  });

  // ── Sent states ─────────────────────────────────────────────────────────────
  if (mode === "sent_magic" || mode === "sent_signup" || mode === "sent_reset") {
    const headlines: Record<string, string> = {
      sent_magic:  "Check your inbox",
      sent_signup: "Confirm your email",
      sent_reset:  "Check your inbox",
    };
    const messages: Record<string, string> = {
      sent_magic:  " Click it to sign in — no password needed.",
      sent_signup: " Click the confirmation link to activate your account.",
      sent_reset:  " Click it to choose a new password.",
    };
    const prefix: Record<string, string> = {
      sent_magic:  "We sent a magic link to ",
      sent_signup: "We sent a confirmation email to ",
      sent_reset:  "We sent a password reset link to ",
    };
    return (
      <Shell>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 0 30px rgba(34,197,94,0.08)" }}
          >
            <CheckCircle size={28} className="text-[#22c55e]" />
          </motion.div>
          <h2
            className="text-[#F0F2F7] font-semibold text-xl mb-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {headlines[mode]}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#6B7A99" }}>
            {prefix[mode]}
            <span style={{ color: "#DEC27A", fontWeight: 500 }}>{email}</span>.
            {messages[mode]}
          </p>
          <p className="text-xs mt-3" style={{ color: "#374151" }}>
            Don&apos;t see it? Check your spam folder.
          </p>
          <button
            onClick={() => reset("signin")}
            className="mt-7 text-xs hover:text-[#9CA3AF] transition-colors underline underline-offset-2"
            style={{ color: "#6B7A99" }}
          >
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
        <motion.div {...fadeUp(0)} className="mb-7">
          <h1
            style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", fontWeight: 700, color: "#F0F2F7", marginBottom: "0.4rem" }}
          >
            Reset password
          </h1>
          <p className="text-sm" style={{ color: "#6B7A99" }}>
            Enter your email and we&apos;ll send a reset link.
          </p>
        </motion.div>
        <motion.form {...fadeUp(0.08)} onSubmit={handleForgot} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} />
          <ErrorMsg error={error} />
          <SubmitBtn loading={loading} label="Send reset link" />
        </motion.form>
        <motion.div {...fadeUp(0.16)}>
          <button
            onClick={() => reset("signin")}
            className="mt-5 w-full text-xs text-center hover:text-[#6B7A99] transition-colors"
            style={{ color: "#3A4558" }}
          >
            ← Back to sign in
          </button>
        </motion.div>
      </Shell>
    );
  }

  // ── Magic link ───────────────────────────────────────────────────────────────
  if (mode === "magic") {
    return (
      <Shell>
        <motion.div {...fadeUp(0)} className="mb-7">
          <h1
            style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", fontWeight: 700, color: "#F0F2F7", marginBottom: "0.4rem" }}
          >
            Magic link
          </h1>
          <p className="text-sm" style={{ color: "#6B7A99" }}>
            We&apos;ll email you a one-click sign-in — no password needed.
          </p>
        </motion.div>
        <motion.form {...fadeUp(0.08)} onSubmit={handleMagicLink} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} />
          <ErrorMsg error={error} />
          <SubmitBtn loading={loading} label="Send magic link" />
        </motion.form>
        <motion.div {...fadeUp(0.16)}>
          <button
            onClick={() => reset("signin")}
            className="mt-5 w-full text-xs text-center hover:text-[#6B7A99] transition-colors"
            style={{ color: "#3A4558" }}
          >
            ← Use email &amp; password instead
          </button>
        </motion.div>
        <motion.div {...fadeUp(0.2)}>
          <TosLine />
        </motion.div>
      </Shell>
    );
  }

  // ── Sign in / Sign up ────────────────────────────────────────────────────────
  const isSignup = mode === "signup";

  return (
    <Shell>
      {/* Heading */}
      <motion.div {...fadeUp(0)} className="mb-7">
        <h1
          style={{ fontFamily: "Playfair Display, serif", fontSize: "1.9rem", fontWeight: 700, color: "#F0F2F7", marginBottom: "0.4rem", letterSpacing: "-0.02em" }}
        >
          {isSignup ? "Create account" : "Welcome back."}
        </h1>
        <p className="text-sm" style={{ color: "#6B7A99" }}>
          {isSignup ? "Start tailoring resumes for free." : "Your next interview starts here."}
        </p>
      </motion.div>

      {/* Google — white button */}
      <motion.div {...fadeUp(0.07)}>
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-60 mb-5"
          style={{
            background: "rgba(255,255,255,0.96)",
            color: "#111827",
            boxShadow: "0 2px 16px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.1) inset",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.96)")}
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: "#111" }} />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div {...fadeUp(0.12)} className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-xs" style={{ color: "#3A4558" }}>or continue with email</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </motion.div>

      {/* Email + password form */}
      <motion.form {...fadeUp(0.16)} onSubmit={handlePasswordAuth} className="space-y-3.5">
        <EmailField email={email} setEmail={setEmail} />

        <div>
          <label className="text-xs mb-1.5 block" style={{ color: "#6B7A99" }}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#374151" }} />
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-[#6B7A99] transition-colors"
              style={{ color: "#374151" }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <ErrorMsg error={error} />
        <SubmitBtn loading={loading} label={isSignup ? "Create account →" : "Sign in →"} />
      </motion.form>

      {/* Footer links */}
      <motion.div {...fadeUp(0.22)} className="mt-4 flex items-center justify-between text-xs" style={{ color: "#3A4558" }}>
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
      </motion.div>

      <motion.div {...fadeUp(0.26)} className="mt-3 text-center">
        <button
          onClick={() => reset("magic")}
          className="text-xs hover:text-[#6B7A99] transition-colors"
          style={{ color: "#3A4558" }}
        >
          Use magic link instead →
        </button>
      </motion.div>

      <motion.div {...fadeUp(0.3)}>
        <TosLine />
      </motion.div>
    </Shell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs mb-1.5 block" style={{ color: "#6B7A99" }}>Email address</label>
      <div className="relative">
        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#374151" }} />
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
    <div className="flex items-center gap-2 text-xs" style={{ color: "#f87171" }}>
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
    <p className="text-center text-xs mt-5" style={{ color: "#2A3040" }}>
      By continuing you agree to our{" "}
      <Link href="/terms" className="hover:text-[#9CA3AF] transition-colors" style={{ color: "#4B5563" }}>Terms</Link>
      {" "}and{" "}
      <Link href="/privacy" className="hover:text-[#9CA3AF] transition-colors" style={{ color: "#4B5563" }}>Privacy Policy</Link>.
    </p>
  );
}
