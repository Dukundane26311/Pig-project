import { prisma } from "@/lib/prisma";
import { BeneficiariesClient } from "./BeneficiariesClient";

export const dynamic = "force-dynamic";

export default async function BeneficiariesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }> | { q?: string | string[] };
}) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const searchTerm = Array.isArray(resolvedParams?.q) ? resolvedParams.q[0] : resolvedParams?.q ?? "";
  const normalizedSearch = searchTerm.trim();

  const beneficiaries = await prisma.beneficiary.findMany({
    where: normalizedSearch
      ? {
          OR: [
            { fullName: { contains: normalizedSearch, mode: "insensitive" } },
            { beneficiaryNumber: { contains: normalizedSearch, mode: "insensitive" } },
            { districtStr: { contains: normalizedSearch, mode: "insensitive" } },
            { sectorStr: { contains: normalizedSearch, mode: "insensitive" } },
            { cellStr: { contains: normalizedSearch, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <BeneficiariesClient
      initialBeneficiaries={beneficiaries.map((b) => ({
        id: b.id,
        fullName: b.fullName,
        beneficiaryNumber: b.beneficiaryNumber,
        districtStr: b.districtStr,
        sectorStr: b.sectorStr,
        cellStr: b.cellStr,
        status: b.status,
        registrationDate: b.registrationDate,
      }))}
      initialQuery={normalizedSearch}
    />
  );
}
