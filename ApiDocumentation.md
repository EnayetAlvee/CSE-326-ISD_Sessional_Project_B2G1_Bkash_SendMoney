# Bkash Project — Backend API Documentation          
Author: Enayet Alvee
B2G1 Bkash{Send Money}
---
## Overview

This is a REST API backend for a mobile wallet application. Built with **Node.js + Express**, database on **Supabase (PostgreSQL)**, authentication via **JWT tokens** and **email OTP**.

### Base URL
```
http://localhost:5000
```
> When deployed, this will change to the live server URL.

### How Authentication Works
```
1. Signup → verify OTP → account active
2. Login → get JWT token
3. Use token in every protected request header
4. Token expires in 7 days → login again
```

### Request Format
All requests must have this header:
```
Content-Type: application/json
```

Protected routes additionally need:
```
Authorization: Bearer <jwt_token>
```

### Response Format
All responses are JSON. Success and error both follow this pattern:
```json
{ "message": "..." }         // action responses
{ "field": value }           // data responses
{ "message": "error here" }  // error responses
```

---

## Database Tables (What Gets Stored)

```
Profiles       → user info (name, phone, email, nid, dob, picture)
wallets        → user balance
transactions   → all add money + send money history
priyo_numbers  → saved favourite contacts (max 5)
otps           → email OTPs for verification/login/reset
```

---

# AUTH ENDPOINTS

---

## 1. Signup

Creates a new account. Sends OTP to email. Account is inactive until OTP verified.

```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "password": "123456",
  "full_name": "Rahim Uddin",
  "phone": "01711111111",
  "date_of_birth": "1995-05-10",
  "nid_number": "1234567890"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| email | string | ✅ | must be valid email, unique |
| password | string | ✅ | minimum 6 characters |
| full_name | string | ✅ | any string |
| phone | string | ✅ | must be unique, no spaces |
| date_of_birth | string | ✅ | format: YYYY-MM-DD |
| nid_number | string | ✅ | any string |

**Success Response** `201`:
```json
{
  "message": "Account created. Check your email for the OTP."
}
```

**Error Responses** `400`:
```json
{ "message": "Email already registered" }
{ "message": "Phone number already registered" }
{ "message": "Password must be at least 6 characters" }
{ "message": "Full name is required" }
```

> After signup, user must verify OTP before they can login.

---

## 2. Verify OTP (After Signup)

Verifies the OTP sent to email during signup. Activates the account.

```
POST /api/auth/verify-otp
```

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "otp": "847291"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| email | string | ✅ | same email used at signup |
| otp | string | ✅ | 6-digit code from email |

**Success Response** `200`:
```json
{
  "message": "Email verified successfully. You can now login."
}
```

**Error Responses** `400`:
```json
{ "message": "Invalid or expired OTP" }
```

> OTP expires in 10 minutes. If expired, user must signup again or you can add a resend endpoint later.

---

## 3. Login

Logs in with email and password. Returns JWT token for all future requests.

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "password": "123456"
}
```

| Field | Type | Required |
|---|---|---|
| email | string | ✅ |
| password | string | ✅ |

**Success Response** `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.xxxxx",
  "user": {
    "id": "uuid-here",
    "email": "user@gmail.com",
    "full_name": "Rahim Uddin",
    "phone": "01711111111",
    "is_verified": true
  }
}
```

**If 2FA enabled** `200`:
```json
{
  "requires2FA": true,
  "message": "OTP sent to your email"
}
```

**Error Responses** `401`:
```json
{ "message": "Invalid email or password" }
{ "message": "Email not verified. A new OTP has been sent to your email." }
```

> Save the `token` — it is needed for every protected endpoint.

---

## 4. Verify 2FA (Only if 2FA enabled)

```
POST /api/auth/verify-2fa
```

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "otp": "847291"
}
```

**Success Response** `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.xxxxx",
  "user": {
    "id": "uuid-here",
    "email": "user@gmail.com",
    "full_name": "Rahim Uddin"
  }
}
```

---

## 5. Forgot Password

Sends a password reset OTP to the email.

```
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@gmail.com"
}
```

**Success Response** `200`:
```json
{
  "message": "If that email is registered, an OTP has been sent."
}
```

> Always returns same message whether email exists or not — security best practice.

---

## 6. Reset Password

Resets password using OTP received in email.

```
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "otp": "847291",
  "new_password": "newpassword123"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| email | string | ✅ | |
| otp | string | ✅ | 6-digit code from email |
| new_password | string | ✅ | minimum 6 characters |

