# bKash Frontend Application

A modern React-based frontend application for a mobile payment system similar to bKash, featuring login, OTP verification, and send money functionality.

## Features

###  Authentication
- Phone number-based login
- OTP verification with resend functionality
- Secure session management
- Auto-logout on token expiry

###  Send Money Module
- Phone number validation
- Receiver verification
- Amount input with fee calculation
- PIN verification
- Transaction confirmation
- Real-time balance updates

###  Mobile-First Design
- Responsive design optimized for mobile devices
- bKash brand colors and styling
- Smooth transitions and animations
- Touch-friendly interface

###  Security Features
- PIN masking
- Secure API communication
- Session timeout handling
- Error handling and validation

## Technology Stack

- **React 18** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Lucide React** - Modern icon library
- **CSS3** - Custom styling with CSS variables

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── LoginPage.js    # Phone number login
│   ├── OTPPage.js      # OTP verification
│   ├── DashboardPage.js # Main dashboard
│   └── SendMoneyPage.js # Send money workflow
├── context/            # React context for state management
│   └── AuthContext.js  # Authentication state
├── services/           # API service layer
│   └── api.js          # API calls and configuration
├── styles/             # CSS styles
│   └── App.css         # Main stylesheet
├── App.js              # Main app component with routing
└── index.js            # React app entry point
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   cd bkash-frontend
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   
   The application will open at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   ```

## API Integration

The frontend expects a backend API with the following endpoints:

### Authentication Endpoints
- `POST /api/auth/request-otp` - Request OTP for phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-pin` - Verify user PIN

### Transaction Endpoints
- `POST /api/transaction/validate-receiver` - Validate receiver phone number
- `GET /api/account/balance` - Get user account balance
- `POST /api/transaction/send-money` - Process send money transaction
- `GET /api/transaction/history` - Get transaction history

## Key Features Implementation

### 1. Login Flow
- User enters phone number
- Phone number validation (Bangladesh format)
- OTP request to backend
- Navigate to OTP verification page

### 2. OTP Verification
- 6-digit OTP input with auto-focus
- Paste support for OTP codes
- Resend OTP with countdown timer
- Automatic login on successful verification

### 3. Send Money Workflow
- **Step 1**: Enter receiver phone number with validation
- **Step 2**: Enter amount with fee calculation
- **Step 3**: PIN verification for security
- **Step 4**: Transaction confirmation and processing

### 4. Security Implementation
- JWT token management
- Automatic token refresh
- Secure PIN entry (masked input)
- Session timeout handling
- API request/response interceptors

## Styling & Design

The application follows bKash's design language:
- **Primary Color**: #e2136e (bKash Pink)
- **Mobile-first approach** with responsive design
- **Card-based layout** for modern UI
- **Smooth animations** and transitions
- **Loading states** for better UX

## Mobile Optimizations

- Viewport configuration for mobile devices
- Touch-friendly button sizes (minimum 44px)
- Prevented zoom on input focus (iOS)
- Optimized font sizes for readability
- Smooth scrolling and navigation

## Error Handling

- Form validation with real-time feedback
- Network error handling with user-friendly messages
- API error parsing and display
- Graceful fallbacks for failed operations

## Testing

Run tests with:
```bash
npm test
```

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow React best practices
2. Maintain consistent code formatting
3. Add proper error handling
4. Write meaningful commit messages
5. Test on multiple devices/browsers




