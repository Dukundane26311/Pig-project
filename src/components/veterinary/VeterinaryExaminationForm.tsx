"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, CheckCircle2, AlertTriangle, Stethoscope, 
  HeartPulse, Activity, ShieldCheck, AlertCircle, Loader2
} from "lucide-react";
import { recordVeterinaryBatchExamination } from "@/app/actions/veterinary";

interface VeterinaryExaminationFormProps {
  backHref?: string;
}

export function VeterinaryExaminationForm({ backHref = "/dashboard/vet" }: VeterinaryExaminationFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [totalExamined, setTotalExamined] = useState<string>("");
  const [examinationDate, setExaminationDate] = useState<string>(today);
  const [sickPigs, setSickPigs] = useState<string>("0");
  const [diseaseDescription, setDiseaseDescription] = useState<string>("");
  const [treatmentDescription, setTreatmentDescription] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const numTotal = parseInt(totalExamined, 10) || 0;
  const numSick = parseInt(sickPigs, 10) || 0;
  const isInvalidSick = numTotal > 0 && numSick > numTotal;
  const numHealthy = Math.max(0, numTotal - numSick);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (numTotal < 1) {
      setErrorMessage("Please enter the number of pigs examined (at least 1).");
      return;
    }

    if (numSick > numTotal) {
      setErrorMessage("The number of sick pigs cannot exceed the total pigs examined.");
      return;
    }

    if (numSick < 0) {
      setErrorMessage("The number of sick pigs cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("totalExamined", String(numTotal));
      formData.set("examinationDate", examinationDate);
      formData.set("sickPigs", String(numSick));
      formData.set("healthyPigs", String(numHealthy));
      formData.set("diseaseDescription", diseaseDescription);
      formData.set("treatmentDescription", treatmentDescription);

      const result = await recordVeterinaryBatchExamination(formData);
      if (result && !result.success) {
        setErrorMessage(result.error || "Failed to save examination record.");
        setIsSubmitting(false);
      } else {
        setSuccessMessage(
          `Examination recorded successfully! Examined: ${numTotal} (${numHealthy} Healthy, ${numSick} Sick). Updating dashboard...`
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Veterinary Examination</h1>
          <p className="mt-1 text-xs text-slate-500">
            Record clinical examinations, identify illnesses, and administer medical treatments.
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

      {/* Main Examination Form Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-[#dfe7df] bg-[#f8faf8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="h-5 w-5 text-[#2c5a43]" />
            <h2 className="text-base font-bold text-[#1b2d24]">Clinical Examination Details</h2>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6e64] bg-[#e4ede6] px-2.5 py-1 rounded-full">
            Batch Entry
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* 1. Number of Pigs Examined */}
            <div>
              <label htmlFor="totalExamined" className="block text-sm font-semibold text-[#1c2b23]">
                Number of Pigs Examined <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="totalExamined"
                name="totalExamined"
                min="1"
                required
                value={totalExamined}
                onChange={(e) => setTotalExamined(e.target.value)}
                placeholder="e.g. 20"
                className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm placeholder:text-[#9db0a4] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm font-medium"
              />
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Enter the total number of pigs inspected in this session.
              </p>
            </div>

            {/* 2. Examination Date */}
            <div>
              <label htmlFor="examinationDate" className="block text-sm font-semibold text-[#1c2b23]">
                Examination Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="examinationDate"
                name="examinationDate"
                required
                value={examinationDate}
                onChange={(e) => setExaminationDate(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm font-medium"
              />
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Today is selected by default. You can choose a previous date if needed.
              </p>
            </div>

            {/* 3. Number of Sick Pigs */}
            <div>
              <label htmlFor="sickPigs" className="block text-sm font-semibold text-[#1c2b23]">
                Number of Sick Pigs <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="sickPigs"
                name="sickPigs"
                min="0"
                required
                value={sickPigs}
                onChange={(e) => setSickPigs(e.target.value)}
                placeholder="0"
                className={`mt-2 block w-full rounded-xl border px-3.5 py-2.5 text-[#1c2b23] shadow-sm placeholder:text-[#9db0a4] sm:text-sm font-medium focus:outline-none focus:ring-2 ${
                  isInvalidSick 
                    ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200" 
                    : "border-[#d9e1d8] bg-white focus:border-[#2c5a43] focus:ring-[#2c5a43]/20"
                }`}
              />
              <p className={`mt-1.5 text-xs ${isInvalidSick ? "text-red-600 font-medium" : "text-[#5d6e64]"}`}>
                {isInvalidSick
                  ? "⚠ Sick pigs cannot exceed the total pigs examined!"
                  : "Enter how many pigs were found sick or in need of treatment."}
              </p>
            </div>

            {/* 4. Number of Healthy Pigs (Automatically calculated) */}
            <div>
              <label htmlFor="healthyPigs" className="block text-sm font-semibold text-[#1c2b23]">
                Number of Healthy Pigs <span className="text-xs font-normal text-[#5d6e64]">(Auto-calculated)</span>
              </label>
              <div className="relative mt-2">
                <input
                  type="number"
                  id="healthyPigs"
                  name="healthyPigs"
                  readOnly
                  value={numHealthy}
                  className="block w-full rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-2.5 text-[#166534] font-bold shadow-sm sm:text-sm cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#16a34a]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Automatically calculated as: <span className="font-semibold text-[#166534]">Total Examined ({numTotal}) − Sick Pigs ({numSick})</span>.
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
                placeholder="Describe illnesses, symptoms, or health problems identified (e.g., fever, respiratory symptoms, parasites)..."
                className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm placeholder:text-[#9db0a4] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm"
              />
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Provide clinical details for any health conditions observed during examination.
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
                placeholder="Describe treatments provided to sick pigs (e.g., antibiotic injection, dewormer, isolation)..."
                className="mt-2 block w-full rounded-xl border border-[#d9e1d8] bg-white px-3.5 py-2.5 text-[#1c2b23] shadow-sm placeholder:text-[#9db0a4] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 sm:text-sm"
              />
              <p className="mt-1.5 text-xs text-[#5d6e64]">
                Specify medications, therapies, or recovery steps administered to affected animals.
              </p>
            </div>
          </div>

          {/* Real-time Validation Error Banner */}
          {isInvalidSick && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-sm font-medium text-red-800">
                Invalid numbers: The number of sick pigs (<strong>{numSick}</strong>) cannot exceed the total pigs examined (<strong>{numTotal}</strong>). Please adjust your counts.
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
              {/* Total Pigs Examined */}
              <div className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6e64]">
                    Total Pigs Examined
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e3efe7] text-[#173d2e]">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#1b2d24]">{numTotal}</p>
                <p className="mt-1 text-xs text-[#7a8a82]">Inspected livestock</p>
              </div>

              {/* Total Sick Pigs */}
              <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#c2410c]">
                    Total Sick Pigs
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffedd5] text-[#ea580c]">
                    <HeartPulse className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#c2410c]">{numSick}</p>
                <p className="mt-1 text-xs text-[#9a3412]">Under therapy / quarantine</p>
              </div>

              {/* Total Healthy Pigs */}
              <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#15803d]">
                    Total Healthy Pigs
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dcfce7] text-[#16a34a]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#15803d]">{numHealthy}</p>
                <p className="mt-1 text-xs text-[#166534]">Cleared for distribution</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
                  <span>Saving Record...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
