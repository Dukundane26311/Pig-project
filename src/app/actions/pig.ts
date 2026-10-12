"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PigSex, PigStatus, Prisma, Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

export type PigReceivedBatch = {
  id: string;
  dateReceived: string;
  quantity: number;
  tags: string[];
  createdAt: string;
};

async function generatePigId(offset = 0) {
  const year = new Date().getFullYear();
  const prefix = `PF-RW-${year}-`;
  const lastPig = await prisma.pig.findFirst({
    where: {
      OR: [
        { tagNumber: { startsWith: prefix } },
        { tagNumber: { startsWith: `PIG-${year}-` } },
      ],
    },
    orderBy: { tagNumber: "desc" },
  });

  if (!lastPig) return `${prefix}${String(1 + offset).padStart(5, "0")}`;

  const parts = lastPig.tagNumber.split("-");
  const lastPart = parts[parts.length - 1];
  const lastSequence = parseInt(lastPart, 10);
  const nextSequence = (Number.isNaN(lastSequence) ? 1 : lastSequence + 1) + offset;
  const sequenceStr = String(nextSequence).padStart(5, "0");

  return `${prefix}${sequenceStr}`;
}

export async function createPig(formData: FormData) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!user) throw new Error("Unauthorized");

  const quantityRaw = formData.get("quantity") || formData.get("pigsReceivedToday");
  const quantity = Math.max(1, parseInt(String(quantityRaw || 1), 10) || 1);

  const breedValue = formData.get("breed");
  const sexValue = formData.get("sex");
  const colorValue = formData.get("color");
  const notesValue = formData.get("notes");
  const sourceValue = formData.get("source");
  const locationValue = formData.get("currentLocation") || formData.get("location");
  const ageValue = formData.get("estimatedAge");
  const dateReceivedValue = formData.get("dateReceived");

  const breed = typeof breedValue === "string" ? breedValue.trim() : "";
  const color = typeof colorValue === "string" ? colorValue.trim() : "";
  const userNotes = typeof notesValue === "string" ? notesValue.trim() : "";
  const source = typeof sourceValue === "string" ? sourceValue.trim() : "";
  const currentLocation = typeof locationValue === "string" ? locationValue.trim() : "";
  const estimatedAge = ageValue && typeof ageValue === "string" ? parseInt(ageValue, 10) : null;
  const dateReceived = dateReceivedValue && typeof dateReceivedValue === "string" && dateReceivedValue.trim()
    ? new Date(dateReceivedValue)
    : new Date();

  const notes = [color, userNotes].filter(Boolean).join(" - ") || null;

  const sexInput = typeof sexValue === "string" ? sexValue : "";
  if (sexInput && sexInput !== "MALE" && sexInput !== "FEMALE") {
    throw new Error("Select a valid pig sex.");
  }
  const sex = sexInput === "MALE"
    ? PigSex.MALE
    : sexInput === "FEMALE"
      ? PigSex.FEMALE
      : null;
  if (breed.length > 100 || (notes && notes.length > 1000)) {
    throw new Error("Pig details exceed the allowed length.");
  }

  let savedPigs = false;
  for (let attempt = 0; attempt < 3 && !savedPigs; attempt += 1) {
    try {
      await prisma.$transaction(async (tx) => {
        const year = Number.isNaN(dateReceived.getTime()) ? new Date().getFullYear() : dateReceived.getFullYear();
        const prefix = `PF-RW-${year}-`;
        const lastPig = await tx.pig.findFirst({
          where: {
            OR: [
              { tagNumber: { startsWith: prefix } },
              { tagNumber: { startsWith: `PIG-${year}-` } },
            ],
          },
          orderBy: { tagNumber: "desc" },
        });

        let baseSequence = 0;
        if (lastPig) {
          const parts = lastPig.tagNumber.split("-");
          const lastPart = parts[parts.length - 1];
          const lastSeq = parseInt(lastPart, 10);
          if (!Number.isNaN(lastSeq)) {
            baseSequence = lastSeq;
          }
        }

        for (let i = 1; i <= quantity; i++) {
          const tagNumber = `${prefix}${String(baseSequence + i + attempt * 100).padStart(5, "0")}`;
          const pig = await tx.pig.create({
            data: {
              tagNumber,
              currentBeneficiaryId: null,
              breed: breed || null,
              sex,
              notes,
              source: source || null,
              currentLocation: currentLocation || null,
              estimatedAge: estimatedAge && !Number.isNaN(estimatedAge) ? estimatedAge : null,
              dateReceived: Number.isNaN(dateReceived.getTime()) ? new Date() : dateReceived,
              status: "REGISTERED",
            },
          });

          await tx.auditLog.create({
            data: {
              userId: user.id,
              role: user.role,
              action: "CREATED",
              entity: "PIG",
              entityId: pig.id,
              newValue: { tagNumber: pig.tagNumber, status: pig.status, quantity },
            },
          });
        }
      });
      savedPigs = true;
    } catch (error) {
      const isTagCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.some((target) => String(target).includes("pigId"));
      if (!isTagCollision || attempt === 2) throw error;
    }
  }

  if (!savedPigs) throw new Error("Could not register pigs into inventory.");

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/admin/pigs/new");
  revalidatePath("/dashboard/field/pigs");
  revalidatePath("/dashboard/field/pigs/new");
  revalidatePath("/dashboard/field/distributions/new");
  revalidatePath("/dashboard/field/returns/new");
  revalidatePath("/dashboard/vet");
  revalidatePath("/api/pigs/available");

  if (user.role === Role.SUPER_ADMIN) redirect("/dashboard/admin/pigs");
  redirect("/dashboard/field/pigs");
}

