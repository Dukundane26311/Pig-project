import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const steps: any[] = [];
  const backendUrl =
    process.env.BACKEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://pig-project-backend.onrender.com"
      : "http://127.0.0.1:8081");

  steps.push({ step: "backendUrl", value: backendUrl, nodeEnv: process.env.NODE_ENV });

  // 1. Test backend call
  try {
    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@valueprotocols.rw",
        password: "admin123",
      }),
    });
    const status = res.status;
    const body = await res.json().catch((e) => e.message);
    steps.push({ step: "backend_fetch", status, body });
  } catch (err: any) {
    steps.push({ step: "backend_fetch_error", message: err.message, stack: err.stack });
  }

  // 2. Test prisma connection & query
  try {
    const userCount = await prisma.user.count();
    steps.push({ step: "prisma_user_count", userCount });
  } catch (err: any) {
    steps.push({ step: "prisma_error", message: err.message, code: err.code });
  }

  // 3. Test prisma upsert
  try {
    const upserted = await prisma.user.upsert({
      where: { email: "admin@valueprotocols.rw" },
      update: { name: "Admin User", role: "SUPER_ADMIN", isActive: true },
      create: {
        name: "Admin User",
        email: "admin@valueprotocols.rw",
        password: "test",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    steps.push({ step: "prisma_upsert_success", id: upserted.id });
  } catch (err: any) {
    steps.push({ step: "prisma_upsert_error", message: err.message, code: err.code });
  }

  return NextResponse.json({ steps });
}
