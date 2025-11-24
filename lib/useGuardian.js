import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { GUARDIAN_ABI } from './guardianAbi';

let cachedConfig = null;

// Fetch config from server-side API
const fetchConfig = async () => {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to fetch config');
    cachedConfig = await res.json();
    return cachedConfig;
  } catch (err) {
    console.error('Failed to fetch Guardian config:', err);
    return null;
  }
};

export const useGuardianContract = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initContract = async () => {
      try {
        const config = await fetchConfig();
        if (!config?.GUARDIAN_ADDRESS || !config?.RPC_URL) {
          console.warn('Guardian contract address or RPC URL not configured. Please set GUARDIAN_ADDRESS and RPC_URL in .env.local');
          setError('Guardian configuration not set');
          return;
        }
        
        const provider = new ethers.JsonRpcProvider(config.RPC_URL);
        const guardianContract = new ethers.Contract(
          config.GUARDIAN_ADDRESS,
          GUARDIAN_ABI,
          provider
        );
        setContract(guardianContract);
      } catch (err) {
        setError('Failed to initialize Guardian contract');
        console.error('Guardian contract initialization error:', err);
      }
    };

    initContract();
  }, []);

  return { contract, loading, error };
};

export const useGuardianOwner = () => {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { contract } = useGuardianContract();

  const fetchOwner = useCallback(async () => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }
    
    setLoading(true);
    try {
      const ownerAddress = await contract.owner();
      setOwner(ownerAddress);
      setError('');
    } catch (err) {
      setError('Failed to fetch contract owner');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) {
      fetchOwner();
    }
  }, [fetchOwner, contract]);

  return { owner, loading, error, refetch: fetchOwner };
};

export const useGuardianPauseState = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { contract } = useGuardianContract();

  const fetchPauseState = useCallback(async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const paused = await contract.paused();
      setIsPaused(paused);
      setError('');
    } catch (err) {
      setError('Failed to fetch pause state');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchPauseState();
    const interval = setInterval(fetchPauseState, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchPauseState]);

  return { isPaused, loading, error, refetch: fetchPauseState };
};

export const useGuardianMintLimit = () => {
  const [mintLimit, setMintLimit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { contract } = useGuardianContract();

  const fetchMintLimit = useCallback(async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const limit = await contract.getMintLimit();
      setMintLimit(ethers.formatUnits(limit, 18)); // Assuming 18 decimals
      setError('');
    } catch (err) {
      setError('Failed to fetch mint limit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchMintLimit();
  }, [fetchMintLimit]);

  return { mintLimit, loading, error, refetch: fetchMintLimit };
};

export const useGuardianCollateralRatio = (assetAddress) => {
  const [ratio, setRatio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { contract } = useGuardianContract();

  const fetchRatio = useCallback(async () => {
    if (!contract || !assetAddress) return;
    
    setLoading(true);
    try {
      const collateralRatio = await contract.getCollateralRatio(assetAddress);
      // Assuming ratio is in basis points (e.g., 15000 = 150%)
      setRatio((Number(collateralRatio) / 100).toFixed(2));
      setError('');
    } catch (err) {
      setError('Failed to fetch collateral ratio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contract, assetAddress]);

  useEffect(() => {
    fetchRatio();
  }, [fetchRatio]);

  return { ratio, loading, error, refetch: fetchRatio };
};

export const useGuardianSupportedAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { contract } = useGuardianContract();

  const fetchAssets = useCallback(async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const supportedAssets = await contract.getSupportedAssets();
      setAssets(supportedAssets);
      setError('');
    } catch (err) {
      setError('Failed to fetch supported assets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
};

export const useExecuteGuardianFunction = () => {
  const [transactionHash, setTransactionHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(async (signer, functionName, ...args) => {
    setLoading(true);
    setError('');
    try {
      if (!GUARDIAN_CONTRACT_ADDRESS) {
        throw new Error('Guardian contract address not configured');
      }

      const guardianContract = new ethers.Contract(
        GUARDIAN_CONTRACT_ADDRESS,
        GUARDIAN_ABI,
        signer
      );

      let tx;
      if (functionName === 'pauseMinting') {
        tx = await guardianContract.pauseMinting();
      } else if (functionName === 'unpauseMinting') {
        tx = await guardianContract.unpauseMinting();
      } else if (functionName === 'emergencyUpdateCollateralRatio') {
        const [asset, newRatio] = args;
        tx = await guardianContract.emergencyUpdateCollateralRatio(
          asset,
          ethers.parseUnits(newRatio, 0)
        );
      } else if (functionName === 'addControllerCollateral') {
        const [asset, oracle, ratio, decimals] = args;
        tx = await guardianContract.addControllerCollateral(
          asset,
          oracle,
          ethers.parseUnits(ratio, 0),
          decimals
        );
      } else if (functionName === 'setMintLimit') {
        const [limit] = args;
        tx = await guardianContract.setMintLimit(ethers.parseUnits(limit, 18));
      } else {
        throw new Error(`Unknown function: ${functionName}`);
      }

      const receipt = await tx.wait();
      setTransactionHash(receipt?.hash || tx.hash);
      return receipt;
    } catch (err) {
      const errorMsg = err.reason || err.message || 'Transaction failed';
      setError(errorMsg);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, transactionHash, loading, error };
};
