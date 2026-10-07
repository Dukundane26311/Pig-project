import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createUser } from "@/app/actions/user";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function NewUserPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }> | { error?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const params = await Promise.resolve(searchParams ?? {});
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/admin/users" className="text-[#5d6e64] hover:text-[#1c2b23]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Create New User</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Add a new Field Officer, Veterinarian, or Admin to the system.</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] p-6">
        <form action={createUser} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Email (Username) *</label>
              <input
                type="text"
                name="email"
                required
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
                placeholder="jane@valueprotocols.rw"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
                placeholder="+250 780 000 000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Initial Password *</label>
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
                placeholder="••••••••"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">System Role *</label>
              <select
                name="role"
                required
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border bg-white"
              >
                <option value="">Select a role...</option>
                <option value="FIELD_OFFICER">Employee / Field Officer (Data Entry & Distributions)</option>
                <option value="VETERINARIAN">Veterinarian (Health Records)</option>
                <option value="FINANCE_OFFICER">Finance Officer (Income & Expenses)</option>
                <option value="SUPER_ADMIN">Admin (Full Access)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link
              href="/dashboard/admin/users"
              className="bg-white py-2 px-4 border border-[#d9e1d8] rounded-md shadow-sm text-sm font-medium text-[#5d6e64] hover:bg-gray-50 mr-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2c5a43] hover:bg-[#1c2b23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2c5a43]"
            >
              <Save className="h-4 w-4 mr-2" />
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
