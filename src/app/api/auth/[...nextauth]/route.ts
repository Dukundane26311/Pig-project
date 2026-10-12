import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { Role } from "@prisma/client";

const validRoles = [
  Role.SUPER_ADMIN,
  Role.FIELD_OFFICER,
  Role.VETERINARIAN,
  Role.PROJECT_MANAGER,
  Role.FINANCE_OFFICER,
  Role.TRAINER,
  Role.FUNDER,
];

const normalizeRole = (role?: string | null): Role | "" => {
  if (!role) return "";
  const cleanRole = role.replace(/^ROLE_/, "");
  if (cleanRole === "ADMIN") return Role.SUPER_ADMIN;
  return validRoles.includes(cleanRole as Role) ? (cleanRole as Role) : "";
};

type BackendLoginResponse = {
  success?: boolean;
  data?: {
    email?: string;
    name?: string;
    role?: string;
    token?: string;
  };
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const cleanEmail = String(credentials?.email || "").trim().toLowerCase();
        const cleanPassword = String(credentials?.password || "");

        if (!cleanEmail || !cleanPassword) {
          return null;
        }

        const localUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (localUser) {
          if (!localUser.isActive || localUser.deletedAt) {
            return null;
          }

          const passwordMatches = await bcrypt.compare(
            cleanPassword,
            localUser.password,
          );
          const legacyPasswordMatches =
            !passwordMatches && cleanPassword !== cleanPassword.trim()
              ? await bcrypt.compare(cleanPassword.trim(), localUser.password)
              : false;

          if (passwordMatches || legacyPasswordMatches) {
            return {
              id: localUser.id,
              email: localUser.email,
              name: localUser.name,
              role: localUser.role,
              accessLevel: localUser.accessLevel,
              assignedDistrictId: localUser.assignedDistrictId,
              assignedSectorId: localUser.assignedSectorId,
              assignedCellId: localUser.assignedCellId,
              assignedVillageId: localUser.assignedVillageId,
            };
          }
        }

        const backendUrl =
          process.env.BACKEND_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://pig-project-backend.onrender.com"
            : "http://127.0.0.1:8081");
        let res: Response;

        try {
          res = await fetch(`${backendUrl}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: cleanEmail,
              password: cleanPassword,
            }),
          });
        } catch {
          console.error("Authentication backend request failed.");
          throw new Error("The authentication service is unavailable.");
        }

        if (res.status === 400 || res.status === 401) {
          return null;
        }
        if (!res.ok) {
          console.error("Authentication backend returned HTTP", res.status);
          throw new Error("The authentication service is unavailable.");
        }

        const result = (await res.json()) as BackendLoginResponse;
        const user = result?.data;
        if (!result?.success || !user) {
          return null;
        }

        const email = String(user.email || cleanEmail).trim().toLowerCase();
        const role = normalizeRole(user.role) || Role.FIELD_OFFICER;
        const mappedUser = await prisma.user.upsert({
          where: { email },
          update: {
            name: user.name || user.email || "System User",
            role,
            isActive: true,
            deletedAt: null,
          },
          create: {
            name: user.name || user.email || "System User",
            email,
            password: await bcrypt.hash(randomUUID(), 10),
            role,
            isActive: true,
          },
        });

        return {
          id: mappedUser.id,
          email,
          name: mappedUser.name,
          role,
          accessLevel: mappedUser.accessLevel,
          assignedDistrictId: mappedUser.assignedDistrictId,
          assignedSectorId: mappedUser.assignedSectorId,
          assignedCellId: mappedUser.assignedCellId,
          assignedVillageId: mappedUser.assignedVillageId,
          token: user.token,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = normalizeRole(user.role);
        token.accessToken = user.token;
        token.accessLevel = user.accessLevel;
        token.assignedDistrictId = user.assignedDistrictId;
        token.assignedSectorId = user.assignedSectorId;
        token.assignedCellId = user.assignedCellId;
        token.assignedVillageId = user.assignedVillageId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = normalizeRole(String(token.role ?? ""));
        session.accessToken = token.accessToken;
        session.user.accessLevel = String(token.accessLevel ?? "ALL");
        session.user.assignedDistrictId = token.assignedDistrictId ?? null;
        session.user.assignedSectorId = token.assignedSectorId ?? null;
        session.user.assignedCellId = token.assignedCellId ?? null;
        session.user.assignedVillageId = token.assignedVillageId ?? null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              role: (user as any).role ? String((user as any).role) : null,
              action: "LOGIN",
              entity: "AUTH",
              entityId: user.id,
              newValue: {
                email: user.email,
                name: user.name,
              },
            },
          });
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch (err) {
          console.error("Failed to record login audit log:", err);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-super-secret-jwt-key-for-next-auth",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