export async function registerPigBatch(data: {
  dateReceived?: string;
  quantity: number;
}) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!user) throw new Error("Unauthorized");

  const quantity = Math.max(1, parseInt(String(data.quantity || 1), 10) || 1);
  const dateReceived = data.dateReceived && data.dateReceived.trim()
    ? new Date(data.dateReceived)
    : new Date();
  const validDate = Number.isNaN(dateReceived.getTime()) ? new Date() : dateReceived;

  let createdPigs: { id: string; tagNumber: string }[] = [];
  let savedPigs = false;

  for (let attempt = 0; attempt < 3 && !savedPigs; attempt += 1) {
    try {
      await prisma.$transaction(async (tx) => {
        const year = validDate.getFullYear();
        const prefix = `PF-RW-${year}-`;
        const lastPig = await tx.pig.findFirst({
          where: {
            OR: [
              { tagNumber: { startsWith: prefix } },
              { tagNumber: { startsWith: `PIG-${year}-` } },
            ],
          },
          orderBy: { tagNumber: "desc" },
        });

        let baseSequence = 0;
        if (lastPig) {
          const parts = lastPig.tagNumber.split("-");
          const lastPart = parts[parts.length - 1];
          const lastSeq = parseInt(lastPart, 10);
          if (!Number.isNaN(lastSeq)) {
            baseSequence = lastSeq;
          }
        }

        const batchList: { id: string; tagNumber: string }[] = [];
        for (let i = 1; i <= quantity; i++) {
          const tagNumber = `${prefix}${String(baseSequence + i + attempt * 100).padStart(5, "0")}`;
          const pig = await tx.pig.create({
            data: {
              tagNumber,
              currentBeneficiaryId: null,
              dateReceived: validDate,
              status: PigStatus.REGISTERED,
            },
          });
          batchList.push({ id: pig.id, tagNumber: pig.tagNumber });

          await tx.auditLog.create({
            data: {
              userId: user.id,
              role: user.role,
              action: "CREATED",
              entity: "PIG",
              entityId: pig.id,
              newValue: { tagNumber: pig.tagNumber, status: pig.status, quantity },
            },
          });
        }
        createdPigs = batchList;
      });
      savedPigs = true;
    } catch (error) {
      const isTagCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.some((target) => String(target).includes("pigId"));
      if (!isTagCollision || attempt === 2) throw error;
    }
  }

  if (!savedPigs) throw new Error("Could not register pigs into inventory.");

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/admin/pigs/new");
  revalidatePath("/dashboard/field/pigs");
  revalidatePath("/dashboard/field/pigs/new");
  revalidatePath("/dashboard/field/distributions/new");
  revalidatePath("/dashboard/field/returns/new");
  revalidatePath("/dashboard/vet");
  revalidatePath("/api/pigs/available");

  const totalAvailable = await prisma.pig.count({
    where: {
      deletedAt: null,
      currentBeneficiaryId: null,
      status: {
        notIn: [PigStatus.DISTRIBUTED, PigStatus.DECEASED, PigStatus.SOLD, PigStatus.INACTIVE],
      },
    },
  });

  const dateReceivedStr = validDate.toISOString().split("T")[0];

  return {
    success: true,
    batch: {
      id: createdPigs[0]?.id || `batch-${Date.now()}`,
      dateReceived: dateReceivedStr,
      quantity,
      tags: createdPigs.map((p) => p.tagNumber),
      createdAt: new Date().toISOString(),
    },
    totalAvailable,
  };
}

