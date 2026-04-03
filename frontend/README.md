# bKash Send Money - Mobile Frontend

A React + Vite frontend application for the bKash Send Money feature. This is a mobile-first PWA designed specifically for the send money functionality.

## Features

- **Home Page**: User greeting with quick access to Send Money
- **Send Money Page**: 
  - Support for saved recipients
  - Add new recipients
  - Amount validation
  - Optional transaction references
- **Confirmation Page**: 
  - Transaction summary
  - PIN authentication
  - Fee calculation
- **Success Page**: 
  - Transaction confirmation
  - Transaction ID and timestamp
  - Transaction details

## Tech Stack

- **React 18.2.0** - UI library
- **Vite 5.0.0** - Build tool and dev server
- **JavaScript (JSX)** - Language

## Project Structure

```
src/
├── main.jsx              # Application entry point
├── App.jsx               # Main app component with routing logic
├── App.css               # App styles
├── index.css             # Global styles and mobile styles
└── pages/
    ├── HomePage.jsx      # Home page component
    ├── SendMoneyPage.jsx # Send money form component
    ├── ConfirmationPage.jsx # Transaction confirmation component
    └── SuccessPage.jsx   # Transaction success component
```

## Installation

1. Navigate to the project directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

The output will be in the `dist` folder.

## Preview

Preview the production build locally:
```bash
npm run preview
```

## Mobile Responsiveness

The application is optimized for mobile devices with a maximum width of 420px. It includes:
- Touch-friendly button sizes
- Mobile-optimized form inputs
- Responsive typography
- Status bar simulation

## Features Overview

### Send Money Workflow

1. **Home Page**
   - User greeting with phone number
   - Quick access button to Send Money

2. **Send Money Form**
   - Toggle between saved recipients and new recipients
   - Input fields for recipient details
   - Amount input with validation
   - Optional reference field
   - Fee structure information

3. **Confirmation**
   - Transaction summary with breakdown
   - 5-digit PIN authentication
   - Fee display
   - Cancel or confirm options

4. **Success**
   - Success confirmation with checkmark
   - Transaction ID
   - Timestamp
   - Complete transaction details
   - Return to home option

## Styling

The application uses:
- Custom CSS with mobile-first approach
- CSS Grid for layouts
- Flexbox for component alignment
- Responsive breakpoints for different screen sizes
- Color scheme: Red (#e74c3c) primary, white backgrounds, grey accents

## Notes

- The application currently only includes the "Send Money" feature as requested
- Other features like "Cash Out" and "bKash to Bank" are not included
- Transaction IDs in the success page are generated with current timestamp
- Fee structure: ৳0 for ≤১০০০, ৳5 for ≤৫০০০, ৳10 for ≤২০০০০, ৳20 for >२०००০

## Future Enhancements

- Backend API integration
- Local storage for saved recipients
- Receipt generation and sharing
- Transaction history
- Multiple language support
- Biometric authentication
