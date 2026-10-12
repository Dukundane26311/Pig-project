import { getBeneficiaryReturnOptions } from "@/app/actions/returns";
import { PigReturnForm } from "@/components/returns/PigReturnForm";

export const metadata = {
  title: "Record Piglet Return | Admin Dashboard",
  description: "Record revolving piglets returned by beneficiaries and health assessment",
};

export default async function AdminNewPigReturnPage() {
  const beneficiaries = await getBeneficiaryReturnOptions();

  return (
    <PigReturnForm
      backHref="/dashboard/admin/returns"
      beneficiaries={beneficiaries}
    />
  );
}
