// Server-side configuration endpoint
// This exposes non-sensitive config values to the client
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only expose non-sensitive config
  res.status(200).json({
    GUARDIAN_ADDRESS: process.env.GUARDIAN_ADDRESS,
    RPC_URL: process.env.RPC_URL,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  });
}
