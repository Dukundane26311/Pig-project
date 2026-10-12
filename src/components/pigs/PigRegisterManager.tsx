"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, CheckCircle2, Edit2, Loader2, Package, Plus, Save, 
  Search, Tag, Trash2, X, AlertTriangle 
} from "lucide-react";
import { 
  registerPigBatch, updatePigBatch, deletePigBatch, PigReceivedBatch 
} from "@/app/actions/pig";

interface PigRegisterManagerProps {
  initialBatches: PigReceivedBatch[];
  initialTotalAvailable: number;
  backHref?: string;
}

export function PigRegisterManager({
  initialBatches,
  initialTotalAvailable,
  backHref = "/dashboard/field/pigs",
}: PigRegisterManagerProps) {
  const [batches, setBatches] = useState<PigReceivedBatch[]>(initialBatches);
  const [totalAvailable, setTotalAvailable] = useState<number>(initialTotalAvailable);

  // Filter state
  const [searchDate, setSearchDate] = useState<string>("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [createQuantity, setCreateQuantity] = useState<number>(1);

  // Edit Modal State
  const [editingBatch, setEditingBatch] = useState<PigReceivedBatch | null>(null);
  const [editDate, setEditDate] = useState<string>("");
  const [editQuantity, setEditQuantity] = useState<number>(1);

  // Delete Confirmation State
  const [deletingBatch, setDeletingBatch] = useState<PigReceivedBatch | null>(null);

  // Transitions & Feedback
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filter batches by searchDate
  const filteredBatches = useMemo(() => {
    if (!searchDate.trim()) return batches;
    return batches.filter((b) => b.dateReceived === searchDate.trim());
  }, [batches, searchDate]);

  // Handle Create Pig Batch
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createQuantity < 1) {
      setFeedback({ type: "error", message: "Please enter at least 1 pig." });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await registerPigBatch({
          dateReceived: createDate,
          quantity: Number(createQuantity),
        });

        if (result.success && result.batch) {
          setBatches((prev) => [result.batch, ...prev]);
          setTotalAvailable(result.totalAvailable);
          setIsCreateOpen(false);
          setFeedback({
            type: "success",
            message: `Successfully saved ${createQuantity} pig${createQuantity > 1 ? "s" : ""} received on ${createDate}.`,
          });
          setCreateQuantity(1);
          setCreateDate(new Date().toISOString().split("T")[0]);
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "Failed to register pigs. Please try again.",
        });
      }
    });
  };

  // Open Edit Modal
  const openEdit = (batch: PigReceivedBatch) => {
    setEditingBatch(batch);
    setEditDate(batch.dateReceived);
    setEditQuantity(batch.quantity);
    setFeedback(null);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    if (editQuantity < 1) {
      setFeedback({ type: "error", message: "Number of pigs must be at least 1." });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await updatePigBatch({
          currentTags: editingBatch.tags,
          newDateReceived: editDate,
          newQuantity: Number(editQuantity),
        });

        if (result.success && result.batch) {
          setBatches((prev) =>
            prev.map((b) =>
              b.id === editingBatch.id
                ? {
                    ...b,
                    dateReceived: result.batch.dateReceived,
                    quantity: result.batch.quantity,
                    tags: result.batch.tags,
                  }
                : b
            )
          );
          setTotalAvailable(result.totalAvailable);
          setEditingBatch(null);
          setFeedback({
            type: "success",
            message: `Receipt record updated successfully (${result.batch.quantity} pigs on ${result.batch.dateReceived}).`,
          });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "Failed to update record. Please try again.",
        });
      }
    });
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = () => {
    if (!deletingBatch) return;

    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await deletePigBatch(deletingBatch.tags);
        if (result.success) {
          setBatches((prev) => prev.filter((b) => b.id !== deletingBatch.id));
          setTotalAvailable(result.totalAvailable);
          setFeedback({
            type: "success",
            message: `Receipt record of ${deletingBatch.quantity} pig(s) on ${deletingBatch.dateReceived} deleted successfully.`,
          });
          setDeletingBatch(null);
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "Failed to delete record. Please try again.",
        });
        setDeletingBatch(null);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Pig Register</h2>
            <p className="mt-1 text-sm text-[#5d6e64]">
              View received pig history and record new incoming pigs into project inventory.
            </p>
          </div>
        </div>

        {/* Register Pig / Save Pig button beside table header */}
        <button
          type="button"
          onClick={() => {
            setCreateDate(new Date().toISOString().split("T")[0]);
            setCreateQuantity(1);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Register Pig / Save Pig
        </button>
      </div>

      {/* Success / Error Feedback Message */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start justify-between gap-3 transition-all ${
            feedback.type === "success"
              ? "bg-[#eaf4ed] text-[#1c4b31] border border-[#bcdbc6]"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2c5a43] mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{feedback.type === "success" ? "Saved Successfully" : "Error"}</p>
              <p className="mt-0.5">{feedback.message}</p>
            </div>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[#5d6e64] hover:text-[#1c2b23] p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
        {/* Table Toolbar: Search by Date & Register Pig button */}
        <div className="px-6 py-4 border-b border-[#d9e1d8] bg-[#f8faf8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-serif text-[#1c2b23]">
              Pigs Received History
            </h3>
            <p className="text-xs text-[#5d6e64] mt-0.5">
              Receipt log showing date received and number of pigs received
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 3. Search by Date field above the table */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-[#d9e1d8] rounded-lg shadow-sm">
              <Search className="h-4 w-4 text-[#7d8d84]" />
              <label htmlFor="searchDate" className="text-xs font-medium text-[#5d6e64]">
                Date:
              </label>
              <input
                type="date"
                id="searchDate"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="text-xs text-[#1c2b23] bg-transparent focus:outline-none"
              />
              {searchDate && (
                <button
                  type="button"
                  onClick={() => setSearchDate("")}
                  title="Clear date filter"
                  className="text-xs text-[#7d8d84] hover:text-red-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Register Pig / Save Pig button beside table */}
            <button
              type="button"
              onClick={() => {
                setCreateDate(new Date().toISOString().split("T")[0]);
                setCreateQuantity(1);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2c5a43] bg-white text-xs font-semibold text-[#2c5a43] hover:bg-[#eef5f0] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Register Pig / Save Pig
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#fafcfa]">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-[#5d6e64] uppercase tracking-wider">
                  Date Received
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-[#5d6e64] uppercase tracking-wider">
                  Number of Pigs Received
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-[#5d6e64] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#eef2ee]">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-[#5d6e64]">
                    <Package className="h-8 w-8 mx-auto text-[#9db0a4] mb-2" />
                    {searchDate
                      ? `No pig receipt records found on ${searchDate}.`
                      : "No pig receipt records found yet. Click 'Register Pig / Save Pig' to add records."}
                    {searchDate && (
                      <div className="mt-2">
                        <button
                          onClick={() => setSearchDate("")}
                          className="text-xs text-[#2c5a43] underline font-medium hover:text-[#1c2b23]"
                        >
                          Clear date filter
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const displayDate = new Date(batch.dateReceived).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={batch.id} className="hover:bg-[#f6faf7] transition-colors">
                      {/* Date Received */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1c2b23]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#2c5a43]" />
                          <span>{displayDate}</span>
                        </div>
                      </td>

                      {/* Number of Pigs Received */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                        <span className="font-bold text-base font-serif text-[#1c2b23] mr-1.5">
                          {batch.quantity}
                        </span>
                        <span className="text-xs text-[#5d6e64]">
                          {batch.quantity === 1 ? "pig" : "pigs"}
                        </span>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                        {/* 1. Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEdit(batch)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#2c5a43] bg-[#eef5f0] hover:bg-[#dfeade] transition-colors border border-[#cbe2d3]"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>

                        {/* 2. Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingBatch(batch)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary: Total Pigs Available */}
      <div className="rounded-[16px] border border-[#dfe7df] bg-white p-5 shadow-[0_4px_12px_rgba(16,28,23,0.03)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e3efe7] text-[#173d2e]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5d6e64]">
                Inventory Status
              </p>
              <h3 className="text-base font-bold text-[#1c2b23]">
                Total Number of Pigs Available
              </h3>
              <p className="text-xs text-[#5d6e64]">
                Total pigs currently in stock across the entire project inventory
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold font-serif text-[#1c2b23]">
              {totalAvailable}
            </span>
            <span className="block text-xs font-medium text-[#2c5a43]">
              {totalAvailable === 1 ? "1 pig in stock" : `${totalAvailable} pigs in stock`}
            </span>
          </div>
        </div>
      </div>

      {/* ===================== CREATE MODAL ===================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-[#d9e1d8] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-[#f8faf8] border-b border-[#d9e1d8] flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-[#1c2b23]">
                Register Pig / Save Pig
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-[#5d6e64] hover:text-[#1c2b23] p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              {/* Date Received — automatically set to today's date */}
              <div>
                <label htmlFor="createDate" className="block text-sm font-medium text-[#1c2b23]">
                  Date Received
                </label>
                <input
                  type="date"
                  id="createDate"
                  name="createDate"
                  value={createDate}
                  onChange={(e) => setCreateDate(e.target.value)}
                  required
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 text-sm text-[#1c2b23] bg-white focus:outline-none focus:ring-2 focus:ring-[#2c5a43]"
                />
              </div>

              {/* Number of Pigs Received — enter quantity */}
              <div>
                <label htmlFor="createQuantity" className="block text-sm font-medium text-[#1c2b23]">
                  Number of Pigs Received
                </label>
                <input
                  type="number"
                  id="createQuantity"
                  name="createQuantity"
                  min="1"
                  value={createQuantity}
                  onChange={(e) => setCreateQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  required
                  placeholder="Enter number of pigs"
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 text-sm text-[#1c2b23] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#2c5a43]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#d9e1d8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] disabled:opacity-50 transition-colors"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Pig...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Save Pig
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT MODAL ===================== */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-[#d9e1d8] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-[#f8faf8] border-b border-[#d9e1d8] flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-[#1c2b23]">
                Edit Pig Receipt Record
              </h3>
              <button
                type="button"
                onClick={() => setEditingBatch(null)}
                className="text-[#5d6e64] hover:text-[#1c2b23] p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div>
                <label htmlFor="editDate" className="block text-sm font-medium text-[#1c2b23]">
                  Date Received
                </label>
                <input
                  type="date"
                  id="editDate"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 text-sm text-[#1c2b23] bg-white focus:outline-none focus:ring-2 focus:ring-[#2c5a43]"
                />
              </div>

              <div>
                <label htmlFor="editQuantity" className="block text-sm font-medium text-[#1c2b23]">
                  Number of Pigs Received
                </label>
                <input
                  type="number"
                  id="editQuantity"
                  min="1"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  required
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 text-sm text-[#1c2b23] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#2c5a43]"
                />
              </div>

              <div className="pt-3 border-t border-[#d9e1d8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] disabled:opacity-50 transition-colors"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {deletingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-red-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <h3 className="text-base font-bold text-red-900">
                Confirm Record Deletion
              </h3>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-sm text-[#1c2b23]">
                Are you sure you want to delete this receipt record of{" "}
                <span className="font-bold">{deletingBatch.quantity} pig(s)</span> received on{" "}
                <span className="font-bold">{deletingBatch.dateReceived}</span>?
              </p>
              <p className="text-xs text-red-600">
                This will remove the registered pigs from stock inventory and recalculate available stock.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingBatch(null)}
                className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="-ml-1 mr-2 h-4 w-4" />
                    Yes, Delete Record
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
