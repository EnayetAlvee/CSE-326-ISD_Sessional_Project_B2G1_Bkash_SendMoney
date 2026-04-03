import { useState } from 'react'
import './App.css'
import ConfirmationPage from './pages/ConfirmationPage'
import HomePage from './pages/HomePage'
import QRScannerPage from './pages/QRScannerPage'
import SendMoneyPage from './pages/SendMoneyPage'
import SuccessPage from './pages/SuccessPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [sendMoneyData, setSendMoneyData] = useState(null)

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page)
    if (data) {
      setSendMoneyData(data)
    }
  }

  const handleGoHome = () => {
    setCurrentPage('home')
    setSendMoneyData(null)
  }

  return (
    <div className="mobile-container">
      <div className="status-bar">
        <span>9:41</span>
        <span>●●●●●</span>
      </div>
      
      <div className="header">bKash</div>

      <div className="main-content">
        {currentPage === 'home' && (
          <HomePage 
            onSendMoney={() => handleNavigate('sendMoney')}
            onScanQR={() => handleNavigate('qrScanner')}
          />
        )}
        {currentPage === 'sendMoney' && (
          <SendMoneyPage 
            onBack={handleGoHome}
            onNext={(data) => handleNavigate('confirmation', data)}
          />
        )}
        {currentPage === 'confirmation' && (
          <ConfirmationPage 
            data={sendMoneyData}
            onBack={() => handleNavigate('sendMoney')}
            onConfirm={(data) => handleNavigate('success', data)}
          />
        )}
        {currentPage === 'success' && (
          <SuccessPage 
            data={sendMoneyData}
            onDone={handleGoHome}
          />
        )}
        {currentPage === 'qrScanner' && (
          <QRScannerPage 
            onBack={handleGoHome}
          />
        )}
      </div>
    </div>
  )
}

export default App
