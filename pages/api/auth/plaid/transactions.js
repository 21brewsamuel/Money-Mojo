import supabase from "@/lib/supabase";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

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

  const { access_token, user_id } = req.query;

  try {
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: "2023-01-01",
      end_date: "2025-12-31",
      options: { count: 100 },
    });

    const transactions = response.data.transactions.map(tx => ({
      user_id,
      name: tx.name,
      amount: tx.amount,
      category: tx.category[0] || "Other",
      date: tx.date,
    }));

    await supabase.from("transactions").insert(transactions);

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Plaid Error:", error);
    res.status(500).json({ error: error.message || "Plaid error" });
  }
}