**Success Response** `200`:
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses** `400`:
```json
{ "message": "Invalid or expired OTP" }
{ "message": "Password must be at least 6 characters" }
```

---

# WALLET ENDPOINTS
### All routes below require Authorization header:
```
Authorization: Bearer <token>
```

---

## 7. Get Balance

Returns current wallet balance of logged in user.

```
GET /api/wallet/balance
```

No request body needed.

**Success Response** `200`:
```json
{
  "balance": 9495
}
```

---

## 8. Add Money

Adds money to the logged in user's wallet. Always free, no charge.

```
POST /api/wallet/add-money
```

**Request Body:**
```json
{
  "amount": 5000
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| amount | number | ✅ | must be positive, max 100,000 per transaction |

**Success Response** `200`:
```json
{
  "message": "Money added successfully",
  "added": 5000,
  "new_balance": 14495
}
```

**Error Responses** `400`:
```json
{ "message": "Amount must be a positive number" }
{ "message": "Cannot add more than 100,000 BDT at once" }
```

---

## 9. Send Money

Sends money from logged in user to another user by phone number.

```
POST /api/wallet/send-money
```

**Request Body:**
```json
{
  "to_phone": "01722222222",
  "amount": 500
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| to_phone | string | ✅ | must be a registered user's phone |
| amount | number | ✅ | must be positive |

**Charge Logic:**
```
Amount under 50 BDT          → always FREE (no charge)
Amount 50+ BDT to Priyo      → FREE up to 25,000 BDT/month, then 5 BDT charge
Amount 50+ BDT to non-Priyo  → always 5 BDT charge
```

**Success Response** `200`:
```json
{
  "message": "Money sent successfully",
  "sent_to": "Karim Miah",
  "amount": 500,
  "charge": 5,
  "total_deducted": 505,
  "your_new_balance": 9495
}
```

**Error Responses** `400`:
```json
{ "message": "No user found with that phone number" }
{ "message": "You cannot send money to yourself" }
{ "message": "Insufficient balance. You need 505 BDT (500 + 5 charge) but have 200 BDT" }
```

---

## 10. Transaction History

Returns all transactions where user was sender or receiver. Newest first.

```
GET /api/wallet/transactions
```

No request body needed.

**Success Response** `200`:
```json
{
  "transactions": [
    {
      "transaction_id": "uuid-here",
      "created_at": "2026-03-16T10:30:00Z",
      "from_user_id": "uuid-of-sender",
      "to_user_id": "uuid-of-receiver",
      "amount": 500,
      "charge": 5,
      "type": "send money"
    },
    {
      "transaction_id": "uuid-here",
      "created_at": "2026-03-16T09:00:00Z",
      "from_user_id": null,
      "to_user_id": "uuid-of-user",
      "amount": 5000,
      "charge": 0,
      "type": "add money"
    }
  ]
}
```

> `from_user_id` is `null` for `add money` transactions — no sender, money added from outside.

**Transaction Types:**
```
"add money"   → user topped up their wallet
"send money"  → user sent money to another user
```

---

# PRIYO NUMBER ENDPOINTS
### All routes require Authorization header.

---

## 11. List Priyo Numbers

Returns all saved priyo numbers of logged in user.

```
GET /api/priyo
```

**Success Response** `200`:
```json
{
  "priyo_numbers": [
    {
      "priyo_user_id": "uuid-here",
      "label": "Mama",
      "created_at": "2026-03-16T10:00:00Z",
      "Profiles": {
        "id": "uuid-here",
        "full_name": "Karim Miah",
        "phone": "01722222222"
      }
    }
  ]
}
```

> Maximum 5 priyo numbers allowed per user.

---

## 12. Add Priyo Number

Adds a user to priyo list by their phone number.

```
POST /api/priyo/add
```

**Request Body:**
```json
{
  "phone": "01722222222",
  "label": "Mama"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| phone | string | ✅ | must be a registered user |
| label | string | ❌ | optional nickname, e.g. "Mama", "Friend" |

**Success Response** `201`:
```json
{
  "message": "Priyo number added successfully",
  "priyo_user": {
    "name": "Karim Miah",
    "phone": "01722222222",
    "label": "Mama"
  }
}
```

**Error Responses** `400`:
```json
{ "message": "No user found with that phone number" }
{ "message": "You cannot add yourself as a priyo number" }
{ "message": "You can only have up to 5 priyo numbers" }
{ "message": "This number is already in your priyo list" }
```

---

## 13. Remove Priyo Number

Removes a user from priyo list.

```
DELETE /api/priyo/remove
```

**Request Body:**
```json
{
  "phone": "01722222222"
}
```

**Success Response** `200`:
```json
{
  "message": "Priyo number removed successfully"
}
```

**Error Responses** `400`:
```json
{ "message": "This number is not in your priyo list" }
```

---

## 14. Update Priyo Label

Updates the label/nickname of a priyo number.

```
PATCH /api/priyo/update-label
```

**Request Body:**
```json
{
  "phone": "01722222222",
  "label": "Best Friend"
}
```

| Field | Type | Required |
|---|---|---|
| phone | string | ✅ |
| label | string | ✅ |

**Success Response** `200`:
```json
{
  "message": "Label updated successfully"
}
```

---

# PROFILE ENDPOINTS
### All routes require Authorization header.

---

## 15. Get Profile

Returns full profile of the logged in user.

```
GET /api/profile
```

**Success Response** `200`:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@gmail.com",
    "full_name": "Rahim Uddin",
    "phone": "01711111111",
    "date_of_birth": "1995-05-10",
    "nid_number": "1234567890",
    "picture_url": null,
    "is_verified": true,
    "two_fa_enabled": false,
    "created_at": "2026-03-16T10:00:00Z"
  }
}
```

---

## 16. Update Profile

Updates allowed profile fields. Phone number cannot be changed.

```
PATCH /api/profile/update
```

**Request Body** (all fields optional, send only what needs updating):
```json
{
  "full_name": "Rahim Updated",
  "date_of_birth": "1995-06-15",
  "nid_number": "9999999999",
  "picture_url": "https://yourproject.supabase.co/storage/v1/object/public/avatars/user.jpg"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| full_name | string | ❌ | optional |
| date_of_birth | string | ❌ | format YYYY-MM-DD |
| nid_number | string | ❌ | optional |
| picture_url | string | ❌ | URL from Supabase Storage |

> Phone and email cannot be updated through this endpoint.

**Success Response** `200`:
```json
{
  "message": "Profile updated",
  "user": {
    "id": "uuid-here",
    "full_name": "Rahim Updated",
    "phone": "01711111111",
    "date_of_birth": "1995-06-15",
    "picture_url": null
  }
}
```

**Error Response** `400`:
```json
{ "message": "No valid fields to update" }
```

---

# Complete Endpoint Summary

| # | Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|---|
| 1 | POST | /api/auth/signup | ❌ | Create account |
| 2 | POST | /api/auth/verify-otp | ❌ | Verify email OTP |
| 3 | POST | /api/auth/login | ❌ | Login, get token |
| 4 | POST | /api/auth/verify-2fa | ❌ | Verify 2FA OTP |
| 5 | POST | /api/auth/forgot-password | ❌ | Request password reset |
| 6 | POST | /api/auth/reset-password | ❌ | Reset password with OTP |
| 7 | GET | /api/wallet/balance | ✅ | Get balance |
| 8 | POST | /api/wallet/add-money | ✅ | Add money to wallet |
| 9 | POST | /api/wallet/send-money | ✅ | Send money to user |
| 10 | GET | /api/wallet/transactions | ✅ | Transaction history |
| 11 | GET | /api/priyo | ✅ | List priyo numbers |
| 12 | POST | /api/priyo/add | ✅ | Add priyo number |
| 13 | DELETE | /api/priyo/remove | ✅ | Remove priyo number |
| 14 | PATCH | /api/priyo/update-label | ✅ | Update priyo label |
| 15 | GET | /api/profile | ✅ | Get profile |
| 16 | PATCH | /api/profile/update | ✅ | Update profile |

---

# Frontend Implementation Notes

**1. Token Storage**
```
Store the JWT token in localStorage or a state manager after login.
Attach it to every protected request automatically.
```

**2. Signup Flow**
```
Show signup form 
→ POST /api/auth/signup 
→ Show OTP input screen 
→ POST /api/auth/verify-otp 
→ Redirect to login
```

**3. Login Flow**
```
POST /api/auth/login
→ if response has "token" → save token → go to dashboard
→ if response has "requires2FA: true" → show OTP screen
→ POST /api/auth/verify-2fa → save token → go to dashboard
```

**4. Send Money Flow**
```
Show send money form (phone + amount)
→ POST /api/wallet/send-money
→ Show result with charge breakdown
→ Refresh balance
```

**5. HTTP Status Codes**
```
200 → success
201 → created successfully
400 → bad request (your input was wrong)
401 → unauthorized (no token or expired token)
500 → server error
```

**6. Token Expiry**
```
Token lasts 7 days.
If you get 401 "Token expired" → redirect user to login page.
```