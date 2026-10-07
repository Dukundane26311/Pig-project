import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Mail, Phone } from "lucide-react";


export const dynamic = 'force-dynamic';

export const dynamic = "force-dynamic";

export default async function TeamMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.teamMember.findFirst({
    where: { id, isPublished: true },
  });

  if (!member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold font-serif text-[#1c2b23]">Team member not found</h1>
        <p className="mt-4 text-[#5d6e64]">This profile is not available or has not been published yet.</p>
        <Link href="/team" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2c5a43] px-5 py-3 text-white hover:bg-[#1c2b23]">
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f5f0] text-[#1c2b23]">
      <header className="border-b border-[#d9e1d8] bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Pig Project Rwanda home" className="flex items-center shrink-0">
            <img src="/pig-project-rwanda-logo.svg" alt="Pig Project Rwanda Logo" className="h-11 w-auto" />
          </Link>
          <div className="flex items-center gap-4 text-sm text-[#5d6e64]">
            <Link href="/team" className="hover:text-[#1c2b23]">Back to Team</Link>
            <Link href="/contact" className="hover:text-[#1c2b23]">Contact Us</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-[#d9e1d8] bg-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-[320px,1fr] md:p-10">
            <div className="flex items-center justify-center">
              <div className="h-72 w-72 overflow-hidden rounded-full border-4 border-[#e4ede6] bg-[#e4ede6] shadow-sm">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-[#2c5a43]">
                    {member.fullName.split(" ").map((part) => part[0]).slice(0,2).join("").toUpperCase() || "TM"}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2c5a43]">Team Member</p>
                <h1 className="mt-3 text-4xl font-bold font-serif text-[#1c2b23]">{member.fullName}</h1>
                <p className="mt-2 text-lg font-semibold text-[#2c5a43]">{member.role}</p>
              </div>

              {member.specialization && (
                <span className="inline-flex rounded-full bg-[#e4ede6] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#2c5a43]">
                  {member.specialization}
                </span>
              )}

              {member.bio && <p className="text-base leading-8 text-[#5d6e64]">{member.bio}</p>}

              {member.responsibilities && (
                <div>
                  <h2 className="text-lg font-bold text-[#1c2b23]">Responsibilities</h2>
                  <p className="mt-2 text-base leading-7 text-[#5d6e64]">{member.responsibilities}</p>
                </div>
              )}

              <div className="grid gap-3 pt-2 text-sm text-[#5d6e64] sm:grid-cols-2">
                {member.showEmailPublic && member.email && (
                  <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 rounded-lg border border-[#d9e1d8] px-3 py-2 hover:bg-[#f2f5f0]">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </a>
                )}
                {member.showPhonePublic && member.phone && (
                  <a href={`tel:${member.phone}`} className="inline-flex items-center gap-2 rounded-lg border border-[#d9e1d8] px-3 py-2 hover:bg-[#f2f5f0]">
                    <Phone className="h-4 w-4" />
                    {member.phone}
                  </a>
                )}
                {member.showLinkedinPublic && member.linkedinUrl && (
                  <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#d9e1d8] px-3 py-2 hover:bg-[#f2f5f0]">
                    <ArrowUpRight className="h-4 w-4" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          </div>
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