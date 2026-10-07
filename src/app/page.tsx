import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, User, HandHeart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  let totalBeneficiaries = 0;
  let totalPigsDistributed = 0;
  let litters: any = { _sum: { numberBorn: 0 } };
  let returnedPiglets = 0;
  let teamMembers: any[] = [];
  let galleryItems: any[] = [];
  let heroContent: any = null;

  try {
    [totalBeneficiaries, totalPigsDistributed, litters, returnedPiglets, teamMembers, galleryItems, heroContent] = await Promise.all([
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
    description: heroContent?.description || "The revolving livestock model helps families build stable income through pig production, communal accountability, and a cycle of return that grows opportunity across Rwanda.",
    primaryButtonText: heroContent?.primaryButtonText || "Learn How It Works",
    primaryButtonLink: heroContent?.primaryButtonLink || "#how-it-works",
    secondaryButtonText: heroContent?.secondaryButtonText || "See Our Impact",
    secondaryButtonLink: heroContent?.secondaryButtonLink || "#impact",
    imageUrl: heroContent?.imageUrl || "/pig-hero-real.jpg",
    imageAlt: heroContent?.imageAlt || "Pig production and community support in Rwanda",
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-200">
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" aria-label="Pig Project Rwanda home" className="flex shrink-0 items-center">
            <span className="text-xl font-bold tracking-tight text-neutral-900">Pig Project<span className="text-neutral-400 font-medium">Rwanda</span></span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <Link href="#about" className="hover:text-neutral-900 transition-colors">About</Link>
            <Link href="#how-it-works" className="hover:text-neutral-900 transition-colors">Model</Link>
            <Link href="#impact" className="hover:text-neutral-900 transition-colors">Impact</Link>
            <Link href="/gallery" className="hover:text-neutral-900 transition-colors">Gallery</Link>
            <Link href="/team" className="hover:text-neutral-900 transition-colors">Team</Link>
            <Link href="/contact" className="hover:text-neutral-900 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Staff Login
            </Link>
            <Link href="/contact" className="hidden rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 sm:inline-flex">
              Get Involved
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative px-6 py-20 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">Empowering Communities</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
                  {heroData.title}
                </h1>
                <p className="mt-6 text-lg sm:text-xl leading-relaxed text-neutral-600 max-w-lg">
                  {heroData.description}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href={heroData.primaryButtonLink} className="inline-flex items-center justify-center rounded bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                    {heroData.primaryButtonText}
                  </Link>
                  <Link href={heroData.secondaryButtonLink} className="inline-flex items-center justify-center rounded border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50">
                    {heroData.secondaryButtonText}
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/3] lg:aspect-square w-full">
                <img src={heroData.imageUrl} alt={heroData.imageAlt} className="absolute inset-0 w-full h-full object-cover rounded-sm shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* MISSION SECTION */}
        <section id="about" className="bg-neutral-50 border-y border-neutral-200 px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                  A Practical Pathway out of Vulnerability
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-neutral-600">
                  We work with families facing limited resources, difficult housing conditions, and unstable income. Beyond the first pig, we focus on care, healthy breeding, and local accountability for sustained growth.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded bg-neutral-200">
                    <User className="h-5 w-5 text-neutral-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">Households in need</h3>
                  <p className="mt-2 text-neutral-600 leading-relaxed text-sm">
                    Partnering directly with families to provide resources that spark immediate economic change.
                  </p>
                </div>
                <div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded bg-neutral-200">
                    <HandHeart className="h-5 w-5 text-neutral-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">Long-term support</h3>
                  <p className="mt-2 text-neutral-600 leading-relaxed text-sm">
                    Building a foundation of veterinary care, agricultural training, and community solidarity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                A Revolving Model
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Our approach is simple, accountable, and designed to scale naturally within communities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12">
              {[
                { number: "01", title: "Initial Grant", text: "A selected household receives a healthy pig and initial guidance for care and management." },
                { number: "02", title: "Growth & Care", text: "The animal grows, reproduces, and the family builds new income potential through healthy livestock care." },
                { number: "03", title: "Return Cycle", text: "The household contributes back to the fund by returning three piglets to continue the cycle." },
                { number: "04", title: "Community Expansion", text: "The returned piglets help another family begin the same journey of dignity, resilience, and growth." },
              ].map((step) => (
                <div key={step.number} className="relative border-t border-neutral-200 pt-6">
                  <div className="text-sm font-bold tracking-widest text-neutral-400 mb-3">{step.number}</div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                  <p className="text-neutral-600 leading-relaxed text-sm">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IMPACT NUMBERS */}
        <section id="impact" className="bg-neutral-900 text-white px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Measurable Impact</h2>
              </div>
              <div>
                <p className="text-lg text-neutral-400 leading-relaxed">
                  These figures reflect our current project records and show the real scale of our work across families, pig distribution, and piglet return cycles.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-neutral-800 pt-12">
              <div>
                <div className="text-5xl font-light tracking-tight mb-2">{totalBeneficiaries}</div>
                <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Families Supported</div>
              </div>
              <div>
                <div className="text-5xl font-light tracking-tight mb-2">{totalPigsDistributed}</div>
                <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Pigs Distributed</div>
              </div>
              <div>
                <div className="text-5xl font-light tracking-tight mb-2">{litters._sum.numberBorn ?? 0}</div>
                <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Piglets Born</div>
              </div>
              <div>
                <div className="text-5xl font-light tracking-tight mb-2">{returnedPiglets}</div>
                <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Piglets Returned</div>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY / STORIES */}
        <section id="stories" className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Field Stories</h2>
              <Link href="/gallery" className="hidden sm:flex items-center text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
                View full gallery <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {galleryItems.length === 0 ? (
              <div className="border border-neutral-200 rounded p-12 text-center text-neutral-500 text-sm">
                Gallery updates coming soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {galleryItems.map((item) => (
                  <article key={item.id} className="group cursor-pointer">
                    <div className="aspect-[4/3] overflow-hidden rounded bg-neutral-100 mb-4">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                    {item.location && <p className="text-sm text-neutral-500 mt-1">{item.location}</p>}
                  </article>
                ))}
              </div>
            )}
            <div className="mt-8 sm:hidden">
              <Link href="/gallery" className="inline-flex w-full items-center justify-center rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50">
                View full gallery
              </Link>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="bg-neutral-50 border-t border-neutral-200 px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">Our Team</h2>
              <p className="mt-4 text-lg text-neutral-600">
                Skilled, community-rooted, and committed to long-term change.
              </p>
            </div>

            {teamMembers.length === 0 ? (
              <div className="border border-neutral-200 bg-white rounded p-8 text-sm text-neutral-500">
                Team profiles are being updated.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {teamMembers.map((member) => (
                  <div key={member.id}>
                    <div className="aspect-square overflow-hidden rounded bg-neutral-200 mb-4">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl font-light text-neutral-400">{member.fullName.slice(0, 2).toUpperCase()}</div>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">{member.fullName}</h3>
                    <p className="text-sm text-neutral-500">{member.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-neutral-200 py-12 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <span className="text-xl font-bold tracking-tight text-neutral-900">Pig Project<span className="text-neutral-400 font-medium">Rwanda</span></span>
            </Link>
            <p className="mt-4 text-sm text-neutral-500 max-w-sm leading-relaxed">
              One Piglet. One Family. A Fund That Keeps Moving. Creating sustainable pathways out of vulnerability through livestock micro-grants.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Navigation</h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li><Link href="#about" className="hover:text-neutral-900 transition-colors">About</Link></li>
              <li><Link href="#how-it-works" className="hover:text-neutral-900 transition-colors">Model</Link></li>
              <li><Link href="#impact" className="hover:text-neutral-900 transition-colors">Impact</Link></li>
              <li><Link href="/gallery" className="hover:text-neutral-900 transition-colors">Gallery</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Connect</h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li><Link href="/contact" className="hover:text-neutral-900 transition-colors">Contact Us</Link></li>
              <li><Link href="/team" className="hover:text-neutral-900 transition-colors">Our Team</Link></li>
              <li><Link href="/login" className="hover:text-neutral-900 transition-colors">Staff Portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-neutral-100 text-xs text-neutral-400 flex flex-col md:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} Pig Project Rwanda. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
