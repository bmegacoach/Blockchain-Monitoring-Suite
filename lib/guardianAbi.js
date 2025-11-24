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
  }
];

// Config loaded from API endpoint at runtime
export const GUARDIAN_CONTRACT_ADDRESS = null; // Loaded dynamically
export const RPC_URL = null; // Loaded dynamically
