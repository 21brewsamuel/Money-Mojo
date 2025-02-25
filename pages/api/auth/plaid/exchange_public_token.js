import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

console.log("DEBUG: Loading Plaid credentials...");
console.log("PLAID_CLIENT_ID:", process.env.PLAID_CLIENT_ID);
console.log("PLAID_SECRET:", process.env.PLAID_SECRET);
console.log("PLAID_ENV:", process.env.PLAID_ENV);

// Initialize Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
});

const plaidClient = new PlaidApi(plaidConfig);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { public_token } = req.body;

    if (!public_token) {
      return res.status(400).json({ error: "Missing public_token" });
    }

    console.log("Exchanging public token:", public_token);

    const response = await fetch("https://sandbox.plaid.com/item/public_token/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        public_token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Plaid Exchange Token Error:", data);
      return res.status(500).json({ error: data });
    }

    console.log("Plaid Access Token Response:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Plaid API Request Failed:", error);
    res.status(500).json({ error: "Plaid API request failed" });
  }
}
