"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";
import { logActivity } from "@/lib/audit";

import {
  type SystemSettingItem,
  DEFAULT_SYSTEM_SETTINGS,
  type UserPreferences,
  DEFAULT_USER_PREFERENCES,
} from "@/lib/constants/settings";

export type { SystemSettingItem, UserPreferences };

const ALL_ROLES = [
  Role.SUPER_ADMIN,
  Role.FIELD_OFFICER,
  Role.VETERINARIAN,
  Role.FINANCE_OFFICER,
] as const;

async function requireAdmin() {
  const user = await getActiveUser([Role.SUPER_ADMIN]);
  if (!user) throw new Error("Unauthorized: Only administrators can modify system settings.");
  return user;
}

export async function getUserPreferences(userId?: string): Promise<UserPreferences> {
  const defaultPrefs = { ...DEFAULT_USER_PREFERENCES };

  let targetUserId = userId;
  if (!targetUserId) {
    const user = await getActiveUser(ALL_ROLES);
    targetUserId = user?.id;
  }
  if (!targetUserId) return defaultPrefs;

  try {
    const key = `user_pref:${targetUserId}`;
    const record = await prisma.systemSetting.findUnique({
      where: { key },
    });
    if (record?.value) {
      const parsed = JSON.parse(record.value);
      return {
        theme: parsed.theme === "dark" ? "dark" : "light",
        textSize: ["small", "default", "large"].includes(parsed.textSize) ? parsed.textSize : "default",
        notifications: typeof parsed.notifications === "boolean" ? parsed.notifications : true,
      };
    }
  } catch (err) {
    console.error("Failed to load user preferences:", err);
  }

  return defaultPrefs;
}

export async function saveUserPreferences(preferences: UserPreferences) {
  const user = await getActiveUser(ALL_ROLES);
  if (!user) throw new Error("Unauthorized");

  const key = `user_pref:${user.id}`;
  const value = JSON.stringify(preferences);

  const prev = await prisma.systemSetting.findUnique({ where: { key } });

  const record = await prisma.systemSetting.upsert({
    where: { key },
    create: {
      key,
      value,
      description: `Personal display preferences for ${user.name} (${user.role})`,
      updatedById: user.id,
    },
    update: {
      value,
      description: `Personal display preferences for ${user.name} (${user.role})`,
      updatedById: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    role: user.role,
    action: prev ? "UPDATED" : "CREATED",
    entity: "USER_PREFERENCES",
    entityId: user.id,
    previousValue: prev?.value ? JSON.parse(prev.value) : null,
    newValue: preferences,
  });

  revalidatePath("/dashboard/settings");
  return { success: true, preferences, recordId: record.id };
}

export async function resetUserPreferences() {
  const user = await getActiveUser(ALL_ROLES);
  if (!user) throw new Error("Unauthorized");

  const key = `user_pref:${user.id}`;
  const defaultPrefs = { ...DEFAULT_USER_PREFERENCES };
  const value = JSON.stringify(defaultPrefs);

  const prev = await prisma.systemSetting.findUnique({ where: { key } });

  const record = await prisma.systemSetting.upsert({
    where: { key },
    create: {
      key,
      value,
      description: `Personal display preferences for ${user.name} (${user.role})`,
      updatedById: user.id,
    },
    update: {
      value,
      description: `Personal display preferences for ${user.name} (${user.role})`,
      updatedById: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    role: user.role,
    action: "RESET",
    entity: "USER_PREFERENCES",
    entityId: user.id,
    previousValue: prev?.value ? JSON.parse(prev.value) : null,
    newValue: defaultPrefs,
  });

  revalidatePath("/dashboard/settings");
  return { success: true, preferences: defaultPrefs, recordId: record.id };
}

export async function getSystemSettings(): Promise<SystemSettingItem[]> {
  try {
    let settings = await prisma.systemSetting.findMany({
      where: {
        NOT: { key: { startsWith: "user_pref:" } },
      },
      orderBy: { key: "asc" },
    });

    // Auto-seed defaults if empty
    if (settings.length === 0) {
      await prisma.systemSetting.createMany({
        data: DEFAULT_SYSTEM_SETTINGS,
        skipDuplicates: true,
      });

      settings = await prisma.systemSetting.findMany({
        where: {
          NOT: { key: { startsWith: "user_pref:" } },
        },
        orderBy: { key: "asc" },
      });
    }

    return settings;
  } catch (err) {
    console.error("Failed to load system settings:", err);
    return [];
  }
}

export async function upsertSystemSetting(formData: FormData) {
  const admin = await requireAdmin();

  const key = String(formData.get("key") || "").trim();
  const value = String(formData.get("value") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;

  if (!key) throw new Error("Setting key is required.");
  if (value === "") throw new Error("Setting value is required.");

  const existing = await prisma.systemSetting.findUnique({
    where: { key },
  });

  const updated = await prisma.systemSetting.upsert({
    where: { key },
    create: {
      key,
      value,
      description,
      updatedById: admin.id,
    },
    update: {
      value,
      description,
      updatedById: admin.id,
    },
  });

  await logActivity({
    userId: admin.id,
    role: admin.role,
    action: existing ? "UPDATED" : "CREATED",
    entity: "SETTING",
    entityId: key,
    previousValue: existing ? { value: existing.value, description: existing.description } : null,
    newValue: { value, description },
  });

  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/settings");

  return { success: true, setting: updated };
}

export async function resetSystemSetting(key: string) {
  const admin = await requireAdmin();

  const defaultSetting = DEFAULT_SYSTEM_SETTINGS.find((s) => s.key === key);
  if (!defaultSetting) {
    throw new Error(`No default configuration exists for key: ${key}`);
  }

  const existing = await prisma.systemSetting.findUnique({
    where: { key },
  });

  const updated = await prisma.systemSetting.upsert({
    where: { key },
    create: {
      key: defaultSetting.key,
      value: defaultSetting.value,
      description: defaultSetting.description,
      updatedById: admin.id,
    },
    update: {
      value: defaultSetting.value,
      description: defaultSetting.description,
      updatedById: admin.id,
    },
  });

  await logActivity({
    userId: admin.id,
    role: admin.role,
    action: "RESET",
    entity: "SETTING",
    entityId: key,
    previousValue: existing ? { value: existing.value, description: existing.description } : null,
    newValue: { value: defaultSetting.value, description: defaultSetting.description },
  });

  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/admin");

  return { success: true, setting: updated };
}

export async function resetAllSettings() {
  const admin = await requireAdmin();

  for (const def of DEFAULT_SYSTEM_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        value: def.value,
        description: def.description,
        updatedById: admin.id,
      },
      update: {
        value: def.value,
        description: def.description,
        updatedById: admin.id,
      },
    });
  }

  await logActivity({
    userId: admin.id,
    role: admin.role,
    action: "RESET",
    entity: "SETTING",
    entityId: "ALL_SETTINGS",
    newValue: { count: DEFAULT_SYSTEM_SETTINGS.length },
  });

  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/admin");

  return { success: true };
}
