import React, { useState, useEffect } from 'react';
import { Auction, Bid } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAuction } from '../contexts/AuctionContext';
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  User, 
  Gavel, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AuctionDetailsProps {
  auction: Auction;
  onBack: () => void;
}

const AuctionDetails: React.FC<AuctionDetailsProps> = ({ auction, onBack }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const { user } = useAuth();
  const { placeBid, getAuctionBids } = useAuction();
  const [auctionBids, setAuctionBids] = useState<Bid[]>([]);

  useEffect(() => {
    setAuctionBids(getAuctionBids(auction.id));
    const interval = setInterval(() => {
      setAuctionBids(getAuctionBids(auction.id));
    }, 2000);
    return () => clearInterval(interval);
  }, [auction.id, getAuctionBids]);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      let targetTime: Date;
      
      if (auction.status === 'upcoming') {
        targetTime = auction.startTime;
      } else if (auction.status === 'active') {
        targetTime = auction.endTime;
      } else {
        setTimeLeft('Auction Ended');
        return;
      }

      const diff = targetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(auction.status === 'upcoming' ? 'Starting Now' : 'Auction Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
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

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError('');
    setBidSuccess(false);
    setIsPlacingBid(true);

    const amount = parseFloat(bidAmount);
    
    if (!amount || amount <= auction.currentBid) {
      setBidError(`Bid must be higher than current bid of $${auction.currentBid}`);
      setIsPlacingBid(false);
      return;
    }

    if (!user || user.balance < amount) {
      setBidError('Insufficient balance');
      setIsPlacingBid(false);
      return;
    }

    try {
      const success = await placeBid(auction.id, amount);
      if (success) {
        setBidSuccess(true);
        setBidAmount('');
        setTimeout(() => setBidSuccess(false), 3000);
      } else {
        setBidError('Failed to place bid. Please try again.');
      }
    } catch (error) {
      setBidError('An error occurred while placing the bid.');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const suggestedBids = [
    auction.currentBid + 50,
    auction.currentBid + 100,
    auction.currentBid + 250,
    auction.currentBid + 500
  ];

  const isWinning = user && auction.highestBidder === user.id;
  const canBid = auction.status === 'active' && user && auction.highestBidder !== user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Auctions
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image and Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="w-full h-96 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    auction.status === 'active' ? 'bg-green-100 text-green-800' :
                    auction.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">#{auction.id}</span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {auction.title}
                </h1>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {auction.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Category</div>
                    <div className="font-semibold">{auction.category}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Starting Bid</div>
                    <div className="font-semibold">${auction.startingBid.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bidding */}
          <div className="space-y-6">
            {/* Current Bid Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Current Bid</h2>
                {isWinning && (
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                    You're Winning!
                  </span>
                )}
              </div>
              
              <div className="text-4xl font-bold text-emerald-600 mb-4">
                ${auction.currentBid.toLocaleString()}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {auction.status === 'upcoming' ? 'Starts in:' :
                     auction.status === 'active' ? 'Ends in:' : 'Ended'}
                  </span>
                </div>
                <div className={`font-semibold ${
                  auction.status === 'active' && timeLeft.includes('m') && !timeLeft.includes('h') && !timeLeft.includes('d')
                    ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {timeLeft}
                </div>
              </div>

              {auction.highestBidder && (
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <User className="w-4 h-4 mr-1" />
                  <span>
                    Highest bidder: {auction.highestBidder === user?.id ? 'You' : 'Someone else'}
                  </span>
                </div>
              )}

              {/* Bidding Form */}
              {canBid && (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    {suggestedBids.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setBidAmount(amount.toString())}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        ${amount.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Bid Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={`Min: $${auction.currentBid + 1}`}
                          min={auction.currentBid + 1}
                          step="1"
                          required
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Your balance: ${user?.balance?.toLocaleString() || 0}
                      </div>
                    </div>

                    {bidError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {bidError}
                      </div>
                    )}

                    {bidSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Bid placed successfully!
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPlacingBid || !bidAmount}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                    >
                      <Gavel className="w-5 h-5 mr-2" />
                      {isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </form>
                </div>
              )}

              {auction.status === 'ended' && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-gray-600 font-medium">Auction Ended</div>
                  {auction.highestBidder && (
                    <div className="text-sm text-gray-500 mt-1">
                      Won by: {auction.highestBidder === user?.id ? 'You' : 'Someone else'}
                    </div>
                  )}
                </div>
              )}

              {auction.status === 'upcoming' && (
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-yellow-800 font-medium">Auction Not Started</div>
                  <div className="text-sm text-yellow-600 mt-1">Check back when the auction begins</div>
                </div>
              )}

              {!user && (
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-blue-800 font-medium">Sign in to place bids</div>
                </div>
              )}
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                <h3 className="text-xl font-bold text-gray-800">Bid History</h3>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {auctionBids.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No bids yet. Be the first to bid!
                  </div>
                ) : (
                  auctionBids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {bid.username === user?.username ? 'You' : bid.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bid.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-emerald-600">
                        ${bid.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;