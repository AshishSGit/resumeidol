"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Target, Search, FileText, LayoutDashboard, Menu, X, LogOut, Crown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/search", label: "Job Search", icon: Search },
  { href: "/tailor", label: "Resume Tailor", icon: FileText },
  { href: "/tracker", label: "Tracker", icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const res = await fetch("/api/pro-status");
        const { isPro } = await res.json();
        setIsPro(isPro);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const res = await fetch("/api/pro-status");
        const { isPro } = await res.json();
        setIsPro(isPro);
      } else {
        setIsPro(false);
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
            <Target size={18} className="text-[#07090F]" strokeWidth={2.5} />
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? "#DEC27A" : "#6B7A99",
                  background: active ? "rgba(201,168,76,0.08)" : "transparent",
                  border: active ? "1px solid rgba(201,168,76,0.15)" : "1px solid transparent",
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isPro && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#DEC27A" }}>
                  <Crown size={11} />
                  Pro
                </div>
              )}
              <span className="text-xs text-[#6B7A99] max-w-[140px] truncate">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs text-[#6B7A99] hover:text-[#9CA3AF] px-3 py-2 rounded-lg transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <LogOut size={13} />
                Sign out
              </button>
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
