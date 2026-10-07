import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import HeroEditor from "@/components/admin/hero-editor";

export const dynamic = "force-dynamic";

export default async function WebsiteContentPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const heroContent = await prisma.websiteContent.findFirst({
    where: { page: "home", section: "hero" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">Website Content</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1b2d24]">Hero Section</h2>
      </div>

      <HeroEditor initialContent={heroContent} />
    </div>
  );
}
