// @ts-nocheck
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const normalizeRole = (role?: string | null) => {
  if (!role) return "";
  const cleanRole = role.replace(/^ROLE_/, "");
  return cleanRole === "ADMIN" ? "SUPER_ADMIN" : cleanRole;
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
        const log = (msg: string) => {
          try {
            const fs = require('fs');
            fs.appendFileSync('nextauth-debug.log', new Date().toISOString() + ': ' + msg + '\n');
          } catch (_) {}
          console.log(msg);
        };
        
        log("LOGIN ATTEMPT WITH: " + credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          log("No credentials provided");
          throw new Error("Invalid credentials");
        }

        try {
          log("Fetching from spring boot...");
          const backendUrl =
            process.env.BACKEND_URL ||
            (process.env.NODE_ENV === "production"
              ? "https://pig-project-backend.onrender.com"
              : "http://127.0.0.1:8081");
          const res = await fetch(`${backendUrl}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          log("Response status: " + res.status);
          const data = await res.json();
          log("Response data: " + JSON.stringify(data));

          if (res.ok && data.success && data.data) {
            const user = data.data;
            const email = String(user.email || "").trim().toLowerCase();
            log("Login successful, user: " + email);

            const mappedUser = email
              ? await prisma.user.upsert({
                  where: { email },
                  update: {
                    name: user.name || user.email || "System User",
                    role: normalizeRole(user.role) as any,
                    isActive: true,
                  },
                  create: {
                    name: user.name || user.email || "System User",
                    email,
                    password: await bcrypt.hash(`backend-user-${Date.now()}`, 10),
                    role: (normalizeRole(user.role) || "FIELD_OFFICER") as any,
                    isActive: true,
                  },
                })
              : null;

            return {
              id: (mappedUser?.id ?? user.id?.toString() ?? email).toString(),
              email: email || user.email,
              name: mappedUser?.name || user.name || user.email || "System User",
              role: normalizeRole(user.role),
              token: user.token,
            } as any;
          } else {
            log("Login failed on backend: " + data.message);
            return null;
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error";
          log("Exception during login fetch: " + message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = normalizeRole((user as any).role ?? (user as any).role);
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = normalizeRole(String(token.role ?? ""));
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "your-super-secret-jwt-key-for-next-auth",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
