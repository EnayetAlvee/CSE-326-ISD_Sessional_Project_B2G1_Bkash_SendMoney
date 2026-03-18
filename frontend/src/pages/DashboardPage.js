import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  LogOut, 
  Eye, 
  EyeOff, 
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';

const DashboardPage = () => {
  const [balance, setBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const balanceTimeoutRef = useRef(null);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchBalance();
  }, []);

  // Clear any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (balanceTimeoutRef.current) {
        clearTimeout(balanceTimeoutRef.current);
        balanceTimeoutRef.current = null;
      }
    };
  }, []);

  const fetchBalance = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(!showLoading);
    
    try {
      const response = await transactionAPI.getBalance();
      setBalance(response.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      toast.error('Failed to load balance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatBalance = (amount) => {
    if (amount === null || amount === undefined) return '0.00';
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const actions = [
    {
      id: 'send-money',
      title: 'Send Money',
      icon: Send,
      color: 'var(--primary-color)',
      onClick: () => navigate('/send-money')
    }
  ];

  const toggleBalance = () => {
    // If currently showing, hide and clear timer
    if (showBalance) {
      setShowBalance(false);
      if (balanceTimeoutRef.current) {
        clearTimeout(balanceTimeoutRef.current);
        balanceTimeoutRef.current = null;
      }
      return;
    }

    // Show decrypted balance and set auto-hide after 5 seconds
    setShowBalance(true);
    if (balanceTimeoutRef.current) {
      clearTimeout(balanceTimeoutRef.current);
    }
    balanceTimeoutRef.current = setTimeout(() => {
      setShowBalance(false);
      balanceTimeoutRef.current = null;
    }, 5000);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
              {getGreeting()},
            </p>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '4px 0 0 0' }}>
              {user?.name || 'User'}
            </h2>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
              Current Balance
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={toggleBalance}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => fetchBalance(false)}
                disabled={refreshing}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} className={refreshing ? 'loading' : ''} />
              </button>
            </div>
          </div>
          
          <div className="balance-amount">
            {loading ? (
              <div className="loading" style={{ width: '32px', height: '32px' }}></div>
            ) : (
              <>
                ৳ {showBalance ? formatBalance(balance) : '****.**'}
              </>
            )}
          </div>
          
          <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.8 }}>
            Account: {user?.accountNumber || 'N/A'}
          </p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="actions-grid">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              className="action-card"
              onClick={action.onClick}
            >
              <div 
                className="action-icon"
                style={{ backgroundColor: action.color }}
              >
                <IconComponent size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#333' }}>
                {action.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', textAlign: 'center', marginTop: 'auto' }}>
        <p style={{ fontSize: '12px', color: '#6c757d', margin: 0 }}>
          © 2024 bKash Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
