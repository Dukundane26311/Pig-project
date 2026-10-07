"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { distributePig } from "@/app/actions/livestock";

export default function NewDistributionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetch('/api/beneficiaries')
      .then(res => res.json())
      .then(data => setBeneficiaries(data));

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return beneficiary.fullName?.toLowerCase().includes(query);
  });

  const selectedBeneficiary = beneficiaries.find((beneficiary) => beneficiary.id === selectedBeneficiaryId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const beneficiaryId = formData.get("beneficiaryId") as string;
    if (!beneficiaryId) {
      alert("Please select a beneficiary by searching for their name.");
      return;
    }

    setLoading(true);
    const notes = formData.get("notes") as string;
    const recordedAt = formData.get("recordedAt") as string;

    try {
      await distributePig({ beneficiaryId, notes, recordedAt });
      router.push("/dashboard/field/distributions");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to record distribution.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/field/distributions" className="text-[#5d6e64] hover:text-[#1c2b23]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Record Pig Distribution</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Create a pig record and assign it to the receiving beneficiary.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="recordedAt" value={now.toISOString()} />

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1c2b23] mb-1">Distribution Date</label>
                <input
                  type="text"
                  readOnly
                  value={now.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  className="w-full rounded-md border-[#d9e1d8] bg-gray-50 px-3 py-2 text-sm text-[#1c2b23]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1c2b23] mb-1">Current Time</label>
                <input
                  type="text"
                  readOnly
                  value={now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  className="w-full rounded-md border-[#d9e1d8] bg-gray-50 px-3 py-2 text-sm text-[#1c2b23]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Beneficiary *</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  if (!event.target.value.trim()) {
                    setSelectedBeneficiaryId("");
                  }
                }}
                placeholder="Type beneficiary name..."
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border bg-white"
              />

              <input type="hidden" name="beneficiaryId" value={selectedBeneficiaryId} />

              {searchTerm.trim() && (
                <div className="mt-2 rounded-md border border-[#d9e1d8] bg-[#f8faf8] max-h-48 overflow-y-auto">
                  {filteredBeneficiaries.length > 0 ? (
                    filteredBeneficiaries.map((beneficiary) => (
                      <button
                        key={beneficiary.id}
                        type="button"
                        onClick={() => {
                          setSelectedBeneficiaryId(beneficiary.id);
                          setSearchTerm(beneficiary.fullName || "");
                        }}
                        className="block w-full border-b border-[#e5ebe6] px-3 py-2 text-left text-sm text-[#1c2b23] last:border-b-0 hover:bg-[#edf3ee]"
                      >
                        {beneficiary.fullName}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-[#5d6e64]">No beneficiary found.</div>
                  )}
                </div>
              )}

              {selectedBeneficiary && (
                <p className="mt-2 text-sm text-[#2c5a43] font-medium">
                  Selected: {selectedBeneficiary.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Notes / Conditions</label>
              <textarea 
                name="notes" 
                rows={3}
                placeholder="Condition of the pig, any specific instructions given..."
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link 
              href="/dashboard/field/distributions"
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
              {loading ? "Recording..." : "Record Distribution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
