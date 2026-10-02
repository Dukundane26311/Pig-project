import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Leaf, Heart, Users, LineChart, Baby, RefreshCw } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PublicHomePage() {
  // Aggregate public statistics
  const totalBeneficiaries = await prisma.beneficiary.count();
  const totalPigsDistributed = await prisma.pig.count();
  const litters = await prisma.litter.aggregate({ _sum: { numberOfPigletsBorn: true } });
  const returnedPiglets = await prisma.piglet.count({ where: { status: 'AVAILABLE_FOR_REDISTRIBUTION' } });
  
  return (
    <div className="min-h-screen bg-white font-sans text-[#1c2b23]">
      
      {/* HEADER */}
      <header className="border-b border-[#d9e1d8] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-[#2c5a43]" />
              <span className="ml-3 text-2xl font-bold font-serif text-[#1c2b23]">Pig Project</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#about" className="text-[#5d6e64] hover:text-[#2c5a43] font-medium">About</Link>
              <Link href="#how-it-works" className="text-[#5d6e64] hover:text-[#2c5a43] font-medium">How it Works</Link>
              <Link href="#impact" className="text-[#5d6e64] hover:text-[#2c5a43] font-medium">Impact</Link>
              <Link href="#stories" className="text-[#5d6e64] hover:text-[#2c5a43] font-medium">Stories</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-[#5d6e64] hover:text-[#1c2b23] font-medium hidden sm:block">
                Staff Login
              </Link>
              <Link href="#support" className="bg-[#2c5a43] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#1c2b23] transition-colors">
                Support Project
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-[#f2f5f0] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold font-serif text-[#1c2b23] mb-6 leading-tight">
              One Piglet. One Family. A Fund That Keeps Moving.
            </h1>
            <p className="text-xl text-[#5d6e64] mb-10 leading-relaxed">
              The Pig Project Revolving Fund supports vulnerable families in Rwanda through agricultural empowerment, generating a continuous cycle of community wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#how-it-works" className="bg-[#c9577a] text-white px-8 py-4 rounded-lg font-bold text-center hover:bg-[#a63a3a] transition-colors inline-flex items-center justify-center">
                Learn How It Works <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT STATISTICS */}
      <section id="impact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif text-[#1c2b23] mb-4">Our Public Impact</h2>
            <p className="text-[#5d6e64] max-w-2xl mx-auto">Real-time statistics directly from our field operations database.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-[#f2f5f0] rounded-2xl">
              <Users className="h-10 w-10 text-[#2c5a43] mx-auto mb-4" />
              <div className="text-4xl font-bold font-serif text-[#1c2b23] mb-2">{totalBeneficiaries}</div>
              <div className="text-[#5d6e64] font-medium">Families Supported</div>
            </div>
            <div className="text-center p-8 bg-[#f2f5f0] rounded-2xl">
              <Heart className="h-10 w-10 text-[#c9577a] mx-auto mb-4" />
              <div className="text-4xl font-bold font-serif text-[#1c2b23] mb-2">{totalPigsDistributed}</div>
              <div className="text-[#5d6e64] font-medium">Pigs Distributed</div>
            </div>
            <div className="text-center p-8 bg-[#f2f5f0] rounded-2xl">
              <Baby className="h-10 w-10 text-[#2c5a43] mx-auto mb-4" />
              <div className="text-4xl font-bold font-serif text-[#1c2b23] mb-2">{litters._sum.numberOfPigletsBorn || 0}</div>
              <div className="text-[#5d6e64] font-medium">Piglets Born</div>
            </div>
            <div className="text-center p-8 bg-[#f2f5f0] rounded-2xl">
              <RefreshCw className="h-10 w-10 text-[#c9577a] mx-auto mb-4" />
              <div className="text-4xl font-bold font-serif text-[#1c2b23] mb-2">{returnedPiglets}</div>
              <div className="text-[#5d6e64] font-medium">Piglets Returned</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-[#1c2b23] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold font-serif mb-6">The Revolving Fund Model</h2>
            <p className="text-[#9db0a4] max-w-2xl mx-auto text-lg">A sustainable approach to community development that ensures every donation multiplies its impact.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="bg-[#243329] p-8 rounded-2xl h-full border border-[#2d3d34]">
                <div className="text-5xl font-serif text-[#c9577a] mb-6 opacity-50">01</div>
                <h3 className="text-xl font-bold mb-3">Family Receives a Pig</h3>
                <p className="text-[#9db0a4]">A vulnerable family is selected by our field officers and receives a healthy pig, veterinary support, and training.</p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#243329] p-8 rounded-2xl h-full border border-[#2d3d34]">
                <div className="text-5xl font-serif text-[#6fb08e] mb-6 opacity-50">02</div>
                <h3 className="text-xl font-bold mb-3">Piglets are Born</h3>
                <p className="text-[#9db0a4]">The pig grows and reproduces. Our veterinarians track the pregnancy and record the litter to ensure safe delivery.</p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#243329] p-8 rounded-2xl h-full border border-[#2d3d34]">
                <div className="text-5xl font-serif text-[#c9577a] mb-6 opacity-50">03</div>
                <h3 className="text-xl font-bold mb-3">3 Piglets Returned</h3>
                <p className="text-[#9db0a4]">The family repays the fund by returning 3 piglets. These are redistributed to new families, and the cycle continues.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f2f5f0] border-t border-[#d9e1d8] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Leaf className="h-6 w-6 text-[#2c5a43] mr-2" />
            <span className="text-lg font-bold font-serif text-[#1c2b23]">Pig Project Rwanda</span>
          </div>
          <p className="text-[#5d6e64] text-sm">Managed by Value Protocols. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
