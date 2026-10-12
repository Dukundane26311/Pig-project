import { getReceivedPigBatches, getTotalPigsAvailable } from "@/app/actions/pig";
import { PigRegisterManager } from "@/components/pigs/PigRegisterManager";

export const dynamic = "force-dynamic";

export default async function AdminNewPigPage() {
  const [initialBatches, initialTotalAvailable] = await Promise.all([
    getReceivedPigBatches(),
    getTotalPigsAvailable(),
  ]);

  return (
    <PigRegisterManager
      initialBatches={initialBatches}
      initialTotalAvailable={initialTotalAvailable}
      backHref="/dashboard/admin/pigs"
    />
  );
}
