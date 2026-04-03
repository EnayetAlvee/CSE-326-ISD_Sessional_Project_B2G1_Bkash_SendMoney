import { useState } from 'react'

export default function SendMoneyPage({ onBack, onNext }) {
  const [currentStep, setCurrentStep] = useState('selectRecipient') // 'selectRecipient' or 'enterAmount'
  const [searchQuery, setSearchQuery] = useState('')
  
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [amount, setAmount] = useState('')
  const [addServiceFee, setAddServiceFee] = useState(false)
  const [note, setNote] = useState('')
  const [selectedGift, setSelectedGift] = useState(null)

  const allContacts = [
    { id: 1, name: 'Aidan', number: '01310041062', isRecent: true },
    { id: 2, name: 'aggers', number: '01872248726', isRecent: true },
    { id: 3, name: '01826501208', number: '01826501208', isRecent: true },
    { id: 9, name: 'Nuhas', number: '01748583807', isRecent: true },
    { id: 4, name: 'A-Rahim', number: '01088140441' },
    { id: 5, name: 'Asir', number: '01920063163' },
    { id: 6, name: 'Abzio', number: '01743333382' },
    { id: 7, name: 'Benjamin', number: '01634678690' },
    { id: 8, name: 'Clara', number: '01087684421' },
  ]

  const specialOptions = [
    { id: 'group', name: 'Group Send Money', description: 'Send money to multiple people', isNew: true },
    { id: 'favorites', name: 'Favorites', description: 'Your favorite saved contacts' },
    { id: 'autoPay', name: 'Auto Pay', description: 'Schedule automatic send payments' },
  ]

  const giftCards = [
    { id: 'instant', name: 'Instant Send', icon: '✈️' },
    { id: 'birthday', name: 'Birthday', icon: '🎁' },
    { id: 'celebration', name: 'Celebrat...', icon: '🎉' },
  ]

  const availableBalance = 2847.50
  const calculateCharge = () => {
    const amt = parseFloat(amount) || 0
    if (addServiceFee) {
      if (amt <= 1000) return 0
      if (amt <= 5000) return 25
      if (amt <= 20000) return 50
      return 100
    }
    return 0
  }

  const handleSelectRecipient = (contact) => {
    setSelectedRecipient(contact)
    setCurrentStep('enterAmount')
  }

  const handleBackToRecipients = () => {
    setCurrentStep('selectRecipient')
  }

  const handleProceed = () => {
    if (!selectedRecipient || !amount) {
      alert('Please select recipient and enter amount')
      return
    }
    onNext({
      recipientName: selectedRecipient.name,
      recipientNumber: selectedRecipient.number,
      amount: amount,
      charge: calculateCharge(),
      totalAmount: parseFloat(amount) + calculateCharge(),
      note: note,
      gift: selectedGift,
      availableBalance: availableBalance,
    })
  }

  if (currentStep === 'selectRecipient') {
    return (
      <div className="send-money-select">
        <div className="send-money-header">
          <button className="sm-back-btn" onClick={onBack}>←</button>
          <h2>Send Money</h2>
          <button className="sm-share-btn">💬</button>
        </div>

        {/* Search Box */}
        <div className="sm-search-box">
          <input
            type="text"
            placeholder="Contacts or Scan QR"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="sm-search-icon">👤</span>
        </div>

        {/* Special Options */}
        <div className="sm-special-options">
          {specialOptions.map(option => (
            <div key={option.id} className="sm-option-card">
              <div className="sm-option-avatar">👥</div>
              <div className="sm-option-info">
                <div className="sm-option-name">
                  {option.name}
                  {option.isNew && <span className="sm-badge">NEW</span>}
                </div>
                <div className="sm-option-desc">{option.description}</div>
              </div>
              <span className="sm-option-arrow">›</span>
            </div>
          ))}
        </div>

        {/* Recents */}
        <div className="sm-section">
          <h3 className="sm-section-title">Recents</h3>
          <div className="sm-contacts-list">
            {allContacts.filter(c => c.isRecent).map(contact => (
              <div 
                key={contact.id} 
                className="sm-contact-item"
                onClick={() => handleSelectRecipient(contact)}
              >
                <div className="sm-contact-avatar">{contact.name.charAt(0)}</div>
                <div className="sm-contact-info">
                  <div className="sm-contact-name">{contact.name}</div>
                  <div className="sm-contact-number">{contact.number}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Contacts */}
        <div className="sm-section">
          <h3 className="sm-section-title">All contacts</h3>
          <div className="sm-contacts-list">
            {allContacts.filter(c => !c.isRecent).map(contact => (
              <div 
                key={contact.id} 
                className="sm-contact-item"
                onClick={() => handleSelectRecipient(contact)}
              >
                <div className="sm-contact-avatar">{contact.name.charAt(0)}</div>
                <div className="sm-contact-info">
                  <div className="sm-contact-name">{contact.name}</div>
                  <div className="sm-contact-number">{contact.number}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Amount Entry Step
  return (
    <div className="send-money-amount">
      <div className="send-money-header">
        <button className="sm-back-btn" onClick={handleBackToRecipients}>←</button>
        <h2>Send Money</h2>
        <button className="sm-share-btn">✉️</button>
      </div>

      {/* Recipient Card */}
      <div className="sm-recipient-selected">
        <div className="sm-recipient-info">
          <div className="sm-recipient-avatar">{selectedRecipient.name.charAt(0)}</div>
          <div>
            <div className="sm-recipient-name">{selectedRecipient.name}</div>
            <div className="sm-recipient-number">{selectedRecipient.number}</div>
          </div>
        </div>
      </div>

      {/* Amount Section */}
      <div className="sm-amount-section">
        <label>Amount</label>
        <div className="sm-amount-input">
          <span>৳</span>
          <input
            type="number"
            placeholder="20,000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="sm-balance-info">
          Available Balance: <strong>৳{availableBalance.toLocaleString()}</strong>
        </div>

        {parseFloat(amount) > availableBalance && (
          <div className="sm-warning">
            Insufficient Balance. <a href="#">Add Money</a>
          </div>
        )}
      </div>

      {/* Service Fee Toggle */}
      <div className="sm-service-fee">
        <div className="sm-fee-label">
          Add Service Fee
          <span className="sm-fee-desc">Include transaction fee for recipient</span>
        </div>
        <label className="sm-toggle">
          <input
            type="checkbox"
            checked={addServiceFee}
            onChange={(e) => setAddServiceFee(e.target.checked)}
          />
          <span className="sm-toggle-slider"></span>
        </label>
      </div>

      {/* Note */}
      <div className="sm-note-section">
        <label>Add a Note (Optional)</label>
        <textarea
          placeholder="Write a message..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>

      {/* Gift Card Selection */}
      <div className="sm-gift-section">
        <label>Select Gift Card</label>
        <div className="sm-gift-options">
          {giftCards.map(gift => (
            <button
              key={gift.id}
              className={`sm-gift-btn ${selectedGift === gift.id ? 'selected' : ''}`}
              onClick={() => setSelectedGift(selectedGift === gift.id ? null : gift.id)}
            >
              <div className="sm-gift-icon">{gift.icon}</div>
              <div className="sm-gift-name">{gift.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Proceed Button */}
      <button className="sm-proceed-btn" onClick={handleProceed}>
        Proceed to Send <span>›</span>
      </button>
    </div>
  )
}
