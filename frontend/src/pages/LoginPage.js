import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!phoneNumber) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setErrors({ phone: 'Please enter a valid Bangladeshi phone number' });
      return;
    }

    if (!pin) {
      setErrors({ pin: 'PIN is required' });
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setErrors({ pin: 'PIN must be 4 digits' });
      return;
    }

    setLoading(true);

    // Frontend-only demo: simulate server verification
    setTimeout(() => {
      // Accept any 4-digit PIN for demo purposes
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      const user = {
        name: 'Demo User',
        phone: cleanedPhone,
        token: 'demo-token'
      };

      login(user);
      toast.success('Logged in (demo)');
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      if (cleaned.length > 5) {
        return cleaned.replace(/(\d{5})(\d{0,6})/, '$1-$2');
      }
      return cleaned;
    }
    return phoneNumber;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (errors.phone) setErrors({});
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    if (errors.pin) setErrors({});
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logo">bK</div>
        <h1>Welcome to bKash (Demo)</h1>
        <p>Your trusted mobile financial service</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <Phone size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="01XXX-XXXXXX"
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength="12"
              disabled={loading}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="pin" className="form-label">
              <Key size={16} style={{ display: 'inline', marginRight: '8px' }} />
              PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`form-input ${errors.pin ? 'error' : ''}`}
              placeholder="••••"
              value={pin}
              onChange={handlePinChange}
              maxLength={4}
              disabled={loading}
            />
            {errors.pin && <div className="error-message">{errors.pin}</div>}
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
              Enter your 4-digit transaction PIN (demo accepts any 4 digits)
            </div>
          </div>

          {errors.general && <div className="error-message" style={{ marginBottom: '12px' }}>{errors.general}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="loading"></div> : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6c757d' }}>
            Forgot PIN?{' '}
            <a href="#" style={{ color: 'var(--primary-color)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/reset-pin'); }}>
              Reset PIN
            </a>
          </p>
        </div>

        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center', margin: 0 }}>
            By proceeding, you agree to bKash's Terms & Conditions and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
