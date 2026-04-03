import { useState } from 'react'

export default function HomePage({ onSendMoney, onScanQR }) {
  const [balance] = useState('৳ 2,847.50')
  const [showBalance, setShowBalance] = useState(false)
  const [notifications] = useState(3)

  return (
    <div className="home-page">
      {/* Top Header */}
      <div className="home-header">
        <div className="header-left">
          <div className="bkash-logo">
            <span>b</span>
          </div>
          <span className="bkash-text">Bkash</span>
        </div>
        <div className="header-right">
          <div className="notification-icon">
            <span>🔔</span>
            {notifications > 0 && <span className="notification-badge">{notifications}</span>}
          </div>
          <div className="user-avatar">👤</div>
        </div>
      </div>

      {/* Dark Green Card - Balance & Add Money */}
      <div className="balance-card">
        <button className="balance-btn" onClick={() => setShowBalance(!showBalance)}>
          <span className="circle-icon">○</span> {showBalance ? `${balance}` : 'View Balance'}
        </button>
        <button className="add-money-btn">
          <span>+</span> Add Money
        </button>

        {/* Send Money Action - Single Button */}
        <div className="quick-actions-single">
          <button className="quick-action-btn send" onClick={onSendMoney}>
            <div className="action-icon">↗</div>
            <div className="action-label">Send</div>
          </button>
        </div>
      </div>

      {/* Cashback Promo Card */}
      <div className="promo-card">
        <div className="promo-content">
          <h3>Get 10% Cashback</h3>
          <p>On your first 3 transactions. Valid for new users only. T&C apply.</p>
        </div>
        <div className="promo-icon">💳</div>
      </div>

      {/* Service Cards Grid */}
      <div className="service-cards-grid">
        <div className="service-card">
          <div className="service-icon">$</div>
          <h4>Pay Bill</h4>
          <p>Secure way of paying your bills</p>
        </div>

        <div className="service-card">
          <div className="service-icon">📱</div>
          <div className="service-badge">NEW</div>
          <h4>Mobile Recharge</h4>
          <p>Top up, stay connected</p>
        </div>

        <div className="service-card">
          <div className="service-icon">❤️</div>
          <h4>Donation</h4>
          <p>Make a difference</p>
        </div>

        <div className="service-card">
          <div className="service-icon">💳</div>
          <h4>Pay Cards</h4>
          <p>Get your own prepaid card for easier transactions</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item">
          <span className="nav-icon">🔗</span>
          <span className="nav-label">Explore</span>
        </button>
        <button className="nav-item center" onClick={onScanQR}>
          <span className="nav-icon large">⊙</span>
          <span className="nav-label">Scan QR</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">📊</span>
          <span className="nav-label">History</span>
        </button>
      </div>
    </div>
  )
}
