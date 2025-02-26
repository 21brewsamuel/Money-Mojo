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

  const { access_token } = req.query;

  try {
    const response = await plaidClient.accountsGet({
      access_token,
    });

    const accounts = response.data.accounts.map(account => ({
      id: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      balance: account.balances.current,
      currency: account.balances.iso_currency_code,
    }));

    res.status(200).json(accounts);
  } catch (error) {
    console.error("Plaid Error:", error);
    res.status(500).json({ error: error.message || "Plaid error" });
  }
} 