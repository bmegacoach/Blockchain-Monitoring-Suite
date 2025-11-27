import React, { useState } from 'react';
import { AlertCircle, Power, Loader2, CheckCircle } from 'lucide-react';
import { useGuardianPauseState, useExecuteGuardianFunction } from '../lib/useGuardian';

const SystemStatusWidget = ({ signer, isAdmin }) => {
  const { isPaused, loading: stateLoading, error: stateError, refetch } = useGuardianPauseState();
  const { execute, loading: txLoading, error: txError, transactionHash } = useExecuteGuardianFunction();
  const [showConfirm, setShowConfirm] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [actionType, setActionType] = useState(null); // 'pause', 'emergency', or 'restore'

  const handleTogglePause = async () => {
    if (!isAdmin || !signer) {
      alert('Admin access required. Please connect the Guardian owner wallet.');
      return;
    }

    try {
      setTxStatus('');
      const functionName = isPaused ? 'unpauseMinting' : 'pauseMinting';
      await execute(signer, functionName);
      setTxStatus(`✅ Protocol ${isPaused ? 'resumed' : 'paused'} successfully`);
      
      // Refresh state after transaction
      setTimeout(() => {
        refetch();
      }, 2000);
      
      setShowConfirm(false);
    } catch (err) {
      setTxStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleEmergencyGlobalPause = async () => {
    if (!isAdmin || !signer) {
      alert('Admin access required. Please connect the Guardian owner wallet.');
      return;
    }

    try {
      setTxStatus('');
      await execute(signer, 'emergencyGlobalPause', 'UI Triggered Emergency');
      setTxStatus('✅ Emergency global pause activated');
      
      setTimeout(() => {
        refetch();
      }, 2000);
      
      setShowConfirm(false);
      setActionType(null);
    } catch (err) {
      setTxStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleRestoreOperations = async () => {
    if (!isAdmin || !signer) {
      alert('Admin access required. Please connect the Guardian owner wallet.');
      return;
    }

    try {
      setTxStatus('');
      await execute(signer, 'restoreOperations');
      setTxStatus('✅ Operations restored successfully');
      
      setTimeout(() => {
        refetch();
      }, 2000);
      
      setShowConfirm(false);
      setActionType(null);
    } catch (err) {
      setTxStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/50 backdrop-blur-md border-2 border-gray-700/50 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full animate-pulse ${isPaused ? 'bg-red-500' : 'bg-green-500'}`} />
          <h2 className="text-2xl font-bold text-gray-100">System Status</h2>
        </div>
        <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
          isPaused 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}>
          {isPaused ? 'PAUSED' : 'OPERATIONAL'}
        </span>
      </div>

      {/* Status Details */}
      <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
        <p className="text-gray-300 text-sm mb-2">
          <span className="text-gray-400">Status: </span>
          <span className={`font-semibold ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
            {stateLoading ? 'Checking...' : isPaused ? 'Protocol is PAUSED - No new minting allowed' : 'Protocol is OPERATIONAL - Ready for transactions'}
          </span>
        </p>
      </div>

      {/* Control Button */}
      {isAdmin ? (
        <>
          {!showConfirm ? (
            <div className="space-y-3">
              {/* Primary Button: Pause/Resume */}
              <button
                onClick={() => {
                  setShowConfirm(true);
                  setActionType('pause');
                }}
                disabled={txLoading || stateLoading}
                className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                  isPaused
                    ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600'
                    : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-600'
                } ${(txLoading || stateLoading) ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <Power className="w-5 h-5" />
                {txLoading ? 'Processing...' : isPaused ? 'RESTORE OPERATIONS' : 'PAUSE PROTOCOL'}
              </button>

              {/* Emergency Button */}
              {!isPaused && (
                <button
                  onClick={() => {
                    setShowConfirm(true);
                    setActionType('emergency');
                  }}
                  disabled={txLoading || stateLoading}
                  className="w-full py-2 px-4 rounded-lg font-bold text-white bg-red-700 hover:bg-red-800 border-2 border-red-500 transition-all duration-200 disabled:opacity-50"
                >
                  🚨 EMERGENCY GLOBAL PAUSE
                </button>
              )}
            </div>
          ) : (
            <div className={`rounded-lg p-4 mb-4 ${
              actionType === 'emergency' 
                ? 'bg-red-600/20 border-2 border-red-500'
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <p className={`font-semibold mb-4 ${actionType === 'emergency' ? 'text-red-300 text-lg' : 'text-red-400'}`}>
                {actionType === 'emergency' 
                  ? '⚠️ EMERGENCY PAUSE - This will freeze all minting globally!'
                  : `⚠️ ${isPaused ? 'Resume' : 'Pause'} minting protocol?`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setActionType(null);
                  }}
                  className="flex-1 py-2 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    actionType === 'emergency' 
                      ? handleEmergencyGlobalPause
                      : actionType === 'restore'
                      ? handleRestoreOperations
                      : handleTogglePause
                  }
                  disabled={txLoading}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                    actionType === 'emergency'
                      ? 'bg-red-700 hover:bg-red-800 text-white'
                      : isPaused
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } disabled:opacity-50`}
                >
                  {txLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm'
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

          {transactionHash && (
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-blue-400 text-xs mb-2">Transaction Hash:</p>
              <a
                href={`https://etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 font-mono text-xs hover:text-blue-300 break-all"
              >
                {transactionHash}
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Admin access required to control system status</span>
        </div>
      )}
    </div>
  );
};

export default SystemStatusWidget;
