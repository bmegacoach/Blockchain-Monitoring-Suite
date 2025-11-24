# Guardian Control Center - Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Guardian Admin Dashboard                      │
│                     /pages/admin.js                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Wallet Connection Section                              │   │
│  │  • MetaMask Integration                                 │   │
│  │  • Owner Verification                                   │   │
│  │  • "GUARDIAN ACCESS GRANTED" Visual                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ System     │  │ Collateral │  │ Minting    │                │
│  │ Status     │  │ Ratio      │  │ Limit      │                │
│  │ Widget     │  │ Manager    │  │ Controls   │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│           Guardian Contract Hooks (lib/useGuardian.js)            │
│                                                                   │
│  • useGuardianOwner()                                            │
│  • useGuardianPauseState()                                       │
│  • useGuardianMintLimit()                                        │
│  • useGuardianCollateralRatio()                                  │
│  • useGuardianSupportedAssets()                                  │
│  • useExecuteGuardianFunction()                                  │
└──────────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    ethers.js Provider                             │
│                  (lib/guardianAbi.js)                             │
└──────────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Blockchain (RPC Provider)                        │
│          env: NEXT_PUBLIC_RPC_URL                                │
└──────────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│              Guardian Smart Contract                              │
│          env: NEXT_PUBLIC_GUARDIAN_ADDRESS                       │
│                                                                   │
│  Functions:                                                      │
│  • owner() → Check admin access                                 │
│  • paused() → Read protocol status                              │
│  • pauseMinting() → Kill switch                                 │
│  • unpauseMinting() → Resume protocol                           │
│  • getCollateralRatio(asset) → Read ratios                      │
│  • emergencyUpdateCollateralRatio() → Update ratios             │
│  • getMintLimit() → Read velocity limit                         │
│  • setMintLimit() → Update velocity limit                       │
│  • getSupportedAssets() → List whitelisted tokens               │
│  • addControllerCollateral() → Add new asset                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Action → Blockchain

### Scenario 1: Pausing Protocol

```
User clicks "PAUSE PROTOCOL"
        ▼
Confirmation dialog appears
        ▼
User clicks "Confirm"
        ▼
MetaMask wallet opens (sign transaction)
        ▼
useExecuteGuardianFunction() → execute(signer, 'pauseMinting')
        ▼
ethers.Contract.pauseMinting() sends transaction
        ▼
Guardian.sol pauseMinting() executes
        ▼
Contract event emitted, pause flag set
        ▼
useGuardianPauseState() detects state change (10s poll)
        ▼
UI updates: "PAUSED" (red indicator)
        ▼
User sees transaction hash → Can click to verify on Etherscan
```

---

### Scenario 2: Updating Collateral Ratio

```
User clicks "Edit" on ETH row
        ▼
Input field appears with current ratio
        ▼
User enters new ratio (e.g., 17500 for 175%)
        ▼
User clicks "Save"
        ▼
Confirmation dialog with new value
        ▼
User clicks "Confirm"
        ▼
MetaMask asks to sign transaction
        ▼
useExecuteGuardianFunction() → execute(signer, 'emergencyUpdateCollateralRatio', asset, newRatio)
        ▼
ethers.Contract.emergencyUpdateCollateralRatio(asset, 17500)
        ▼
Guardian.sol updates collateral mapping
        ▼
Contract emits CollateralRatioUpdated event
        ▼
Hook refetch triggers → getCollateralRatio(asset)
        ▼
UI shows new ratio in table
        ▼
Success message with transaction hash
```

---

### Scenario 3: Adding New Asset

```
User clicks "Add Asset" button
        ▼
Modal form opens with 4 input fields
        ▼
User fills:
  • Token Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (USDC)
  • Oracle: 0x8fFfFfd4AfB6115b954Bd29E92983e775236667B (Chainlink)
  • Ratio: 11000 (110%)
  • Decimals: 6
        ▼
User clicks "Add Asset"
        ▼
Inputs validated
        ▼
MetaMask asks to sign transaction
        ▼
useExecuteGuardianFunction() → execute(signer, 'addControllerCollateral', asset, oracle, ratio, decimals)
        ▼
ethers.Contract.addControllerCollateral(0xA0b8..., 0x8fFf..., 11000, 6)
        ▼
Guardian.sol adds USDC to whitelisted collateral
        ▼
Contract emits AssetAdded event
        ▼
useGuardianSupportedAssets() refetch triggered
        ▼
Table now shows USDC in asset list
        ▼
Success: "✅ New asset added successfully"
        ▼
Modal closes, user sees USDC with 110% ratio
```

