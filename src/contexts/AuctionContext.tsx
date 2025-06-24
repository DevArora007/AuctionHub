import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auction, Bid, Notification } from '../types';
import { useAuth } from './AuthContext';

interface AuctionContextType {
  auctions: Auction[];
  bids: Bid[];
  notifications: Notification[];
  createAuction: (auction: Omit<Auction, 'id' | 'currentBid' | 'highestBidder' | 'status'>) => void;
  placeBid: (auctionId: string, amount: number) => Promise<boolean>;
  deleteAuction: (auctionId: string) => Promise<boolean>;
  getAuctionBids: (auctionId: string) => Bid[];
  markNotificationRead: (notificationId: string) => void;
  refreshAuctions: () => void;
  removeEndedAuctions: () => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};

interface AuctionProviderProps {
  children: ReactNode;
}

export const AuctionProvider: React.FC<AuctionProviderProps> = ({ children }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, updateBalance } = useAuth();

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      updateAuctionStatuses();
      // Auto-remove ended auctions after 1 hour
      removeOldEndedAuctions();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const savedAuctions = localStorage.getItem('auctions');
    const savedBids = localStorage.getItem('bids');
    const savedNotifications = localStorage.getItem('notifications');

    if (savedAuctions) {
      const parsedAuctions = JSON.parse(savedAuctions).map((auction: any) => ({
        ...auction,
        startTime: new Date(auction.startTime),
        endTime: new Date(auction.endTime)
      }));
      setAuctions(parsedAuctions);
    } else {
      // Initialize with sample auctions
      initializeSampleAuctions();
    }

    if (savedBids) {
      const parsedBids = JSON.parse(savedBids).map((bid: any) => ({
        ...bid,
        timestamp: new Date(bid.timestamp)
      }));
      setBids(parsedBids);
    }

    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications).map((notification: any) => ({
        ...notification,
        timestamp: new Date(notification.timestamp)
      }));
      setNotifications(parsedNotifications);
    }
  };

  const initializeSampleAuctions = () => {
    const now = new Date();
    const sampleAuctions: Auction[] = [
      {
        id: '1',
        title: 'Vintage Rolex Submariner',
        description: 'Classic 1970s Rolex Submariner in excellent condition. All original parts, recently serviced.',
        imageUrl: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=500',
        startingBid: 5000,
        currentBid: 5000,
        highestBidder: null,
        startTime: new Date(now.getTime() - 30 * 60 * 1000),
        endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        status: 'active',
        createdBy: 'admin',
        category: 'Watches'
      },
      {
        id: '2',
        title: 'Rare Art Deco Vase',
        description: 'Beautiful 1920s art deco vase in perfect condition. Authenticated piece from renowned artist.',
        imageUrl: 'https://images.pexels.com/photos/1576717/pexels-photo-1576717.jpeg?auto=compress&cs=tinysrgb&w=500',
        startingBid: 800,
        currentBid: 800,
        highestBidder: null,
        startTime: new Date(now.getTime() - 10 * 60 * 1000),
        endTime: new Date(now.getTime() + 45 * 60 * 1000),
        status: 'active',
        createdBy: 'admin',
        category: 'Art'
      },
      {
        id: '3',
        title: 'Classic Ferrari Model',
        description: 'Limited edition Ferrari 250 GTO scale model. Perfect for collectors.',
        imageUrl: 'https://images.pexels.com/photos/3764958/pexels-photo-3764958.jpeg?auto=compress&cs=tinysrgb&w=500',
        startingBid: 200,
        currentBid: 200,
        highestBidder: null,
        startTime: new Date(now.getTime() + 30 * 60 * 1000),
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        status: 'upcoming',
        createdBy: 'admin',
        category: 'Collectibles'
      }
    ];

    setAuctions(sampleAuctions);
    localStorage.setItem('auctions', JSON.stringify(sampleAuctions));
  };

  const updateAuctionStatuses = () => {
    const now = new Date();
    setAuctions(prevAuctions => {
      const updatedAuctions = prevAuctions.map(auction => {
        let newStatus = auction.status;
        
        if (auction.status === 'upcoming' && now >= auction.startTime) {
          newStatus = 'active';
        } else if (auction.status === 'active' && now >= auction.endTime) {
          newStatus = 'ended';
          
          // Create auction ended notification for highest bidder
          if (auction.highestBidder) {
            const endedNotification: Notification = {
              id: Date.now().toString() + '_ended_' + auction.id,
              userId: auction.highestBidder,
              type: 'auction_won',
              message: `Congratulations! You won "${auction.title}" for $${auction.currentBid.toLocaleString()}`,
              read: false,
              timestamp: new Date(),
              auctionId: auction.id
            };
            
            setNotifications(prev => {
              const updated = [...prev, endedNotification];
              localStorage.setItem('notifications', JSON.stringify(updated));
              return updated;
            });
          }
        }
        
        return { ...auction, status: newStatus };
      });
      
      localStorage.setItem('auctions', JSON.stringify(updatedAuctions));
      return updatedAuctions;
    });
  };

  const removeOldEndedAuctions = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    
    setAuctions(prevAuctions => {
      const filteredAuctions = prevAuctions.filter(auction => {
        // Keep auction if it's not ended, or if it ended less than 1 hour ago
        return auction.status !== 'ended' || auction.endTime > oneHourAgo;
      });
      
      // Only update localStorage if auctions were actually removed
      if (filteredAuctions.length !== prevAuctions.length) {
        localStorage.setItem('auctions', JSON.stringify(filteredAuctions));
        
        // Also clean up related bids for removed auctions
        const removedAuctionIds = prevAuctions
          .filter(auction => !filteredAuctions.find(fa => fa.id === auction.id))
          .map(auction => auction.id);
        
        if (removedAuctionIds.length > 0) {
          setBids(prevBids => {
            const filteredBids = prevBids.filter(bid => !removedAuctionIds.includes(bid.auctionId));
            localStorage.setItem('bids', JSON.stringify(filteredBids));
            return filteredBids;
          });
        }
      }
      
      return filteredAuctions;
    });
  };

  const removeEndedAuctions = () => {
    setAuctions(prevAuctions => {
      const filteredAuctions = prevAuctions.filter(auction => auction.status !== 'ended');
      localStorage.setItem('auctions', JSON.stringify(filteredAuctions));
      
      // Also clean up related bids for removed auctions
      const removedAuctionIds = prevAuctions
        .filter(auction => auction.status === 'ended')
        .map(auction => auction.id);
      
      if (removedAuctionIds.length > 0) {
        setBids(prevBids => {
          const filteredBids = prevBids.filter(bid => !removedAuctionIds.includes(bid.auctionId));
          localStorage.setItem('bids', JSON.stringify(filteredBids));
          return filteredBids;
        });
      }
      
      return filteredAuctions;
    });
  };

  const createAuction = (auctionData: Omit<Auction, 'id' | 'currentBid' | 'highestBidder' | 'status'>) => {
    const newAuction: Auction = {
      ...auctionData,
      id: Date.now().toString(),
      currentBid: auctionData.startingBid,
      highestBidder: null,
      status: new Date() >= auctionData.startTime ? 'active' : 'upcoming'
    };

    setAuctions(prev => {
      const updated = [...prev, newAuction];
      localStorage.setItem('auctions', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAuction = async (auctionId: string): Promise<boolean> => {
    if (!user) return false;

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return false;

    // Check permissions: user can delete their own auctions, admin can delete any
    const canDelete = user.role === 'admin' || auction.createdBy === user.id;
    if (!canDelete) return false;

    try {
      // Get all bids for this auction to refund bidders
      const auctionBids = bids.filter(bid => bid.auctionId === auctionId);
      
      // Refund all bidders
      if (auctionBids.length > 0) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Group bids by user and refund the highest bid amount for each user
        const userBids = new Map<string, number>();
        auctionBids.forEach(bid => {
          const currentAmount = userBids.get(bid.userId) || 0;
          if (bid.amount > currentAmount) {
            userBids.set(bid.userId, bid.amount);
          }
        });

        // Process refunds
        userBids.forEach((amount, userId) => {
          const userIndex = users.findIndex((u: any) => u.id === userId);
          if (userIndex !== -1) {
            users[userIndex].balance += amount;
            
            // Create refund notification
            const refundNotification: Notification = {
              id: Date.now().toString() + '_refund_' + auctionId + '_' + userId,
              userId: userId,
              type: 'auction_ended',
              message: `Auction "${auction.title}" was deleted. Your bid of $${amount.toLocaleString()} has been refunded.`,
              read: false,
              timestamp: new Date(),
              auctionId: auctionId
            };
            
            setNotifications(prev => {
              const updated = [...prev, refundNotification];
              localStorage.setItem('notifications', JSON.stringify(updated));
              return updated;
            });
          }
        });

        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user's balance if they had bid on this auction
        if (user && userBids.has(user.id)) {
          updateBalance(user.balance + userBids.get(user.id)!);
        }
      }

      // Remove auction
      setAuctions(prev => {
        const updated = prev.filter(a => a.id !== auctionId);
        localStorage.setItem('auctions', JSON.stringify(updated));
        return updated;
      });

      // Remove related bids
      setBids(prev => {
        const updated = prev.filter(bid => bid.auctionId !== auctionId);
        localStorage.setItem('bids', JSON.stringify(updated));
        return updated;
      });

      return true;
    } catch (error) {
      console.error('Error deleting auction:', error);
      return false;
    }
  };

  const placeBid = async (auctionId: string, amount: number): Promise<boolean> => {
    if (!user) return false;

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction || auction.status !== 'active') return false;

    if (amount <= auction.currentBid || user.balance < amount) return false;

    // Create new bid
    const newBid: Bid = {
      id: Date.now().toString(),
      auctionId,
      userId: user.id,
      username: user.username,
      amount,
      timestamp: new Date()
    };

    // Update auction
    const updatedAuctions = auctions.map(a => {
      if (a.id === auctionId) {
        // Refund previous highest bidder
        if (a.highestBidder && a.highestBidder !== user.id) {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const prevBidder = users.find((u: any) => u.id === a.highestBidder);
          if (prevBidder) {
            prevBidder.balance += a.currentBid;
            users[users.findIndex((u: any) => u.id === a.highestBidder)] = prevBidder;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Add notification for outbid user
            const outbidNotification: Notification = {
              id: Date.now().toString() + '_outbid',
              userId: a.highestBidder,
              type: 'bid_outbid',
              message: `You've been outbid on "${a.title}"`,
              read: false,
              timestamp: new Date(),
              auctionId: a.id
            };
            setNotifications(prev => {
              const updated = [...prev, outbidNotification];
              localStorage.setItem('notifications', JSON.stringify(updated));
              return updated;
            });
          }
        }

        return {
          ...a,
          currentBid: amount,
          highestBidder: user.id
        };
      }
      return a;
    });

    // Update user balance
    updateBalance(user.balance - amount);

    // Update state
    setAuctions(updatedAuctions);
    setBids(prev => {
      const updated = [...prev, newBid];
      localStorage.setItem('bids', JSON.stringify(updated));
      return updated;
    });

    localStorage.setItem('auctions', JSON.stringify(updatedAuctions));

    return true;
  };

  const getAuctionBids = (auctionId: string): Bid[] => {
    return bids.filter(bid => bid.auctionId === auctionId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, read: true } : n);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshAuctions = () => {
    loadData();
  };

  return (
    <AuctionContext.Provider value={{
      auctions,
      bids,
      notifications: user ? notifications.filter(n => n.userId === user.id) : [],
      createAuction,
      placeBid,
      deleteAuction,
      getAuctionBids,
      markNotificationRead,
      refreshAuctions,
      removeEndedAuctions
    }}>
      {children}
    </AuctionContext.Provider>
  );
};