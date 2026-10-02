import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Project Reports</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Download generated CSV and PDF analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-[#d9e1d8] shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#e4ede6] p-3 rounded-lg text-[#2c5a43]">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-[#1c2b23]">Financial Summary</h3>
              <p className="text-sm text-[#5d6e64]">All income and expenses (Year-to-Date)</p>
            </div>
          </div>
          <button className="text-[#2c5a43] hover:text-[#1c2b23] p-2 hover:bg-[#e4ede6] rounded-full transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#d9e1d8] shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#e4ede6] p-3 rounded-lg text-[#2c5a43]">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-[#1c2b23]">Revolving Fund Status</h3>
              <p className="text-sm text-[#5d6e64]">Beneficiaries and repayment tracking</p>
            </div>
          </div>
          <button className="text-[#2c5a43] hover:text-[#1c2b23] p-2 hover:bg-[#e4ede6] rounded-full transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-[#d9e1d8] shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#e4ede6] p-3 rounded-lg text-[#2c5a43]">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-[#1c2b23]">Veterinary & Health</h3>
              <p className="text-sm text-[#5d6e64]">Pig health and mortality analytics</p>
            </div>
          </div>
          <button className="text-[#2c5a43] hover:text-[#1c2b23] p-2 hover:bg-[#e4ede6] rounded-full transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
