import React, { useState } from 'react';
import { Users, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';

export default function PartnerManagement({ signer, isAdmin }) {
  const [partners, setPartners] = useState([
    { address: '0x1234567890123456789012345678901234567890', name: 'Partner A' },
    { address: '0x0987654321098765432109876543210987654321', name: 'Partner B' }
  ]);
  const [newPartnerAddress, setNewPartnerAddress] = useState('');
  const [newPartnerName, setNewPartnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isValidAddress = (addr) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleAddMinter = async () => {
    if (!isValidAddress(newPartnerAddress)) {
      alert('Invalid Ethereum address');
      return;
    }

    if (partners.some(p => p.address.toLowerCase() === newPartnerAddress.toLowerCase())) {
      alert('This address is already a partner');
      return;
    }

    if (!isAdmin || !signer) {
      alert('Admin access required');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call addMinter via USDGB contract
      // const result = await executeUSDGBFunction(signer, 'addMinter', newPartnerAddress);
      // setTransactionHash(result.hash);

      // Mock update
      setPartners([...partners, {
        address: newPartnerAddress,
        name: newPartnerName || 'New Partner'
      }]);
      setNewPartnerAddress('');
      setNewPartnerName('');
      alert('Minter added successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMinter = async (partnerAddress) => {
    if (!isAdmin || !signer) {
      alert('Admin access required');
      return;
    }

    if (!confirm(`Remove minter ${formatAddress(partnerAddress)}?`)) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Call removeMinter via USDGB contract
      // const result = await executeUSDGBFunction(signer, 'removeMinter', partnerAddress);
      // setTransactionHash(result.hash);

      // Mock update
      setPartners(partners.filter(p => p.address !== partnerAddress));
      alert('Minter removed successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400">Admin access required to manage partners.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/50 backdrop-blur-md border-2 border-gray-700/50 rounded-xl p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-gray-100">Minter Access Control</h2>
        <span className="ml-auto text-sm text-gray-400">{partners.length} active</span>
      </div>

      {/* Add Partner Form */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-green-500/30 mb-8">
        <h3 className="text-green-400 font-semibold mb-4">Add New Institutional Partner</h3>
        <div className="space-y-4">
          {/* Address Input */}
          <div>
            <label className="block text-gray-300 font-semibold text-sm mb-2">
              Wallet Address (0x...)
            </label>
            <input
              type="text"
              value={newPartnerAddress}
              onChange={(e) => setNewPartnerAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-green-500 outline-none font-mono"
            />
            {newPartnerAddress && !isValidAddress(newPartnerAddress) && (
              <p className="text-red-400 text-xs mt-2">Invalid Ethereum address format</p>
            )}
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-gray-300 font-semibold text-sm mb-2">
              Partner Name (optional)
            </label>
            <input
              type="text"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              placeholder="e.g., Institutional Partner X"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-green-500 outline-none"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddMinter}
            disabled={loading || !isValidAddress(newPartnerAddress)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Minter
          </button>
        </div>
      </div>

      {/* Partners List */}
      <div>
        <h3 className="text-gray-300 font-semibold mb-4">Active Partners</h3>
        {partners.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No partners added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partners.map(partner => (
              <div
                key={partner.address}
                className="bg-gray-800/60 rounded-lg p-4 flex items-center justify-between border border-gray-700/50 hover:border-gray-600/80 transition"
              >
                <div>
                  <p className="text-gray-100 font-semibold">{partner.name}</p>
                  <p className="text-gray-400 text-sm font-mono">{partner.address}</p>
                </div>
                <button
                  onClick={() => handleRemoveMinter(partner.address)}
                  disabled={loading}
                  className="bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {transactionHash && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            Transaction: <a href={`https://etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer" className="underline">{transactionHash.slice(0, 10)}...</a>
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-400 font-semibold text-sm">About Minter Access</p>
          <p className="text-blue-400/80 text-xs mt-1">
            Only whitelisted addresses can mint USDGB tokens. Add institutional partners who need minting capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
