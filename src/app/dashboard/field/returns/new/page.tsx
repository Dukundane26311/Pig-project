import { getBeneficiaryReturnOptions } from "@/app/actions/returns";
import { PigReturnForm } from "@/components/returns/PigReturnForm";

export const dynamic = "force-dynamic";

export default async function NewReturnPage() {
  const beneficiaries = await getBeneficiaryReturnOptions();

  return (
    <PigReturnForm
      backHref="/dashboard/field/returns"
      beneficiaries={beneficiaries}
    />
  );
}
