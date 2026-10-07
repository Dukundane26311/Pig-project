import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { DistributionsTableClient } from "./DistributionsTableClient";

export const dynamic = "force-dynamic";

export default async function FieldDistributionsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "FIELD_OFFICER") {
    redirect("/dashboard");
  }

  const distributions = await prisma.pigDistribution.findMany({
    where: { distributedById: session.user.id },
    orderBy: { distributionDate: "desc" },
    include: {
      pig: true,
      beneficiary: true,
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">My Distributions</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Pigs you have distributed to beneficiaries.</p>
        </div>
        <Link href="/dashboard/field/distributions/new" className="inline-flex items-center px-4 py-2 bg-[#2c5a43] text-white text-sm font-medium rounded-md hover:bg-[#1c2b23] transition-colors">
          <PlusCircle className="h-4 w-4 mr-2" />
          Record Distribution
        </Link>
      </div>

      <DistributionsTableClient
        initialDistributions={distributions.map((dist) => ({
          id: dist.id,
          distributionDate: dist.distributionDate,
          notes: dist.notes,
          pig: dist.pig ? { tagNumber: dist.pig.tagNumber } : null,
          beneficiary: dist.beneficiary ? { fullName: dist.beneficiary.fullName } : null,
        }))}
      />
    </div>
  );
}
