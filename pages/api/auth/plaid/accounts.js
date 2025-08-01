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

    const response = await plaidClient.accountsGet({
      access_token,
    });

    const accounts = response.data.accounts.map(account => ({
      id: account.account_id,
      name: account.name || "Unknown Account",
      type: account.type || "unknown",
      subtype: account.subtype || "unknown",
      balance: account.balances?.current || 0,
      currency: account.balances?.iso_currency_code || "USD",
    }));

    res.status(200).json(accounts);
  } catch (error) {
    console.error("Plaid Accounts Error:", error.message);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
} 