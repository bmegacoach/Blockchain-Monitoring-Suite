# Smart Contract Dashboard

A modern, responsive web application for monitoring Ethereum smart contract activity, transactions, and token transfers in real-time.

## Features

- **Contract Analysis**: Get detailed information about any Ethereum smart contract including verification status, compiler version, and token type detection
- **Transaction Monitoring**: View all transactions involving a specific contract with pagination support
- **Token Transfer Tracking**: Monitor ERC20/ERC721 token transfers with real-time data
- **Price Integration**: Live price data for supported tokens via CoinGecko API
- **Analytics Dashboard**: Visual charts showing transaction activity and volume trends over the last 7 days
- **Real-time Updates**: Automatic refresh every minute for live monitoring
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## API Endpoints

### Contract Information
```
GET /api/contract/[address]
```
Returns contract metadata including name, verification status, compiler info, and token type.

### Transaction History
```
GET /api/transactions/[address]?page=1&offset=20
```
Returns paginated transaction history for the contract.

### Token Transfers
```
GET /api/transfers/[address]?page=1&offset=20
```
Returns paginated token transfer history for ERC20/ERC721 contracts.

### Price Data
```
GET /api/price/[address]
```
Returns current price, market cap, and 24h change for supported tokens.

## Technology Stack

- **Frontend**: Next.js 13+, React, Tailwind CSS
- **Charts**: Recharts for data visualization
- **APIs**:
  - Etherscan API (V2) for blockchain data
  - CoinGecko API for price information
- **Styling**: Tailwind CSS with dark theme
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-contract-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   NEXT_PUBLIC_ALCHEMY_URL=https://eth-mainnet.g.alchemy.com/v2/your_alchemy_key
   NEXT_PUBLIC_ALCHEMY_WS_URL=wss://eth-mainnet.g.alchemy.com/v2/your_alchemy_key
   NEXT_PUBLIC_NETWORK=mainnet
   ```

   Or copy the provided `.env.example` file and fill in your API keys:
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Environment Variables

- `ETHERSCAN_API_KEY`: Required. Get your free API key from [Etherscan](https://etherscan.io/apis)
- `ALCHEMY_API_KEY`: Required. Get your API key from [Alchemy](https://www.alchemy.com/)
- `NEXT_PUBLIC_ALCHEMY_URL`: Required. Alchemy HTTP endpoint URL
- `NEXT_PUBLIC_ALCHEMY_WS_URL`: Required. Alchemy WebSocket endpoint URL
- `NEXT_PUBLIC_NETWORK`: Required. Network name (mainnet)

## Supported Token Addresses

The dashboard includes built-in support for popular tokens:

- USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- WBTC: `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599`
- DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- LINK: `0x514910771AF9Ca656af840dff83E8264EcF986CA`
- UNI: `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984`
- AAVE: `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9`
- SHIB: `0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE`

## Error Handling

The application includes comprehensive error handling for:
- Invalid Ethereum addresses
- API rate limiting
- Network failures
- Missing API keys
- Contract not found scenarios

## Security Features

- Input validation for all API endpoints
- Rate limiting awareness
- Secure API key handling
- CORS protection
- Error message sanitization

## Performance Optimizations

- Efficient pagination for large datasets
- Caching strategies for API responses
- Optimized bundle size with Next.js
- Lazy loading for charts and heavy components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is for educational and informational purposes only. Always verify contract addresses and transaction details on official blockchain explorers before taking any actions.
