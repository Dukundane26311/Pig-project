import { getVeterinaryDateSummaries } from "@/app/actions/veterinary";
import { VeterinaryRecordsTableClient } from "@/components/veterinary/VeterinaryRecordsTableClient";

export const dynamic = "force-dynamic";

export default async function VeterinaryPage() {
  const { summary, totalPigsAvailable } = await getVeterinaryDateSummaries();

  return (
    <VeterinaryRecordsTableClient
      records={summary}
      totalPigsAvailable={totalPigsAvailable}
      newRecordHref="/dashboard/vet/veterinary/new"
    />
  );
}
