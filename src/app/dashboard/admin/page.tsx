import { prisma } from "@/lib/prisma";
import { 
  Users, UserCheck, Clock, 
  PiggyBank, Package, ArrowDownRight, RefreshCw, HeartPulse, Sparkles,
  Stethoscope, Activity, FileText,
  Wallet, TrendingUp, TrendingDown, CheckSquare, MessageSquare
} from "lucide-react";

export default async function AdminDashboardOverview() {
  const [
    totalBeneficiaries,
    activeBeneficiaries,
    waitingBeneficiaries,
    
    totalPigs,
    availablePigs,
    distributedPigs,
    returnedPigs,
    pregnantPigs,
    pigsWithPiglets,
    sickPigs,
    healthyPigs,
    
    totalDistributions,
    revolvingExpectedAggr,
    totalReturnsAggr,
    
    vetExams,
    
    incomeAggr,
    expenseAggr,
    
    employeeReports,
    vetReports
  ] = await Promise.all([
    // Beneficiaries
    prisma.beneficiary.count(),
    prisma.beneficiary.count({ where: { status: "ACTIVE" } }),
    prisma.beneficiary.count({ where: { status: "AWAITING_PIGLET" } }),
    
    // Pigs
    prisma.pig.count(),
    prisma.pig.count({ where: { status: { in: ["ACTIVE", "REGISTERED"] } } }),
    prisma.pig.count({ where: { status: "DISTRIBUTED" } }),
    prisma.pig.count({ where: { status: "RETURNED" } }),
    prisma.pig.count({ where: { status: "PREGNANT" } }),
    prisma.pig.count({ where: { status: "PIGLETS_RECORDED" } }),
    prisma.pig.count({ where: { healthStatus: { in: ["SICK", "CRITICAL"] } } }),
    prisma.pig.count({ where: { healthStatus: "HEALTHY" } }),
    
    // Revolving Fund
    prisma.pigDistribution.count(),
    prisma.revolvingCycle.aggregate({ _sum: { expectedReturn: true } }),
    prisma.pigReturn.aggregate({ _sum: { quantity: true } }),
    
    // Veterinary
    prisma.veterinaryExamination.count(),
    
    // Finance
    prisma.financeTransaction.aggregate({ _sum: { amount: true }, where: { type: "INCOME" } }),
    prisma.financeTransaction.aggregate({ _sum: { amount: true }, where: { type: "EXPENSE" } }),
    
    // Reports
    prisma.fieldVisit.count(), // Mapping employee reports to field visits
    prisma.veterinaryRecord.count(), // Mapping vet reports
  ]);

  const revolvingExpected = revolvingExpectedAggr._sum.expectedReturn || 0;
  const revolvingReturned = totalReturnsAggr._sum.quantity || 0;
  const revolvingRemaining = Math.max(0, revolvingExpected - revolvingReturned);
  
  const totalIncome = Number(incomeAggr._sum.amount || 0);
  const totalExpenses = Number(expenseAggr._sum.amount || 0);
  const balance = totalIncome - totalExpenses;

  const sections = [
    {
      title: "Beneficiaries",
      cards: [
        { label: "Total families", value: totalBeneficiaries, icon: Users, tone: "bg-[#e3efe7] text-[#173d2e]" },
        { label: "Active families", value: activeBeneficiaries, icon: UserCheck, tone: "bg-[#e3efe7] text-[#173d2e]" },
        { label: "Waiting for piglets", value: waitingBeneficiaries, icon: Clock, tone: "bg-[#f0ece4] text-[#7d6641]" },
      ]
    },
    {
      title: "Pigs",
      cards: [
        { label: "Total pigs", value: totalPigs, icon: PiggyBank, tone: "bg-[#f7e3ea] text-[#a44d67]" },
        { label: "Available", value: availablePigs, icon: Package, tone: "bg-[#e3efe7] text-[#173d2e]" },
        { label: "Distributed", value: distributedPigs, icon: ArrowDownRight, tone: "bg-[#eef3da] text-[#536334]" },
        { label: "Returned", value: returnedPigs, icon: RefreshCw, tone: "bg-[#eef3da] text-[#536334]" },
        { label: "Pregnant", value: pregnantPigs, icon: HeartPulse, tone: "bg-[#f7e3ea] text-[#a44d67]" },
        { label: "With piglets", value: pigsWithPiglets, icon: Sparkles, tone: "bg-[#f7e3ea] text-[#a44d67]" },
        { label: "Needing Vet", value: sickPigs, icon: Stethoscope, tone: "bg-[#f7e3ea] text-[#a44d67]" },
      ]
    },
    {
      title: "Revolving Fund",
      cards: [
        { label: "Pigs distributed", value: totalDistributions, icon: ArrowDownRight, tone: "bg-[#eef3da] text-[#536334]" },
        { label: "Expected returns", value: revolvingExpected, icon: Clock, tone: "bg-[#f0ece4] text-[#7d6641]" },
        { label: "Piglets returned", value: revolvingReturned, icon: RefreshCw, tone: "bg-[#eef3da] text-[#536334]" },
        { label: "Remaining returns", value: revolvingRemaining, icon: Activity, tone: "bg-[#e3efe7] text-[#173d2e]" },
      ]
    },
    {
      title: "Veterinary",
      cards: [
        { label: "Pigs examined", value: vetExams, icon: Stethoscope, tone: "bg-[#e7f0fb] text-[#2d5b78]" },
        { label: "Healthy pigs", value: healthyPigs, icon: Activity, tone: "bg-[#e3efe7] text-[#173d2e]" },
        { label: "Sick pigs", value: sickPigs, icon: HeartPulse, tone: "bg-[#f7e3ea] text-[#a44d67]" },
      ]
    },
    {
      title: "Finance",
      cards: [
        { label: "Total income", value: `${totalIncome.toLocaleString()} RWF`, icon: TrendingUp, tone: "bg-[#e3efe7] text-[#173d2e]" },
        { label: "Total expenses", value: `${totalExpenses.toLocaleString()} RWF`, icon: TrendingDown, tone: "bg-[#f7e3ea] text-[#a44d67]" },
        { label: "Current balance", value: `${balance.toLocaleString()} RWF`, icon: Wallet, tone: "bg-[#eef3da] text-[#536334]" },
      ]
    },
    {
      title: "Reports",
      cards: [
        { label: "Employee reports", value: employeeReports, icon: FileText, tone: "bg-[#f0ece4] text-[#7d6641]" },
        { label: "Veterinary reports", value: vetReports, icon: FileText, tone: "bg-[#e7f0fb] text-[#2d5b78]" },
        { label: "Pending tasks", value: 0, icon: CheckSquare, tone: "bg-[#f0ece4] text-[#7d6641]" },
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">Pig Project Rwanda</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1b2d24]">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-[#5d6d64]">One Piglet. One Family. A Fund That Keeps Moving.</p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-xl font-semibold text-[#1b2d24] border-b border-[#dfe7df] pb-2">{section.title}</h3>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4">
              {section.cards.map(({ label, value, icon: Icon, tone }, idx) => (
                <div key={idx} className="rounded-[16px] border border-[#dfe7df] bg-white p-5 shadow-[0_4px_12px_rgba(16,28,23,0.03)] hover:shadow-[0_8px_24px_rgba(16,28,23,0.06)] transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#5d6d64]">{label}</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1b2d24]">{value}</p>
                    </div>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
