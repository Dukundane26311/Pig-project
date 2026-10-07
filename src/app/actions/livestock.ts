"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function transferPig(data: {
  pigId: string;
  toBeneficiaryId: string;
  reason: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Only Admins can approve transfers directly right now.");
  }

  const pig = await prisma.pig.findUnique({
    where: { id: data.pigId },
    include: { currentBeneficiary: true },
  });
  if (!pig) throw new Error("Pig not found");

  const fromLocation = pig.currentLocation || "Unknown";
  const toBeneficiary = await prisma.beneficiary.findUnique({ where: { id: data.toBeneficiaryId } });
  if (!toBeneficiary) throw new Error("Target beneficiary not found");

  const toLocation = `${toBeneficiary.districtStr ?? ""}, ${toBeneficiary.sectorStr ?? ""}, ${toBeneficiary.cellStr ?? ""}`.replace(/,\s*,/g, ",").replace(/^,\s*|,\s*$/g, "") || "Unknown";

  await prisma.$transaction(async (tx) => {
    await tx.pigTransfer.create({
      data: {
        pigId: pig.id,
        previousBeneficiaryId: pig.currentBeneficiaryId,
        newBeneficiaryId: data.toBeneficiaryId,
        fromLocation,
        toLocation,
        transferDate: new Date(),
        reason: data.reason,
        requestedById: session.user.id,
        approvedById: session.user.id,
        status: "COMPLETED",
      }
    });

    await tx.pig.update({
      where: { id: pig.id },
      data: {
        currentBeneficiaryId: data.toBeneficiaryId,
        currentLocation: toLocation,
        status: "REDISTRIBUTED"
      }
    });
  });

  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/admin/transfers");
}

export async function recordMortality(data: {
  pigId: string;
  reportedCause: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "FIELD_OFFICER", "VETERINARIAN"].includes(session.user.role)) {
    throw new Error("Forbidden");
  }

  const pig = await prisma.pig.findUnique({ where: { id: data.pigId } });
  if (!pig) throw new Error("Pig not found");

  await prisma.$transaction(async (tx) => {
    await tx.mortalityRecord.create({
      data: {
        pigId: pig.id,
        beneficiaryId: pig.currentBeneficiaryId,
        deathDate: new Date(),
        reportedCause: data.reportedCause,
        reportedById: session.user.id,
        legacyStatus: "PENDING",
      }
    });

    await tx.pig.update({
      where: { id: pig.id },
      data: { status: "DECEASED" }
    });
  });

  const admins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN" } });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map(a => ({
        userId: a.id,
        type: "MORTALITY_ALERT",
        title: "Pig Death Reported",
        message: `Mortality reported for Pig ID: ${pig.tagNumber}`,
        relatedEntity: "PIG",
        relatedEntityId: pig.id,
      }))
    });
  }

  revalidatePath("/dashboard/admin/pigs");
}

export async function distributePig(data: {
  pigId?: string;
  beneficiaryId?: string;
  toBeneficiaryId?: string;
  notes?: string;
  reason?: string;
  recordedAt?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "FIELD_OFFICER"].includes(session.user.role)) throw new Error("Forbidden");

  const beneficiaryId = data.beneficiaryId ?? data.toBeneficiaryId;
  if (!beneficiaryId) throw new Error("Beneficiary is required");

  const beneficiary = await prisma.beneficiary.findUnique({ where: { id: beneficiaryId } });
  if (!beneficiary) throw new Error("Beneficiary not found");

  const distributionDate = data.recordedAt ? new Date(data.recordedAt) : new Date();

  if (data.pigId) {
    await prisma.$transaction(async (tx) => {
      const pig = await tx.pig.update({
        where: { id: data.pigId },
        data: {
          currentBeneficiaryId: beneficiaryId,
          status: "DISTRIBUTED"
        }
      });

      await tx.pigDistribution.create({
        data: {
          pigId: pig.id,
          beneficiaryId,
          distributionDate,
          distributedById: session.user.id,
          notes: data.notes ?? null
        }
      });
    });

    revalidatePath("/dashboard/admin/pigs");
    revalidatePath("/dashboard/field/pigs");
    return;
  }

  const year = new Date().getFullYear();
  const lastPig = await prisma.pig.findFirst({
    where: { tagNumber: { startsWith: `PIG-${year}-` } },
    orderBy: { tagNumber: "desc" },
  });

  const nextSequence = lastPig ? Number.parseInt(lastPig.tagNumber.split("-")[2] ?? "0", 10) + 1 : 1;
  const generatedTagNumber = `PIG-${year}-${String(nextSequence).padStart(6, "0")}`;

  const pig = await prisma.pig.create({
    data: {
      tagNumber: generatedTagNumber,
      currentBeneficiaryId: beneficiaryId,
      breed: null,
      sex: null,
      notes: data.notes ?? null,
      dateReceived: distributionDate,
      status: "DISTRIBUTED",
    },
  });

  await prisma.pigDistribution.create({
    data: {
      pigId: pig.id,
      beneficiaryId,
      distributionDate,
      distributedById: session.user.id,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/field/pigs");
  revalidatePath("/dashboard/field/distributions");
}

export async function returnPig(data: {
  beneficiaryId?: string;
  pigId?: string;
  quantity?: number;
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "FIELD_OFFICER"].includes(session.user.role)) throw new Error("Forbidden");

  const beneficiaryId = data.beneficiaryId ?? (data.pigId ? (await prisma.pig.findUnique({ where: { id: data.pigId } }))?.currentBeneficiaryId ?? null : null);
  if (!beneficiaryId) throw new Error("Beneficiary is required");

  const quantity = Math.max(1, Number(data.quantity ?? 1));

  if (data.pigId) {
    const pig = await prisma.pig.findUnique({ where: { id: data.pigId } });
    if (!pig) throw new Error("Pig not found");

    await prisma.$transaction(async (tx) => {
      await tx.pigReturn.create({
        data: {
          pigId: pig.id,
          beneficiaryId,
          recordedById: session.user.id,
          returnDate: new Date(),
          quantity: 1,
          notes: data.notes ?? null,
        }
      });

      await tx.pig.update({
        where: { id: pig.id },
        data: {
          currentBeneficiaryId: null,
          status: "RETURNED",
        }
      });
    });

    revalidatePath("/dashboard/admin/pigs");
    revalidatePath("/dashboard/field/pigs");
    revalidatePath("/dashboard/admin/returns");
    revalidatePath("/dashboard/field/returns");
    return;
  }

  await prisma.pigReturn.create({
    data: {
      beneficiaryId,
      recordedById: session.user.id,
      returnDate: new Date(),
      quantity,
      notes: data.notes ?? null,
    }
  });

  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/field/pigs");
  revalidatePath("/dashboard/admin/returns");
  revalidatePath("/dashboard/field/returns");
}

