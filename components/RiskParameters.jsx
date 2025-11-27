import React, { useState } from 'react';
import { Settings, Loader2, AlertCircle } from 'lucide-react';

export default function RiskParameters({ signer, isAdmin }) {
  const [softLimit, setSoftLimit] = useState(10000); // Queue Trigger
  const [hardLimit, setHardLimit] = useState(1000000); // Safety Cap
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newSoftLimit, setNewSoftLimit] = useState(softLimit);
  const [newHardLimit, setNewHardLimit] = useState(hardLimit);
  const [transactionHash, setTransactionHash] = useState(null);

  const handleUpdateLimits = async () => {
    if (newSoftLimit >= newHardLimit) {
      alert('Soft limit must be less than hard limit');
      return;
    }

    if (!isAdmin || !signer) {
      alert('Admin access required');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call updateLimits via Guardian contract
      // const result = await executeGuardianFunction(signer, 'updateLimits', newSoftLimit, newHardLimit);
      // setTransactionHash(result.hash);

      // Mock update
      setSoftLimit(newSoftLimit);
      setHardLimit(newHardLimit);
      setShowModal(false);
      alert('Risk parameters updated successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400">Admin access required to manage risk parameters.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/50 backdrop-blur-md border-2 border-gray-700/50 rounded-xl p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-gray-100">Risk Control Parameters</h2>
      </div>

      {/* Current Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Soft Limit */}
        <div className="bg-gray-800/60 rounded-lg p-6 border border-yellow-500/30">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-yellow-400 font-semibold">Soft Limit (Queue Trigger)</h3>
            <span className="text-yellow-400/60 text-xs">Yellow Lane</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400 mb-2">${softLimit.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">
            Transactions above this amount enter the compliance queue for review.
          </p>
        </div>

        {/* Hard Limit */}
        <div className="bg-gray-800/60 rounded-lg p-6 border border-red-500/30">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-red-400 font-semibold">Hard Limit (Safety Cap)</h3>
            <span className="text-red-400/60 text-xs">Red Lane</span>
          </div>
          <p className="text-3xl font-bold text-red-400 mb-2">${hardLimit.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">
            Transactions above this amount are automatically rejected for safety.
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-lg p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-400 font-semibold text-sm">Traffic Light System</p>
          <p className="text-blue-400/80 text-xs mt-1">
            Green Lane: Under ${softLimit.toLocaleString()} - Auto-approved<br/>
            Yellow Lane: ${softLimit.toLocaleString()} - ${hardLimit.toLocaleString()} - Requires approval<br/>
            Red Lane: Over ${hardLimit.toLocaleString()} - Auto-rejected
          </p>
        </div>
      </div>

      {/* Update Button */}
      <button
        onClick={() => {
          setNewSoftLimit(softLimit);
          setNewHardLimit(hardLimit);
          setShowModal(true);
        }}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
      >
        Update Limits
      </button>

      {transactionHash && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            Transaction: <a href={`https://etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer" className="underline">{transactionHash.slice(0, 10)}...</a>
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-100 mb-6">Update Risk Parameters</h3>
            
            {/* Soft Limit Input */}
            <div className="mb-6">
              <label className="block text-gray-300 font-semibold text-sm mb-2">
                Soft Limit (Queue Trigger) - USD
              </label>
              <input
                type="number"
                value={newSoftLimit}
                onChange={(e) => setNewSoftLimit(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:border-purple-500 outline-none"
                placeholder="10000"
              />
              <p className="text-gray-400 text-xs mt-2">
                Current: ${softLimit.toLocaleString()}
              </p>
            </div>

            {/* Hard Limit Input */}
            <div className="mb-6">
              <label className="block text-gray-300 font-semibold text-sm mb-2">
                Hard Limit (Safety Cap) - USD
              </label>
              <input
                type="number"
                value={newHardLimit}
                onChange={(e) => setNewHardLimit(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:border-red-500 outline-none"
                placeholder="1000000"
              />
              <p className="text-gray-400 text-xs mt-2">
                Current: ${hardLimit.toLocaleString()}
              </p>
            </div>

            {newSoftLimit >= newHardLimit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                <p className="text-red-400 text-xs">⚠️ Soft limit must be less than hard limit</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLimits}
                disabled={loading || newSoftLimit >= newHardLimit}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Update Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
