# Quick Developer Setup Guide

## For Your Developer: Immediate Next Steps

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Install & Run
```bash
npm install
npm run dev
```

### 3. Configuration (CRITICAL)
Edit `.env.local`:
```env
NEXT_PUBLIC_GUARDIAN_ADDRESS=0x[YOUR_GUARDIAN_ADDRESS]
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/[YOUR_API_KEY]
```

### 4. Test the Admin Interface
- Navigate to: `http://localhost:3000/admin`
- Click "Connect Wallet" (use MetaMask with owner wallet)
- Verify "GUARDIAN ACCESS GRANTED" appears
- Test each control on testnet first

---

## What Was Implemented

### ✅ New Components (4 Total)

1. **SystemStatusWidget.jsx** (`/components/`)
   - Emergency pause/unpause button
   - Live status indicator (Green=Operational, Red=Paused)
   - Real-time state polling every 10 seconds

2. **CollateralRatioManager.jsx** (`/components/`)
   - Table of supported assets with current ratios
   - Edit button to update ratios
   - "Add Asset" modal for new collateral tokens
   - Input validation and transaction feedback

3. **MintingLimitControls.jsx** (`/components/`)
   - Slider (100K - 10M range) for quick adjustments
   - Direct input field for precise values
   - Preview of new limit before update
   - Educational info box about circuit breaker

4. **Guardian Admin Page** (`/pages/admin.js`)
   - Wallet connection interface with MetaMask
   - Owner verification (compares connected wallet to contract owner)
   - Responsive grid layout combining all 3 controls
   - Security status indicators

### ✅ New Utilities (2 Files)

1. **lib/guardianAbi.js**
   - Complete Guardian contract ABI
   - Contract address configuration
   - RPC URL configuration

2. **lib/useGuardian.js**
   - 7 React hooks for contract interaction
   - Automatic state management & caching
   - Error handling & status updates
   - Examples:
     - `useGuardianOwner()` - fetch owner address
     - `useGuardianPauseState()` - poll pause state
     - `useGuardianMintLimit()` - fetch mint limit
     - `useExecuteGuardianFunction()` - execute transactions

### ✅ Updated Files

1. **components/Sidebar.jsx**
   - Added "Guardian Admin" link to bottom navigation
   - Styled with red accent (indicates admin-only)

2. **.env.local** (NEW)
   - Guardian contract address placeholder
   - RPC URL placeholder
   - Must be filled in before use

### ✅ Documentation

1. **GUARDIAN_IMPLEMENTATION.md** (COMPREHENSIVE)
   - Feature-by-feature breakdown
   - Installation instructions
   - Contract function reference
   - Security considerations
   - Troubleshooting guide

---

## Key Integration Points

### How Wallet Connection Works
```javascript
// In /pages/admin.js
const connectWallet = async () => {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  setConnectedWallet(accounts[0]);
}

// Compare with Guardian owner
useEffect(() => {
  const isOwner = connectedWallet.toLowerCase() === owner.toLowerCase();
  setIsAdmin(isOwner);
}, [connectedWallet, owner]);
```

### How Contract Calls Work
```javascript
// Example: Pausing Protocol
const { execute } = useExecuteGuardianFunction();

const handlePause = async () => {
  const tx = await execute(signer, 'pauseMinting');
  // Transaction sent to blockchain
  // Real-time feedback provided
}
```

---

## Testing Checklist

### Before Mainnet Deployment

- [ ] `.env.local` configured with correct addresses
- [ ] Admin page loads at `/admin`
- [ ] MetaMask connection works
- [ ] Owner verification shows "GUARDIAN ACCESS GRANTED"
- [ ] System Status widget reads pause state correctly
- [ ] Pause button sends transaction (testnet)
- [ ] Collateral table displays assets
- [ ] Mint limit slider responds to input
- [ ] Add Asset modal validates inputs
- [ ] Transaction hashes display correctly
- [ ] Etherscan links work

### Edge Cases to Test

