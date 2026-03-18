import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  DollarSign,
  Lock,
  Send,
  Check,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SendMoneyPage = () => {
  // Demo configuration (frontend-only)
  const DEMO_BALANCE = 5000.0; // demo user balance
  const DEMO_PIN = '12345'; // correct demo PIN

  const [step, setStep] = useState(1); // 1: Receiver, 2: Amount, 3: PIN, 4: Confirmation
  const [formData, setFormData] = useState({
    receiverNumber: '',
    amount: '',
    pin: '',
    reference: ''
  });
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [balanceChecked, setBalanceChecked] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  };

  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    return !Number.isNaN(numAmount) && numAmount > 0 && numAmount <= 25000; // bKash daily limit
  };

  // Frontend-only: simulate receiver lookup
  const handleReceiverSubmit = () => {
    setErrors({});

    if (!formData.receiverNumber) {
      setErrors({ receiver: 'Receiver number is required' });
      return;
    }

    if (!validatePhoneNumber(formData.receiverNumber)) {
      setErrors({ receiver: 'Please enter a valid phone number' });
      return;
    }

    if (formData.receiverNumber.replace(/-/g, '') === (user?.phone || user?.phoneNumber)) {
      setErrors({ receiver: 'You cannot send money to yourself' });
      return;
    }

    // Simulate found receiver
    setLoading(true);
    setTimeout(() => {
      setReceiverInfo({ name: 'Demo Receiver' });
      setLoading(false);
      setStep(2);
      toast.success('Receiver found (demo)');
    }, 500);
  };

  const handleAmountSubmit = () => {
    setErrors({});

    if (!formData.amount) {
      setErrors({ amount: 'Amount is required' });
      return;
    }

    if (!validateAmount(formData.amount)) {
      setErrors({ amount: 'Amount should be between ৳1 and ৳25,000' });
      return;
    }

    const fee = calculateFee(formData.amount);
    const total = parseFloat(formData.amount) + fee;

    // Check demo balance
    if (total > DEMO_BALANCE) {
      setErrors({ amount: `Insufficient balance. Demo balance is ৳ ${DEMO_BALANCE.toFixed(2)}` });
      setBalanceChecked(false);
      return;
    }

    // Mark that balance is sufficient; user can now proceed to PIN entry
    setBalanceChecked(true);
    toast.success(`Balance sufficient. Total: ৳ ${total.toFixed(2)}`);
  };

  const proceedToPin = () => {
    // ensure balance was checked
    if (!balanceChecked) {
      setErrors({ amount: 'Please check balance before proceeding to PIN' });
      return;
    }
    setStep(3);
  };

  const handlePinSubmit = () => {
    setErrors({});

    if (!formData.pin || formData.pin.length !== 5) {
      setErrors({ pin: 'Please enter your 5-digit PIN' });
      return;
    }

    setLoading(true);

    // Frontend-only PIN check
    setTimeout(() => {
      if (formData.pin === DEMO_PIN) {
        setLoading(false);
        setStep(4);
        toast.success('PIN verified (demo)');
      } else {
        setLoading(false);
        setErrors({ pin: 'Wrong PIN' });
        toast.error('Wrong PIN');
      }
    }, 500);
  };

  const handleFinalSubmit = () => {
    // Simulate sending money (frontend-only)
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Money sent successfully (demo)!');

      // Build transaction object
      const fee = calculateFee(formData.amount);
      const total = (parseFloat(formData.amount) + fee).toFixed(2);
      const tx = {
        id: `TX${Date.now().toString().slice(-8)}`,
        date: new Date().toISOString(),
        receiverName: receiverInfo?.name || 'Receiver',
        receiverNumber: formData.receiverNumber.replace(/-/g, ''),
        amount: parseFloat(formData.amount).toFixed(2),
        fee: fee.toFixed(2),
        total: total,
        reference: formData.reference || ''
      };

      setTimeout(() => navigate('/receipt', { state: { transaction: tx } }), 600);
    }, 800);
  };

  const calculateFee = (amount) => {
    const numAmount = parseFloat(amount);
    if (numAmount <= 100) return 5;
    if (numAmount <= 1000) return 10;
    if (numAmount <= 5000) return 15;
    return 20;
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      if (cleaned.length > 5) {
        return cleaned.replace(/(\d{5})(\d{0,6})/, '$1-$2');
      }
      return cleaned;
    }
    return formData.receiverNumber;
  };

  const handleInputChange = (field, value) => {
    if (field === 'receiverNumber') {
      value = formatPhoneNumber(value);
    } else if (field === 'amount') {
      // Only allow numbers and decimal point
      if (!/^\d*\.?\d*$/.test(value)) return;
    } else if (field === 'pin') {
      // Only allow numbers, max 5 digits
      if (!/^\d*$/.test(value) || value.length > 5) return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const renderStep1 = () => (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#333' }}>
        Enter Receiver Number
      </h2>

      <div className="form-group">
        <label className="form-label">
          <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Receiver's Phone Number
        </label>
        <input
          type="text"
          className={`form-input ${errors.receiver ? 'error' : ''}`}
          placeholder="01XXX-XXXXXX"
          value={formData.receiverNumber}
          onChange={(e) => handleInputChange('receiverNumber', e.target.value)}
          maxLength="12"
        />
        {errors.receiver && (
          <div className="error-message">
            <AlertTriangle size={14} />
            {errors.receiver}
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={handleReceiverSubmit} disabled={loading || !formData.receiverNumber}>
        {loading ? <div className="loading"></div> : 'Continue'}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#333' }}>
        Enter Amount
      </h2>

      {receiverInfo && (
        <div className="recipient-info">
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Sending to:</h4>
          <p style={{ margin: '0', fontWeight: '600' }}>{receiverInfo.name}</p>
          <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>{formData.receiverNumber}</p>
        </div>
      )}

      <div style={{ marginBottom: '12px', color: '#333' }}>
        <strong>Your demo balance: </strong> ৳ {DEMO_BALANCE.toFixed(2)}
      </div>

      <div className="form-group">
        <label className="form-label">
          <DollarSign size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Amount (৳)
        </label>
        <input
          type="text"
          className={`form-input ${errors.amount ? 'error' : ''}`}
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          style={{ fontSize: '18px', textAlign: 'center' }}
        />
        {errors.amount && (
          <div className="error-message">
            <AlertTriangle size={14} />
            {errors.amount}
          </div>
        )}
      </div>

      {formData.amount && (
        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Amount:</span>
            <span>৳ {formData.amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Fee:</span>
            <span>৳ {calculateFee(formData.amount)}</span>
          </div>
          <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #dee2e6' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
            <span>Total:</span>
            <span>৳ {(parseFloat(formData.amount) + calculateFee(formData.amount)).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Reference (Optional)</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., Payment for..."
          value={formData.reference}
          onChange={(e) => handleInputChange('reference', e.target.value)}
          maxLength="50"
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={handleAmountSubmit} disabled={!formData.amount}>
          Check Balance
        </button>
        {balanceChecked && (
          <button className="btn btn-primary" onClick={proceedToPin}>
            Proceed to PIN
          </button>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#333' }}>
        Enter PIN
      </h2>

      <div style={{ background: '#e8f5e8', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#2e7d32' }}>You are sending</p>
        <div className="amount-display">৳ {formData.amount}</div>
        <p style={{ margin: '0', fontSize: '14px', color: '#2e7d32' }}>to {receiverInfo?.name}</p>
      </div>

      <div className="form-group">
        <label className="form-label">
          <Lock size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Enter your PIN
        </label>
        <input
          type="password"
          className={`form-input ${errors.pin ? 'error' : ''}`}
          placeholder="• • • • •"
          value={formData.pin}
          onChange={(e) => handleInputChange('pin', e.target.value)}
          maxLength="5"
          style={{ fontSize: '24px', textAlign: 'center', letterSpacing: '8px' }}
        />
        {errors.pin && (
          <div className="error-message">
            <AlertTriangle size={14} />
            {errors.pin}
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={handlePinSubmit} disabled={loading || formData.pin.length !== 5}>
        {loading ? <div className="loading"></div> : 'Verify PIN'}
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'var(--success-color)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        color: 'white'
      }}>
        <Check size={40} />
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
        Confirm Transaction
      </h2>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '24px', textAlign: 'left' }}>
        <div style={{ marginBottom: '12px' }}>
          <strong>To:</strong> {receiverInfo?.name}
          <br />
          <small>{formData.receiverNumber}</small>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <strong>Amount:</strong> ৳ {formData.amount}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <strong>Fee:</strong> ৳ {calculateFee(formData.amount)}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <strong>Total:</strong> ৳ {(parseFloat(formData.amount) + calculateFee(formData.amount)).toFixed(2)}
        </div>
        {formData.reference && (
          <div>
            <strong>Reference:</strong> {formData.reference}
          </div>
        )}
      </div>

      <button className="btn btn-success" onClick={handleFinalSubmit} disabled={loading} style={{ marginBottom: '12px' }}>
        {loading ? (
          <div className="loading"></div>
        ) : (
          <>
            <Send size={16} />
            Send Money
          </>
        )}
      </button>

      <button className="btn btn-secondary" onClick={() => setStep(3)} disabled={loading}>
        Back to PIN
      </button>
    </div>
  );

  return (
    <div className="send-money-container">
      <div className="page-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title">Send Money</h1>
      </div>

      <div className="form-container">
        <div className="card">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: stepNumber <= step ? 'var(--primary-color)' : '#dee2e6'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SendMoneyPage;
