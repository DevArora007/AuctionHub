export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startingBid: number;
  currentBid: number;
  highestBidder: string | null;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'active' | 'ended';
  createdBy: string;
  category: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  username: string;
  amount: number;
  timestamp: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bid' | 'refund';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'bid_outbid' | 'auction_won' | 'auction_ended' | 'deposit_confirmed';
  message: string;
  read: boolean;
  timestamp: Date;
  auctionId?: string;
}