const inputClass =
  "block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white";

export function LocationAddForm({
  action,
  hiddenFields,
  nameLabel,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string>;
  nameLabel: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="p-4 sm:p-6 bg-[#f2f5f0] border-t border-[#d9e1d8] grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <div>
        <label className="block text-sm font-medium text-[#5d6e64] mb-1">{nameLabel}</label>
        <input type="text" name="name" required className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#5d6e64] mb-1">Code (optional)</label>
        <input type="text" name="code" className={inputClass} />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );
}
