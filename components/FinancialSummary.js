import { calculateFinancialSummary } from '@/lib/utils';

export default function FinancialSummary({ transactions }) {
  const financialSummary = calculateFinancialSummary(transactions);

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm shadow-teal-100/50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
          💰
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Financial Summary
          </h2>
          <p className="mt-1 text-teal-600">
            Your current financial overview
          </p>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Balance</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-800">${financialSummary.balance}</span>
            {parseFloat(financialSummary.balance) > 0 ? (
              <span className="ml-2 text-xs font-medium text-green-600">+2.5%</span>
            ) : (
              <span className="ml-2 text-xs font-medium text-red-600">-1.2%</span>
            )}
          </div>
        </div>
        
        <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Income</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-green-600">${financialSummary.income}</span>
            <span className="ml-2 text-xs font-medium text-gray-500">this month</span>
          </div>
        </div>
        
        <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Expenses</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-red-600">${financialSummary.expenses}</span>
            <span className="ml-2 text-xs font-medium text-gray-500">this month</span>
          </div>
        </div>
      </div>
    </div>
  );
}