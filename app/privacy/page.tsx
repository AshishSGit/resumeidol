import Link from "next/link";
import { Crown } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ResumeIdol",
  alternates: { canonical: "https://resumeidol.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#07090F" }}>
      {/* Minimal nav */}
      <nav className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)" }}>
            <Crown size={16} className="text-[#07090F]" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.2rem", color: "#F0F2F7" }}>
            ResumeIdol
          </span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", fontWeight: 700, color: "#F0F2F7", marginBottom: "0.5rem" }}>
          Privacy Policy
        </h1>
        <p className="text-[#6B7A99] text-sm mb-12">Last updated: March 6, 2026</p>

        <div className="space-y-10 text-[#9CA3AF] leading-relaxed">

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">1. Who we are</h2>
            <p>ResumeIdol (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an AI-powered resume tailoring and job search platform operated at resumeidol.com. Questions about this policy can be sent to <a href="mailto:hello@resumeidol.com" className="text-[#C9A84C] hover:underline">hello@resumeidol.com</a>.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">2. Information we collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-[#DEC27A]">Resume content</strong> — text you upload or paste, used to generate your tailored resume. If you are signed in, your most recent resume is saved to your account in our database so it auto-loads on your next visit. You can delete it at any time by contacting us.</li>
              <li><strong className="text-[#DEC27A]">Account data</strong> — your email address, collected when you create an account via magic link sign-in. Stored in Supabase (our database provider).</li>
              <li><strong className="text-[#DEC27A]">Job descriptions</strong> — text you paste into the tailor tool. Not stored after your session unless you are signed in and saving results.</li>
              <li><strong className="text-[#DEC27A]">Subscription status</strong> — your plan tier (Free, Pro, or Lifetime) is stored to enforce usage limits.</li>
              <li><strong className="text-[#DEC27A]">Payment information</strong> — handled entirely by Stripe. We never see or store your card details.</li>
              <li><strong className="text-[#DEC27A]">Usage data</strong> — anonymized analytics (pages visited, feature usage) to improve the product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">3. How we use your information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To generate your AI-tailored resume using Anthropic&apos;s Claude API.</li>
              <li>To process payments through Stripe.</li>
              <li>To send you product updates if you opted in via the waitlist.</li>
              <li>To improve the platform based on aggregated, anonymized usage patterns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">4. Third-party services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-[#DEC27A]">Anthropic</strong> — processes resume and job description text to generate tailored resumes. See <a href="https://www.anthropic.com/privacy" className="text-[#C9A84C] hover:underline" target="_blank" rel="noopener noreferrer">Anthropic&apos;s Privacy Policy</a>.</li>
              <li><strong className="text-[#DEC27A]">Supabase</strong> — stores your account data (email, resume text, subscription status) in a secure cloud database. See <a href="https://supabase.com/privacy" className="text-[#C9A84C] hover:underline" target="_blank" rel="noopener noreferrer">Supabase&apos;s Privacy Policy</a>.</li>
              <li><strong className="text-[#DEC27A]">Stripe</strong> — handles all payment processing. We never receive your card details. See <a href="https://stripe.com/privacy" className="text-[#C9A84C] hover:underline" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a>.</li>
              <li><strong className="text-[#DEC27A]">JSearch (RapidAPI)</strong> — provides job listing data. See <a href="https://rapidapi.com/privacy" className="text-[#C9A84C] hover:underline" target="_blank" rel="noopener noreferrer">RapidAPI&apos;s Privacy Policy</a>.</li>
              <li><strong className="text-[#DEC27A]">Railway</strong> — hosts the application infrastructure. See <a href="https://railway.app/legal/privacy" className="text-[#C9A84C] hover:underline" target="_blank" rel="noopener noreferrer">Railway&apos;s Privacy Policy</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">5. Data retention</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-[#DEC27A]">Resume text</strong> — retained for signed-in users until you delete your account or request removal. Not retained for unauthenticated sessions.</li>
              <li><strong className="text-[#DEC27A]">Account data (email)</strong> — retained for as long as your account is active. Deleted upon request.</li>
              <li><strong className="text-[#DEC27A]">Subscription records</strong> — retained for the duration of your subscription and up to 3 years after for tax and legal compliance.</li>
              <li><strong className="text-[#DEC27A]">Payment records</strong> — retained by Stripe per their data retention policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">6. Your rights</h2>
            <p>You may request deletion of any personal data we hold by emailing <a href="mailto:hello@resumeidol.com" className="text-[#C9A84C] hover:underline">hello@resumeidol.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">7. Cookies</h2>
            <p>We use only essential cookies required for the application to function (session state, payment flow). We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">8. Changes to this policy</h2>
            <p>We may update this policy periodically. Continued use of the service after changes constitutes acceptance. Material changes will be communicated via email to registered users.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">9. Contact</h2>
            <p>For any privacy questions: <a href="mailto:hello@resumeidol.com" className="text-[#C9A84C] hover:underline">hello@resumeidol.com</a></p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
          <Link href="/" className="text-[#C9A84C] text-sm hover:underline">← Back to ResumeIdol</Link>
          <Link href="/terms" className="text-[#6B7A99] text-sm hover:text-[#9CA3AF]">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
