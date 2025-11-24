# Guardian Admin Control Center Implementation

This document outlines the implementation of the 5 critical improvements to transform the Blockchain Monitoring Suite into a functioning control center for your Guardian smart contract.

## Overview

Your Guardian.sol contract is the owner of the MintingController and requires a specialized admin interface. This implementation adds a dedicated `/admin` page with four core control features.

---

## 1. Guardian Admin Dashboard

**Location:** `/pages/admin.js`

### Features:
- **Wallet Connection**: Connect via MetaMask to authenticate as the Guardian owner
- **Admin Status Indicator**: Visual confirmation when the correct wallet is connected
  - ✅ "GUARDIAN ACCESS GRANTED" (green) - Owner wallet detected
  - ⚠️ "Admin-only access required" (yellow) - Non-owner wallet connected
- **Owner Display**: Shows the Guardian contract owner address
- **Access Control**: All controls are disabled unless you're connected with the owner wallet

### How to Use:
1. Navigate to `/admin` in your application
2. Click "Connect Wallet"
3. Select your MetaMask wallet (the one that deployed Guardian)
4. Confirm you see "GUARDIAN ACCESS GRANTED"
5. You now have full access to all emergency controls

---

## 2. System Status Widget (Emergency Pause Kill Switch)

**Location:** `/components/SystemStatusWidget.jsx`

### Features:
- **Live Status Indicator**: 
  - Green with "OPERATIONAL" when protocol is running
  - Red with "PAUSED" when protocol is paused
  - Real-time updates every 10 seconds
  
- **Control Button**:
  - Red "PAUSE PROTOCOL" when operational
  - Green "RESUME PROTOCOL" when paused
  - Confirmation dialog before execution
  
- **Calls These Contract Functions**:
  - `pauseMinting()` - Pause all minting
  - `unpauseMinting()` - Resume minting
  - `paused()` - Get current pause state

### Use Cases:
- **Peg Break Detected**: Immediately pause minting to prevent further USDGB from entering circulation
- **Security Exploit Found**: Kill switch to prevent abuse
- **Market Crash**: Pause while you assess collateral ratios

### Example Flow:
```
1. Click "PAUSE PROTOCOL"
2. Confirmation dialog appears
3. Click "Confirm"
4. Transaction sent to chain
5. Status updates to "PAUSED" (red)
```

---

## 3. Collateral Ratio Manager

**Location:** `/components/CollateralRatioManager.jsx`

### Features:
- **Asset Table Display**:
  - Shows all whitelisted assets (ETH, USDC, WBTC, etc.)
  - Current collateral ratio for each asset
  - Real-time ratio updates
  
- **Edit Functionality**:
  - Click "Edit" on any asset row
  - Enter new ratio (in basis points: 15000 = 150%)
  - Save changes with one click
  - Confirmation with transaction hash
  
- **Add New Asset Button**:
  - Modal form to whitelist new collateral tokens
  - Required inputs:
    - Token Address (0x...)
    - Chainlink Oracle Address
    - Collateral Ratio (basis points)
    - Token Decimals
  - Enables market expansion without redeployment

### Calls These Contract Functions**:
  - `getCollateralRatio(asset)` - Fetch current ratio
  - `getSupportedAssets()` - Get all whitelisted tokens
  - `emergencyUpdateCollateralRatio(asset, newRatio)` - Update ratio
  - `addControllerCollateral(asset, oracle, ratio, decimals)` - Add new asset

### Example Scenario:
```
ETH crashes from $2000 to $1500
1. Click "Edit" on ETH row
2. Change ratio from 150% → 175%
3. Click "Save"
4. Transaction sent
5. New ratio active immediately
6. Protocol requires more collateral for new USDGB mints
```

---

## 4. Minting Limit Controls (Velocity/Circuit Breaker)

**Location:** `/components/MintingLimitControls.jsx`

