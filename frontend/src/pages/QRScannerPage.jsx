import { useState } from 'react'

export default function QRScannerPage({ onBack }) {
  const [recentScans] = useState([
    { id: 1, name: 'Sarah Ahmed', time: 'Scanned 2 hours ago' },
    { id: 2, name: 'Mike Store', time: 'Scanned yesterday' },
    { id: 3, name: "John's Payment", time: 'Scanned 3 days ago' },
  ])

  const handleUploadFromGallery = () => {
    alert('Upload from Gallery functionality')
  }

  const handleMyQRCode = () => {
    alert('My QR Code functionality')
  }

  return (
    <div className="qr-scanner-page">
      {/* Header */}
      <div className="qr-header">
        <button className="qr-back-btn" onClick={onBack}>
          ←
        </button>
        <h2>Scan QR Code</h2>
        <button className="qr-settings-btn">⚙️</button>
      </div>

      {/* QR Scanner Frame */}
      <div className="qr-scanner-area">
        <div className="qr-frame">
          <div className="qr-corner qr-corner-top-left"></div>
          <div className="qr-corner qr-corner-top-right"></div>
          <div className="qr-corner qr-corner-bottom-left"></div>
          <div className="qr-corner qr-corner-bottom-right"></div>

          {/* Center Crosshair */}
          <div className="qr-center-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14M8 8l4 4M16 16l-4-4M16 8l-4 4M8 16l4-4" />
            </svg>
          </div>

          {/* Horizontal Line */}
          <div className="qr-scan-line"></div>
        </div>

        {/* Instructions */}
        <div className="qr-instructions">
          <h3>Position QR code in frame</h3>
          <p>The scan will happen automatically</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="qr-action-buttons">
        <button className="qr-action-btn gallery-btn" onClick={handleUploadFromGallery}>
          <div className="qr-action-icon">🖼️</div>
          <span>Upload from Gallery</span>
        </button>
        <button className="qr-action-btn my-qr-btn" onClick={handleMyQRCode}>
          <div className="qr-action-icon">📷</div>
          <span>My QR Code</span>
        </button>
      </div>

      {/* Recent Scans */}
      <div className="recent-scans-section">
        <h4 className="recent-scans-title">Recent Scans</h4>
        <div className="recent-scans-list">
          {recentScans.map(scan => (
            <div key={scan.id} className="recent-scan-item">
              <div className="recent-scan-avatar">⊙</div>
              <div className="recent-scan-info">
                <div className="recent-scan-name">{scan.name}</div>
                <div className="recent-scan-time">{scan.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
