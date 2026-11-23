# API DOCUMENTATION — MONTHLY BUDGET TRACKER (FULL-STACK WEB)

Base URL: `http://localhost:5000/api` (or environment-configured `API_URL`)

All endpoints expect `Content-Type: application/json`.
Protected endpoints support:
1. `Cookie: token=<jwt_token>` (Automatic for web browsers via HttpOnly cookies)
2. `Authorization: Bearer <jwt_token>` (Header fallback)

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register User
- **POST** `/auth/register`
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Responses:**
  - `201 Created`: Sets `Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800`
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "c1f20108-e8cb-4b36-96b4-2396e95267a0",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: Email already registered.

### 1.2 Login User
- **POST** `/auth/login`
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Responses:**
  - `200 OK`: Sets `Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "c1f20108-e8cb-4b36-96b4-2396e95267a0",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
  - `401 Unauthorized`: Invalid credentials.

### 1.3 Logout User
- **POST** `/auth/logout`
- **Responses:**
  - `200 OK`: Clears `token` cookie.
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.4 Get Current User Profile
- **GET** `/auth/me`
- **Protected:** Yes
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c1f20108-e8cb-4b36-96b4-2396e95267a0",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
}
```

---

## 2. INCOME ENDPOINTS

### 2.1 Set or Update Monthly Income (Upsert)
- **POST** `/income`
- **Protected:** Yes
- **Request Body:**
```json
{
  "month": 11,
  "year": 2026,
  "amount": 100000.00
}
```
- **Response (`200 OK` / `201 Created`):**
```json
{
  "success": true,
  "message": "Monthly income saved successfully",
  "data": {
    "income": {
      "id": "060d4a7c-658f-410a-bfa6-a70d9a0d24bf",
      "month": 11,
      "year": 2026,
      "amount": "100000.00",
      "createdAt": "2026-11-16T10:00:00.000Z",
      "updatedAt": "2026-11-16T10:00:00.000Z"
    },
    "summary": {
      "month": 11,
      "year": 2026,
      "totalIncome": "100000.00",
      "totalExpense": "23000.00",
      "remainingBalance": "77000.00",
      "isOverspent": false,
      "overspentAmount": "0.00",
      "budgetSpentPercentage": "23.00",
      "formattedTotalIncome": "Rs. 100,000.00",
      "formattedTotalExpense": "Rs. 23,000.00",
      "formattedRemainingBalance": "Rs. 77,000.00"
    }
  }
}
```

### 2.2 Get Monthly Income & Summary
- **GET** `/income?month=11&year=2026`
- **Protected:** Yes
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "income": {
      "id": "060d4a7c-658f-410a-bfa6-a70d9a0d24bf",
      "month": 11,
      "year": 2026,
      "amount": "100000.00"
    },
    "summary": {
      "month": 11,
      "year": 2026,
      "totalIncome": "100000.00",
      "totalExpense": "23000.00",
      "remainingBalance": "77000.00",
      "isOverspent": false,
      "overspentAmount": "0.00",
      "budgetSpentPercentage": "23.00"
    }
  }
}
```

---

## 3. EXPENSE ENDPOINTS

### 3.1 Create Expense
- **POST** `/expenses`
- **Protected:** Yes
- **Request Body:**
```json
{
  "name": "Grocery Shopping",
  "amount": 12000.00,
  "category": "FOOD",
  "date": "2026-11-16",
  "month": 11,
  "year": 2026
}
```
- **Response (`201 Created`):** Returns created expense and recalculated summary.

### 3.2 List Expenses
- **GET** `/expenses?month=11&year=2026&category=FOOD`
- **Protected:** Yes
- **Response (`200 OK`):** Returns filtered expenses array and authoritative monthly summary.

### 3.3 Edit Expense
- **PUT** `/expenses/:id`
- **Protected:** Yes
- **Request Body:**
```json
{
  "name": "Grocery Shopping (Superstore)",
  "amount": 15000.00,
  "category": "FOOD",
  "date": "2026-11-16"
}
```
- **Response (`200 OK`):** Returns updated expense and authoritative recalculated summary.

### 3.4 Delete Expense
- **DELETE** `/expenses/:id`
- **Protected:** Yes
- **Response (`200 OK`):** Returns deleted expense metadata and authoritative recalculated summary.

### 3.5 Export Expenses (CSV)
- **GET** `/expenses/export?month=11&year=2026`
- **Protected:** Yes
- **Response (`200 OK`):** Returns CSV file with headers:
  `ID,Date,Expense Name,Category,Amount (PKR),Month,Year`

---

## 4. FINANCIAL SUMMARY & ANALYTICS ENDPOINT

### 4.1 Get Full Monthly Summary & Breakdown
- **GET** `/summary?month=11&year=2026`
- **Protected:** Yes
- **Response (`200 OK`):** Returns full category breakdown, 80% threshold flag, and month-over-month comparison metrics.
