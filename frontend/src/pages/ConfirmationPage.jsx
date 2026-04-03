import { useState } from 'react'

export default function ConfirmationPage({ data, onBack, onConfirm }) {
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  const handlePinKeypad = (value) => {
    if (value === 'backspace') {
      setPin(pin.slice(0, -1))
    } else if (value === 'confirm') {
      if (pin.length !== 5) {
        setPinError('PIN must be 5 digits')
        return
      }
      onConfirm({
        ...data,
        pin: pin,
      })
    } else if (pin.length < 5) {
      setPin(pin + value)
      setPinError('')
    }
  }

  const totalAmount = parseFloat(data?.totalAmount || 0)
  const charge = parseFloat(data?.charge || 0)
  const amount = parseFloat(data?.amount || 0)
  const afterTransaction = (parseFloat(data?.availableBalance || 0) - totalAmount).toFixed(2)

  return (
    <div className="confirmation-page">
      <div className="confirmation-header">
        <button className="conf-back-btn" onClick={onBack}>←</button>
        <h2>Confirm Transfer</h2>
        <button className="conf-send-btn">✉️</button>
      </div>

      {/* Sending To */}
      <div className="conf-sending-to">
        <span className="conf-label">SENDING TO</span>
        <span className="conf-tag">Anamed Number</span>
      </div>

      {/* Recipient */}
      <div className="conf-recipient">
        <div className="conf-recipient-avatar">{data?.recipientName?.charAt(0)}</div>
        <div className="conf-recipient-info">
          <div className="conf-recipient-name">{data?.recipientName}</div>
          <div className="conf-recipient-number">{data?.recipientNumber}</div>
        </div>
      </div>

      {/* Amount Breakdown */}
      <div className="conf-breakdown">
        <div className="conf-breakdown-row">
          <span>Amount</span>
          <span className="conf-amount">৳{amount.toLocaleString()}.00</span>
        </div>
        <div className="conf-breakdown-row">
          <span>Charge</span>
          <span className="conf-charge">+৳{charge.toFixed(2)}</span>
        </div>
        <div className="conf-breakdown-row conf-breakdown-total">
          <span>Total</span>
          <span>৳{totalAmount.toLocaleString()}.00</span>
        </div>
      </div>

      {/* Balance Info */}
      <div className="conf-balance">
        <div className="conf-balance-row">
          <span>Current Balance</span>
          <span>৳{parseFloat(data?.availableBalance || 0).toLocaleString()}.50</span>
        </div>
        <div className="conf-balance-row">
          <span>After Transaction</span>
          <span>৳{afterTransaction}</span>
        </div>
      </div>

      {/* Reference */}
      {data?.note && (
        <div className="conf-reference">
          <input
            type="text"
            placeholder="Add a note (Optional)"
            value={data.note}
            readOnly
          />
        </div>
      )}

      {/* PIN Entry */}
      <div className="conf-pin-section">
        <div className="conf-pin-label">
          <div className="conf-pin-avatar">🔐</div>
          <span>Enter Your PIN</span>
        </div>
        <p className="conf-pin-desc">Your PIN is required to confirm</p>

        <div className="conf-pin-display">
          {Array(5).fill(0).map((_, i) => (
            <span key={i} className={`conf-pin-dot ${i < pin.length ? 'filled' : ''}`}>
              {i < pin.length ? '●' : '○'}
            </span>
          ))}
        </div>

        {pinError && (
          <div className="conf-pin-error">{pinError}</div>
        )}
      </div>

      {/* PIN Keypad */}
      <div className="conf-keypad">
        <div className="conf-keypad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              className="conf-keypad-btn"
              onClick={() => handlePinKeypad(num.toString())}
            >
              {num}
            </button>
          ))}
          <button
            className="conf-keypad-btn backspace"
            onClick={() => handlePinKeypad('backspace')}
          >
            ⌫
          </button>
          <button
            className="conf-keypad-btn"
            onClick={() => handlePinKeypad('0')}
          >
            0
          </button>
          <button
            className="conf-keypad-btn confirm"
            onClick={() => handlePinKeypad('confirm')}
            disabled={pin.length !== 5}
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  )
}