---

## Component Interaction Map

```
Guardian Admin Dashboard (/pages/admin.js)
    │
    ├─→ Wallet Connection Handler
    │   ├─→ window.ethereum.request('eth_requestAccounts')
    │   ├─→ useGuardianOwner() [checks owner]
    │   └─→ setIsAdmin = (connectedWallet === owner)
    │
    ├─→ SystemStatusWidget
    │   ├─→ useGuardianPauseState() [polls every 10s]
    │   ├─→ useExecuteGuardianFunction() [execute pause/unpause]
    │   └─→ Displays: Current status, button, transaction hash
    │
    ├─→ CollateralRatioManager
    │   ├─→ useGuardianSupportedAssets() [fetch all tokens]
    │   ├─→ useGuardianCollateralRatio(asset) [per-asset ratio]
    │   ├─→ useExecuteGuardianFunction() [update ratio or add asset]
    │   └─→ Displays: Table, edit forms, modal
    │
    └─→ MintingLimitControls
        ├─→ useGuardianMintLimit() [fetch current limit]
        ├─→ useExecuteGuardianFunction() [update limit]
        └─→ Displays: Current value, slider, input, preview
```

---

## React Hook Dependency Chain

```
Guardian Admin Dashboard (page)
    │
    ├─→ useGuardianOwner()
    │   └─→ useGuardianContract()
    │       └─→ ethers.JsonRpcProvider(RPC_URL)
    │           └─→ ethers.Contract(GUARDIAN_ADDRESS, GUARDIAN_ABI, provider)
    │
    ├─→ useGuardianPauseState() [in SystemStatusWidget]
    │   ├─→ useGuardianContract()
    │   └─→ Auto-refresh interval (10 seconds)
    │
    ├─→ useGuardianSupportedAssets() [in CollateralRatioManager]
    │   └─→ useGuardianContract()
    │
    ├─→ useGuardianCollateralRatio(asset) [in CollateralRatioManager]
    │   └─→ useGuardianContract()
    │
    ├─→ useGuardianMintLimit() [in MintingLimitControls]
    │   └─→ useGuardianContract()
    │
    └─→ useExecuteGuardianFunction() [shared across all controls]
        ├─→ Window.ethereum (MetaMask)
        └─→ ethers.Contract(GUARDIAN_ADDRESS, GUARDIAN_ABI, signer)
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────┐
│         Admin Dashboard Component State              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  useState: connectedWallet                          │
│  useState: isAdmin                                  │
│                                                     │
│  Dependencies:                                      │
│  • connectedWallet → triggers useGuardianOwner()   │
│  • owner (from hook) → determines isAdmin           │
│                                                     │
└─────────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────┐
│   SystemStatusWidget Component State                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  useState: showConfirm                              │
│  useState: txStatus                                 │
│                                                     │
│  Hooks:                                             │
│  • useGuardianPauseState()                          │
│    └─ Updates: isPaused, loading, error             │
│                                                     │
│  • useExecuteGuardianFunction()                     │
│    └─ Updates: txLoading, error, transactionHash    │
│                                                     │
│  Auto-refresh: isPaused updates every 10 seconds   │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CollateralRatioManager Component State              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  useState: editingAsset                             │
│  useState: newRatio                                 │
│  useState: assetRatios (cache)                      │
│  useState: showAddModal                             │
│  useState: newAssetData                             │
│                                                     │
│  Hooks:                                             │
│  • useGuardianSupportedAssets()                     │
│    └─ Updates: assets array                         │
│                                                     │
│  • useGuardianCollateralRatio(asset)                │
│    └─ Updates: assetRatios cache per-asset          │
│                                                     │
│  • useExecuteGuardianFunction()                     │
│    └─ Updates: transaction status                   │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MintingLimitControls Component State                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  useState: isEditing                                │
│  useState: newLimit                                 │
│  useState: sliderValue                              │
│                                                     │
│  Hooks:                                             │
│  • useGuardianMintLimit()                           │
│    └─ Updates: mintLimit, loading, error            │
│                                                     │
│  • useExecuteGuardianFunction()                     │
│    └─ Updates: transaction status                   │
│                                                     │
│  Auto-sync: sliderValue ↔ newLimit (two-way)       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Transaction Lifecycle

```
Step 1: User Action
  User clicks button → Dialog appears
        ▼