- [ ] Non-owner wallet connects (verify access denied)
- [ ] Invalid contract address (verify error message)
- [ ] Network mismatch (testnet vs mainnet)
- [ ] MetaMask disconnected (verify error handling)
- [ ] Transaction fails (verify error message to user)
- [ ] Very large mint limit values (verify parsing)

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "GUARDIAN ADDRESS NOT CONFIGURED" | Fill `.env.local` with correct contract address |
| "Admin access required" message | Switch MetaMask to owner wallet |
| Buttons don't work | Verify signer is connected with owner wallet |
| Wrong network | Check `NEXT_PUBLIC_RPC_URL` matches MetaMask network |
| Transaction fails silently | Check browser console for error details |
| State doesn't update | Verify RPC endpoint is accessible |

---

## File Locations Reference

```
d:\Blockchain-Monitoring-Suite\
├── pages/
│   └── admin.js                           ← Guardian Admin Dashboard
├── components/
│   ├── SystemStatusWidget.jsx             ← Pause/Unpause Control
│   ├── CollateralRatioManager.jsx         ← Collateral & Asset Management
│   ├── MintingLimitControls.jsx           ← Velocity Limit Slider
│   └── Sidebar.jsx                        ← Updated with admin link
├── lib/
│   ├── guardianAbi.js                     ← Contract ABI & Config
│   └── useGuardian.js                     ← React Hooks
├── .env.local                             ← Configuration (UPDATE THIS)
└── GUARDIAN_IMPLEMENTATION.md             ← Full Documentation
```

---

## Deployment Steps

### 1. Testnet (Sepolia/Goerli)
```env
NEXT_PUBLIC_GUARDIAN_ADDRESS=0x[TESTNET_GUARDIAN]
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/[KEY]
```
- Test all 5 features
- Verify error handling
- Check transaction flow

### 2. Mainnet
```env
NEXT_PUBLIC_GUARDIAN_ADDRESS=0x[MAINNET_GUARDIAN]
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/[KEY]
```
- Use with caution
- Test with small transactions first
- Keep security best practices

---

## API Reference (Quick)

### SystemStatusWidget
```jsx
<SystemStatusWidget signer={window.ethereum} isAdmin={true} />
```
Props:
- `signer`: Web3 provider (window.ethereum)
- `isAdmin`: boolean, enables controls

### CollateralRatioManager
```jsx
<CollateralRatioManager signer={window.ethereum} isAdmin={true} />
```
Props:
- `signer`: Web3 provider
- `isAdmin`: boolean, enables edit/add

### MintingLimitControls
```jsx
<MintingLimitControls signer={window.ethereum} isAdmin={true} />
```
Props:
- `signer`: Web3 provider
- `isAdmin`: boolean, enables slider

---

## Support Contract Functions

The implementation calls these Guardian.sol functions:

```solidity
// Status & Config
function owner() external view returns (address)
function paused() external view returns (bool)
function getMintLimit() external view returns (uint256)
function getSupportedAssets() external view returns (address[])
function getCollateralRatio(address asset) external view returns (uint256)

// Write (onlyOwner)
function pauseMinting() external
function unpauseMinting() external
function setMintLimit(uint256 limit) external
function emergencyUpdateCollateralRatio(address asset, uint256 newRatio) external
function addControllerCollateral(address asset, address oracle, uint256 ratio, uint8 decimals) external
```

---

## Architecture Overview

```
Guardian Admin Dashboard
│
├── Wallet Connection Layer
│   ├── MetaMask Integration
│   └── Owner Verification
│
├── Contract Interaction Layer
│   ├── Read Functions (view state)
│   ├── Write Functions (execute tx)
│   └── Error Handling
│
└── UI Components
    ├── System Status (pause/unpause)
    ├── Collateral Manager (edit ratios)
    ├── Mint Limit (slider control)
    └── Asset Management (add tokens)
```

---

## Questions?

Refer to `GUARDIAN_IMPLEMENTATION.md` for:
- Detailed feature descriptions
- Security considerations
- Troubleshooting guide
- Complete function reference

---

**You're all set to deploy your Guardian control center!** 🚀
