import { redirect } from "next/navigation";

export default async function FieldPigDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/admin/pigs/${id}`);
}