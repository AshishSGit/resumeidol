"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, FileText, LayoutDashboard, Menu, X, LogOut, Crown, ChevronDown, User as UserIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/search", label: "Job Search", icon: Search },
  { href: "/tailor", label: "Resume Tailor", icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [planLabel, setPlanLabel] = useState("Free — 1 tailor");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handle = () => {
      setScrolled(window.scrollY > 10);
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const res = await fetch("/api/pro-status");
        const { isPro, plan } = await res.json();
        setIsPro(isPro);
        setPlanLabel(
          plan === "lifetime" ? "✦ Lifetime — unlimited" :
          plan === "pro"      ? "✦ Pro — unlimited" :
          plan === "starter"  ? "Starter — 8/month" :
                                "Free — 1 tailor"
        );
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const res = await fetch("/api/pro-status");
        const { isPro, plan } = await res.json();
        setIsPro(isPro);
        setPlanLabel(
          plan === "lifetime" ? "✦ Lifetime — unlimited" :
          plan === "pro"      ? "✦ Pro — unlimited" :
          plan === "starter"  ? "Starter — 8/month" :
                                "Free — 1 tailor"
        );
      } else {
        setIsPro(false);
        setPlanLabel("Free — 1 tailor");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsPro(false);
    router.push("/");
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(7,9,15,0.92)" : "rgba(7,9,15,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] transition-all duration-150"
        style={{
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #DEC27A, #C9A84C)",
          opacity: scrollProgress > 0 ? 1 : 0,
        }}
      />
      <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between" style={{ height: "60px" }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #B8952F)",
              boxShadow: "0 0 16px rgba(201,168,76,0.35)",
            }}
          >
            <Crown size={18} className="text-[#07090F]" strokeWidth={2.5} />
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

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                style={{ color: active ? "#DEC27A" : "#6B7A99" }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={15} />
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {(isPro || planLabel.startsWith("Starter")) && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={isPro
                    ? { background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#DEC27A" }
                    : { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
                  <Crown size={11} />
                  {isPro ? "Pro" : "Starter"}
                </div>
              )}
              {/* Account dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#DEC27A] px-3 py-2 rounded-lg transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <UserIcon size={13} />
                  <span className="max-w-[130px] truncate">{user.email}</span>
                  <ChevronDown size={11} className={`transition-transform ${accountOpen ? "rotate-180" : ""}`} />
                </button>
                {accountOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl p-1 z-50"
                    style={{ background: "#0D1018", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}
                  >
                    <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                      <p className="text-xs text-[#6B7A99] mb-0.5">Signed in as</p>
                      <p className="text-sm text-[#F0F2F7] truncate font-medium">{user.email}</p>
                      <p className="text-xs mt-1.5" style={{ color: isPro ? "#DEC27A" : "#6B7A99" }}>
                        {planLabel}
                      </p>
                    </div>
                    {!isPro && (
                      <Link
                        href="/#pricing"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs rounded-lg transition-colors hover:bg-[rgba(201,168,76,0.08)]"
                        style={{ color: "#C9A84C" }}
                      >
                        <Crown size={12} />
                        Upgrade to Pro
                      </Link>
                    )}
                    <button
                      onClick={() => { setAccountOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#6B7A99] hover:text-[#9CA3AF] rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      <LogOut size={12} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/signin" className="btn-ghost text-sm px-4 py-2 rounded-lg">
                Sign in
              </Link>
              <Link href="/tailor" className="btn-gold text-sm px-5 py-2 rounded-lg">
                Start Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[#6B7A99] hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-[rgba(255,255,255,0.05)]"
          style={{ background: "rgba(7,9,15,0.97)" }}
        >
          <div className="px-6 py-4 flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    color: active ? "#DEC27A" : "#9CA3AF",
                    background: active ? "rgba(201,168,76,0.08)" : "transparent",
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
            {user ? (
              <>
                <div className="px-4 py-2 text-xs text-[#6B7A99] flex items-center gap-2">
                  {isPro && <Crown size={11} className="text-[#C9A84C]" />}
                  {user.email}
                </div>
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#6B7A99] hover:text-white transition-all"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="btn-gold text-sm px-5 py-3 rounded-xl text-center mt-2 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Sign in →
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
