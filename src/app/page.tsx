import type { GalleryItem, TeamMember, WebsiteContent } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  HandHeart,
  Sprout,
  User,
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
      text: "Families receive a pig, care guidance, and follow-up support as the project grows.",
    },
    {
      icon: HandHeart,
      title: "Return piglets",
      text: "Returned piglets move into the fund and help another family begin the same journey.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1c2b23]">
      <header className="sticky top-0 z-50 border-b border-[#d9e1d8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Pig Project Rwanda home" className="flex shrink-0 items-center">
            <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-11 w-auto" />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#5d6e64] md:flex">
            <Link href="#about" className="hover:text-[#1c2b23]">
              About
            </Link>
            <Link href="#how-it-works" className="hover:text-[#1c2b23]">
              How It Works
            </Link>
            <Link href="#impact" className="hover:text-[#1c2b23]">
              Impact
            </Link>
            <Link href="/gallery" className="hover:text-[#1c2b23]">
              Gallery
            </Link>
            <Link href="/team" className="hover:text-[#1c2b23]">
              Our Team
            </Link>
            <Link href="#stories" className="hover:text-[#1c2b23]">
              Stories
            </Link>
            <Link href="/contact" className="hover:text-[#1c2b23]">
              Contact Us
            </Link>
          </nav>

          <nav className="hidden items-center gap-4 text-sm font-semibold text-[#5d6e64] lg:flex">
            <Link
              href="/contact"
              className="rounded-full bg-[#123d2f] px-5 py-2.5 text-white shadow-sm shadow-[#123d2f]/10 hover:bg-[#0d2d23]"
            >
              Contact Us
            </Link>
            <Link href="/login" className="hover:text-[#1c2b23]">
              Staff Login
            </Link>
          </nav>

          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg bg-[#c9577a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a63a3a] md:hidden"
          >
            Contact
          </Link>
        </div>
      </header>

      <main>
        <section className="overflow-hidden bg-[#fdfcf9]">
          <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-18">
            <div>
              <p className="mb-7 inline-flex rounded-full border border-[#cfe4d7] bg-[#e7f4ed] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#064b36]">
                Pig Project Rwanda
              </p>
              <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-normal text-[#172b20] sm:text-6xl lg:text-[62px]">
                {heroData.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-9 text-[#50635a] sm:text-xl">
                {heroData.description}
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href={heroData.primaryButtonLink}
                  className="inline-flex items-center gap-3 rounded-full bg-[#123d2f] px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-[#0d2d23]"
                >
                  {heroData.primaryButtonText}
                </Link>
                <Link
                  href={heroData.secondaryButtonLink}
                  className="inline-flex items-center rounded-full border border-[#d9e1d8] bg-white px-6 py-4 text-base font-bold text-[#064b36] shadow-sm hover:bg-[#f2f5f0]"
                >
                  {heroData.secondaryButtonText}
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-[#50635a]">
                <span>Community-led support</span>
                <span>Rwanda-based impact</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[590px] lg:mr-0">
              <div className="rounded-[26px] border border-[#d9e1d8] bg-white p-3 shadow-[0_20px_54px_rgba(28,43,35,0.09)]">
                <div className="aspect-[1.44/1] overflow-hidden rounded-[18px] bg-[#e9f0eb]">
                  <img src={heroData.imageUrl} alt={heroData.imageAlt} className="h-full w-full object-cover" />
                </div>
              </div>

              <div className="absolute -bottom-6 left-7 w-[270px] rounded-2xl bg-white p-4 shadow-[0_14px_30px_rgba(28,43,35,0.16)]">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a8a82]">
                      Families Supported
                    </p>
                    <p className="mt-0.5 text-2xl font-extrabold text-[#123d2f]">{totalBeneficiaries}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2c5a43]">
                About the fund
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold leading-tight text-[#1c2b23] sm:text-5xl">
                A simple model with a lasting community return.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#5d6e64]">
                The project starts with one pig, then grows through training, animal care, and a return
                cycle that lets one family&apos;s progress open the door for the next.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-[#d9e1d8] bg-[#f2f5f0] p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e4ede6] text-[#2c5a43]">
                    <User className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-bold text-[#1c2b23]">Families</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5d6e64]">
                    Support focuses on households that need a practical way to build income.
                  </p>
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f8e3ea] text-[#c9577a]">
                    <HandHeart className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-bold text-[#1c2b23]">Follow-up</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5d6e64]">
                    Field guidance and accountability keep the revolving model healthy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-[#d9e1d8] bg-[#f2f5f0] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2c5a43]">
                How it works
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold text-[#1c2b23]">
                Receive. Raise. Return.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="rounded-2xl border border-[#d9e1d8] bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e4ede6] text-[#2c5a43]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 font-serif text-2xl font-bold text-[#1c2b23]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5d6e64]">{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="impact" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl bg-[#2c5a43] p-6 text-white sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#dbe8dd]">
                  Impact
                </p>
                <h2 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
                  Live numbers from the project records.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {impactStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/15 bg-white/8 p-5">
                    <div className="font-serif text-4xl font-bold">{stat.value}</div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="stories" className="border-t border-[#d9e1d8] bg-[#f8faf7] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2c5a43]">
                  Our Gallery
                </p>
                <h2 className="mt-3 font-serif text-4xl font-bold text-[#1c2b23]">Field stories</h2>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2c5a43] hover:text-[#c9577a]"
              >
                View full gallery <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {galleryItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d9e1d8] bg-white p-12 text-center text-[#5d6e64]">
                <p className="text-lg font-medium">Our gallery is being updated. Please check back soon.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d9e1d8] bg-white shadow-sm">
                    <div className="aspect-[4/3] bg-[#e4ede6]">
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-2xl font-bold text-[#1c2b23]">{item.title}</h3>
                      {item.location && <p className="mt-2 text-sm text-[#5d6e64]">{item.location}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2c5a43]">
                  Our Team
                </p>
                <h2 className="mt-3 font-serif text-4xl font-bold text-[#1c2b23]">People behind the work</h2>
              </div>
              <Link href="/team" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2c5a43] hover:text-[#c9577a]">
                Meet the team <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {teamMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d9e1d8] bg-[#f2f5f0] p-8 text-center text-sm font-medium text-[#5d6e64]">
                Team profiles are being updated.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {teamMembers.map((member) => (
                  <article key={member.id}>
                    <div className="aspect-square overflow-hidden rounded-2xl bg-[#e4ede6] p-3">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.fullName} className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-xl bg-[#dfeae3] text-3xl font-bold text-[#2c5a43]">
                          {member.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-bold text-[#1c2b23]">{member.fullName}</h3>
                    <p className="text-sm text-[#5d6e64]">{member.role}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d9e1d8] bg-[#f2f5f0] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Link href="/" aria-label="Pig Project Rwanda home" className="inline-flex items-center">
                <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-12 w-auto" />
              </Link>
              <p className="mt-3 font-serif text-2xl text-[#1c2b23]">
                One Piglet. One Family. A Fund That Keeps Moving.
              </p>
              <p className="mt-3 text-sm leading-6 text-[#5d6e64]">
                Supporting vulnerable families in Rwanda through livestock empowerment and a sustainable revolving fund.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2c5a43]">Navigation</h3>
              <ul className="mt-4 space-y-2 text-sm text-[#5d6e64]">
                <li><Link href="#about" className="hover:text-[#1c2b23]">About</Link></li>
                <li><Link href="#how-it-works" className="hover:text-[#1c2b23]">How It Works</Link></li>
                <li><Link href="#impact" className="hover:text-[#1c2b23]">Impact</Link></li>
                <li><Link href="/gallery" className="hover:text-[#1c2b23]">Gallery</Link></li>
                <li><Link href="/team" className="hover:text-[#1c2b23]">Our Team</Link></li>
                <li><Link href="/contact" className="hover:text-[#1c2b23]">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-[#d9e1d8] pt-5 text-center text-sm text-[#5d6e64]">
            Managed by Value Protocols. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
