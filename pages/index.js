import { useSession, signIn } from "next-auth/react";
import { useState, useEffect, useMemo, useRef } from "react";
import { usePlaidLink } from "react-plaid-link";
import { cn } from "@/lib/utils";
import Head from "next/head";

// Add this helper function to get/set goals from localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Helper function to get category icons
const getCategoryIcon = (category) => {
  const lowerCategory = (category || "").toLowerCase();
  
  if (lowerCategory.includes("food") || lowerCategory.includes("restaurant") || lowerCategory.includes("dining")) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
    );
  } else if (lowerCategory.includes("transport") || lowerCategory.includes("travel") || lowerCategory.includes("uber")) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
      </svg>
    );
  } else if (lowerCategory.includes("shopping") || lowerCategory.includes("retail")) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
      </svg>
    );
  } else if (lowerCategory.includes("entertainment") || lowerCategory.includes("movie") || lowerCategory.includes("subscription")) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
      </svg>
    );
  } else if (lowerCategory.includes("health") || lowerCategory.includes("medical") || lowerCategory.includes("fitness")) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
    );
  } else if (lowerCategory.includes("bill") || lowerCategory.includes("utility") || lowerCategory.includes("payment")) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
      </svg>
    );
  }
  
  // Default icon
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );
};

// Add this helper function near the top of your file, next to getCategoryIcon
const getCategoryColor = (category) => {
  const categoryLower = (category || "").toLowerCase();
  
  // Define color mapping for different categories
  if (categoryLower.includes("food") || categoryLower.includes("restaurant")) {
    return "#3b82f6"; // blue
  }
  if (categoryLower.includes("shopping") || categoryLower.includes("retail")) {
    return "#10b981"; // green
  }
  if (categoryLower.includes("travel") || categoryLower.includes("transport")) {
    return "#8b5cf6"; // purple
  }
  if (categoryLower.includes("entertainment") || categoryLower.includes("recreation")) {
    return "#f59e0b"; // amber
  }
  if (categoryLower.includes("bills") || categoryLower.includes("utilities")) {
    return "#ef4444"; // red
  }
  
  // Default color for uncategorized or other categories
  return "#6b7280"; // gray
};

