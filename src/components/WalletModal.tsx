import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, CreditCard, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user, updateBalance } = useAuth();

  if (!isOpen || !user) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0) {
      updateBalance(user.balance + depositAmount);
      setAmount('');
    }
    
    setProcessing(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > 0 && withdrawAmount <= user.balance) {
      updateBalance(user.balance - withdrawAmount);
      setAmount('');
    }
    
    setProcessing(false);
  };

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Balance Display */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Current Balance</div>
                <div className="text-3xl font-bold">${user.balance.toLocaleString()}</div>
              </div>
              <CreditCard className="w-8 h-8 opacity-80" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('balance')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'balance'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Balance
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'deposit'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'withdraw'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Account Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Balance:</span>
                    <span className="font-semibold">${user.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Status:</span>
                    <span className="text-green-600 font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter amount"
                    min="1"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map(quickAmount => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 px-4 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={processing || !amount}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                {processing ? 'Processing...' : 'Deposit Funds'}
              </button>
            </form>
          )}

          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdraw Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter amount"
                    min="1"
                    max={user.balance}
                    step="1"
                    required
                  />
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Available: ${user.balance.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.filter(amount => amount <= user.balance).map(quickAmount => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={processing || !amount || parseFloat(amount) > user.balance}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
              >
                <TrendingDown className="w-5 h-5 mr-2" />
                {processing ? 'Processing...' : 'Withdraw Funds'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>This is a demo wallet. In production, real payment processing would be integrated.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;