export async function getReceivedPigBatches(): Promise<PigReceivedBatch[]> {
  const pigs = await prisma.pig.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      tagNumber: true,
      dateReceived: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const batches: PigReceivedBatch[] = [];
  for (const p of pigs) {
    const pDate = p.dateReceived
      ? p.dateReceived.toISOString().split("T")[0]
      : p.createdAt.toISOString().split("T")[0];
    const last = batches[batches.length - 1];
    if (
      last &&
      last.dateReceived === pDate &&
      Math.abs(new Date(last.createdAt).getTime() - new Date(p.createdAt).getTime()) < 5000
    ) {
      last.quantity += 1;
      last.tags.push(p.tagNumber);
    } else {
      batches.push({
        id: p.id,
        dateReceived: pDate,
        quantity: 1,
        tags: [p.tagNumber],
        createdAt: p.createdAt.toISOString(),
      });
    }
  }

  return batches;
}

export async function getTotalPigsAvailable(): Promise<number> {
  return await prisma.pig.count({
    where: {
      deletedAt: null,
      currentBeneficiaryId: null,
      status: {
        notIn: [PigStatus.DISTRIBUTED, PigStatus.DECEASED, PigStatus.SOLD, PigStatus.INACTIVE],
      },
    },
  });
}

export async function deletePigBatch(tags: string[]) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!user) throw new Error("Unauthorized");

  if (!tags || tags.length === 0) throw new Error("No pigs specified for deletion.");

  // Check if any pig is already distributed
  const distributedPig = await prisma.pig.findFirst({
    where: {
      tagNumber: { in: tags },
      status: PigStatus.DISTRIBUTED,
      deletedAt: null,
    },
  });

  if (distributedPig) {
    throw new Error(`Cannot delete: Pig ${distributedPig.tagNumber} has already been distributed to a beneficiary.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.pig.updateMany({
      where: {
        tagNumber: { in: tags },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: "DELETED",
        entity: "PIG",
        entityId: tags[0] || "BATCH",
        newValue: { tags, count: tags.length },
      },
    });
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/admin/pigs/new");
  revalidatePath("/dashboard/field/pigs");
  revalidatePath("/dashboard/field/pigs/new");
  revalidatePath("/api/pigs/available");

  const totalAvailable = await prisma.pig.count({
    where: {
      deletedAt: null,
      currentBeneficiaryId: null,
      status: {
        notIn: [PigStatus.DISTRIBUTED, PigStatus.DECEASED, PigStatus.SOLD, PigStatus.INACTIVE],
      },
    },
  });

  return { success: true, totalAvailable };
}

export async function updatePigBatch(data: {
  currentTags: string[];
  newDateReceived: string;
  newQuantity: number;
}) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!user) throw new Error("Unauthorized");

  const { currentTags, newDateReceived, newQuantity } = data;
  if (!currentTags || currentTags.length === 0) throw new Error("Batch not found.");

  const quantity = Math.max(1, parseInt(String(newQuantity || 1), 10) || 1);
  const dateReceived = newDateReceived && newDateReceived.trim()
    ? new Date(newDateReceived)
    : new Date();
  const validDate = Number.isNaN(dateReceived.getTime()) ? new Date() : dateReceived;

  let updatedTags = [...currentTags];

  await prisma.$transaction(async (tx) => {
    // 1. Update dateReceived for existing pigs
    await tx.pig.updateMany({
      where: { tagNumber: { in: currentTags }, deletedAt: null },
      data: { dateReceived: validDate },
    });

    const diff = quantity - currentTags.length;

    if (diff > 0) {
      // Need to add `diff` more pigs
      const year = validDate.getFullYear();
      const prefix = `PF-RW-${year}-`;
      const lastPig = await tx.pig.findFirst({
        where: {
          OR: [
            { tagNumber: { startsWith: prefix } },
            { tagNumber: { startsWith: `PIG-${year}-` } },
          ],
        },
        orderBy: { tagNumber: "desc" },
      });

      let baseSequence = 0;
      if (lastPig) {
        const parts = lastPig.tagNumber.split("-");
        const lastPart = parts[parts.length - 1];
        const lastSeq = parseInt(lastPart, 10);
        if (!Number.isNaN(lastSeq)) {
          baseSequence = lastSeq;
        }
      }

      for (let i = 1; i <= diff; i++) {
        const tagNumber = `${prefix}${String(baseSequence + i).padStart(5, "0")}`;
        const newPig = await tx.pig.create({
          data: {
            tagNumber,
            currentBeneficiaryId: null,
            dateReceived: validDate,
            status: PigStatus.REGISTERED,
          },
        });
        updatedTags.push(newPig.tagNumber);
      }
    } else if (diff < 0) {
      // Need to remove Math.abs(diff) pigs (from the end of currentTags, only if not distributed)
      const toRemoveCount = Math.abs(diff);
      const candidates = [...currentTags].reverse().slice(0, toRemoveCount);

      const distributed = await tx.pig.findFirst({
        where: {
          tagNumber: { in: candidates },
          status: PigStatus.DISTRIBUTED,
          deletedAt: null,
        },
      });
      if (distributed) {
        throw new Error(`Cannot reduce quantity: Pig ${distributed.tagNumber} is already distributed.`);
      }

      await tx.pig.updateMany({
        where: { tagNumber: { in: candidates }, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      updatedTags = updatedTags.filter((t) => !candidates.includes(t));
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: "UPDATED",
        entity: "PIG",
        entityId: currentTags[0] || "BATCH",
        newValue: {
          previousCount: currentTags.length,
          newCount: quantity,
          newDate: validDate.toISOString(),
          tags: updatedTags,
        },
      },
    });
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/admin/pigs/new");
  revalidatePath("/dashboard/field/pigs");
  revalidatePath("/dashboard/field/pigs/new");
  revalidatePath("/api/pigs/available");

  const totalAvailable = await prisma.pig.count({
    where: {
      deletedAt: null,
      currentBeneficiaryId: null,
      status: {
        notIn: [PigStatus.DISTRIBUTED, PigStatus.DECEASED, PigStatus.SOLD, PigStatus.INACTIVE],
      },
    },
  });

  return {
    success: true,
    batch: {
      dateReceived: validDate.toISOString().split("T")[0],
      quantity: updatedTags.length,
      tags: updatedTags,
    },
    totalAvailable,
  };
}