### Features:
- **Current Limit Display**:
  - Shows current max USDGB that can be minted per hour
  - Large, easy-to-read format (e.g., "1,000,000 USDGB")
  
- **Edit Controls**:
  - Interactive slider (100K - 10M range)
  - Direct input field for exact values
  - Live preview of new limit
  
- **Smart Defaults**:
  - 100,000 USDGB minimum
  - 10,000,000 USDGB maximum
  - Increments of 100,000

- **Protection Explanation**:
  - Built-in info box explaining circuit breaker purpose
  - Prevents whale attacks in single transaction

### Calls This Contract Function**:
  - `getMintLimit()` - Get current limit
  - `setMintLimit(limit)` - Update limit

### Example Scenario:
```
Detecting unusual minting spike
1. Check current limit: 1,000,000 USDGB/hour
2. Slide to 500,000 USDGB/hour
3. Click "Update Limit"
4. Transaction confirmed
5. Minting capped at 500K/hour immediately
```

---

## 5. Asset Management Interface

**Already Integrated in Collateral Ratio Manager**

### Features:
- **Add New Asset Form** (Modal):
  - Accessible via "Add Asset" button
  - Four required fields with validation
  - Transaction confirmation with hash display
  
- **Supported Assets Display**:
  - Table shows all currently whitelisted tokens
  - Enables you to manage multiple collateral types

### Use Case:
```
You want to accept USDC as collateral:
1. Click "Add Asset" button
2. Enter USDC token address
3. Enter Chainlink USDC/USD oracle address
4. Set collateral ratio (e.g., 110% = 11000)
5. Set token decimals (6 for USDC)
6. Click "Add Asset"
7. USDC is now accepted for minting USDGB
```

---

## Installation & Configuration

### Step 1: Update Environment Variables

Edit `.env.local` and replace with your actual values:

```env
# Guardian Smart Contract Configuration
NEXT_PUBLIC_GUARDIAN_ADDRESS=0x1234567890abcdef...  # Your Guardian contract
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key  # Your RPC

# Keep existing values
NEXT_PUBLIC_ETHERSCAN_API_KEY=your-key
NEXT_PUBLIC_ALCHEMY_WS_URL=wss://eth-mainnet.g.alchemy.com/v2/your-key
```

### Step 2: Verify Smart Contract Deployment

Ensure your Guardian contract is deployed with these functions:

```solidity
function owner() public view returns (address) {}
function paused() public view returns (bool) {}
function pauseMinting() public onlyOwner {}
function unpauseMinting() public onlyOwner {}
function emergencyUpdateCollateralRatio(address asset, uint256 newRatio) public onlyOwner {}
function addControllerCollateral(address asset, address oracle, uint256 ratio, uint8 decimals) public onlyOwner {}
function setMintLimit(uint256 limit) public onlyOwner {}
function getMintLimit() public view returns (uint256) {}
function getCollateralRatio(address asset) public view returns (uint256) {}
function getSupportedAssets() public view returns (address[]) {}
```

### Step 3: Install Dependencies

All required dependencies (ethers.js v6, react, lucide-react) are already in your `package.json`.

### Step 4: Test the Admin Interface

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Connect your MetaMask wallet
4. Verify you see "GUARDIAN ACCESS GRANTED"
5. Test each control feature with testnet before mainnet

---

## File Structure

```
components/
├── SystemStatusWidget.jsx          # Emergency pause controls
├── CollateralRatioManager.jsx      # Collateral ratio & asset management
├── MintingLimitControls.jsx        # Circuit breaker velocity limit
├── Sidebar.jsx                     # Updated with /admin link

lib/
├── guardianAbi.js                  # Guardian contract ABI & addresses
├── useGuardian.js                  # React hooks for contract interaction

pages/
└── admin.js                        # Main Guardian admin dashboard

.env.local                          # Configuration file (updated)
```

---

## Component Details

