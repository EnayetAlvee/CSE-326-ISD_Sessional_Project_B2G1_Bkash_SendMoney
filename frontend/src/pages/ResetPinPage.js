import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ResetPinPage = () => {
  const [phone, setPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [step, setStep] = useState(1); // 1: enter phone & new pin, 2: enter OTP
  const [generatedOTP, setGeneratedOTP] = useState(null);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const validatePhone = (p) => {
    const cleaned = p.replace(/\D/g, '');
    const phoneRegex = /^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/;
    return phoneRegex.test(cleaned) || phoneRegex.test(p);
  };

  const handleStartReset = (e) => {
    e.preventDefault();
    // basic validation
    if (!phone) return toast.error('Phone number is required');
    if (!validatePhone(phone)) return toast.error('Please enter a valid Bangladeshi phone number');
    if (!newPin || newPin.length !== 5) return toast.error('New PIN must be 5 digits');
    if (newPin !== confirmPin) return toast.error('PINs do not match');

    // generate OTP and advance
    generateAndStartOTP();
    setStep(2);
  };

  const generateAndStartOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    toast.success(`Demo OTP: ${otp}`); // show OTP in toast for demo

    setCountdown(30);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // focus first OTP input after small delay
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpInputs];
    newOtp[index] = value.slice(-1);
    setOtpInputs(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otpString = otpInputs.join('');
    if (otpString.length !== 6) return toast.error('Please enter the 6-digit OTP');
    if (countdown === 0) return toast.error('OTP expired. Please resend OTP');

    if (otpString === generatedOTP) {
      // success: update demo state (no backend)
      toast.success('PIN reset successful (demo)');
      // Optionally store the new PIN somewhere (demo only)
      // redirect to login
      setTimeout(() => navigate('/login'), 800);
    } else {
      toast.error('Invalid OTP');
      setOtpInputs(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    generateAndStartOTP();
  };

  const handleBack = () => {
    navigate('/login');
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
        <h1>Reset PIN (Demo)</h1>
        <p>Enter your registered phone number and a new 5-digit PIN to receive an OTP.</p>
      </div>

      <div className="card">
        {step === 1 && (
          <form onSubmit={handleStartReset}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="01XXX-XXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={12}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New PIN (5 digits)</label>
              <input
                type="password"
                inputMode="numeric"
                className="form-input"
                value={newPin}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setNewPin(v);
                }}
                maxLength={5}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                className="form-input"
                value={confirmPin}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setConfirmPin(v);
                }}
                maxLength={5}
              />
            </div>

            <button type="submit" className="btn btn-primary">Generate OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <p style={{ marginBottom: '12px' }}>Enter the 6-digit OTP sent to your phone. OTP expires in <strong>{countdown}s</strong>.</p>

            <div className="otp-container" style={{ justifyContent: 'center' }}>
              {otpInputs.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  maxLength={1}
                />
              ))}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary">Verify OTP</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setStep(1); setGeneratedOTP(null); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }}>
                Cancel
              </button>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              {canResend ? (
                <button onClick={handleResend} className="btn" style={{ background: 'none', border: 'none', color: 'var(--primary-color)' }}>
                  <RefreshCw size={14} /> Resend OTP
                </button>
              ) : (
                <p style={{ color: '#6c757d' }}>Resend available in {countdown}s</p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPinPage;
