import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ComplianceQueue({ signer, isAdmin }) {
  const [queueItems, setQueueItems] = useState([
    // Mock data - replace with real data from contract
    {
      id: 402,
      user: '0x123456789abcdef',
      amount: '50,000',
      time: '2 hours ago',
      status: 'pending'
    }
  ]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleApprove = async (txId) => {
    if (!isAdmin || !signer) {
      alert('Admin access required');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call approveTransaction via contract
      // const result = await executeUSDGBFunction(signer, 'approveTransaction', txId);
      
      // Mock update
      setQueueItems(items =>
        items.filter(item => item.id !== txId)
      );
      alert(`Transaction #${txId} approved!`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (txId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call rejectTransaction via contract
      // const result = await executeUSDGBFunction(signer, 'rejectTransaction', txId, rejectReason);
      
      // Mock update
      setQueueItems(items =>
        items.filter(item => item.id !== txId)
      );
      setShowRejectModal(false);
      setRejectReason('');
      alert(`Transaction #${txId} rejected!`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400">Admin access required to manage compliance queue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-gray-100">Compliance Queue</h2>
        <span className="ml-auto text-sm text-gray-400">{queueItems.length} pending</span>
      </div>

      {queueItems.length === 0 ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-green-400 font-semibold">All Transactions Approved</p>
          <p className="text-green-400/70 text-sm mt-2">No pending compliance queue items.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">ID</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">User</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Time</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queueItems.map(item => (
                <tr key={item.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition">
                  <td className="px-6 py-4 text-gray-200 font-mono">#{item.id}</td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://basescan.org/address/${item.user}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono"
                    >
                      {formatAddress(item.user)}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-200">{item.amount} USDGB</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{item.time}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTx(item.id);
                        setShowRejectModal(true);
                      }}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Reject Transaction #{selectedTx}</h3>
            <p className="text-gray-400 text-sm mb-4">Provide a reason for rejection:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Suspicious activity detected, KYC verification failed"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:border-red-500 outline-none mb-6 text-sm"
              rows="4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedTx)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
