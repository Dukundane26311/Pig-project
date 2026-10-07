import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const normalizeRole = (role?: string | null) => {
  if (!role) return "";
  const value = role.replace(/^ROLE_/, "");
  return value === "ADMIN" ? "SUPER_ADMIN" : value;
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = normalizeRole(typeof token?.role === "string" ? token.role : undefined);

    if (path === "/dashboard") {
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      if (role === "VETERINARIAN") return NextResponse.redirect(new URL("/dashboard/vet", req.url));
      if (role === "FIELD_OFFICER") return NextResponse.redirect(new URL("/dashboard/field", req.url));
      if (role === "FINANCE_OFFICER") return NextResponse.redirect(new URL("/dashboard/finance", req.url));
    }

    if (path.startsWith("/dashboard/admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (path === "/dashboard/team" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (path.startsWith("/dashboard/vet") && role !== "VETERINARIAN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (path.startsWith("/dashboard/field") && role !== "FIELD_OFFICER" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (path.startsWith("/dashboard/finance") && role !== "FINANCE_OFFICER" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
