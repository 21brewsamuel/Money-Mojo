import { useState } from 'react';
import { formatDate, getCategoryIcon, getCategoryColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function TransactionList({ 
  transactions, 
  isLoading, 
  error, 
  onRefresh, 
  accessToken 
}) {
  const [transactionsToShow, setTransactionsToShow] = useState(5);

  const handleShowMoreTransactions = () => {
    setTransactionsToShow(prev => prev + 5);
  };

  // Group transactions by date
  const groupedTransactions = Array.isArray(transactions) 
    ? transactions.reduce((groups, transaction) => {
        const date = transaction.date || "Unknown Date";
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
      }, {})
    : {};

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-red-800">Error loading transactions: {error}</p>
        </div>
        <button 
          onClick={onRefresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Recent Transactions
        </h2>
        {accessToken && (
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
            aria-label="Refresh transactions"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh Transactions
              </>
            )}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Recent Transactions
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : Array.isArray(transactions) && transactions.length > 0 ? (
          <>
            <div className="space-y-4">
              {Object.entries(groupedTransactions)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .slice(0, transactionsToShow)
                .map(([date, dayTransactions]) => (
                  <div key={date}>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      {formatDate(date)}
                    </h4>
                    <div className="space-y-2">
                      {dayTransactions.map((transaction, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          role="listitem"
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                              style={{ backgroundColor: getCategoryColor(transaction.category) + '20' }}
                            >
                              <div className="text-lg" style={{ color: getCategoryColor(transaction.category) }}>
                                {getCategoryIcon(transaction.category)}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{transaction.name}</p>
                              <p className="text-xs text-gray-500">{transaction.category}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-medium ${transaction.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount < 0 ? '+' : '-'}${Math.abs(transaction.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
            
            {Object.keys(groupedTransactions).length > transactionsToShow && (
              <div className="mt-6 text-center">
                <button 
                  onClick={handleShowMoreTransactions}
                  className="px-4 py-2 text-sm font-medium text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
                  aria-label="Show more transactions"
                >
                  Show More Transactions
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found. Connect your account to see your recent transactions.</p>
          </div>
        )}
      </div>
    </div>
  );
}