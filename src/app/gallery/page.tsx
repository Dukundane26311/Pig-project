import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GalleryCollection from "@/components/public/gallery-collection";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let items: any[] = [];
  try {
    items = await prisma.galleryItem.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
  } catch (error) {
    console.error("Failed to load gallery items:", error);
  }

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-white text-[#1c2b23]">
      <header className="border-b border-[#d9e1d8] bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Pig Project Rwanda home" className="flex items-center shrink-0">
            <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-11 w-auto" />
          </Link>
          <div className="flex items-center gap-4 text-sm text-[#5d6e64]">
            <Link href="/" className="hover:text-[#1c2b23]">Home</Link>
            <Link href="/team" className="hover:text-[#1c2b23]">Our Team</Link>
            <Link href="/contact" className="hover:text-[#1c2b23]">Contact Us</Link>
            <Link href="/login" className="hover:text-[#1c2b23]">Staff Login</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#2c5a43]">Our Gallery</p>
          <h1 className="text-4xl font-bold font-serif text-[#1c2b23]">Our Gallery</h1>
          <p className="mt-4 text-lg text-[#5d6e64]">A visual story of families, livestock, field teams, and community impact across Rwanda.</p>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-[#d9e1d8] bg-[#f2f5f0] p-12 text-center text-[#5d6e64]">
            <p className="text-lg font-medium">Our gallery is being updated. Please check back soon.</p>
          </div>
        ) : (
          <div className="mt-12">
            <GalleryCollection items={items.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              imageUrl: item.imageUrl,
              category: item.category,
              location: item.location,
              photoDate: item.photoDate,
              photographer: item.photographer,
            }))} categories={categories} />
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-[#c9577a] px-6 py-3 font-medium text-white hover:bg-[#a63a3a]">
            Back to Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#d9e1d8] bg-[#f2f5f0] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Link href="/" aria-label="Pig Project Rwanda home" className="inline-flex items-center">
                <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-12 w-auto" />
              </Link>
              <p className="mt-3 text-2xl font-serif text-[#1c2b23]">One Piglet. One Family. A Fund That Keeps Moving.</p>
              <p className="mt-3 text-sm leading-6 text-[#5d6e64]">Supporting vulnerable families in Rwanda through livestock empowerment and a sustainable revolving fund.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2c5a43]">Navigation</h3>
              <ul className="mt-4 space-y-2 text-sm text-[#5d6e64]">
                <li><Link href="/" className="hover:text-[#1c2b23]">About</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-[#1c2b23]">How It Works</Link></li>
                <li><Link href="/#impact" className="hover:text-[#1c2b23]">Impact</Link></li>
                <li><Link href="/gallery" className="hover:text-[#1c2b23]">Gallery</Link></li>
                <li><Link href="/team" className="hover:text-[#1c2b23]">Our Team</Link></li>
                <li><Link href="/#stories" className="hover:text-[#1c2b23]">Stories</Link></li>
                <li><Link href="/contact" className="hover:text-[#1c2b23]">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-[#d9e1d8] pt-5 text-center text-sm text-[#5d6e64]">Managed by Value Protocols. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
