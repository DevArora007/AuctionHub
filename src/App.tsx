import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuctionProvider } from './contexts/AuctionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import AuctionCard from './components/AuctionCard';
import AuctionDetails from './components/AuctionDetails';
import WalletModal from './components/WalletModal';
import AdminPanel from './components/AdminPanel';
import CreateAuctionModal from './components/CreateAuctionModal';
import UserProfileModal from './components/UserProfileModal';
import { useAuction } from './contexts/AuctionContext';
import { Auction } from './types';
import { Search, Filter, Grid, List, Sparkles, TrendingUp, Users, Clock, Plus, Trash2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCreateAuction, setShowCreateAuction] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const { auctions, removeEndedAuctions } = useAuction();

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || auction.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', ...Array.from(new Set(auctions.map(auction => auction.category)))];
  const endedAuctionsCount = auctions.filter(a => a.status === 'ended').length;

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  if (selectedAuction) {
    return (
      <AuctionDetails
        auction={selectedAuction}
        onBack={() => setSelectedAuction(null)}
      />
    );
  }

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header
          onWalletClick={() => setShowWallet(true)}
          onAdminClick={() => setShowAdmin(false)}
          onCreateAuctionClick={() => setShowCreateAuction(true)}
          onProfileClick={() => setShowProfile(true)}
        />
        <AdminPanel onClose={() => setShowAdmin(false)} />
        <WalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} />
        <CreateAuctionModal isOpen={showCreateAuction} onClose={() => setShowCreateAuction(false)} />
        <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header
        onWalletClick={() => setShowWallet(true)}
        onAdminClick={() => setShowAdmin(true)}
        onCreateAuctionClick={() => setShowCreateAuction(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-fuchsia-900 dark:from-gray-800 dark:via-purple-900 dark:to-violet-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="max-w-4xl relative z-10">
            <div className="flex items-center mb-4">
              <Sparkles className="w-8 h-8 mr-3 text-yellow-400" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Welcome to AuctionHub
              </h1>
            </div>
            <p className="text-xl opacity-90 mb-8 max-w-2xl">
              Discover extraordinary items, place strategic bids, and win amazing auctions in real-time. 
              Join thousands of collectors in the ultimate bidding experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <div className="text-3xl font-bold">{auctions.length}</div>
                </div>
                <div className="text-sm opacity-80">Total Auctions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-6 h-6 text-orange-400" />
                  <div className="text-3xl font-bold">
                    {auctions.filter(a => a.status === 'active').length}
                  </div>
                </div>
                <div className="text-sm opacity-80">Live Now</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-6 h-6 text-blue-400" />
                  <div className="text-3xl font-bold">
                    {auctions.filter(a => a.status === 'upcoming').length}
                  </div>
                </div>
                <div className="text-sm opacity-80">Coming Soon</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                  <div className="text-3xl font-bold">${user.balance.toLocaleString()}</div>
                </div>
                <div className="text-sm opacity-80">Your Balance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Auctions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search by title or description..."
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle and Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-violet-600 dark:text-violet-400">{filteredAuctions.length}</span> of {auctions.length} auctions
              </div>
              
              {/* Remove Ended Auctions Button */}
              {endedAuctionsCount > 0 && (
                <button
                  onClick={removeEndedAuctions}
                  className="flex items-center text-sm bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove {endedAuctionsCount} Ended
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-violet-500 text-white shadow-lg' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-violet-500 text-white shadow-lg' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Auctions Grid/List */}
        {filteredAuctions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Filter className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No auctions found</h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => setShowCreateAuction(true)}
              className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Auction
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }>
            {filteredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onViewDetails={setSelectedAuction}
              />
            ))}
          </div>
        )}
      </div>

      <WalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} />
      <CreateAuctionModal isOpen={showCreateAuction} onClose={() => setShowCreateAuction(false)} />
      <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />

      {/* Floating Create Button for Mobile */}
      <button
        onClick={() => setShowCreateAuction(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200 z-40 md:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuctionProvider>
          <MainApp />
        </AuctionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;