import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const OTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { tempPhoneNumber, login, setTempPhone } = useAuth();

  // Redirect if no phone number stored
  useEffect(() => {
    if (!tempPhoneNumber) {
      navigate('/login');
      return;
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tempPhoneNumber, navigate]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    
    const newOtp = Array(6).fill('');
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP with backend
      const response = await authAPI.verifyOTP(tempPhoneNumber, otpString);
      
      // Login user
      login({
        phoneNumber: tempPhoneNumber,
        name: response.user.name,
        accountNumber: response.user.accountNumber,
        token: response.token
      });
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
      
      // Clear OTP and focus first input
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setResending(true);
    
    try {
      await authAPI.requestOTP(tempPhoneNumber);
      toast.success('OTP resent successfully');
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    setTempPhone('');
    navigate('/login');
  };

  const formatPhoneNumber = (phone) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{5})(\d{6})/, '$1-$2');
    }
    return phone;
  };

  return (
    <div className="container">
      <div className="header">
        <button
          onClick={handleBack}
          className="back-button"
          style={{ position: 'absolute', top: '20px', left: '20px' }}
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="logo">
          <Shield size={32} />
        </div>
        <h1>Verify OTP</h1>
        <p>
          Enter the 6-digit code sent to<br />
          <strong>{formatPhoneNumber(tempPhoneNumber)}</strong>
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength="1"
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={loading}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (
              <div className="loading"></div>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>
            Didn't receive the code?
          </p>
          
          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                margin: '0 auto'
              }}
            >
              {resending ? (
                <div className="loading" style={{ width: '14px', height: '14px' }}></div>
              ) : (
                <RefreshCw size={14} />
              )}
              Resend OTP
            </button>
          ) : (
            <p style={{ fontSize: '14px', color: '#6c757d' }}>
              Resend in {countdown}s
            </p>
          )}
        </div>

        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#2e7d32', textAlign: 'center', margin: 0 }}>
            🔒 Your transaction is secured with advanced encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
