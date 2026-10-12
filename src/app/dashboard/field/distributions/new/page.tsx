"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { distributePig } from "@/app/actions/livestock";
import { LocationPicker } from "@/components/LocationPicker";

type BeneficiaryOption = {
  id: string;
  fullName: string;
  beneficiaryNumber: string;
  nationalId: string | null;
  status: string;
  districtId: string | null;
  sectorId: string | null;
  cellId: string | null;
  villageId: string | null;
  districtStr: string | null;
  sectorStr: string | null;
  cellStr: string | null;
  villageStr: string | null;
};

export default function NewDistributionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [pigReceived, setPigReceived] = useState<boolean | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    let active = true;
    fetch("/api/beneficiaries?purpose=distribution")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load beneficiaries.");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid beneficiary list.");
        if (active) {
          setBeneficiaries(data);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load beneficiaries:", error);
        if (active) setLoadError("Could not load registered beneficiaries. Refresh the page and try again.");
      })
      .finally(() => {
        if (active) setLoadingBeneficiaries(false);
      });

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const selectedBeneficiary = beneficiaries.find(
    (b) => b.id === selectedBeneficiaryId
  );

  const handleBeneficiarySelect = (id: string) => {
    setSelectedBeneficiaryId(id);
    const found = beneficiaries.find((b) => b.id === id);
    if (found) {
      if (found.nationalId) {
        setNationalId(found.nationalId);
      }
    }
  };

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      b.fullName?.toLowerCase().includes(query) ||
      b.beneficiaryNumber?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedBeneficiaryId) {
      alert("Please select a beneficiary from the list.");
      return;
    }

    if (pigReceived !== true) {
      alert("A completed distribution can only be recorded when pig receipt is confirmed as received.");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const district = (formData.get("district") as string) || "";
    const sector = (formData.get("sector") as string) || "";
    const cell = (formData.get("cell") as string) || "";
    const village = (formData.get("village") as string) || "";
    const districtId = (formData.get("districtId") as string) || "";
    const sectorId = (formData.get("sectorId") as string) || "";
    const cellId = (formData.get("cellId") as string) || "";
    const villageId = (formData.get("villageId") as string) || "";
    const notes = (formData.get("notes") as string) || "";

    try {
      await distributePig({
        beneficiaryId: selectedBeneficiaryId,
        nationalId: nationalId.trim(),
        district,
        sector,
        cell,
        village,
        districtId,
        sectorId,
        cellId,
        villageId,
        pigReceived: true,
        notes,
      });

      router.push("/dashboard/field/distributions");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to record distribution.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/field/distributions" className="text-[#5d6e64] hover:text-[#1c2b23]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Record Pig Distribution</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">
            Select a registered beneficiary to record distribution. Saving automatically creates the revolving obligation of two returned piglets.
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl border border-[#d9e1d8] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {loadError && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </p>
          )}

          {/* Automatic Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">
                Distribution Date (Automatic)
              </label>
              <input
                type="text"
                readOnly
                value={now.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                className="w-full rounded-md border-[#d9e1d8] bg-gray-50 px-3 py-2 text-sm text-[#1c2b23] border cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">
                Current Time (Automatic)
              </label>
              <input
                type="text"
                readOnly
                value={now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                className="w-full rounded-md border-[#d9e1d8] bg-gray-50 px-3 py-2 text-sm text-[#1c2b23] border cursor-not-allowed"
              />
            </div>
          </div>

          {/* Beneficiary Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#1c2b23]">
              Select Registered Beneficiary *
            </label>

            <div className="space-y-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search beneficiary by name or number..."
                className="w-full rounded-md border border-[#d9e1d8] p-2 text-sm shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43]"
              />

              <select
                name="beneficiaryId"
                required
                value={selectedBeneficiaryId}
                onChange={(e) => handleBeneficiarySelect(e.target.value)}
                disabled={loadingBeneficiaries || beneficiaries.length === 0}
                className="w-full rounded-md border border-[#d9e1d8] bg-white p-2.5 text-sm shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43]"
              >
                <option value="">
                  {loadingBeneficiaries 
                    ? "Loading registered beneficiaries..." 
                    : beneficiaries.length === 0 
                      ? "No registered beneficiaries found" 
                      : "-- Select Beneficiary by Name --"}
                </option>
                {filteredBeneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.fullName} ({b.beneficiaryNumber})
                  </option>
                ))}
              </select>
            </div>

            {!loadingBeneficiaries && beneficiaries.length === 0 && (
              <div className="flex items-center justify-between rounded-lg bg-[#f4f7f4] border border-[#d9e1d8] p-3 text-sm text-[#5d6e64]">
                <span>No registered beneficiaries found in system yet.</span>
                <Link
                  href="/dashboard/field/beneficiaries/new"
                  className="font-medium text-[#2c5a43] hover:underline"
                >
                  + Register Beneficiary
                </Link>
              </div>
            )}

            {selectedBeneficiary && (
              <div className="flex items-center gap-2 rounded-lg bg-[#e8f0eb] p-3 text-sm text-[#1c2b23]">
                <UserCheck className="h-5 w-5 text-[#2c5a43] shrink-0" />
                <div>
                  <span className="font-semibold">{selectedBeneficiary.fullName}</span>
                  <span className="text-xs text-[#5d6e64] ml-2">ID: {selectedBeneficiary.beneficiaryNumber}</span>
                </div>
              </div>
            )}
          </div>

          {/* National ID (Irangamuntu) */}
          <div>
            <label className="block text-sm font-medium text-[#1c2b23] mb-1">
              National ID Number (Irangamuntu)
            </label>
            <input
              type="text"
              name="nationalId"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="e.g. 1 1990 8 0012345 1 23"
              className="w-full rounded-md border border-[#d9e1d8] p-2 text-sm shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43]"
            />
            <p className="mt-1 text-xs text-[#5d6e64]">
              Rwandan National Identity Card (16 digits).
            </p>
          </div>

          {/* Rwanda Location Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#1c2b23]">
              Beneficiary Location (Rwanda)
            </label>
            <div className="rounded-lg border border-[#d9e1d8] p-4 bg-[#fbfcfb]">
              <LocationPicker
                villageRequired={false}
                initialDistrictId={selectedBeneficiary?.districtId || ""}
                initialSectorId={selectedBeneficiary?.sectorId || ""}
                initialCellId={selectedBeneficiary?.cellId || ""}
                initialVillageId={selectedBeneficiary?.villageId || ""}
              />
            </div>
          </div>

          {/* "Pig Received" Confirmation Option */}
          <div className="rounded-xl border-2 border-[#d9e1d8] p-4 bg-[#f8faf8] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-[#1c2b23]">
                  Pig Received Confirmation *
                </label>
                <p className="text-xs text-[#5d6e64]">
                  Confirm whether the beneficiary has physically received the pig.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pigReceived"
                  value="yes"
                  checked={pigReceived === true}
                  onChange={() => setPigReceived(true)}
                  className="h-4 w-4 text-[#2c5a43] focus:ring-[#2c5a43] border-[#d9e1d8]"
                  required
                />
                <span className="text-sm font-medium text-[#1c2b23] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#2c5a43]" />
                  Yes, pig has been received
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pigReceived"
                  value="no"
                  checked={pigReceived === false}
                  onChange={() => setPigReceived(false)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-[#d9e1d8]"
                />
                <span className="text-sm font-medium text-[#1c2b23] flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  No, not yet received
                </span>
              </label>
            </div>

            {pigReceived === false && (
              <p className="text-xs text-red-600 font-medium">
                A completed distribution can only be recorded when the pig has actually been received and confirmed.
              </p>
            )}
          </div>

          {/* Notes / Conditions */}
          <div>
            <label className="block text-sm font-medium text-[#1c2b23] mb-1">
              Notes / Instructions
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Condition of pig upon handover, beneficiary agreement notes, or special care instructions..."
              className="w-full rounded-md border border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end">
            <Link
              href="/dashboard/field/distributions"
              className="bg-white py-2 px-4 border border-[#d9e1d8] rounded-md shadow-sm text-sm font-medium text-[#5d6e64] hover:bg-gray-50 mr-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || loadingBeneficiaries || !selectedBeneficiaryId || pigReceived !== true}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2c5a43] hover:bg-[#1c2b23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2c5a43] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? "Recording..." : "Save Distribution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
