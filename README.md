# PIG PROJECT REVOLVING FUND

**Value Protocols Rwanda**

_“One Piglet. One Family. A Fund That Keeps Moving.”_

---

## 📖 Project Overview
The **Pig Project Revolving Fund** is a comprehensive software platform designed for Value Protocols Rwanda. It combines a **Public Website** for donors and visitors with a **Secure Private Management Platform** for field officers, veterinarians, and finance administrators. 

The core logic of the system handles the distribution of pigs to vulnerable families, tracks pregnancies and litters, and enforces the "3-Piglet Return" policy to sustain a continuous revolving fund that empowers the community.

## ✨ Features
### Public Website
- **Impact Dashboard:** Real-time aggregated statistics directly from the database.
- **Revolving Model Explanation:** Visual step-by-step breakdown of how the fund works.
- **Responsive Design:** Beautiful, mobile-friendly landing pages.

### Private Management Platform
- **Role-Based Access Control (RBAC):** Restricts access based on roles (SUPER_ADMIN, PROJECT_MANAGER, FINANCE_OFFICER, etc.).
- **Beneficiary & Livestock Management:** Complete CRUD for Families, Pigs, and Litters.
- **Revolving Fund Tracking:** Monitors the lifecycle from pig distribution to the 3-piglet repayment.
- **Financial Module:** Tracks income and expenses securely using PostgreSQL `Decimal` types.
- **Veterinary Records:** Veterinarians can log checkups and automatically update livestock health statuses.
- **Audit Logs:** Immutable tracking of all significant actions.

## 🏗 Architecture
**Full-Stack Next.js Application:**
```
Client Browser (Public / Dashboard)
↓
Next.js (App Router / React Server Components)
↓
Server Actions (Secure Backend Logic / NextAuth Security)
↓
Prisma ORM
↓
PostgreSQL Database
```

## 📋 Requirements
- Node.js (v18.17 or higher)
- npm, yarn, or pnpm
- PostgreSQL (v14 or higher)

## ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pig-project.git
   cd pig-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🔐 Environment Variables
You must create a `.env` file in the root directory. Use the provided `.env.example` as a template.

```bash
cp .env.example .env
```
Ensure you update the `DATABASE_URL` and `NEXTAUTH_SECRET` before running the application.

## 🗄 Database Setup & Prisma Migration
Ensure your PostgreSQL server is running. Then, sync the Prisma schema with your database:

```bash
npx prisma db push
```
*(For production, you should use `npx prisma migrate deploy` instead).*

## 🌱 Seed Database
Seed the database with the initial `SUPER_ADMIN` account and necessary setup data:

```bash
npx tsx prisma/seed.ts
```
**Default Admin Credentials:**
- **Email:** `admin@valueprotocols.rw`
- **Password:** `Admin@123` *(Change this immediately in production)*

## 🚀 Local Development
Start the development server:

```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the public website, or `/login` to access the dashboard.

## 🧪 Testing
*(Tests can be configured here using Jest/Playwright)*
Currently, manual testing is recommended for the **3-piglet repayment logic**:
1. Assign a Pig to a Beneficiary.
2. Create a Litter for that Pig.
3. Log the return of 3 Piglets.
4. Verify the Beneficiary's status upgrades automatically.

## 🛠 Build
To create a production build:
```bash
npm run build
```

## ☁️ GitHub Deployment
To push this project to GitHub securely:
```bash
git init
git add .
git commit -m "Initial production build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
*Note: Your `.env` file is excluded via `.gitignore`.*

## 🌐 Netlify Deployment
1. Connect your GitHub repository to Netlify.
2. Set the Build Command to: `npm run build`
3. Set the Publish Directory to: `.next`
4. In Netlify's **Environment Variables** settings, add all variables from your `.env` file.
5. Deploy the site.

### Production Environment Variables
In Netlify/Production, ensure you set:
- `DATABASE_URL`: URL to your cloud Postgres (e.g., Supabase, Neon, AWS RDS).
- `NEXTAUTH_URL`: Your actual domain (e.g., `https://my-pig-project.netlify.app`).
- `NEXTAUTH_SECRET`: A strong, randomly generated 32+ character string.

## 🛡 Security
- **Authentication:** Sessions are secured via NextAuth.
- **Passwords:** Hashed using bcrypt.
- **Public/Private Data:** GPS, phone numbers, and financial data are strictly protected by server-side role validation.
- **OTP:** (Placeholder) Security Center is prepared for OTP implementations for financial approvals.

## 💾 Backup Strategy
It is highly recommended to configure automated daily backups on your managed PostgreSQL provider (e.g., Supabase or AWS RDS) to prevent data loss of the Revolving Fund tracking.

## 🆘 Troubleshooting
- **PrismaClientUnknownRequestError (Date parsing):** If you enter a year extremely far in the future (e.g., year 30000), the system will safely ignore it to prevent a crash.
- **Database Connection Issues:** Ensure your `DATABASE_URL` is correct and your Postgres instance accepts connections. If deploying to Netlify, ensure your database allows external IP connections.
