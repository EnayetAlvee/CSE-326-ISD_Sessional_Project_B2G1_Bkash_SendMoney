# Digital Wallet Application — Project Specification

**Project:** Bkash-Inspired Digital Wallet System
**Author:** Enayet Alvee 
**Group** B2G1
**Version:** 1.0
**Date:** March 2026

---

## 1. Project Overview

A mobile wallet backend system inspired by bKash, built for peer-to-peer money transfers within a closed user network. The system supports user registration with identity verification, wallet management, and a smart charging model based on user relationships (Priyo Numbers).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth + Custom JWT |
| Email Service | Nodemailer (SMTP) |
| Password Hashing | Handled by Supabase Auth internally |
| API Security | JWT Bearer Tokens + Rate Limiting |
| Architecture | Controller → Service → Repository pattern |

---

## 3. Implemented Features

### 3.1 User Registration (Signup)

Users register by providing the following information:

| Field | Required | Notes |
|---|---|---|
| Full Name | ✅ | |
| Mobile Number | ✅ | Unique, cannot be changed later |
| Email | ✅ | Unique, verified via OTP |
| Password | ✅ | Minimum 6 characters, hashed by Supabase |
| Date of Birth | ✅ | Format: YYYY-MM-DD |
| NID Number | ✅ | National ID, stored as text |
| Profile Picture | ❌ | Optional, uploadable later from dashboard via URL |

**Registration Flow:**
```
User fills form → account created (unverified) 
→ OTP sent to email → user enters OTP 
→ account activated → user can now login
```

- Account is inactive (`is_verified = false`) until OTP is verified
- A wallet with 0 BDT balance is automatically created on registration
- Duplicate email or phone number is rejected

---

### 3.2 Email OTP Verification

- A 6-digit OTP is generated on signup and sent to the user's email
- OTP expires in **10 minutes**
- OTP can only be used **once** (marked used after verification)
- If user tries to login without verifying, a **new OTP is automatically resent**
- Sent via **Nodemailer over SMTP**

---

### 3.3 Login

- Login uses **email + password**
- On success, a **JWT token** is returned (valid for 7 days)
- Token must be sent in the `Authorization: Bearer <token>` header for all protected routes
- If email is unverified, login is blocked and a new OTP is sent automatically
- Optional **2FA** support: if enabled, an OTP is sent to email before token is issued

---

### 3.4 Password Management

- **Forgot Password:** user submits email → OTP sent → user submits OTP + new password → password updated
- Password reset handled via Supabase Auth admin API
- Always returns a generic message regardless of whether email exists (security best practice)

---

### 3.5 Wallet — Add Money

- Logged in users can add any positive amount to their wallet
- Maximum **100,000 BDT** per single transaction
- Adding money is always **free** (no charge)
- Balance updates immediately in database
- Transaction is recorded in history with type `add money`

---

### 3.6 Wallet — Send Money

Users can send money to any other registered user by their **mobile number**.

**Charge Logic:**

| Condition | Charge |
|---|---|
| Amount under 50 BDT | Always FREE |
| Amount ≥ 50 BDT to a Priyo number, within 25,000 BDT/month | FREE |
| Amount ≥ 50 BDT to a Priyo number, after 25,000 BDT/month | 5 BDT |
| Amount ≥ 50 BDT to a non-Priyo number | 5 BDT |

- Sender must have sufficient balance including charge
- Recipient receives exact amount (charge is only deducted from sender)
- Transaction is recorded for both sender and receiver
- Cannot send money to yourself
- Monthly free limit for Priyo numbers resets every calendar month

---

### 3.7 Priyo Numbers

Users can save up to **5 favourite contacts** as Priyo Numbers for free or discounted transfers.

**Features:**
- Add a user to Priyo list by their mobile number
- Optional label/nickname per Priyo contact (e.g. "Mama", "Friend")
- Edit/update the label of any Priyo contact
- Remove a Priyo contact
- View full Priyo list with contact names and labels
- Cannot add yourself
- Cannot add the same number twice
- Cannot exceed 5 Priyo numbers

---

### 3.8 Transaction History

- Users can view all their past transactions
- Shows both sent and received transactions
- Ordered newest first
- Each record includes: amount, charge, type, sender, receiver, timestamp

---

### 3.9 Profile Management

- View full profile information
- Update allowed fields: Full Name, Date of Birth, NID Number, Profile Picture URL
- **Mobile number cannot be changed** (used as primary identifier)
- **Email cannot be changed** through this endpoint

---

### 3.10 Security Features

- JWT authentication on all protected routes
- Rate limiting: **100 requests per 15 minutes** per IP
- Row Level Security (RLS) on all Supabase tables
- Service role key used server-side only, never exposed to frontend
- OTPs are single-use and time-limited
- Passwords never stored in custom tables — handled entirely by Supabase Auth

---

## 4. Database Schema

