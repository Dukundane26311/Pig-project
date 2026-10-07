import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { ReturnsTableClient } from "./ReturnsTableClient";

export const dynamic = "force-dynamic";

export default async function FieldReturnsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "FIELD_OFFICER") {
    redirect("/dashboard");
  }

  const returns = await prisma.pigReturn.findMany({
    where: { recordedById: session.user.id },
    orderBy: { returnDate: "desc" },
    include: {
      pig: true,
      beneficiary: true,
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">My Recorded Returns</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Pigs you have received back from beneficiaries.</p>
        </div>
        <Link href="/dashboard/field/returns/new" className="inline-flex items-center px-4 py-2 bg-[#2c5a43] text-white text-sm font-medium rounded-md hover:bg-[#1c2b23] transition-colors">
          <PlusCircle className="h-4 w-4 mr-2" />
          Record Return
        </Link>
      </div>

      <ReturnsTableClient initialReturns={returns.map((ret) => ({
        id: ret.id,
        returnDate: ret.returnDate,
        quantity: ret.quantity,
        notes: ret.notes,
        beneficiary: ret.beneficiary ? { fullName: ret.beneficiary.fullName } : null,
      }))} />
    </div>
  );
}
