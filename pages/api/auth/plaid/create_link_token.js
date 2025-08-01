import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]";

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
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Get the authenticated user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.email || session.user.id;

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "MoneyMojo",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Plaid Link Token Error:", error.message);
    res.status(500).json({ error: "Failed to create link token" });
  }
}
