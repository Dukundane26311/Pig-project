"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, CheckCircle2, AlertTriangle, 
  HeartPulse, Activity, ShieldCheck, AlertCircle, Loader2, ArrowLeftCircle
} from "lucide-react";
import { recordBatchPigReturn } from "@/app/actions/returns";

interface PigReturnFormProps {
  backHref?: string;
  beneficiaries?: Array<{
    id: string;
    fullName: string;
    beneficiaryNumber: string;
    districtStr: string | null;
  }>;
}

export function PigReturnForm({ backHref = "/dashboard/field/returns", beneficiaries = [] }: PigReturnFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [quantity, setQuantity] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>(today);
  const [sickPiglets, setSickPiglets] = useState<string>("0");
  const [diseaseDescription, setDiseaseDescription] = useState<string>("");
  const [treatmentDescription, setTreatmentDescription] = useState<string>("");
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const numTotal = parseInt(quantity, 10) || 0;
  const numSick = parseInt(sickPiglets, 10) || 0;
  const isInvalidSick = numTotal > 0 && numSick > numTotal;
  const numHealthy = Math.max(0, numTotal - numSick);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (numTotal < 1) {
      setErrorMessage("Please enter the number of piglets returned (at least 1).");
      return;
    }

    if (numSick > numTotal) {
      setErrorMessage("The number of sick piglets cannot exceed the total piglets returned.");
      return;
    }

    if (numSick < 0) {
      setErrorMessage("The number of sick piglets cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("quantity", String(numTotal));
      formData.set("returnDate", returnDate);
      formData.set("sickPiglets", String(numSick));
      formData.set("healthyPiglets", String(numHealthy));
      formData.set("diseaseDescription", diseaseDescription);
      formData.set("treatmentDescription", treatmentDescription);
      if (selectedBeneficiaryId) {
        formData.set("beneficiaryId", selectedBeneficiaryId);
      }

      const result = await recordBatchPigReturn(formData);
      if (result && !result.success) {
        setErrorMessage(result.error || "Failed to save return record.");
        setIsSubmitting(false);
      } else {
        setSuccessMessage(
          `Piglet return recorded successfully! Returned: ${numTotal} (${numHealthy} Healthy, ${numSick} Sick). Updating records...`
        );
        setTimeout(() => {
          router.push(backHref);
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while saving.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link 
          href={backHref}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe7df] bg-white text-[#5d6e64] hover:bg-[#e4ede6] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Record Piglet Returns</h1>
          <p className="mt-1 text-xs text-slate-500">
            Register revolving piglets returned by beneficiaries and record health assessments.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-xs flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-800">Saved Successfully</h4>
            <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error / Validation Notification */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-xs flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-800">Validation Error</h4>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-[#dfe7df] bg-[#f8faf8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ArrowLeftCircle className="h-5 w-5 text-[#2c5a43]" />
            <h2 className="text-base font-bold text-[#1b2d24]">Piglet Return Intake Details</h2>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6e64] bg-[#e4ede6] px-2.5 py-1 rounded-full">
            Batch Entry
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Beneficiary selection if available */}
            {beneficiaries.length > 0 && (
              <div className="sm:col-span-2">
                <label htmlFor="beneficiaryId" className="block text-sm font-semibold text-[#1c2b23]">
                  Beneficiary <span className="text-xs font-normal text-[#5d6e64]">(Optional)</span>
                </label>
                <select
                  id="beneficiaryId"
                  value={selectedBeneficiaryId}
                  onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm font-medium"
                >
                  <option value="">-- General Revolving Pool / Any Beneficiary --</option>
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.beneficiaryNumber}){b.districtStr ? ` - ${b.districtStr}` : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-[#5d6e64]">
                  Select the returning beneficiary to link to their revolving fund contract.
                </p>
              </div>
            )}

            {/* 1. Number of Piglets Returned */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-semibold text-[#1c2b23]">
                Number of Piglets Returned <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
                className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm placeholder:text-[#9db0a4] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm font-medium"
              />
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Enter the quantity of piglets physically received and confirmed.
              </p>
            </div>

            {/* 2. Return Date */}
            <div>
              <label htmlFor="returnDate" className="block text-sm font-semibold text-[#1c2b23]">
                Return Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm font-medium"
              />
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Today is selected by default. You can choose a previous date if needed.
              </p>
            </div>

            {/* 3. Number of Sick Piglets */}
            <div>
              <label htmlFor="sickPiglets" className="block text-sm font-semibold text-[#1c2b23]">
                Number of Sick Piglets <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="sickPiglets"
                name="sickPiglets"
                min="0"
                required
                value={sickPiglets}
                onChange={(e) => setSickPiglets(e.target.value)}
                placeholder="0"
                className={`mt-2 block w-full rounded-xl border px-3.5 py-2.5 text-[#1c2b23] shadow-sm placeholder:text-[#9db0a4] sm:text-sm font-medium focus:outline-none focus:ring-2 ${
                  isInvalidSick 
                    ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200" 
                    : "border-[#d9e1d8] bg-white focus:border-[#2c5a43] focus:ring-[#2c5a43]/20"
                }`}
              />
              <p className={`mt-1.5 text-xs ${isInvalidSick ? "text-red-600 font-medium" : "text-[#5d6e64]"}`}>
                {isInvalidSick
                  ? "⚠ Sick piglets cannot exceed the total piglets returned!"
                  : "Enter how many returned piglets were found sick or in need of treatment."}
              </p>
            </div>

            {/* 4. Number of Healthy Piglets (Automatically calculated) */}
            <div>
              <label htmlFor="healthyPiglets" className="block text-sm font-semibold text-[#1c2b23]">
                Number of Healthy Piglets <span className="text-xs font-normal text-[#5d6e64]">(Auto-calculated)</span>
              </label>
              <div className="relative mt-2">
                <input
                  type="number"
                  id="healthyPiglets"
                  name="healthyPiglets"
                  readOnly
                  value={numHealthy}
                  className="block w-full rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-2.5 text-[#166534] font-bold shadow-sm sm:text-sm cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#16a34a]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Automatically calculated as: <span className="font-semibold text-[#166534]">Total Returned ({numTotal}) − Sick Piglets ({numSick})</span>.
              </p>
            </div>

            {/* 5. Disease Description */}
            <div className="sm:col-span-2">
              <label htmlFor="diseaseDescription" className="block text-sm font-semibold text-[#1c2b23]">
                Disease Description
              </label>
              <textarea
                id="diseaseDescription"
                name="diseaseDescription"
                rows={3}
                value={diseaseDescription}
                onChange={(e) => setDiseaseDescription(e.target.value)}
                placeholder="Describe any illnesses, clinical symptoms, or injuries identified..."
                className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm placeholder:text-[#9db0a4] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm"
              />
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Clinical details of any symptoms observed upon receiving the piglets.
              </p>
            </div>

            {/* 6. Treatment Description */}
            <div className="sm:col-span-2">
              <label htmlFor="treatmentDescription" className="block text-sm font-semibold text-[#1c2b23]">
                Treatment Description
              </label>
              <textarea
                id="treatmentDescription"
                name="treatmentDescription"
                rows={3}
                value={treatmentDescription}
                onChange={(e) => setTreatmentDescription(e.target.value)}
                placeholder="Record medications, treatments, isolation, or recovery steps provided..."
                className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm placeholder:text-[#9db0a4] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm"
              />
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Specify medical interventions or therapy assigned to sick piglets.
              </p>
            </div>
          </div>

          {/* Validation Banner */}
          {isInvalidSick && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-sm font-medium text-red-800">
                Invalid quantities: The number of sick piglets (<strong>{numSick}</strong>) cannot exceed the total piglets returned (<strong>{numTotal}</strong>).
              </p>
            </div>
          )}

          {/* Automatic Summary Section */}
          <div className="rounded-[20px] border border-[#dfe7df] bg-[#f8faf8] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#2c5a43]" />
                <h3 className="text-base font-bold text-[#1b2d24]">Automatic Summary</h3>
              </div>
              <span className="text-xs text-[#5d6e64] font-medium">
                Live Calculation
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Total Piglets Returned */}
              <div className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6e64]">
                    Total Piglets Returned
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e3efe7] text-[#173d2e]">
                    <ArrowLeftCircle className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#1b2d24]">{numTotal}</p>
                <p className="mt-1 text-xs text-[#7a8a82]">Received from beneficiaries</p>
              </div>

              {/* Total Sick Piglets */}
              <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#c2410c]">
                    Total Sick Piglets
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffedd5] text-[#ea580c]">
                    <HeartPulse className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#c2410c]">{numSick}</p>
                <p className="mt-1 text-xs text-[#9a3412]">Quarantined / in therapy</p>
              </div>

              {/* Total Healthy Piglets */}
              <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#15803d]">
                    Total Healthy Piglets
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dcfce7] text-[#16a34a]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#15803d]">{numHealthy}</p>
                <p className="mt-1 text-xs text-[#166534]">Distribution-ready</p>
              </div>
            </div>
          </div>

          {/* Buttons: Cancel & Save Return Record */}
          <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#d9e1d8]">
            <Link 
              href={backHref}
              className="px-5 py-2.5 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] hover:bg-[#e4ede6] rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isInvalidSick || numTotal < 1}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2c5a43] px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1c2b23] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Return Record...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Return Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
