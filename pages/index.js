import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function Home() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [linkToken, setLinkToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Fetch Plaid Link Token on Load
  useEffect(() => {
    fetch("/api/auth/plaid/create_link_token", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Link token response:", data);
        setLinkToken(data.link_token);
      })
      .catch((error) => console.error("Error fetching link token:", error));
  }, []);

  // Plaid Link Hook
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token) => {
      fetch("/api/auth/plaid/exchange_public_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      })
        .then((res) => res.json())
        .then((data) => setAccessToken(data.access_token));
    },
  });

  // Fetch Transactions
  const fetchTransactions = () => {
    fetch(`/api/auth/plaid/transactions?access_token=${accessToken}&user_id=${session.user.email}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((error) => console.error("Error fetching transactions:", error));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>MoneyMojo</h1>

      {session ? (
        <>
          <p>Welcome, {session.user.name}!</p>
          <button 
            onClick={() => open()} 
            disabled={!ready || !linkToken}
            style={{ opacity: (!ready || !linkToken) ? 0.5 : 1 }}
          >
            Connect Your Bank
          </button>

          {accessToken && (
            <button onClick={fetchTransactions}>
              Fetch Transactions
            </button>
          )}

          <h2>Your Transactions</h2>
          <ul>
            {transactions.map((tx) => (
              <li key={tx.id}>{tx.name}: ${tx.amount} ({tx.category})</li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={() => signIn("google")}>Sign In</button>
      )}
    </div>
  );
}
