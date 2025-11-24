import React, { useState, useEffect } from 'react';
import { Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useGuardianMintLimit, useExecuteGuardianFunction } from '../lib/useGuardian';

const MintingLimitControls = ({ signer, isAdmin }) => {
  const { mintLimit, loading: limitLoading, error: limitError, refetch } = useGuardianMintLimit();
  const { execute, loading: txLoading, error: txError } = useExecuteGuardianFunction();
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [sliderValue, setSliderValue] = useState(1000000);

  useEffect(() => {
    if (mintLimit) {
      const limitNum = parseFloat(mintLimit);
      setSliderValue(limitNum);
      setNewLimit(limitNum.toString());
    }
  }, [mintLimit]);

  const handleUpdateLimit = async () => {
    if (!isAdmin || !signer) {
      alert('Admin access required');
      return;
    }

    if (!newLimit || parseFloat(newLimit) <= 0) {
      alert('Please enter a valid limit');
      return;
    }

    try {
      setTxStatus('');
      await execute(signer, 'setMintLimit', newLimit);
      setTxStatus('✅ Mint limit updated successfully');
      
      setIsEditing(false);
      
      // Refresh data
      setTimeout(() => refetch(), 2000);
    } catch (err) {
      setTxStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleSliderChange = (e) => {
    const value = e.target.value;
    setSliderValue(value);
    setNewLimit(value);
  };

  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/50 backdrop-blur-md border-2 border-gray-700/50 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Velocity Limit
        </h2>
        <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-gray-700/50 rounded-full">
          Circuit Breaker
        </span>
      </div>

      {/* Current Limit Display */}
      <div className="bg-gray-700/30 rounded-lg p-6 mb-6">
        {limitLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-2">Current Mint Limit (Per Hour)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-400">
                {formatNumber(mintLimit || '0')}
              </span>
              <span className="text-gray-400 text-lg">USDGB</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              This is the maximum amount of USDGB that can be minted in a 1-hour window
            </p>
          </>
        )}
      </div>

      {/* Interactive Controls */}
      {isAdmin ? (
        <>
          {!isEditing ? (
            <button
              onClick={() => {
                setIsEditing(true);
                setNewLimit(mintLimit?.toString() || '');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-5 h-5" />
              Edit Mint Limit
            </button>
          ) : (
            <div className="space-y-4">
              {/* Slider Control */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Set New Limit (USDGB)
                </label>
                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="100000"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>100K</span>
                  <span>10M</span>
                </div>
              </div>

              {/* Direct Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Or enter exact value
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => {
                      setNewLimit(e.target.value);
                      setSliderValue(e.target.value || '0');
                    }}
                    placeholder="1000000"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                  <span className="flex items-center px-3 py-2 bg-gray-700 rounded-lg text-gray-400 font-medium">
                    USDGB
                  </span>
                </div>
              </div>

              {/* Preview */}
              {newLimit && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-400 text-sm font-medium">
                    New limit will be: <span className="font-bold">{formatNumber(newLimit)}</span> USDGB per hour
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewLimit(mintLimit?.toString() || '');
                  }}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLimit}
                  disabled={txLoading || !newLimit}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {txLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Update Limit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Transaction Status */}
          {txStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
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
            <div className="mt-4 p-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {txError}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-xs leading-relaxed">
              <span className="font-semibold">💡 Circuit Breaker Protection:</span> This limit prevents any single transaction or coordinated attack from minting an excessive amount of USDGB in a 1-hour window. If the limit is exceeded, the transaction will be rejected.
            </p>
          </div>
        </>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Admin access required to modify minting limits</span>
        </div>
      )}
    </div>
  );
};

export default MintingLimitControls;
