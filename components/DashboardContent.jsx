import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity, Coins, Users, TrendingUp, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
import Button from './Button';

const DashboardContent = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contractData, setContractData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokenTransfers, setTokenTransfers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions');
  const [txPage, setTxPage] = useState(1);
  const [transferPage, setTransferPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const wsRef = useRef(null);

  const demoAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT

  const fetchContractData = async (contractAddress) => {
    setLoading(true);
    setError('');

    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        throw new Error('Invalid Ethereum address format');
      }

      const contractResponse = await fetch(`/api/contract/${contractAddress}`);
      if (!contractResponse.ok) {
        const errorData = await contractResponse.json();
        throw new Error(errorData.error || 'Contract not found');
      }

      const contract = await contractResponse.json();

      const txResponse = await fetch(`/api/transactions/${contractAddress}?page=1&offset=20`);
      let txData = { transactions: [] };
      if (txResponse.ok) {
        txData = await txResponse.json();
      }

      const transferResponse = await fetch(`/api/transfers/${contractAddress}?page=1&offset=20`);
      let transferData = { transfers: [] };
      if (transferResponse.ok) {
        transferData = await transferResponse.json();
      }

      const analyticsData = calculateAnalytics(txData.transactions, transferData.transfers);

      setContractData(contract);
      setTransactions(txData.transactions || []);
      setTokenTransfers(transferData.transfers || []);
      setAnalytics(analyticsData);
      setTxPage(1);
      setTransferPage(1);

      if (contract.tokenType === 'ERC20' || contract.tokenType === 'ERC721') {
        fetchPriceData(contractAddress);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch contract data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (txs, transfers) => {
    let avgGasUsed = 0;
    if (txs && txs.length > 0) {
      const totalGas = txs.reduce((sum, tx) => sum + (tx.gasUsed || 0), 0);
      avgGasUsed = Math.round(totalGas / txs.length);
    }

    if (transfers && transfers.length > 0) {
      const totalTransfers = transfers.length;
      const totalTokenVolume = transfers.reduce((sum, t) => sum + parseFloat(t.value || 0), 0);

      const last7Days = {};
      const now = Date.now();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        last7Days[day] = { day, transactions: 0, volume: 0, transfers: 0 };
      }

      transfers.forEach(transfer => {
        const date = new Date(transfer.timestamp);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (last7Days[day]) {
          last7Days[day].transfers++;
          last7Days[day].volume += parseFloat(transfer.value || 0);
        }
      });

      return {
        totalTransactions: totalTransfers,
        totalVolume: totalTokenVolume.toFixed(2),
        avgGasUsed,
        chartData: Object.values(last7Days),
        isTokenVolume: true
      };
    }

    if (!txs || txs.length === 0) return null;

    const totalTxs = txs.length;
    const totalValue = txs.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0);

    const last7Days = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days[day] = { day, transactions: 0, volume: 0, transfers: 0 };
    }

    txs.forEach(tx => {
      const date = new Date(tx.timestamp);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (last7Days[day]) {
        last7Days[day].transactions++;
        last7Days[day].volume += parseFloat(tx.value || 0);
      }
    });

    return {
      totalTransactions: totalTxs,
      totalVolume: totalValue.toFixed(6),
      avgGasUsed,
      chartData: Object.values(last7Days),
      isTokenVolume: false
    };
  };

  const fetchPriceData = async (contractAddress) => {
    try {
      const response = await fetch(`/api/price/${contractAddress}`);
      if (response.ok) {
        const data = await response.json();
        setPriceData(data);
      }
    } catch (err) {
      console.log('Price data not available');
    }
  };

  const handleSearch = () => {
    if (address.trim()) {
      fetchContractData(address.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (contractData && address) {
        fetchContractData(address);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [contractData, address]);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Monitor a Contract</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter contract address (0x...)"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </Button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && !contractData ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white">Loading contract data...</p>
          </div>
        </div>
      ) : contractData ? (
        <>
          {/* Contract Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-white">Token Info</span>
                </div>
                <p className="text-2xl font-bold text-white">{contractData.name || 'Unknown'}</p>
                <p className="text-xs text-gray-300 mt-2">
                  {contractData.verified ? '✓ Verified' : 'Unverified'}
                </p>
                {priceData && (
                  <p className="text-lg font-bold text-green-600 mt-2">${priceData.price}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-white">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {analytics ? formatNumber(analytics.totalTransactions) : '0'}
                </p>
                <p className="text-xs text-gray-300 mt-2">Total count</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-white">Volume</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {analytics ? analytics.totalVolume : '0'}
                </p>
                <p className="text-xs text-gray-300 mt-2">
                  {analytics?.isTokenVolume ? 'Tokens' : 'ETH'} transferred
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  {contractData.verified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm font-medium text-white">Status</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {contractData.verified ? 'Verified' : 'Not Verified'}
                </p>
                <a
                  href={`https://etherscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1"
                >
                  View on Etherscan <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {analytics && analytics.chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Activity (7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.chartData}>
                        <defs>
                          <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey={analytics.isTokenVolume ? "transfers" : "transactions"}
                          stroke="#2563EB"
                          fillOpacity={1}
                          fill="url(#colorTx)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volume Transferred (7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="volume" fill="#A855F7" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transactions & Transfers */}
          <Card>
            <CardHeader>
              <div className="flex border-b border-gray-200 -mb-4">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'transactions'
                      ? 'text-blue-400 border-blue-400'
                      : 'text-gray-300 border-transparent hover:text-white'
                  }`}
                >
                  Transactions ({transactions.length})
                </button>
                <button
                  onClick={() => setActiveTab('transfers')}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'transfers'
                      ? 'text-blue-400 border-blue-400'
                      : 'text-gray-300 border-transparent hover:text-white'
                  }`}
                >
                  Token Transfers ({tokenTransfers.length})
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeTab === 'transactions' ? (
                  transactions.length > 0 ? (
                    transactions.map((tx, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-300" />
                            <span className="text-sm text-white">{formatTime(tx.timestamp)}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-300">Hash: </span>
                            <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-mono">
                              {formatAddress(tx.hash)}
                            </a>
                          </div>
                          <div>
                            <span className="text-gray-300">From: </span>
                            <span className="text-white font-mono">{formatAddress(tx.from)}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">To: </span>
                            <span className="text-white font-mono">{formatAddress(tx.to)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-gray-300">Value: <span className="font-medium text-white">{tx.value} ETH</span></span>
                          <span className="text-gray-300">Gas: <span className="font-medium text-white">{formatNumber(tx.gasUsed)}</span></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-300">No transactions found</div>
                  )
                ) : (
                  tokenTransfers.length > 0 ? (
                    tokenTransfers.map((transfer, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-300" />
                            <span className="text-sm text-white">{formatTime(transfer.timestamp)}</span>
                          </div>
                          <span className="text-green-600 font-medium">{transfer.value} {transfer.tokenSymbol}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-300">Hash: </span>
                            <a href={`https://etherscan.io/tx/${transfer.hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-mono">
                              {formatAddress(transfer.hash)}
                            </a>
                          </div>
                          <div>
                            <span className="text-gray-300">From: </span>
                            <span className="text-white font-mono">{formatAddress(transfer.from)}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">To: </span>
                            <span className="text-white font-mono">{formatAddress(transfer.to)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-300">No token transfers found</div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to SmartMonitor</h2>
<p className="text-white mb-6">Enter a contract address above to start monitoring</p>
            <Button onClick={() => {
              setAddress(demoAddress);
              fetchContractData(demoAddress);
            }}>
              Try Demo (USDT)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardContent;