export default function Home() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [linkToken, setLinkToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  
  // Add state for goal editing
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const budgetInputRef = useRef(null);
  const savingsInputRef = useRef(null);
  
  // Add localStorage for custom goals
  const [customGoals, setCustomGoals] = useLocalStorage("money-mojo-goals", {
    monthlyBudget: null,
    savingsGoal: null
  });

  // Add this state for transaction display
  const [transactionsToShow, setTransactionsToShow] = useState(15);

  // Fetch Plaid Link Token on Load
  useEffect(() => {
    if (session) {
      setIsLoading(true);
      fetch("/api/auth/plaid/create_link_token", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          console.log("Link token response:", data);
          setLinkToken(data.link_token);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching link token:", error);
          setIsLoading(false);
        });
    }
  }, [session]);

  // Plaid Link Hook
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token) => {
      setIsLoading(true);
      fetch("/api/auth/plaid/exchange_public_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      })
        .then((res) => res.json())
        .then((data) => {
          setAccessToken(data.access_token);
          setIsLoading(false);
          if (data.access_token) {
            fetchTransactions();
            fetchAccounts();
          }
        })
        .catch(() => setIsLoading(false));
    },
  });

  // Fetch Transactions
  const fetchTransactions = () => {
    setIsLoading(true);
    fetch(`/api/auth/plaid/transactions?access_token=${accessToken}&user_id=${session.user.email}`)
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array before setting state
        const transactionsArray = Array.isArray(data) ? data : [];
        console.log("Transactions data:", transactionsArray);
        setTransactions(transactionsArray);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
        setIsLoading(false);
      });
  };

  // Fetch Accounts
  const fetchAccounts = () => {
    setIsLoading(true);
    fetch(`/api/auth/plaid/accounts?access_token=${accessToken}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Accounts data:", data);
        setAccounts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching accounts:", error);
        setIsLoading(false);
      });
  };

  // Group transactions by date - ensure transactions is an array
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

  // Calculate financial summary from actual transaction data
  const financialSummary = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        balance: 0,
        income: 0,
        expenses: 0
      };
    }

    // Calculate income (negative amounts in Plaid are typically credits/income)
    const income = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    // Calculate expenses (positive amounts are debits/expenses)
    const expenses = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Calculate balance (income - expenses)
    const balance = income - expenses;

    return {
      balance: balance.toFixed(2),
      income: income.toFixed(2),
      expenses: expenses.toFixed(2)
    };
  }, [transactions]);

  // Calculate budget progress and top spending categories
  const financialInsights = useMemo(() => {
    // Find savings accounts
    const savingsAccounts = accounts.filter(account => 
      account.type === 'depository' && 
      (account.subtype === 'savings' || account.name.toLowerCase().includes('saving'))
    );
    
    // Calculate total savings balance
    const currentSavings = savingsAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    
    // Calculate current monthly spending
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthExpenses = Array.isArray(transactions) 
      ? transactions
          .filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === currentMonth && 
                  txDate.getFullYear() === currentYear &&
                  tx.amount > 0;
          })
          .reduce((sum, tx) => sum + tx.amount, 0)
      : 0;

    // Use custom goals if set, otherwise calculate defaults
    const monthlyBudgetTotal = customGoals.monthlyBudget || Math.max(1500, Math.round(currentMonthExpenses * 1.2 / 100) * 100);
    const savingsGoalTotal = customGoals.savingsGoal || Math.max(10000, Math.round(currentSavings * 1.5 / 1000) * 1000);
    
    // Calculate top spending categories
    const categoryTotals = Array.isArray(transactions)
      ? transactions
          .filter(tx => tx.amount > 0)
          .reduce((categories, tx) => {
            const category = tx.category || "Other";
            if (!categories[category]) categories[category] = 0;
            categories[category] += tx.amount;
            return categories;
          }, {})
      : {};
    
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({
        name: category,
        amount,
        percentage: Math.round((amount / (currentMonthExpenses || 1)) * 100)
      }));
    
    return {
      hasSavingsAccounts: savingsAccounts.length > 0,
      monthlyBudget: { 
        current: currentMonthExpenses, 
        total: monthlyBudgetTotal,
        percentage: Math.min(100, Math.round((currentMonthExpenses / monthlyBudgetTotal) * 100))
      },
      savingsGoal: { 
        current: currentSavings, 
        total: savingsGoalTotal,
        percentage: Math.min(100, Math.round((currentSavings / savingsGoalTotal) * 100))
      },
      topCategories
    };
  }, [transactions, accounts, customGoals]);

  // Add handlers for saving custom goals
  const handleSaveBudgetGoal = () => {
    const newBudget = parseFloat(budgetInputRef.current.value);
    if (!isNaN(newBudget) && newBudget > 0) {
      setCustomGoals({...customGoals, monthlyBudget: newBudget});
    }
    setIsEditingBudget(false);
  };

  const handleSaveSavingsGoal = () => {
    const newSavingsGoal = parseFloat(savingsInputRef.current.value);
    if (!isNaN(newSavingsGoal) && newSavingsGoal > 0) {
      setCustomGoals({...customGoals, savingsGoal: newSavingsGoal});
    }
    setIsEditingSavings(false);
  };

  // Add this function to handle showing more transactions
  const handleShowMoreTransactions = () => {
    setTransactionsToShow(prev => prev + 15);
  };

  return (
    <>
      <Head>
        <title>MoneyMojo | Smart Finance Tracking</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-teal-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Money<span className="font-extrabold">Mojo</span>
                </h1>
              </div>
              
              {session && (
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center text-sm text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                    Connected
                  </div>
                  <div className="relative">
                    <img 
                      src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=0D9488&color=fff`}
                      alt={session.user.name}
                      className="h-9 w-9 rounded-full border-2 border-teal-200 hover:border-teal-400 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {session ? (
            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              {/* Main Column */}
              <div className="space-y-8">
                {/* Welcome Card */}
                <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm shadow-teal-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {session.user.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Welcome back, {session.user.name.split(' ')[0]}!
                      </h2>
                      <p className="mt-1 text-teal-600">
                        Let's manage your finances today
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

                {/* Transactions Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Recent Transactions
                    </h2>
                    {accessToken && (
                      <button 
                        onClick={fetchTransactions}
                        disabled={isLoading}
                        className={cn(
                          "inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all",
                          isLoading && "opacity-70 cursor-not-allowed"
                        )}
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

                  {/* Recent Transactions */}
                  <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Recent Transactions</h3>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                      </div>
                    ) : Array.isArray(transactions) && transactions.length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(groupedTransactions)
                          .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                          .map(([date, dayTransactions]) => (
                            <div key={date}>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                              </h4>
                              <div className="space-y-2">
                                {dayTransactions.map((transaction, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                                           style={{ backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'][idx % 3] + '20' }}>
                                        <div className="text-lg" style={{ color: ['#3b82f6', '#10b981', '#8b5cf6'][idx % 3] }}>
                                          {getCategoryIcon(transaction.category)}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-800">{transaction.name}</p>
                                          <p className="text-xs text-gray-500">{transaction.category}</p>
                                      </div>
                                    </div>
                                    <span className={`text-sm font-medium ${transaction.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {transaction.amount < 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No transactions found. Connect your account to see your recent transactions.</p>
                        {session && !accessToken && (
                          <button
                            onClick={open}
                            disabled={!ready}
                            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                          >
                            Connect Account
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Insights */}
                <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Financial Insights</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm items-center">
                        <div className="flex items-center">
                          <span className="text-gray-600">Monthly Budget</span>
                          <button 
                            onClick={() => setIsEditingBudget(true)} 
                            className="ml-2 text-teal-500 hover:text-teal-700"
                            title="Edit budget goal"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                          </button>
                        </div>
                        {isEditingBudget ? (
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-1">$</span>
                            <input
                              ref={budgetInputRef}
                              type="number"
                              defaultValue={financialInsights.monthlyBudget.total}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                              min="1"
                              step="100"
                            />
                            <button 
                              onClick={handleSaveBudgetGoal}
                              className="ml-2 text-xs px-2 py-1 bg-teal-500 text-white rounded hover:bg-teal-600"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setIsEditingBudget(false)}
                              className="ml-1 text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="font-medium text-gray-800">
                            ${financialInsights.monthlyBudget.current.toFixed(2)} / ${financialInsights.monthlyBudget.total.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${financialInsights.monthlyBudget.percentage > 90 ? 'bg-red-600' : 'bg-teal-600'}`} 
                          style={{ width: `${Math.min(100, financialInsights.monthlyBudget.percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Savings Goal Section - Show only if savings accounts exist */}
                    {financialInsights.hasSavingsAccounts ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm items-center">
                          <div className="flex items-center">
                            <span className="text-gray-600">Savings Goal</span>
                            <button 
                              onClick={() => setIsEditingSavings(true)} 
                              className="ml-2 text-teal-500 hover:text-teal-700"
                              title="Edit savings goal"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                              </svg>
                            </button>
                          </div>
                          {isEditingSavings ? (
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-1">$</span>
                              <input
                                ref={savingsInputRef}
                                type="number"
                                defaultValue={financialInsights.savingsGoal.total}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                                min="1"
                                step="1000"
                              />
                              <button 
                                onClick={handleSaveSavingsGoal}
                                className="ml-2 text-xs px-2 py-1 bg-teal-500 text-white rounded hover:bg-teal-600"
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => setIsEditingSavings(false)}
                                className="ml-1 text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className="font-medium text-gray-800">
                              ${financialInsights.savingsGoal.current.toFixed(2)} / ${financialInsights.savingsGoal.total.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, financialInsights.savingsGoal.percentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-800">Track your savings progress</h4>
                            <p className="text-xs text-gray-500 mt-1">Connect your savings account to set and track savings goals</p>
                          </div>
                          <button 
                            onClick={open} 
                            disabled={!ready}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
                          >
                            Add Account
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Top Spending Categories</h4>
                      <div className="space-y-3">
                        {financialInsights.topCategories.length > 0 ? (
                          financialInsights.topCategories.map((category, index) => (
                            <div key={index} className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mr-3`}
                                   style={{ backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'][index % 3] }}>
                                {getCategoryIcon(category.name)}
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-800">{category.name}</span>
                                  <span className="text-gray-600">${category.amount.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                  <div 
                                    className="h-1.5 rounded-full" 
                                    style={{ 
                                      width: `${Math.min(100, category.percentage)}%`,
                                      backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'][index % 3]
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 italic">Connect your account to see top spending categories</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Your Accounts</h3>
                  <div className="text-sm text-gray-500 mb-4">
                    {accessToken ? "Connected" : "Not Connected"}
                  </div>
                  
                  {accessToken ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-xs opacity-80">Main Account</div>
                          <svg className="h-8 w-8 opacity-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 10V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 10H18C15 10 14 11 14 14V18C14 21 15 22 18 22H22C21.06 22 20.19 22 19.42 21.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 17.38H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>
                          •••• 4582
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs opacity-80">Chase Bank</div>
                          <div className="text-xs opacity-80">Exp: 09/26</div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-gray-100 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">Savings Account</div>
                          <div className="text-sm text-gray-500">•••• 7291</div>
                        </div>
                        <div className="mt-2 text-lg font-bold text-gray-800" style={{ fontFamily: "'Space Mono', monospace" }}>
                          $12,458.32
                        </div>
                      </div>
                      
                      <button 
                        className="w-full mt-2 text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add another account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Link your bank accounts to track spending, monitor balances, and get insights into your financial health.
                      </p>
                      <button 
                        onClick={() => open()} 
                        disabled={!ready || !linkToken || isLoading}
                        className={cn(
                          "w-full rounded-full bg-teal-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all flex items-center justify-center",
                          (!ready || !linkToken || isLoading) && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            Connect Bank Account
                          </>
                        )}
                      </button>
                    </div> 
                  )}
                </div>
                
                <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Analytics Overview</h3>
                  
                  <div className="space-y-4">
                    {/* Spending by Category */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Top Spending Categories</h4>
                      <div className="space-y-2">
                        {Array.isArray(transactions) && transactions.length > 0 ? (
                          // Calculate and display top categories
                          Object.entries(
                            transactions.reduce((categories, tx) => {
                              const category = tx.category || "Other";
                              if (!categories[category]) categories[category] = 0;
                              categories[category] += tx.amount > 0 ? tx.amount : 0;
                              return categories;
                            }, {})
                          )
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([category, amount], index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" 
                                       style={{ backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'][index % 3] + '20' }}>
                                    <div className="text-sm" style={{ color: ['#10b981', '#3b82f6', '#8b5cf6'][index % 3] }}>
                                      {getCategoryIcon(category)}
                                    </div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{category}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">${amount.toFixed(2)}</span>
                              </div>
                            ))
                        ) : (
                          <div className="text-sm text-gray-500 italic">Connect your account to see spending categories</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Monthly Trend */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Monthly Spending Trend</h4>
                      <div className="h-24 flex items-end space-x-2">
                        {Array.isArray(transactions) && transactions.length > 0 ? (
                          // Simple bar chart visualization
                          [...Array(7)].map((_, i) => {
                            const height = Math.random() * 80 + 20; // Replace with actual data calculation
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div 
                                  className="w-full rounded-t-sm bg-teal-500" 
                                  style={{ height: `${height}%`, opacity: 0.7 + (i * 0.05) }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-1">
                                  {new Date(Date.now() - (6-i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }).substring(0, 3)}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="w-full text-sm text-gray-500 italic">Connect your account to see spending trends</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Insights */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Financial Insights</h4>
                      {Array.isArray(transactions) && transactions.length > 0 ? (
                        <div className="text-sm text-gray-700 space-y-2">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-800">
                            <span className="font-medium">Spending pattern:</span> Your highest spending day is typically Friday.
                          </div>
                          <div className="p-2 bg-teal-50 rounded-lg text-teal-800">
                            <span className="font-medium">Potential saving:</span> Reducing dining expenses by 10% could save you $45 monthly.
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">Connect your account to see personalized insights</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[80vh] flex-col items-center justify-center">
              <div className="mx-auto max-w-md text-center">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 mb-4">
                    <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight text-gray-800 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Money<span className="text-teal-600">Mojo</span>
                  </h2>
                  <p className="text-xl text-gray-600">Your personal finance assistant</p>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Take control of your finances
                </h3>
                <p className="mt-4 text-gray-600 mb-8">
                  Connect your bank accounts, track spending patterns, set budgets, and achieve your financial goals with our smart tools and insights.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Track Expenses</h4>
                      <p className="text-xs text-gray-600 mt-1">Automatically categorize and monitor your spending habits</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Smart Insights</h4>
                      <p className="text-xs text-gray-600 mt-1">Get personalized recommendations to improve your finances</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Budget Planning</h4>
                      <p className="text-xs text-gray-600 mt-1">Create and manage budgets to reach your financial goals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Bank-Level Security</h4>
                      <p className="text-xs text-gray-600 mt-1">Your financial data is protected with industry-leading encryption</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => signIn("google")}
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-blue-500 px-8 py-4 font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Sign in with Google
                  </span>
                  <div className="absolute inset-0 -translate-y-full bg-gradient-to-r from-blue-500 to-teal-500 transition-transform duration-300 ease-in-out group-hover:translate-y-0"></div>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-teal-100 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500">© 2025 MoneyMojo. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">
                  <span className="sr-only">Privacy Policy</span>
                  <span className="text-sm">Privacy Policy</span>
                </a>
                <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">
                  <span className="sr-only">Terms of Service</span>
                  <span className="text-sm">Terms of Service</span>
                </a>
                <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">
                  <span className="sr-only">Contact</span>
                  <span className="text-sm">Contact</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 