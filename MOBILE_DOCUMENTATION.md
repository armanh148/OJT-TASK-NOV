# Monthly Budget Tracker — Mobile Application (Android & iOS)

A complete cross-platform mobile application built with **React Native**, **Expo SDK 51**, and **Expo Router**, engineered to satisfy 100% of the On-the-Job Training (OJT) evaluation criteria.

Runs natively on:
- 🤖 **Android:** Expo Go app, Android Emulator, or Standalone Android APK (`.apk`)
- 🍏 **iOS (iPhone & iPad):** Expo Go app (via QR code) or iOS Simulator
- 🌐 **Web:** Preview via Metro Web

---

## 1. Quick Start Guide (How to Run on Android & iPhone)

### Prerequisites
- Install **Expo Go** on your physical Android phone (from Google Play Store) or iPhone (from Apple App Store).
- Ensure your phone and development PC are connected to the same Wi-Fi network (or use tunnel mode).

### Step 1: Start Backend API & Database
```bash
cd backend
npm run dev
```
*API runs on `http://localhost:5000` (PostgreSQL Neon connected).*

### Step 2: Start Mobile App (Metro Bundler)
```bash
cd mobile
npm start
```
Metro will start and display a QR Code in your terminal.

### Step 3: Open on Your Device
- **On Android Phone:** Open the **Expo Go** app and tap **"Scan QR code"**. Point your camera at the QR code in the terminal.
- **On iPhone:** Open the default **Camera** app, point at the terminal QR code, and tap the yellow **"Open in Expo Go"** banner.
- **On Android Emulator:** Press `a` in the terminal running Expo.
- **On iOS Simulator:** Press `i` in the terminal running Expo.

---

## 2. In-App Backend URL Switcher (Zero-Configuration Mobile Networking)

In mobile development, `localhost` from a physical phone refers to the phone itself, not your PC.
To make testing effortless on both Android and iPhone, we built an **In-App Backend Server Configurator** in **Settings tab**:

1. Open the app -> Go to **Settings** tab.
2. Under **Backend Server URL**, you will find one-tap presets:
   - **Android Emulator:** `http://10.0.2.2:5000/api`
   - **iOS Simulator / Localhost:** `http://localhost:5000/api`
   - **Physical Phone over Wi-Fi:** Enter your PC's local IP (e.g. `http://192.168.1.15:5000/api`)
   - **Cloud Deployed Backend:** Enter your deployed Render or Railway URL (e.g. `https://my-budget-api.onrender.com/api`)
3. Tap **"Save Backend URL"** — changes take effect immediately without rebuilding!

---

## 3. OJT Functional Requirements Coverage (F1 – F10)

| Requirement ID | Feature Name | Task Specification | Mobile Implementation Details |
| :--- | :--- | :--- | :--- |
| **F1** | Register / Login | User creates account & logs in with email/pass. JWT authentication. | `app/(auth)/login.tsx` & `register.tsx`. Validation with password complexity rules. Persistent JWT storage via `AsyncStorage`. Includes one-click demo login button. |
| **F2** | Set Monthly Income | User enters income for any month (e.g. Rs. 100,000). Updates on duplicate. | `app/(tabs)/income.tsx`. Custom month/year targeting, quick selection pills (50k, 100k, 150k), positive amount validation. Auto-updates existing income. |
| **F3** | Add Expense | User enters Name and Amount and saves it. | `app/modal/add-expense.tsx`. Inputs for Name, Amount, Category, Date. Validates positive number and non-empty name. |
| **F4** | Auto Deduction | Expense saved automatically deducts from income & updates balance. | `BudgetContext.tsx` real-time client-side calculation mirror + server authoritative sync. |
| **F5** | Expense Table | List of all expenses for selected month: Name, Amount, Date. | `app/(tabs)/expenses.tsx`. Scrollable list with category pills, date formatting, and search filter by name. |
| **F6** | Edit Expense | Changing expense name or amount recalculates balance correctly. | `app/modal/edit-expense.tsx`. Re-derives remaining balance instantaneously. |
| **F7** | Delete Expense | Deleting expense adds amount back to balance. | Native confirmation alert dialog (`Alert.alert`). Automatically credits amount back to balance. |
| **F8** | Summary Cards | Home screen shows 3 cards: Total Income, Total Expense, Remaining Balance. | `src/components/SummaryCards.tsx`. Executive fintech styling with emerald (income), ruby (expense), and blue/crimson (balance) badges. |
| **F9** | Month Selector | User can view and filter data from previous months. | `src/components/MonthSelectorModal.tsx`. Seamless switching across Jan–Dec and multi-year history. |
| **F10** | Logout | Clears token and returns to login screen. | `app/(tabs)/settings.tsx`. Clears AsyncStorage token & user state, routing back to auth flow. |

---

## 4. Bonus Features Implemented (+10 Extra Marks)

1. **Expense Categories & Distribution Chart:**
   - 9 standard categories: `FOOD`, `UTILITIES`, `HOUSING`, `TRANSPORT`, `HEALTH`, `ENTERTAINMENT`, `SHOPPING`, `EDUCATION`, `OTHER`.
   - Visual segmented category distribution chart in Home and Analytics tabs (`src/components/CategoryBreakdown.tsx`).

2. **80% Budget Alert & Overspending Banner:**
   - Visual alert banner (`src/components/BudgetAlertBanner.tsx`) that triggers when expenses reach $\ge 80\%$ of monthly income.
   - High-visibility crimson deficit banner with exact negative amount when budget is exceeded.

3. **Dark Mode & Light Mode:**
   - Complete fintech theme system with toggle in header and settings (`src/context/ThemeContext.tsx`).
   - Persists user theme preference.

4. **Export / Share Report:**
   - In **Analytics** tab, users can tap **"Export / Share Budget Report"** to generate a formatted text summary for sharing via WhatsApp, email, or saving to notes.

---

## 5. Building Standalone Android APK (`.apk`)

To generate a standalone APK that can be installed on any physical Android phone without Expo Go:

### Method A: EAS Build (Cloud APK Build — Recommended by Task Spec)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to Expo:
   ```bash
   eas login
   ```
3. Configure & trigger preview APK build:
   ```bash
   cd mobile
   eas build -p android --profile preview
   ```
4. EAS will compile the Android APK in the cloud and provide a direct download link (`.apk` file).

### Method B: Local Android Build (Expo Prebuild)
If you have Android Studio and Android SDK installed locally:
```bash
cd mobile
npx expo run:android --variant release
```
The compiled APK will be generated at:
`mobile/android/app/build/outputs/apk/release/app-release.apk`
