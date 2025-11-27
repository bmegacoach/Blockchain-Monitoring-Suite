// Guardian Smart Contract ABI
export const GUARDIAN_ABI = [
  {
    name: 'owner',
    outputs: [{ type: 'address' }],
    type: 'function',
    stateMutability: 'view'
  },
  {
    name: 'paused',
    outputs: [{ type: 'bool' }],
    type: 'function',
    stateMutability: 'view'
  },
  {
    name: 'pauseMinting',
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'unpauseMinting',
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'emergencyUpdateCollateralRatio',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'newRatio', type: 'uint256' }
    ],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'addControllerCollateral',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'chainlinkOracle', type: 'address' },
      { name: 'collateralRatio', type: 'uint256' },
      { name: 'decimals', type: 'uint8' }
    ],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'setMintLimit',
    inputs: [{ name: 'limit', type: 'uint256' }],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'getMintLimit',
    outputs: [{ type: 'uint256' }],
    type: 'function',
    stateMutability: 'view'
  },
  {
    name: 'getCollateralRatio',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    type: 'function',
    stateMutability: 'view'
  },
  {
    name: 'getSupportedAssets',
    outputs: [{ type: 'address[]' }],
    type: 'function',
    stateMutability: 'view'
  },
  {
    name: 'emergencyGlobalPause',
    inputs: [{ name: 'reason', type: 'string' }],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'restoreOperations',
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'updateLimits',
    inputs: [
      { name: '_soft', type: 'uint256' },
      { name: '_hard', type: 'uint256' }
    ],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'hasRole',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    outputs: [{ type: 'bool' }],
    type: 'function',
    stateMutability: 'view'
  },
  {
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ type: 'bytes32' }],
    type: 'function',
    stateMutability: 'view'
  }
];

// USDGBMinting Smart Contract ABI
export const USDGBMINTING_ABI = [
  {
    name: 'paused',
    outputs: [{ type: 'bool' }],
    type: 'function',
    stateMutability: 'view'
  },
  {
    name: 'complianceQueue',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'processed', type: 'bool' }
    ],
    type: 'function',
    stateMutability: 'view'
  },
  {
    name: 'approveTransaction',
    inputs: [{ name: 'txId', type: 'uint256' }],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'rejectTransaction',
    inputs: [
      { name: 'txId', type: 'uint256' },
      { name: 'reason', type: 'string' }
    ],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'addMinter',
    inputs: [{ name: 'partner', type: 'address' }],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    name: 'removeMinter',
    inputs: [{ name: 'partner', type: 'address' }],
    type: 'function',
    stateMutability: 'nonpayable'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'txId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'TransactionQueued',
    type: 'event'
  }
];

// Config loaded from API endpoint at runtime
export const GUARDIAN_CONTRACT_ADDRESS = null; // Loaded dynamically
export const RPC_URL = null; // Loaded dynamically
