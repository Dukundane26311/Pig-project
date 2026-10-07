import { FileText, Download, Users, PiggyBank, ArrowRightCircle, RefreshCw, Stethoscope, Wallet, Activity, ClipboardList } from "lucide-react";

export default function ReportsPage() {
  const reportTypes = [
    { title: "Beneficiary Report", desc: "Total, New, Active, Location", icon: Users },
    { title: "Pig Report", desc: "Total, Available, Distributed, Sick, Born", icon: PiggyBank },
    { title: "Distribution Report", desc: "Distributed pigs, Beneficiaries, Dates", icon: ArrowRightCircle },
    { title: "Return Report", desc: "Returned pigs/piglets, Dates, Beneficiaries", icon: RefreshCw },
    { title: "Veterinary Report", desc: "Examined, Healthy, Sick, Treated", icon: Stethoscope },
    { title: "Finance Report", desc: "Income, Expenses, Balance", icon: Wallet },
    { title: "Employee Report", desc: "Daily reports, Visits, Distributed", icon: ClipboardList },
    { title: "System Activity", desc: "Recent actions, User, Action, Date/time", icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">Admin Reports</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1b2d24]">Combined System Reports</h2>
          <p className="mt-2 text-sm text-[#5d6e64]">Generate, filter, and export data across all modules.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select className="border border-[#dfe7df] rounded-lg px-3 py-2 text-sm bg-white text-[#1b2d24]">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
            <option>Custom Range</option>
          </select>
          <button className="bg-white border border-[#dfe7df] text-[#1b2d24] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" /> PDF
          </button>
          <button className="bg-[#173d2e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1b2d24] flex items-center">
            <Download className="w-4 h-4 mr-2" /> Excel/CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reportTypes.map((report, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-[#dfe7df] shadow-[0_4px_12px_rgba(16,28,23,0.03)] hover:shadow-[0_8px_24px_rgba(16,28,23,0.06)] transition-shadow flex flex-col justify-between">
            <div>
              <div className="bg-[#e4efe6] w-12 h-12 flex items-center justify-center rounded-xl text-[#173d2e] mb-4">
                <report.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-[#1b2d24] text-lg">{report.title}</h3>
              <p className="text-sm text-[#5d6e64] mt-2 leading-relaxed">{report.desc}</p>
            </div>
            <button className="mt-6 text-[#173d2e] hover:bg-[#e4efe6] bg-[#f3f5f1] w-full py-2.5 rounded-lg transition-colors font-semibold text-sm border border-[#dfe7df]">
              Generate Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
