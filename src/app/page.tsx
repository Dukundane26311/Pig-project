import type { GalleryItem, TeamMember, WebsiteContent } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HomePageClient } from "./HomePageClient";

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

  return (
    <HomePageClient
      heroData={heroData}
      totalBeneficiaries={totalBeneficiaries}
      totalPigsDistributed={totalPigsDistributed}
      litterbornCount={litters._sum.numberBorn ?? 0}
      returnedPiglets={returnedPiglets}
      teamMembers={teamMembers}
      galleryItems={galleryItems}
    />
  );
}
