import Link from "next/link";
import { Target } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ResumeIdol",
  alternates: { canonical: "https://resumeidol.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#07090F" }}>
      {/* Minimal nav */}
      <nav className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)" }}>
            <Target size={16} className="text-[#07090F]" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.2rem", color: "#F0F2F7" }}>
            ResumeIdol
          </span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", fontWeight: 700, color: "#F0F2F7", marginBottom: "0.5rem" }}>
          Terms of Service
        </h1>
        <p className="text-[#6B7A99] text-sm mb-12">Last updated: March 3, 2026</p>

        <div className="space-y-10 text-[#9CA3AF] leading-relaxed">

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">1. Acceptance of terms</h2>
            <p>By accessing or using ResumeIdol (&quot;the Service&quot;) at resumeidol.com, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">2. What ResumeIdol does</h2>
            <p>ResumeIdol provides AI-assisted resume tailoring and job search tools. The AI rewrites and repositions your existing experience — it does not fabricate credentials, employment history, or qualifications you do not have. You are responsible for ensuring your final resume is accurate.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">3. Your responsibilities</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be 18 years of age or older to use the Service.</li>
              <li>You must not submit false, misleading, or unlawful content.</li>
              <li>You are solely responsible for the accuracy of your resume and job applications.</li>
              <li>You must not use the Service to misrepresent your qualifications to employers.</li>
              <li>You must not attempt to reverse-engineer, scrape, or abuse the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">4. Subscription and payments</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-[#DEC27A]">Free plan:</strong> Access to 3 AI resume tailors per month at no charge.</li>
              <li><strong className="text-[#DEC27A]">Pro plan ($18/month):</strong> Unlimited resume tailoring, billed monthly. Cancel anytime from your Stripe billing portal.</li>
              <li><strong className="text-[#DEC27A]">Lifetime plan ($249 one-time):</strong> Unlimited resume tailoring, no recurring charges, valid for the lifetime of the product.</li>
              <li>All payments are processed by Stripe. By purchasing, you agree to Stripe&apos;s terms of service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">5. Refund policy</h2>
            <p>We offer a <strong className="text-[#DEC27A]">14-day money-back guarantee</strong> on all paid plans. If you are unsatisfied for any reason within 14 days of purchase, email <a href="mailto:hello@resumeidol.com" className="text-[#C9A84C] hover:underline">hello@resumeidol.com</a> and we will issue a full refund — no questions asked. After 14 days, refunds are at our discretion.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">6. Intellectual property</h2>
            <p>You retain full ownership of the resume content you submit. The tailored output generated from your content is yours to use freely. ResumeIdol retains ownership of its platform, design, code, and AI systems.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">7. Disclaimer of warranties</h2>
            <p>The Service is provided &quot;as is&quot; without warranty of any kind. We do not guarantee that using ResumeIdol will result in job interviews, offers, or employment. AI-generated content may contain errors and should be reviewed before submission.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">8. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, ResumeIdol shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the amount you paid in the 12 months prior to the claim.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate access to the Service at our discretion if these terms are violated. You may cancel your subscription at any time through Stripe&apos;s billing portal.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">10. Governing law</h2>
            <p>These terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the applicable jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-[#F0F2F7] text-lg font-semibold mb-3">11. Contact</h2>
            <p>Questions about these terms: <a href="mailto:hello@resumeidol.com" className="text-[#C9A84C] hover:underline">hello@resumeidol.com</a></p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
          <Link href="/" className="text-[#C9A84C] text-sm hover:underline">← Back to ResumeIdol</Link>
          <Link href="/privacy" className="text-[#6B7A99] text-sm hover:text-[#9CA3AF]">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