```
Profiles          → user identity and profile data
wallets           → one wallet per user, holds balance
transactions      → full history of add money + send money
priyo_numbers     → saved favourite contacts per user (max 5)
otps              → email OTPs for verification, login, reset
```

---

## 5. API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | ❌ | Register new account |
| POST | /api/auth/verify-otp | ❌ | Verify email OTP after signup |
| POST | /api/auth/login | ❌ | Login, receive JWT token |
| POST | /api/auth/verify-2fa | ❌ | Verify 2FA OTP |
| POST | /api/auth/forgot-password | ❌ | Request password reset OTP |
| POST | /api/auth/reset-password | ❌ | Reset password with OTP |
| GET | /api/wallet/balance | ✅ | Get current balance |
| POST | /api/wallet/add-money | ✅ | Add money to wallet |
| POST | /api/wallet/send-money | ✅ | Send money to another user |
| GET | /api/wallet/transactions | ✅ | View transaction history |
| GET | /api/priyo | ✅ | List priyo numbers |
| POST | /api/priyo/add | ✅ | Add priyo number |
| DELETE | /api/priyo/remove | ✅ | Remove priyo number |
| PATCH | /api/priyo/update-label | ✅ | Update priyo label |
| GET | /api/profile | ✅ | View profile |
| PATCH | /api/profile/update | ✅ | Update profile fields |

---

## 6. Known Limitations (Current Version)

- OTP emails are delivered via Nodemailer SMTP and **may land in spam folders** depending on the user's email provider. A third-party transactional email service is recommended (see Future Scope).
- Profile picture upload is URL-based only. Direct file upload to Supabase Storage is not yet implemented.
- No admin dashboard or panel exists yet.
- 2FA is schema-ready but the toggle to enable/disable it per user is not yet exposed as an API endpoint.
- RLS creating some problems ( can be solved later)
- If a user signup but didnot enter otp or enters the wrong otp we need to handle this ( -delete the  user data from database as he/she may able to sign up later)

---

## 7. Future Scope

The following features are planned for future versions:

### 7.1 Priyo Number Monthly Limit
- Enforce a maximum of **5 new Priyo numbers added per month** to prevent abuse

### 7.2 NID Verification
- Integrate with a national identity verification API to validate NID numbers against a government database during registration

### 7.3 Mobile Number Change with OTP
- Allow users to change their registered mobile number after verifying ownership of both old and new numbers via OTP

### 7.4 SMS OTP Support
- Replace or supplement email OTP with **SMS OTP** for signup, login, and password reset — more reliable delivery and better user experience
- Suggested providers: **Twilio**, **SSL Wireless** (Bangladesh), **Infobip**

### 7.5 Transactional Email Service
- Replace Nodemailer SMTP with a dedicated provider to improve deliverability and avoid spam issues
- Suggested providers: **SendGrid**, **Resend**, **Mailgun**, **Brevo (Sendinblue)**

### 7.6 Admin Panel
- Dashboard for monitoring transactions, managing users, viewing system stats

### 7.7 Notifications
- Email or push notifications for every transaction

### 7.8 Transaction PIN
- Require a 4-digit PIN for every send money transaction as an additional security layer  & make this the app password as it for bkash app

---

## 8. Project Structure

```
server/
├── config/
│   ├── index.js              → environment variables
│   └── supabase.js           → supabase client setup
├── controllers/
│   ├── auth.controller.js    → handles auth HTTP requests
│   ├── wallet.controller.js  → handles balance + add money
│   ├── sendmoney.controller.js → handles send money
│   ├── transaction.controller.js → handles history
│   ├── priyo.controller.js   → handles priyo operations
│   └── profile.controller.js → handles profile
├── middleware/
│   └── auth.middleware.js    → JWT verification
├── repositories/
│   ├── user.repository.js    → Profiles table queries
│   ├── wallet.repository.js  → wallets table queries
│   ├── transaction.repository.js → transactions queries
│   ├── otp.repository.js     → otps table queries
│   └── priyo.repository.js   → priyo_numbers queries
├── routes/
│   ├── auth.routes.js        → auth endpoints
│   ├── wallet.routes.js      → wallet endpoints
│   ├── priyo.routes.js       → priyo endpoints
│   └── profile.routes.js     → profile endpoints
├── services/
│   ├── auth.service.js       → auth business logic
│   ├── wallet.service.js     → wallet business logic
│   ├── sendmoney.service.js  → send money + charge logic
│   └── priyo.service.js      → priyo business logic
├── utils/
│   ├── email.js              → nodemailer email sender
│   ├── jwt.js                → token generate + verify
│   └── otp.js                → OTP generator
└── app.js                    → express app entry point
```

---

*This document was prepared by **Enayet Alvee** as part of the ISD project, March 2026.*
*Backend fully designed, architected, and implemented by Enayet Alvee.*