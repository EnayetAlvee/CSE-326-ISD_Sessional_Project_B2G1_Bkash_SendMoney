import { useState } from 'react'

export default function SuccessPage({ data, onDone }) {
  const [transactionId] = useState(() => {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  })
  const [timestamp] = useState(() => {
    const now = new Date()
    const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${date}, ${time}`
  })

  return (
    <div className="success-page-new">
      <button className="success-close-btn" onClick={onDone}>✕</button>

      {/* Success Header */}
      <div className="success-header">
        <h2>Send Money</h2>
        <div className="success-subtitle">Successful <span className="success-checkmark">✓</span></div>
      </div>

      {/* Recipient Card */}
      <div className="success-recipient-card">
        <div className="success-recipient-avatar">{data?.recipientName?.charAt(0)}</div>
        <div className="success-recipient-info">
          <div className="success-recipient-name">{data?.recipientName}</div>
          <div className="success-recipient-number">{data?.recipientNumber}</div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="success-details">
        <div className="success-detail-row">
          <span className="success-detail-label">Time</span>
          <span className="success-detail-value">{timestamp}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Transaction ID</span>
          <span className="success-detail-value success-txn-id">3OC8_ID</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Amount</span>
          <span className="success-detail-value success-amount">৳{parseFloat(data?.amount || 0).toLocaleString()}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Total</span>
          <span className="success-detail-value success-total">৳{parseFloat(data?.totalAmount || 0).toLocaleString()}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Remaining Balance</span>
          <span className="success-detail-value">৳{(parseFloat(data?.availableBalance || 0) - parseFloat(data?.totalAmount || 0)).toLocaleString()}.50</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="success-quick-actions">
        <h4 className="success-actions-title">Quick Actions</h4>
        <div className="success-actions-grid">
          <button className="success-action-btn">
            <span className="success-action-icon">📧</span>
            <span className="success-action-label">Share Receipt</span>
          </button>
          <button className="success-action-btn">
            <span className="success-action-icon">⭐</span>
            <span className="success-action-label">Save Number</span>
          </button>
        </div>
      </div>

      {/* Done Button */}
      <button className="success-done-btn" onClick={onDone}>Done</button>
    </div>
  )
}
