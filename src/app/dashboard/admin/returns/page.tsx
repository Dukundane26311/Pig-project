import { getPigReturnDateSummaries } from "@/app/actions/returns";
import { PigReturnsTableClient } from "@/components/returns/PigReturnsTableClient";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const { summaries, totalPigletsReturned, cumulativeExamined, notYetExamined, totalSickIdentified } =
    await getPigReturnDateSummaries();

  return (
    <PigReturnsTableClient
      records={summaries}
      totalPigletsReturned={totalPigletsReturned}
      cumulativeExamined={cumulativeExamined}
      notYetExamined={notYetExamined}
      totalSickIdentified={totalSickIdentified}
      newRecordHref="/dashboard/admin/returns/new"
    />
  );
}
