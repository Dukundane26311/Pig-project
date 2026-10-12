import { PrismaClient } from "@prisma/client";
import * as rg from "rwanda-geo";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Rwanda administrative divisions...");

  const districts = rg.getAllDistricts().map((d) => ({
    id: d.code,
    name: d.name,
    code: d.code,
  }));

  const sectors = rg.getAllSectors().map((s) => ({
    id: s.code,
    name: s.name,
    code: s.code,
    districtId: s.parentCode,
  }));

  const cells = rg.getAllCells().map((c) => ({
    id: c.code,
    name: c.name,
    code: c.code,
    sectorId: c.parentCode,
  }));

  const villages = rg.getAllVillages().map((v) => ({
    id: v.code,
    name: v.name,
    code: v.code,
    cellId: v.parentCode,
  }));

  console.log(`Inserting ${districts.length} districts...`);
  await prisma.district.createMany({
    data: districts,
    skipDuplicates: true,
  });

  console.log(`Inserting ${sectors.length} sectors...`);
  await prisma.sector.createMany({
    data: sectors,
    skipDuplicates: true,
  });

  console.log(`Inserting ${cells.length} cells in chunks...`);
  for (let i = 0; i < cells.length; i += 1000) {
    await prisma.cell.createMany({
      data: cells.slice(i, i + 1000),
      skipDuplicates: true,
    });
  }

  console.log(`Inserting ${villages.length} villages in chunks...`);
  for (let i = 0; i < villages.length; i += 2000) {
    await prisma.village.createMany({
      data: villages.slice(i, i + 2000),
      skipDuplicates: true,
    });
  }

  console.log("Seeding default system settings...");
  const defaultSettings = [
    {
      key: "revolving_return_target",
      value: "2",
      description: "Standard number of healthy piglets required to be returned per distributed female pig.",
    },
    {
      key: "default_distribution_batch",
      value: "1",
      description: "Standard quantity of pigs allocated per beneficiary household during a distribution round.",
    },
    {
      key: "organization_name",
      value: "Pig Project Rwanda",
      description: "Official institutional organization name displayed across official reports and receipts.",
    },
    {
      key: "system_contact_email",
      value: "admin@pigproject.rw",
      description: "Primary notification and administrative contact email address for project operations.",
    },
    {
      key: "system_contact_phone",
      value: "+250 788 123 456",
      description: "Hotline phone number for field operations and beneficiary support inquiries.",
    },
    {
      key: "currency",
      value: "RWF",
      description: "Primary transaction currency for financial records, budget receipts, and asset valuation.",
    },
    {
      key: "pig_quarantine_period_days",
      value: "14",
      description: "Minimum quarantine and health clearance holding days for newly received pigs before distribution.",
    },
    {
      key: "enable_audit_strict_mode",
      value: "true",
      description: "Enforces strict append-only audit tracking across all administrative modules and transactions.",
    },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: s,
      update: { description: s.description },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
