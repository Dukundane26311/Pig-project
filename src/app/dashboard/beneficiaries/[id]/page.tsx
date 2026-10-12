import { redirect } from "next/navigation";

export default async function BeneficiaryDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/admin/beneficiaries/${id}`);
}
