"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Menu, X, LogOut, Crown, ChevronDown } from "lucide-react";
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
              {/* Account dropdown */}
              <div className="relative" ref={accountRef}>
                {/* Avatar trigger */}
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-1.5 transition-all"
                  style={{ outline: "none" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.08))",
                      border: `1.5px solid ${accountOpen ? "rgba(201,168,76,0.55)" : "rgba(201,168,76,0.28)"}`,
                      color: "#DEC27A",
                      boxShadow: accountOpen ? "0 0 14px rgba(201,168,76,0.28)" : "none",
                    }}
                  >
                    {user.email?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <ChevronDown
                    size={12}
                    style={{ color: "#6B7A99" }}
                    className={`transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2.5 w-[280px] rounded-2xl overflow-hidden z-50"
                      style={{
                        background: "rgba(7,9,15,0.98)",
                        backdropFilter: "blur(28px)",
                        WebkitBackdropFilter: "blur(28px)",
                        border: "1px solid rgba(201,168,76,0.13)",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      {/* Header */}
                      <div className="px-4 py-4 border-b border-[rgba(255,255,255,0.06)]">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{
                              background: "linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.08))",
                              border: "1px solid rgba(201,168,76,0.3)",
                              color: "#DEC27A",
                              boxShadow: "0 0 20px rgba(201,168,76,0.12)",
                            }}
                          >
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#F0F2F7] truncate">{user.email}</p>
                            {isPro ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1"
                                style={{
                                  background: "linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.08))",
                                  border: "1px solid rgba(201,168,76,0.3)",
                                  color: "#DEC27A",
                                }}
                              >
                                <Crown size={8} />
                                {planLabel.replace("✦ ", "")}
                              </span>
                            ) : (
                              <span className="text-[10px] block mt-0.5" style={{ color: "#4B5563" }}>{planLabel}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        {!isPro && (
                          <Link
                            href="/#pricing"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs rounded-xl transition-all hover:bg-[rgba(201,168,76,0.08)]"
                            style={{ color: "#C9A84C" }}
                          >
                            <Crown size={13} />
                            <span>Upgrade to Pro</span>
                          </Link>
                        )}
                        <button
                          onClick={() => { setAccountOpen(false); handleSignOut(); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs rounded-xl transition-all hover:bg-[rgba(255,255,255,0.04)]"
                          style={{ color: "#6B7A99" }}
                        >
                          <LogOut size={13} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
