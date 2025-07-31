import supabase from "@/lib/supabase";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]";

// Initialize Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    // Get the authenticated user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { access_token } = req.query;

    if (!access_token) {
      return res.status(400).json({ error: "Missing access_token" });
    }

    // Get current date and calculate start date (30 days ago)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: startDate,
      end_date: endDate,
      options: { count: 100 },
    });

    const transactions = response.data.transactions.map(tx => ({
      user_id: session.user.email,
      name: tx.name || "Unknown Transaction",
      amount: tx.amount || 0,
      category: tx.category?.[0] || "Other",
      date: tx.date,
    }));

    // Only insert to Supabase if we have transactions
    if (transactions.length > 0) {
      try {
        await supabase.from("transactions").insert(transactions);
      } catch (dbError) {
        console.error("Database Error:", dbError.message);
        // Continue without failing the request
      }
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Plaid Transactions Error:", error.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}
