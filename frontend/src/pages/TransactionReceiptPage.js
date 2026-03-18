import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const TransactionReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tx = location.state?.transaction;

  if (!tx) {
    // If no transaction data, redirect to dashboard
    navigate('/dashboard');
    return null;
  }

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logo">bK</div>
        <h1>Transaction Receipt</h1>
        <p>Details of your recent transaction</p>
      </div>

      <div className="card" style={{ maxWidth: '480px', margin: '20px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={28} color="#2e7d32" />
            <h2 style={{ margin: 0 }}>Transaction Successful</h2>
          </div>
        </div>

        <div style={{ padding: '12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>Transaction ID</strong>
            <span>{tx.id}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>Date & Time</strong>
            <span>{formatDateTime(tx.date)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>To</strong>
            <span>{tx.receiverName} ({tx.receiverNumber})</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>Amount</strong>
            <span>৳ {Number(tx.amount).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>Fee</strong>
            <span>৳ {Number(tx.fee).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', marginBottom: '12px' }}>
            <strong>Total</strong>
            <span>৳ {Number(tx.total).toFixed(2)}</span>
          </div>

          {tx.reference && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Reference</strong>
              <div>{tx.reference}</div>
            </div>
          )}

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceiptPage;
