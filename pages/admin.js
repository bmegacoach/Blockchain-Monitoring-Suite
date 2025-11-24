import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AlertCircle, Lock, Unlock, Shield, Wallet } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useGuardianOwner } from '../lib/useGuardian';

// Dynamically import components to avoid SSR issues
const SystemStatusWidget = dynamic(() => import('../components/SystemStatusWidget'), {
  loading: () => <div className="bg-gray-800/50 rounded-xl p-6 h-40 animate-pulse" />,
  ssr: false
});

const CollateralRatioManager = dynamic(() => import('../components/CollateralRatioManager'), {
  loading: () => <div className="bg-gray-800/50 rounded-xl p-6 h-40 animate-pulse" />,
  ssr: false
});

const MintingLimitControls = dynamic(() => import('../components/MintingLimitControls'), {
  loading: () => <div className="bg-gray-800/50 rounded-xl p-6 h-40 animate-pulse" />,
  ssr: false
});

export default function GuardianAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const { owner } = useGuardianOwner();

  // Check if we're on the client side and MetaMask is available
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && window.ethereum) {
      setHasMetaMask(true);
    }
  }, []);

  // Check if connected wallet is the admin
  useEffect(() => {
    if (connectedWallet && owner) {
      const isOwner = connectedWallet.toLowerCase() === owner.toLowerCase();
      setIsAdmin(isOwner);
    }
  }, [connectedWallet, owner]);

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask is not installed. Please install it to continue.');
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts && accounts.length > 0) {
        setConnectedWallet(accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    setIsAdmin(false);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <Head>
        <title>Guardian Admin - Smart Monitor</title>
      </Head>
      <div className="flex flex-col lg:flex-row h-screen bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header isLoggedIn={true} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-blue-400" />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Guardian Admin Control Center
                  </h1>
                </div>
                <p className="text-gray-400">Manage protocol parameters, emergency controls, and asset configurations</p>
              </div>

              {/* Wallet Connection Section */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/50 backdrop-blur-md border-2 border-gray-700/50 rounded-xl p-6 mb-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isAdmin ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                      {isAdmin ? (
                        <Unlock className="w-6 h-6 text-green-400" />
                      ) : (
                        <Lock className="w-6 h-6 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Wallet Status</p>
                      {connectedWallet ? (
                        <div>
                          <p className="text-lg font-semibold text-gray-100">{formatAddress(connectedWallet)}</p>
                          {isAdmin ? (
                            <p className="text-green-400 text-sm font-medium flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              GUARDIAN ACCESS GRANTED
                            </p>
                          ) : (
                            <p className="text-red-400 text-sm font-medium flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                              ACCESS DENIED
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Not connected</p>
                      )}
                    </div>
                  </div>

                  {connectedWallet ? (
                    <button
                      onClick={disconnectWallet}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={connectWallet}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Wallet className="w-4 h-4" />
                      {loading ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  )}
                </div>

                {owner && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold">Guardian Owner:</span> {formatAddress(owner)}
                    </p>
                  </div>
                )}
              </div>

              {/* MetaMask Check */}
              {isClient && !hasMetaMask && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4 mb-8 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold mb-1">MetaMask Not Found</p>
                    <p className="text-yellow-400/80 text-sm">
                      MetaMask browser extension is not installed. Please install it from <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">metamask.io</a> to connect your wallet and access admin controls.
                    </p>
                  </div>
                </div>
              )}

              {/* Configuration Check */}
              {isClient && owner === null && hasMetaMask && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4 mb-8 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold mb-1">Loading Guardian Configuration</p>
                    <p className="text-yellow-400/80 text-sm">
                      Fetching Guardian contract configuration...
                    </p>
                  </div>
                </div>
              )}

              {/* Warning Banner */}
              {!isAdmin && connectedWallet && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4 mb-8 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold mb-1">Admin Access Required</p>
                    <p className="text-yellow-400/80 text-sm">
                      You are not connected with the Guardian owner wallet. Please switch to the wallet that deployed the Guardian contract to access admin controls.
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Controls Grid (owner-only) */}
              {isAdmin ? (
                <div className="space-y-8">
                  {/* Row 1: System Status */}
                  <SystemStatusWidget 
                    signer={typeof window !== 'undefined' && connectedWallet ? window.ethereum : null} 
                    isAdmin={isAdmin}
                  />

                  {/* Row 2: Collateral & Minting Controls */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <CollateralRatioManager 
                      signer={typeof window !== 'undefined' && connectedWallet ? window.ethereum : null} 
                      isAdmin={isAdmin}
                    />
                    <MintingLimitControls 
                      signer={typeof window !== 'undefined' && connectedWallet ? window.ethereum : null} 
                      isAdmin={isAdmin}
                    />
                  </div>

                  {/* Info Section */}
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">About Guardian Controls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h4 className="text-blue-400 font-semibold mb-2">🚨 System Status (Emergency Pause)</h4>
                        <p className="text-gray-300">
                          Immediately pause minting across the entire protocol. Use this if a peg break is detected or an exploit is found. Only the Guardian owner can execute this.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-purple-400 font-semibold mb-2">📊 Collateral Risk Parameters</h4>
                        <p className="text-gray-300">
                          Adjust collateral ratios for each supported asset. If Gold or ETH crashes, increase requirements instantly to protect the protocol solvency.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-green-400 font-semibold mb-2">⚡ Velocity Limit (Circuit Breaker)</h4>
                        <p className="text-gray-300">
                          Set maximum USDGB that can be minted per hour. Prevents whale attacks or sudden spikes in minting that could destabilize the peg.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-yellow-400 font-semibold mb-2">🎯 Asset Management</h4>
                        <p className="text-gray-300">
                          Add new whitelisted collateral tokens (USDC, WBTC, etc.) without deploying a new contract. Expand your market on-the-fly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-red-600/20 text-center">
                  <Lock className="w-10 h-10 text-red-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-red-400 mb-2">ACCESS DENIED</h2>
                  <p className="text-gray-300 mb-4">You are not connected with the Guardian owner wallet. Switch to the wallet that deployed the Guardian contract to access admin controls.</p>
                  {owner && <p className="text-sm text-gray-400">Guardian Owner: {formatAddress(owner)}</p>}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
