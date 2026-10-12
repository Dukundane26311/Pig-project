# Pig Project Revolving Fund

**Value Protocols Rwanda**

> *"One Piglet. One Family. A Fund That Keeps Moving."*

## Overview

The Pig Project Revolving Fund is a management platform for livestock distribution, veterinary care, beneficiary follow-up, finance, and the revolving fund.

New distributions create a return cycle for **two piglets**. Each cycle stores its own expected return, so historical obligations remain as recorded instead of being silently rewritten. A pig must be registered, cleared as healthy by a veterinary officer, and selected from available inventory before it can be distributed.

## Architecture

- Next.js 16, React 19, and TypeScript web application and API routes.
- Prisma ORM with PostgreSQL for application data.
- A separate Spring Boot application is present in `Backend/`; it is not required to run the root Next.js application.

## Project Structure

```text
src/app/       Next.js pages, API routes, and server actions
src/components Shared UI components
src/lib/        Authentication, database, and application helpers
prisma/         Prisma schema
Backend/        Separate Spring Boot application
```

## Run the Next.js Application

### Prerequisites

- Node.js 20.9 or later.
- PostgreSQL available to the application.

### Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create `.env` from `.env.example` and configure `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`. Use a unique, securely generated `NEXTAUTH_SECRET`; do not reuse development values in production.

3. Generate the Prisma client and start the app:

   ```powershell
   npx prisma generate
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The Prisma schema is in `prisma/schema.prisma`. This repository currently has no Prisma migration history. Before applying schema changes to an existing database, take a backup and use the project's approved database-change process; do not assume that `db push` is safe for existing data.

## Validation and Production

```powershell
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

The production server requires the same database and authentication environment variables as development. Do not expose the database or commit `.env`.

## Spring Boot Application

`Backend/` contains a separate Spring Boot application. It has its own Maven wrapper and configuration; the Next.js app can be run independently. Review `Backend/HELP.md` and the backend configuration before starting it.

## Security Notes

- Server-side actions and protected APIs must enforce authorization; hiding a page or navigation link is not an authorization boundary.
- Use active database-backed accounts and role-appropriate access.
- Do not store production credentials in source control or share account passwords in documentation.

## License

Proprietary — Value Protocols Rwanda
