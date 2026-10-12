import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GalleryCollection from "@/components/public/gallery-collection";
import type { GalleryItem } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let items: GalleryItem[] = [];
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
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Pig Project Rwanda home" className="flex items-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50/80 px-2 py-1 text-xs font-semibold text-slate-600">
            <Link href="/" className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-white transition-colors">Home</Link>
            <Link href="/team" className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-white transition-colors">Our Team</Link>
            <Link href="/contact" className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-white transition-colors">Contact Us</Link>
            <Link href="/login" className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-white transition-colors">Staff Login</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Visual Documentation</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Project Field Gallery</h1>
          <p className="mt-3 text-sm text-slate-600">A visual narrative of rural families, livestock assets, veterinary follow-ups, and revolving community impact across Rwanda.</p>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
            <p className="text-sm font-medium">Our gallery is currently being curated. Please check back shortly.</p>
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
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#053d2e] transition-colors shadow-xs">
            <span>Back to Home</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50/70 py-12 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Link href="/" aria-label="Pig Project Rwanda home" className="inline-flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-10 w-auto" />
              </Link>
              <p className="mt-3 text-sm font-semibold text-slate-900">One Piglet. One Family. A Fund That Keeps Moving.</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">Supporting vulnerable families in Rwanda through livestock empowerment and a sustainable revolving fund.</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Navigation</h3>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                <li><Link href="/" className="hover:text-slate-900">Home</Link></li>
                <li><Link href="/team" className="hover:text-slate-900">Our Team</Link></li>
                <li><Link href="/gallery" className="hover:text-slate-900">Gallery</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200/80 pt-4 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Pig Project Rwanda &bull; Value Protocols. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