Step 2: Confirmation
  User confirms action → Form validated
        ▼
Step 3: MetaMask Signing
  window.ethereum.request() opens MetaMask → User approves
        ▼
Step 4: Transaction Execution
  ethers.Contract.function() → Sends to blockchain
        ▼
Step 5: Blockchain Processing
  RPC node processes → Included in block → Event emitted
        ▼
Step 6: Transaction Receipt
  tx.wait() → Returns receipt with block number, gas used, status
        ▼
Step 7: UI Update
  Hook detects state change → Re-fetch from contract
        ▼
Step 8: Final Display
  Transaction hash shown → User can click to verify on Etherscan
        ▼
Step 9: Auto-Refresh
  State hooks poll contract every 10 seconds → Keep UI in sync
```

---

## Error Handling Flowchart

```
User Action
    ▼
Try Block Execution
    ▼
    ├─ SUCCESS
    │   ├─ Update local state
    │   ├─ Show success message
    │   ├─ Display transaction hash
    │   └─ Auto-refresh from contract
    │
    └─ ERROR
        ├─ Check error type
        │   ├─ Invalid address format
        │   │   └─ Show: "Invalid address"
        │   │
        │   ├─ Not owner
        │   │   └─ Show: "Admin access required"
        │   │
        │   ├─ Network error
        │   │   └─ Show: "RPC endpoint unreachable"
        │   │
        │   ├─ Transaction rejected
        │   │   └─ Show: "Transaction cancelled"
        │   │
        │   └─ Other contract error
        │       └─ Show: Detailed error message
        │
        └─ Display error in UI
            ├─ Error message visible
            ├─ Button remains clickable
            ├─ User can retry
            └─ No state corrupted
```

---

## Environment Configuration

```
.env.local
├─ NEXT_PUBLIC_GUARDIAN_ADDRESS
│  └─ Example: 0x1234...5678 (Your deployed Guardian)
│
├─ NEXT_PUBLIC_RPC_URL
│  ├─ Testnet: https://eth-sepolia.g.alchemy.com/v2/[KEY]
│  └─ Mainnet: https://eth-mainnet.g.alchemy.com/v2/[KEY]
│
├─ NEXT_PUBLIC_ETHERSCAN_API_KEY
│  └─ For API calls (existing)
│
└─ NEXT_PUBLIC_ALCHEMY_WS_URL
   └─ For WebSocket (existing)
```

---

## Security Boundaries

```
Frontend (Untrusted)
├─ User Input Validation
├─ Parameter Sanitization
├─ UI-level checks
└─ Error handling

Network Layer (Untrusted)
├─ ethers.js validates
├─ RPC response validation
└─ Timeout protection

Smart Contract (Trusted)
├─ onlyOwner() checks
├─ State validation
└─ Event logging
```

---

## Real-time Update Intervals

```
useGuardianPauseState()
└─ Poll interval: 10 seconds
   └─ Updates pause status live
   └─ Shows instant feedback to user

useGuardianMintLimit()
└─ Fetches on mount
└─ Refetch on user action
└─ No auto-polling (less critical)

useGuardianCollateralRatio()
└─ Fetches on mount
└─ Refetch on user action
└─ Cached in component state

useGuardianSupportedAssets()
└─ Fetches on mount
└─ Refetch on add/remove
└─ Cached in component state
```

---

## Deployment Architecture

```
Development
├─ localhost:3000/admin
├─ Testnet Guardian contract
└─ Testing environment

Production
├─ yoursite.com/admin
├─ Mainnet Guardian contract
└─ Live environment

Same Code Base
├─ Controlled via .env.local
├─ Network detection via RPC
└─ No code changes needed
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Real-time state synchronization
- ✅ Secure admin access
- ✅ Error resilience
- ✅ Scalable design
- ✅ Easy maintenance
