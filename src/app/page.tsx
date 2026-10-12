import type { GalleryItem, TeamMember, WebsiteContent } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  HandHeart,
  Sprout,
  User,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

type LitterBirthAggregate = {
  _sum: {
    numberBorn: number | null;
  };
};

export default async function PublicHomePage() {
  let totalBeneficiaries = 0;
  let totalPigsDistributed = 0;
  let litters: LitterBirthAggregate = { _sum: { numberBorn: 0 } };
  let returnedPiglets = 0;
  let teamMembers: TeamMember[] = [];
  let galleryItems: GalleryItem[] = [];
  let heroContent: WebsiteContent | null = null;

  try {
    [
      totalBeneficiaries,
      totalPigsDistributed,
      litters,
      returnedPiglets,
      teamMembers,
      galleryItems,
      heroContent,
    ] = await Promise.all([
      prisma.beneficiary.count(),
      prisma.pig.count(),
      prisma.litter.aggregate({ _sum: { numberBorn: true } }),
      prisma.piglet.count({ where: { status: "AVAILABLE_FOR_REDISTRIBUTION" } }),
      prisma.teamMember.findMany({
        where: { isPublished: true, isFeatured: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        take: 4,
      }),
      prisma.galleryItem.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        take: 3,
      }),
      prisma.websiteContent.findFirst({
        where: { page: "home", section: "hero" },
      }),
    ]);
  } catch (error) {
    console.error("Failed to fetch homepage data from database:", error);
  }

  const heroData = {
    title: heroContent?.title || "One Piglet. One Family. A Fund That Keeps Moving.",
    description:
      heroContent?.description ||
      "Supporting vulnerable families in Rwanda through livestock empowerment, community accountability, and a sustainable revolving fund.",
    primaryButtonText: heroContent?.primaryButtonText || "Learn How It Works",
    primaryButtonLink: heroContent?.primaryButtonLink || "#how-it-works",
    secondaryButtonText: heroContent?.secondaryButtonText || "See Our Impact",
    secondaryButtonLink: heroContent?.secondaryButtonLink || "#impact",
    imageUrl: heroContent?.imageUrl || "/pig-hero-real.jpg",
    imageAlt: heroContent?.imageAlt || "Pig production and community support in Rwanda",
  };

  const impactStats = [
    { value: totalBeneficiaries, label: "Families Supported" },
    { value: totalPigsDistributed, label: "Pigs Distributed" },
    { value: litters._sum.numberBorn ?? 0, label: "Piglets Born" },
    { value: returnedPiglets, label: "Piglets Returned" },
  ];

  const steps = [
    {
      icon: BadgeCheck,
      title: "Select a family",
      text: "Field teams identify households where a livestock asset can make a practical difference.",
    },
    {
      icon: Sprout,
      title: "Raise and grow",
      text: "Families receive a pig, care guidance, and veterinary support as the livestock grows.",
    },
    {
      icon: HandHeart,
      title: "Return piglets",
      text: "Returned piglets move into the fund and help another family begin the same journey.",
    },
  ];

  return (
    <div className="bg-white text-slate-900 antialiased">
      {/* ── Full-screen hero wrapper ───────────────────────────── */}
      <div
        id="hero-screen"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          height: "100dvh",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        {/* Background image — full cover */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${heroData.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          }}
        />

        {/* Dark overlay for readability */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(160deg, rgba(6,78,59,0.72) 0%, rgba(2,26,20,0.80) 100%)",
            zIndex: 1,
          }}
        />

        {/* ── Sticky navbar — floats above the hero image ── */}
        <header
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(6,78,59,0.25)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" aria-label="Pig Project Rwanda home" className="flex shrink-0 items-center">
              <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-10 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
            </Link>

            <nav className="hidden items-center gap-0.5 md:flex">
              {[
                { href: "#about", label: "About" },
                { href: "#how-it-works", label: "How It Works" },
                { href: "#impact", label: "Impact" },
                { href: "/gallery", label: "Gallery" },
                { href: "/team", label: "Our Team" },
                { href: "#stories", label: "Stories" },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-medium text-white/80 hover:text-white px-3 py-1.5 transition-colors"
              >
                Staff Login
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#064e3b] shadow-sm hover:bg-emerald-50 transition-colors"
              >
                <span>Contact Us</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero content — centered in viewport ── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-200 backdrop-blur-sm mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pig Project Rwanda &bull; Revolving Fund
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.10]">
              {heroData.title}
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-emerald-100/85 sm:text-xl">
              {heroData.description}
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={heroData.primaryButtonLink}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#064e3b] shadow-md hover:bg-emerald-50 transition-all"
              >
                <span>{heroData.primaryButtonText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={heroData.secondaryButtonLink}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                {heroData.secondaryButtonText}
              </Link>
            </div>

            {/* Trust pills */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-emerald-200/70 uppercase tracking-widest">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Community-Led
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Rwanda Operations
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Revolving Mandate
              </span>
            </div>
          </div>
        </div>

        {/* ── Floating stat chip — bottom of screen ── */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "flex",
            gap: "1rem",
          }}
        >
          {[
            { value: totalBeneficiaries, label: "Families Supported" },
            { value: totalPigsDistributed, label: "Pigs Distributed" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.20)",
                borderRadius: "0.875rem",
                padding: "0.875rem 1.5rem",
                textAlign: "center",
                minWidth: "110px",
              }}
            >
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ marginTop: "0.25rem", fontSize: "0.65rem", fontWeight: 600, color: "rgba(167,243,208,0.85)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* ── End full-screen hero ──────────────────────────────── */}

      <main>

        {/* About the fund */}
        <section id="about" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                About The Fund
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                A simple model with a lasting community return.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                The project starts with one healthy pig, then grows through practical training, veterinary care, and an accountable revolving cycle where one family&apos;s harvest enables the next family to begin.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">Vulnerable Families</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Direct targeting of households in need of durable, practical agricultural assets.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <HandHeart className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">Veterinary Guidance</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Continuous professional supervision ensures healthy litters and strong reproduction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-slate-200/70 bg-slate-50/70 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Sustainable Workflow
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Receive. Raise. Return.
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                A structured three-step lifecycle empowering Rwandan rural households.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="relative rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-300">0{idx + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Impact Live Numbers */}
        <section id="impact" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl bg-[#064e3b] p-8 text-white sm:p-12 lg:p-14 shadow-sm">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  Real-Time Database Records
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
                  Transparent community impact measured live.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100/80">
                  Every animal recorded, vaccinated, and distributed is tracked directly within our operations ledger.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                {impactStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs">
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-200/70">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stories & Gallery */}
        <section id="stories" className="border-t border-slate-200/70 bg-slate-50/50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Field Documentation
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  Stories from the ground
                </h2>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <span>View full gallery</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {galleryItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
                <p className="text-sm font-medium">Our gallery is being updated. Please check back soon.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                      {item.location && <p className="mt-1 text-xs text-slate-500">{item.location}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Our Team */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Dedicated Leadership
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  People behind the project
                </h2>
              </div>
              <Link
                href="/team"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <span>Meet the entire team</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {teamMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs font-medium text-slate-500">
                Team profiles are currently being synchronized.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {teamMembers.map((member) => (
                  <article key={member.id} className="group">
                    <div className="aspect-square overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.fullName}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl font-bold text-emerald-800 bg-emerald-50">
                          {member.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-900">{member.fullName}</h3>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modern, professional footer */}
      <footer className="border-t border-slate-200 bg-slate-50/70 py-14 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2 space-y-3">
              <Link href="/" aria-label="Pig Project Rwanda home" className="inline-flex items-center">
                <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-10 w-auto" />
              </Link>
              <p className="text-sm font-semibold text-slate-900">
                One Piglet. One Family. A Fund That Keeps Moving.
              </p>
              <p className="text-xs leading-relaxed text-slate-500 max-w-md">
                A sustainable revolving fund supporting vulnerable rural families across Rwanda with livestock capital and veterinary backing.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="#about" className="hover:text-slate-900 transition-colors">About Us</Link></li>
                <li><Link href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</Link></li>
                <li><Link href="#impact" className="hover:text-slate-900 transition-colors">Impact Summary</Link></li>
                <li><Link href="/gallery" className="hover:text-slate-900 transition-colors">Field Gallery</Link></li>
                <li><Link href="/team" className="hover:text-slate-900 transition-colors">Our Team</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Operations</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-slate-900 transition-colors">Staff Login</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900 transition-colors">Contact Support</Link></li>
                <li><span className="text-slate-400">Value Protocols, Rwanda</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Pig Project Rwanda &bull; Value Protocols. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
