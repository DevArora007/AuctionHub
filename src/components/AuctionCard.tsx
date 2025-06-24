import React, { useState, useEffect } from 'react';
import { Auction } from '../types';
import { Clock, User, DollarSign, Eye, Zap, Trophy, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAuction } from '../contexts/AuctionContext';

interface AuctionCardProps {
  auction: Auction;
  onViewDetails: (auction: Auction) => void;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onViewDetails }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [timeDetails, setTimeDetails] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { deleteAuction } = useAuction();

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      let targetTime: Date;
      
      if (auction.status === 'upcoming') {
        targetTime = auction.startTime;
      } else if (auction.status === 'active') {
        targetTime = auction.endTime;
      } else {
        setTimeLeft('Ended');
        setTimeDetails({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const diff = targetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(auction.status === 'upcoming' ? 'Starting...' : 'Ended');
        setTimeDetails({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeDetails({ days, hours, minutes, seconds });

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const getStatusColor = () => {
    switch (auction.status) {
      case 'upcoming': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      case 'active': return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
      case 'ended': return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const canDelete = user && (user.role === 'admin' || auction.createdBy === user.id);
  const isWinning = user && auction.highestBidder === user.id;
  const isUrgent = auction.status === 'active' && timeDetails.days === 0 && timeDetails.hours === 0 && timeDetails.minutes < 30;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      const success = await deleteAuction(auction.id);
      if (success) {
        setShowDeleteConfirm(false);
      } else {
        alert('Failed to delete auction. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while deleting the auction.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700 group relative">
      <div className="relative overflow-hidden">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg ${getStatusColor()}`}>
          {auction.status === 'active' && <Zap className="w-3 h-3 inline mr-1" />}
          {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
        </div>
        
        {isWinning && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center">
            <Trophy className="w-3 h-3 mr-1" />
            Winning!
          </div>
        )}

        {isUrgent && (
          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg animate-pulse">
            🔥 Ending Soon!
          </div>
        )}

        {/* Delete Button */}
        {canDelete && (
          <div className="absolute top-4 right-4">
            {!showDeleteConfirm ? (
              <button
                onClick={handleDeleteClick}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Delete auction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700 min-w-[200px]">
                <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Delete auction?</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  This will refund all bidders and cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {auction.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {auction.description}
        </p>

        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center text-sm text-emerald-700 dark:text-emerald-400">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>Current Bid</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ${auction.currentBid.toLocaleString()}
          </div>
        </div>

        {auction.highestBidder && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <User className="w-4 h-4 mr-2" />
            <span>Highest bidder: {auction.highestBidder === user?.id ? 'You' : 'Someone else'}</span>
          </div>
        )}

        {/* Enhanced Time Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {auction.status === 'upcoming' ? 'Starts in:' : 
                 auction.status === 'active' ? 'Ends in:' : 'Ended'}
              </span>
            </div>
            <div className={`font-semibold ${
              isUrgent ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {timeLeft}
            </div>
          </div>

          {/* Detailed Time Breakdown for Active Auctions */}
          {auction.status === 'active' && timeDetails.days === 0 && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg p-2 border border-violet-200 dark:border-violet-800">
                <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{timeDetails.hours}</div>
                <div className="text-xs text-violet-500 dark:text-violet-400">Hours</div>
              </div>
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg p-2 border border-violet-200 dark:border-violet-800">
                <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{timeDetails.minutes}</div>
                <div className="text-xs text-violet-500 dark:text-violet-400">Minutes</div>
              </div>
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg p-2 border border-violet-200 dark:border-violet-800">
                <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{timeDetails.seconds}</div>
                <div className="text-xs text-violet-500 dark:text-violet-400">Seconds</div>
              </div>
            </div>
          )}

          {/* Start/End Time Display */}
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>
                {auction.status === 'upcoming' ? 'Starts: ' : 'Started: '}
                {auction.startTime.toLocaleDateString()} {auction.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              Ends: {auction.endTime.toLocaleDateString()} {auction.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(auction)}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
        >
          <Eye className="w-5 h-5 mr-2 group-hover:animate-pulse" />
          View Details & Bid
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;