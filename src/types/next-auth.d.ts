import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      role: string
      accessLevel: string
      assignedDistrictId: string | null
      assignedSectorId: string | null
      assignedCellId: string | null
      assignedVillageId: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    accessLevel: string
    assignedDistrictId: string | null
    assignedSectorId: string | null
    assignedCellId: string | null
    assignedVillageId: string | null
    token?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    accessLevel: string
    assignedDistrictId: string | null
    assignedSectorId: string | null
    assignedCellId: string | null
    assignedVillageId: string | null
    accessToken?: string
  }
}
