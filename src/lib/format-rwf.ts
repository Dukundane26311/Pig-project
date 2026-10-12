import { Prisma } from "@prisma/client";

export function formatRwf(amount: Prisma.Decimal | number | string | null | undefined) {
  const [whole, fraction] = new Prisma.Decimal(amount ?? 0).toFixed(2).split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${groupedWhole}${fraction === "00" ? "" : `.${fraction}`} RWF`;
}
