"use client";

import { useState, useTransition } from "react";
import {
  Settings,
  Plus,
  RotateCcw,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Save,
  ShieldAlert,
} from "lucide-react";
import {
  upsertSystemSetting,
  resetSystemSetting,
  resetAllSettings,
} from "@/app/actions/settings";
import {
  DEFAULT_SYSTEM_SETTINGS,
  type SystemSettingItem,
} from "@/lib/constants/settings";

interface Props {
  initialSettings: SystemSettingItem[];
  userRole?: string;
}

export function SettingsTableClient({ initialSettings, userRole }: Props) {
  const isAdmin = userRole === "SUPER_ADMIN";
  const [settings, setSettings] = useState<SystemSettingItem[]>(initialSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Feedback states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit / Create modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [activeKey, setActiveKey] = useState("");
  const [activeValue, setActiveValue] = useState("");
  const [activeDescription, setActiveDescription] = useState("");

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 6000);
  };

  const handleOpenCreate = () => {
    setIsEditingExisting(false);
    setActiveKey("");
    setActiveValue("");
    setActiveDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (setting: SystemSettingItem) => {
    setIsEditingExisting(true);
    setActiveKey(setting.key);
    setActiveValue(setting.value);
    setActiveDescription(setting.description || "");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKey.trim() || activeValue.trim() === "") {
      triggerError("Both Setting Key and Value are required.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("key", activeKey.trim());
        formData.append("value", activeValue.trim());
        formData.append("description", activeDescription.trim());

        const res = await upsertSystemSetting(formData);
        if (res.success && res.setting) {
          setSettings((prev) => {
            const index = prev.findIndex((s) => s.key === res.setting.key);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = res.setting;
              return updated;
            }
            return [...prev, res.setting].sort((a, b) => a.key.localeCompare(b.key));
          });
          setIsModalOpen(false);
          triggerSuccess(`Setting '${activeKey}' saved successfully.`);
        }
      } catch (err: any) {
        triggerError(err.message || "Failed to save system setting.");
      }
    });
  };

  const handleResetSingle = (key: string) => {
    const isDefault = DEFAULT_SYSTEM_SETTINGS.some((d) => d.key === key);
    if (!isDefault) {
      triggerError(`No standard default configuration is defined for custom setting: ${key}`);
      return;
    }

    if (!confirm(`Are you sure you want to reset '${key}' back to its system default value?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await resetSystemSetting(key);
        if (res.success && res.setting) {
          setSettings((prev) =>
            prev.map((s) => (s.key === key ? res.setting : s))
          );
          triggerSuccess(`Setting '${key}' was successfully reset to default.`);
        }
      } catch (err: any) {
        triggerError(err.message || "Failed to reset setting.");
      }
    });
  };

  const handleResetAll = () => {
    if (!confirm("Are you sure you want to restore ALL system settings to their default values?")) {
      return;
    }

    startTransition(async () => {
      try {
        await resetAllSettings();
        setSettings((prev) =>
          prev.map((item) => {
            const def = DEFAULT_SYSTEM_SETTINGS.find((d) => d.key === item.key);
            return def ? { ...item, value: def.value, description: def.description } : item;
          })
        );
        triggerSuccess("All system settings have been restored to defaults.");
      } catch (err: any) {
        triggerError(err.message || "Failed to restore all settings.");
      }
    });
  };

  const filteredSettings = settings.filter(
    (s) =>
      s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23] flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#2c5a43]" /> System Settings
          </h1>
          <p className="mt-1 text-sm text-[#5d6e64]">
            Configure and manage global operational variables stored in the database.
          </p>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5d6e64] hover:text-[#1c2b23] border border-[#d9e1d8] rounded-lg bg-white hover:bg-[#f2f5f0] transition disabled:opacity-50"
              title="Restore default configuration"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#5d6e64]" /> Reset All Defaults
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#2c5a43] hover:bg-[#1c2b23] rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add Setting
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#2c5a43] bg-[#e3efe7] border border-[#cfe4d7] rounded-xl">
            <ShieldAlert className="h-4 w-4 text-[#2c5a43]" />
            <span>Read-Only Mode &bull; Managed by System Administrators</span>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-[#cfe4d7] bg-[#e7f4ed] p-4 text-sm text-[#064b36] shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#2c5a43] shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-[#064b36] hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-[#f5c6cb] bg-[#f8d7da] p-4 text-sm text-[#721c24] shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-[#c9577a] shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-[#721c24] hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9db0a4]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search setting key, value, or description..."
            className="block w-full pl-9 pr-4 py-2 border border-[#d9e1d8] rounded-lg bg-[#fbfcfb] text-sm text-[#1c2b23] focus:outline-none focus:ring-1 focus:ring-[#2c5a43] focus:border-[#2c5a43]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9db0a4] hover:text-[#1c2b23]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Table */}
      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Configuration Key
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Current Value
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {filteredSettings.map((setting) => {
                const isDefault = DEFAULT_SYSTEM_SETTINGS.some((d) => d.key === setting.key);
                return (
                  <tr key={setting.id} className="hover:bg-[#f9faf8] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold font-mono text-[#1c2b23]">
                      {setting.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className="inline-block px-2.5 py-1 rounded bg-[#e8f0eb] text-[#2c5a43] border border-[#cfe0d4] font-mono text-xs">
                        {setting.value}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5d6e64] max-w-md">
                      {setting.description || <span className="text-[#9db0a4] italic">No description provided</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {isAdmin ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(setting)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2c5a43] hover:text-[#1c2b23] hover:bg-[#e4ede6] rounded transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>

                          {isDefault && (
                            <button
                              type="button"
                              onClick={() => handleResetSingle(setting.key)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#5d6e64] hover:text-[#c9577a] hover:bg-[#fdeeed] rounded transition"
                              title="Reset to default"
                            >
                              <RotateCcw className="h-3 w-3" /> Reset
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-[#7a8a82] italic">System Parameter (Read-only)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSettings.length === 0 && (
          <div className="p-8 text-center text-sm text-[#5d6e64]">
            {searchQuery ? (
              <div>
                <p>No system settings matching &quot;{searchQuery}&quot;.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs font-semibold text-[#2c5a43] hover:underline"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              <div>
                <p>No system settings configured in the database.</p>
                {isAdmin && (
                  <button
                    onClick={handleOpenCreate}
                    className="mt-2 text-xs font-semibold text-[#2c5a43] hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create a setting now
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#d9e1d8] w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#d9e1d8] px-6 py-4 bg-[#f8faf8]">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#2c5a43]" />
                <h3 className="font-serif font-bold text-lg text-[#1c2b23]">
                  {isEditingExisting ? `Edit Setting: ${activeKey}` : "Create System Setting"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#9db0a4] hover:text-[#1c2b23] p-1 rounded-full hover:bg-[#e4ede6] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5d6e64]">
                  Setting Key *
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditingExisting}
                  value={activeKey}
                  onChange={(e) => setActiveKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="e.g. revolving_return_target"
                  className="mt-1 block w-full px-3.5 py-2 border border-[#d9e1d8] rounded-lg text-sm font-mono text-[#1c2b23] bg-white disabled:bg-[#f2f5f0] disabled:text-[#7a8a82] focus:ring-1 focus:ring-[#2c5a43] focus:border-[#2c5a43]"
                />
                <p className="mt-1 text-xs text-[#7a8a82]">
                  {isEditingExisting
                    ? "Setting keys are unique identifiers and cannot be altered once created."
                    : "Use snake_case for consistency (letters, numbers, underscores)."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5d6e64]">
                  Setting Value *
                </label>
                <input
                  type="text"
                  required
                  value={activeValue}
                  onChange={(e) => setActiveValue(e.target.value)}
                  placeholder="Enter configuration value"
                  className="mt-1 block w-full px-3.5 py-2 border border-[#d9e1d8] rounded-lg text-sm text-[#1c2b23] bg-white focus:ring-1 focus:ring-[#2c5a43] focus:border-[#2c5a43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5d6e64]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={activeDescription}
                  onChange={(e) => setActiveDescription(e.target.value)}
                  placeholder="Explain what this system variable governs..."
                  className="mt-1 block w-full px-3.5 py-2 border border-[#d9e1d8] rounded-lg text-sm text-[#1c2b23] bg-white focus:ring-1 focus:ring-[#2c5a43] focus:border-[#2c5a43]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d9e1d8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#2c5a43] hover:bg-[#1c2b23] rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isPending ? "Saving..." : isEditingExisting ? "Update Setting" : "Save Setting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
