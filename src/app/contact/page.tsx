import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "pigprojectfund@gmail.com",
    href: "mailto:pigprojectfund@gmail.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "0723 729 454",
    href: "https://wa.me/250723729454",
  },
  {
    icon: Phone,
    label: "Call",
    value: "0781 219 911",
    href: "tel:+250781219911",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-8 text-[#1b2d24] sm:py-12">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[30px] border border-[#dfe7df] bg-white shadow-[0_20px_52px_rgba(20,33,27,0.06)]">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[#173d2e] p-6 text-white sm:p-8 lg:p-10">
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e6efe8]">
              Contact us
            </span>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Have a question or want to connect?
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[#dfe9e3]">
              We would be happy to hear from you. Whether you want to learn more about the Pig Project, support the work, or collaborate with the team, we are here to answer your questions.
            </p>

            <div className="mt-8 rounded-[20px] border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dfe9e3]">Response time</p>
              <p className="mt-2 text-xl font-semibold text-white">Usually within 24 hours</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="mailto:pigprojectfund@gmail.com" className="inline-flex items-center gap-2 rounded-full bg-[#c85b77] px-5 py-3 text-sm font-semibold text-white hover:bg-[#a64761]">
                Email us
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">
                Back home
              </Link>
            </div>
          </div>

          <div className="bg-[#f8f7f4] p-6 sm:p-8 lg:p-10">
            <div className="space-y-4">
              {contactMethods.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="group block rounded-[22px] border border-[#dfe7df] bg-white p-4 shadow-[0_10px_26px_rgba(20,33,27,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(20,33,27,0.06)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3efe7] text-[#173d2e]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">{label}</div>
                      <div className="mt-1 text-lg font-semibold text-[#1b2d24] sm:text-xl">{value}</div>
                    </div>
                    <div className="hidden rounded-full border border-[#dfe7df] bg-[#f3f5f2] p-2 text-[#173d2e] sm:flex">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <form className="mt-8 space-y-4 rounded-[24px] border border-[#dfe7df] bg-white p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1b2d24]">Full name</label>
                  <input type="text" className="w-full rounded-xl border border-[#dfe7df] bg-[#f9faf8] px-3 py-2.5 text-sm text-[#1b2d24] outline-none ring-0 transition focus:border-[#173d2e]" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1b2d24]">Email address</label>
                  <input type="email" className="w-full rounded-xl border border-[#dfe7df] bg-[#f9faf8] px-3 py-2.5 text-sm text-[#1b2d24] outline-none transition focus:border-[#173d2e]" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1b2d24]">Message</label>
                <textarea rows={5} className="w-full rounded-xl border border-[#dfe7df] bg-[#f9faf8] px-3 py-2.5 text-sm text-[#1b2d24] outline-none transition focus:border-[#173d2e]" placeholder="Tell us how we can help" />
              </div>

              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#173d2e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#102a22]">
                Send message
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
