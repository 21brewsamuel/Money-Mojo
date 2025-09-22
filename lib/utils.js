import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for merging Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Helper function to get category icons
export const getCategoryIcon = (category) => {
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

// Helper function to get category colors
export const getCategoryColor = (category) => {
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

// Helper function to format dates
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Helper function to calculate financial summary
export const calculateFinancialSummary = (transactions) => {
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
};
