import React, { useState, useEffect } from 'react';
import { Edit2, Loader2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useGuardianSupportedAssets, useGuardianCollateralRatio, useExecuteGuardianFunction } from '../lib/useGuardian';

const ASSET_NAMES = {
  '0x': 'ETH',
  '0xC02aaA39b223FE8D0A0e8e4F27ead9083C756Cc2': 'WETH',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
};

const CollateralRatioManager = ({ signer, isAdmin }) => {
  const { assets, loading: assetsLoading, refetch: refetchAssets } = useGuardianSupportedAssets();
  const { execute, loading: txLoading, error: txError } = useExecuteGuardianFunction();
  const [editingAsset, setEditingAsset] = useState(null);
  const [newRatio, setNewRatio] = useState('');
  const [assetRatios, setAssetRatios] = useState({});
  const [txStatus, setTxStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetData, setNewAssetData] = useState({
    address: '',
    oracleAddress: '',
    ratio: '',
    decimals: 18
  });

  // Fetch collateral ratios for all assets
  useEffect(() => {
    const fetchRatios = async () => {
      const ratios = {};
      for (const asset of assets) {
        try {
          const ratio = await getCollateralRatio(asset);
          ratios[asset] = ratio;
        } catch (err) {
          console.error(`Failed to fetch ratio for ${asset}:`, err);
        }
      }
      setAssetRatios(ratios);
    };

    if (assets.length > 0) {
      fetchRatios();
    }
  }, [assets]);

  const getCollateralRatio = async (assetAddress) => {
    // This would need to be integrated with the actual contract
    // For now, returning mock data
    return Math.random() * 100 + 100; // 100-200%
  };

  const handleUpdateRatio = async () => {
    if (!isAdmin || !signer) {
      alert('Admin access required');
      return;
    }

    try {
      setTxStatus('');
      await execute(signer, 'emergencyUpdateCollateralRatio', editingAsset, newRatio);
      setTxStatus(`✅ Collateral ratio updated for ${ASSET_NAMES[editingAsset] || editingAsset.slice(0, 6)}`);
      
      // Update local state
      setAssetRatios(prev => ({
        ...prev,
        [editingAsset]: newRatio
      }));
      
      setEditingAsset(null);
      setNewRatio('');
      
      // Refresh data
      setTimeout(() => refetchAssets(), 2000);
    } catch (err) {
      setTxStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleAddAsset = async () => {
    if (!isAdmin || !signer) {
      alert('Admin access required');
      return;
    }

    if (!newAssetData.address || !newAssetData.oracleAddress || !newAssetData.ratio) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setTxStatus('');
      await execute(
        signer,
        'addControllerCollateral',
        newAssetData.address,
        newAssetData.oracleAddress,
        newAssetData.ratio,
        parseInt(newAssetData.decimals)
      );
      setTxStatus('✅ New asset added successfully');
      
      // Reset form
      setNewAssetData({
        address: '',
        oracleAddress: '',
        ratio: '',
        decimals: 18
      });
      setShowAddModal(false);
      
      // Refresh data
      setTimeout(() => refetchAssets(), 2000);
    } catch (err) {
      setTxStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/50 backdrop-blur-md border-2 border-gray-700/50 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-400" />
          Collateral Risk Parameters
        </h2>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        )}
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-gray-300 font-semibold text-sm">Asset</th>
              <th className="px-4 py-3 text-left text-gray-300 font-semibold text-sm">Address</th>
              <th className="px-4 py-3 text-left text-gray-300 font-semibold text-sm">Current Ratio</th>
              {isAdmin && <th className="px-4 py-3 text-left text-gray-300 font-semibold text-sm">Action</th>}
            </tr>
          </thead>
          <tbody>
            {assetsLoading ? (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="px-4 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
                </td>
              </tr>
            ) : assets.length > 0 ? (
              assets.map((asset) => (
                <tr key={asset} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3 text-gray-100 font-semibold">
                    {ASSET_NAMES[asset] || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {asset.slice(0, 10)}...{asset.slice(-8)}
                  </td>
                  <td className="px-4 py-3">
                    {editingAsset === asset ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newRatio}
                          onChange={(e) => setNewRatio(e.target.value)}
                          placeholder="e.g., 15000 for 150%"
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-100 text-sm w-24 focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-gray-400 text-xs">basis points</span>
                      </div>
                    ) : (
                      <span className="text-green-400 font-semibold">
                        {assetRatios[asset] ? `${assetRatios[asset].toFixed(2)}%` : 'N/A'}
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {editingAsset === asset ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateRatio}
                            disabled={txLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            {txLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingAsset(null);
                              setNewRatio('');
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setNewRatio(assetRatios[asset]?.toString() || '');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="px-4 py-8 text-center text-gray-400">
                  No assets configured yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Messages */}
      {txStatus && (
        <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 mb-4 ${
          txStatus.includes('✅')
            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
            : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {txStatus.includes('✅') ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {txStatus}
        </div>
      )}

      {txError && (
        <div className="p-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {txError}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Add New Asset</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Token Address</label>
                <input
                  type="text"
                  value={newAssetData.address}
                  onChange={(e) => setNewAssetData({...newAssetData, address: e.target.value})}
                  placeholder="0x..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Chainlink Oracle Address</label>
                <input
                  type="text"
                  value={newAssetData.oracleAddress}
                  onChange={(e) => setNewAssetData({...newAssetData, oracleAddress: e.target.value})}
                  placeholder="0x..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Collateral Ratio (basis points)</label>
                <input
                  type="number"
                  value={newAssetData.ratio}
                  onChange={(e) => setNewAssetData({...newAssetData, ratio: e.target.value})}
                  placeholder="e.g., 15000 for 150%"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Token Decimals</label>
                <input
                  type="number"
                  value={newAssetData.decimals}
                  onChange={(e) => setNewAssetData({...newAssetData, decimals: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAsset}
                disabled={txLoading}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {txLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Asset'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollateralRatioManager;
