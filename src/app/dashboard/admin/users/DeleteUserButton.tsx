"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUser } from "@/app/actions/user";

export function DeleteUserButton({
  userId,
  userName,
  isCurrentUser,
}: {
  userId: string;
  userName: string;
  isCurrentUser: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (isCurrentUser) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const res = await deleteUser(userId);
      if (res && !res.success && res.error) {
        alert(res.error);
      }
    });
  };

  if (isCurrentUser) {
    return (
      <span className="inline-flex items-center text-xs text-[#8a9990] italic">
        Current user
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title={`Delete ${userName}`}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-50 border border-transparent hover:border-red-200"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      <span>Delete</span>
    </button>
  );
}
