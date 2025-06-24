import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAuction } from '../contexts/AuctionContext';
import { 
  X, 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Trophy,
  Clock,
  Eye,
  Award,
  Activity
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bids' | 'stats'>('profile');
  const { user } = useAuth();
  const { bids, auctions } = useAuction();

  if (!isOpen || !user) return null;

  // Get user's bid history
  const userBids = bids.filter(bid => bid.userId === user.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Get auctions user has bid on
  const userAuctions = auctions.filter(auction => 
    userBids.some(bid => bid.auctionId === auction.id)
  );

  // Calculate user statistics
  const totalBidsPlaced = userBids.length;
  const totalAmountBid = userBids.reduce((sum, bid) => sum + bid.amount, 0);
  const auctionsWon = auctions.filter(auction => 
    auction.status === 'ended' && auction.highestBidder === user.id
  ).length;
  const activeAuctions = auctions.filter(auction => 
    auction.status === 'active' && auction.highestBidder === user.id
  ).length;

  const getBidStatus = (bid: any) => {
    const auction = auctions.find(a => a.id === bid.auctionId);
    if (!auction) return { status: 'unknown', color: 'gray' };
    
    if (auction.status === 'ended') {
      if (auction.highestBidder === user.id) {
        return { status: 'won', color: 'emerald' };
      } else {
        return { status: 'lost', color: 'red' };
      }
    } else if (auction.status === 'active') {
      if (auction.highestBidder === user.id) {
        return { status: 'winning', color: 'blue' };
      } else {
        return { status: 'outbid', color: 'orange' };
      }
    }
    return { status: 'upcoming', color: 'yellow' };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-3 rounded-2xl shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">User Profile</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your account and view activity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-4 font-medium transition-colors flex items-center ${
              activeTab === 'profile'
                ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`px-6 py-4 font-medium transition-colors flex items-center ${
              activeTab === 'bids'
                ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            Bid History ({totalBidsPlaced})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-4 font-medium transition-colors flex items-center ${
              activeTab === 'stats'
                ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Statistics
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-violet-200 dark:border-violet-800">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{user.username}</h3>
                    <p className="text-violet-600 dark:text-violet-400 font-medium capitalize">{user.role} Account</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{user.email}</div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Member Since</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {user.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Balance</div>
                    <div className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                      ${user.balance.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Account ID</div>
                    <div className="font-mono text-sm text-gray-800 dark:text-gray-200">{user.id}</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalBidsPlaced}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Bids</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-5 h-5 text-emerald-500" />
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{auctionsWon}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Auctions Won</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{activeAuctions}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Currently Winning</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      ${totalAmountBid.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Bid Amount</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bids' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Your Bid History</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {totalBidsPlaced} total bids placed
                </div>
              </div>

              {userBids.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No bids yet</h3>
                  <p className="text-gray-500 dark:text-gray-500">Start bidding on auctions to see your history here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userBids.map((bid) => {
                    const auction = auctions.find(a => a.id === bid.auctionId);
                    const bidStatus = getBidStatus(bid);
                    
                    return (
                      <div key={bid.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mr-3">
                                {auction?.title || 'Unknown Auction'}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bidStatus.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                bidStatus.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                bidStatus.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                bidStatus.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}>
                                {bidStatus.status === 'won' && <><Trophy className="w-3 h-3 inline mr-1" />Won</>}
                                {bidStatus.status === 'winning' && <><Award className="w-3 h-3 inline mr-1" />Winning</>}
                                {bidStatus.status === 'lost' && 'Lost'}
                                {bidStatus.status === 'outbid' && 'Outbid'}
                                {bidStatus.status === 'upcoming' && 'Upcoming'}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {bid.timestamp.toLocaleDateString()} at {bid.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {auction && (
                                <div className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Current: ${auction.currentBid.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              ${bid.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Your Bid</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Your Statistics</h3>
              
              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 opacity-80" />
                    <div className="text-3xl font-bold">{totalBidsPlaced}</div>
                  </div>
                  <div className="text-blue-100">Total Bids Placed</div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8 opacity-80" />
                    <div className="text-3xl font-bold">{auctionsWon}</div>
                  </div>
                  <div className="text-emerald-100">Auctions Won</div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 opacity-80" />
                    <div className="text-3xl font-bold">{activeAuctions}</div>
                  </div>
                  <div className="text-orange-100">Currently Winning</div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 opacity-80" />
                    <div className="text-2xl font-bold">${totalAmountBid.toLocaleString()}</div>
                  </div>
                  <div className="text-purple-100">Total Amount Bid</div>
                </div>

                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 opacity-80" />
                    <div className="text-2xl font-bold">
                      {totalBidsPlaced > 0 ? Math.round((auctionsWon / totalBidsPlaced) * 100) : 0}%
                    </div>
                  </div>
                  <div className="text-teal-100">Win Rate</div>
                </div>

                <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 opacity-80" />
                    <div className="text-2xl font-bold">
                      {totalBidsPlaced > 0 ? Math.round(totalAmountBid / totalBidsPlaced) : 0}
                    </div>
                  </div>
                  <div className="text-pink-100">Avg Bid Amount</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {userBids.slice(0, 5).map((bid) => {
                    const auction = auctions.find(a => a.id === bid.auctionId);
                    return (
                      <div key={bid.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            Bid on {auction?.title || 'Unknown Auction'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {bid.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
                          ${bid.amount.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;