import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

console.log("DEBUG: Loading Plaid credentials...");
console.log("PLAID_CLIENT_ID:", process.env.PLAID_CLIENT_ID);
console.log("PLAID_SECRET:", process.env.PLAID_SECRET);
console.log("PLAID_ENV:", process.env.PLAID_ENV);

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

  console.log("Creating Plaid Link Token...");
  console.log("Request Payload:", {
    client_id: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    user: { client_user_id: "user-id-123" },
    client_name: "MoneyMojo",
    products: ["transactions"],
    country_codes: ["US"],
    language: "en",
  });

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: "user-id-123" },
      client_name: "MoneyMojo",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    });

    console.log("Plaid Response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Plaid Error:", error);
    res.status(500).json({ error: error.message || "Plaid error" });
  }
}
