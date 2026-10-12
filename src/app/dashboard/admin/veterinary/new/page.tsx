import { VeterinaryExaminationForm } from "@/components/veterinary/VeterinaryExaminationForm";

export const dynamic = "force-dynamic";

export default function AdminNewVetVisitPage() {
  return <VeterinaryExaminationForm backHref="/dashboard/admin/veterinary" />;
}
