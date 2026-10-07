"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { returnPig } from "@/app/actions/livestock";

export default function NewReturnPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/beneficiaries')
      .then(res => res.json())
      .then(data => setBeneficiaries(data));
  }, []);

  const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return (
      beneficiary.fullName?.toLowerCase().includes(query) ||
      beneficiary.nationalId?.toLowerCase().includes(query) ||
      beneficiary.beneficiaryNumber?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const beneficiaryId = formData.get("beneficiaryId") as string;
    const quantity = Number(formData.get("quantity") ?? 0);
    const notes = formData.get("notes") as string;

    try {
      await returnPig({ beneficiaryId, quantity, notes });
      router.push("/dashboard/field/returns");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to record return.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/field/returns" className="text-[#5d6e64] hover:text-[#1c2b23]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Record Pig Return</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Log a pig or piglet returned by a beneficiary to the project.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Select Beneficiary *</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search beneficiary by name..."
                className="mb-2 w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border bg-white"
              />
              <select 
                name="beneficiaryId" 
                required
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border bg-white"
              >
                <option value="">-- Choose a Beneficiary --</option>
                {filteredBeneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>{b.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Number of Pigs Returned *</label>
              <input
                type="number"
                name="quantity"
                min={1}
                required
                defaultValue={1}
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Notes / Condition</label>
              <textarea 
                name="notes" 
                rows={3}
                placeholder="Why is it being returned? What is its health condition?"
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link 
              href="/dashboard/field/returns"
              className="bg-white py-2 px-4 border border-[#d9e1d8] rounded-md shadow-sm text-sm font-medium text-[#5d6e64] hover:bg-gray-50 mr-3"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2c5a43] hover:bg-[#1c2b23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2c5a43]"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? "Recording..." : "Record Return"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
