import { VeterinaryExaminationForm } from "@/components/veterinary/VeterinaryExaminationForm";

export const dynamic = "force-dynamic";

export default function NewVetVisitPage() {
  return <VeterinaryExaminationForm backHref="/dashboard/vet" />;
}