### System Status Widget
- **Prop Requirements**: `signer`, `isAdmin`
- **Auto-refreshes**: Every 10 seconds
- **Error Handling**: Displays user-friendly error messages
- **Transaction Feedback**: Shows Etherscan link after execution

### Collateral Ratio Manager
- **Prop Requirements**: `signer`, `isAdmin`
- **Features**: Edit inline, add modal, table display
- **Validation**: Prevents invalid inputs
- **Feedback**: Transaction status and success confirmations

### Minting Limit Controls
- **Prop Requirements**: `signer`, `isAdmin`
- **UI Elements**: Slider + input field for flexibility
- **Range**: 100K - 10M USDGB per hour
- **Preview**: Shows new limit before confirmation

---

## API & Hooks Reference

### `useGuardianContract()`
Initializes contract instance from ABI and address.

### `useGuardianOwner()`
Fetches and caches owner address from contract.

### `useGuardianPauseState()`
Polls pause state every 10 seconds.
- `isPaused`: boolean
- `loading`: boolean
- `error`: string
- `refetch()`: manually refresh

### `useGuardianMintLimit()`
Fetches current mint limit.
- `mintLimit`: string (formatted to 18 decimals)
- `loading`: boolean
- `error`: string
- `refetch()`: manually refresh

### `useGuardianCollateralRatio(assetAddress)`
Fetches ratio for specific asset.
- `ratio`: string (as percentage)
- `loading`: boolean
- `error`: string
- `refetch()`: manually refresh

### `useGuardianSupportedAssets()`
Fetches array of whitelisted asset addresses.
- `assets`: address[]
- `loading`: boolean
- `error`: string
- `refetch()`: manually refresh

### `useExecuteGuardianFunction()`
Executes contract state-changing functions.
- `execute(signer, functionName, ...args)`: async function
- `transactionHash`: string
- `loading`: boolean
- `error`: string

---

## Security Considerations

1. **Owner-Only Access**: All functions check wallet address matches Guardian owner
2. **Confirmation Dialogs**: Critical operations require explicit confirmation
3. **Error Boundaries**: Failed transactions display detailed error messages
4. **Real-Time State**: Pause state and limits auto-update from contract
5. **No Hardcoded Keys**: All sensitive config in `.env.local` (never commit)

---

## Troubleshooting

### "Guardian contract address not configured"
- Check `.env.local` has `NEXT_PUBLIC_GUARDIAN_ADDRESS`
- Ensure it's a valid Ethereum address (0x...)

### "Admin access required" message stays
- Verify you're connected with the wallet that deployed Guardian
- Check Guardian.sol `owner()` function returns your wallet address
- Try disconnecting/reconnecting MetaMask

### "Failed to fetch contract data"
- Verify `NEXT_PUBLIC_RPC_URL` is valid and accessible
- Check Alchemy API key has correct permissions
- Ensure network matches (mainnet vs testnet)

### Transactions failing with "call revert"
- Verify caller is contract owner (`onlyOwner` check)
- Check parameter formats (basis points, decimals, addresses)
- Ensure sufficient gas for transaction

---

## Next Steps

1. ✅ Configure `.env.local` with your Guardian address
2. ✅ Deploy or verify Guardian.sol contract
3. ✅ Test on testnet (Sepolia/Goerli)
4. ✅ Verify all 5 controls work as expected
5. ✅ Deploy to production with mainnet config
6. ✅ Test with small transactions first

---

## Summary of Capabilities

| Feature | Function | Impact |
|---------|----------|--------|
| **System Status** | pauseMinting / unpauseMinting | Immediate protocol halt |
| **Collateral Ratio** | emergencyUpdateCollateralRatio | Adjust protection instantly |
| **Mint Limit** | setMintLimit | Prevent whale attacks |
| **Asset Management** | addControllerCollateral | Expand without redeployment |
| **Owner Verification** | owner / onlyOwner check | Secure admin access |

---

**You now have a production-ready Guardian control center!** 🎉
