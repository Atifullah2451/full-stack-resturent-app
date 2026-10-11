# 🍽️ Savoria - Production Full-Stack Restaurant Ordering & Table Booking App

A complete, production-quality restaurant mobile app MVP built with **React Native (Expo)**, **Node.js & Express REST API**, and **Firebase (Authentication & Cloud Firestore)**.

---

## 📁 1. Full Folder Structure

```
restaurant-app/
├── firestore.rules                  # Production security rules for Firestore
├── backend/                         # Node.js + Express REST API
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Excludes node_modules, keys, logs
│   ├── package.json                 # Express, firebase-admin, cors, validation
│   ├── server.js                    # Express entry point, middleware, routes
│   ├── serviceAccountKey.json       # (Generated from Firebase Console, gitignored)
│   ├── scripts/
│   │   └── seed.js                  # Seeds 18 gourmet menu items to Firestore
│   └── src/
│       ├── config/
│       │   └── firebaseAdmin.js     # Firebase Admin SDK initialization
│       ├── controllers/
│       │   ├── authController.js    # User sync & profile management
│       │   ├── bookingController.js # Table availability & clash prevention
│       │   ├── menuController.js    # Catalog, filter, sort, category counts
│       │   └── orderController.js   # Order placement, tax math, status updates
│       ├── middleware/
│       │   ├── authMiddleware.js    # Verifies Firebase ID token Bearer
│       │   └── errorHandler.js      # Centralized error handler & 404
│       └── routes/
│           ├── authRoutes.js        # /api/auth/*
│           ├── bookingRoutes.js     # /api/bookings/*
│           ├── menuRoutes.js        # /api/menu/*
│           └── orderRoutes.js       # /api/orders/*
│
└── mobile-app/                      # React Native Expo Mobile App (Android & iOS)
    ├── App.js                       # Root component with Providers
    ├── app.json                     # Expo & Android package configuration
    ├── babel.config.js              # Babel preset for Expo
    ├── package.json                 # Expo SDK 51, React Native, Firebase, Nav
    └── src/
        ├── components/
        │   ├── CategoryChip.js      # Category filter chips
        │   ├── CustomButton.js      # Primary/outline buttons with spinners
        │   ├── CustomInput.js       # Inputs with icons and error states
        │   ├── EmptyState.js        # Polished empty lists
        │   ├── LoadingSpinner.js    # Themed activity indicator
        │   └── MenuItemCard.js      # Dish card with image, rating, add button
        ├── config/
        │   ├── api.js               # REST client with dynamic LAN/Emulator IP
        │   └── firebase.js          # Client SDK (Auth + Firestore + AsyncStorage)
        ├── constants/
        │   └── theme.js             # Warm orange/terracotta culinary theme
        ├── context/
        │   ├── AuthContext.js       # Auth state, login/signup, profile sync
        │   └── CartContext.js       # Cart items, qty, tax math, local persistence
        ├── navigation/
        │   └── AppNavigator.js      # Bottom Tabs (5 tabs) + Stack routes
        └── screens/
            ├── auth/
            │   ├── ForgotPasswordScreen.js
            │   ├── LoginScreen.js
            │   └── RegisterScreen.js
            └── main/
                ├── BookingsScreen.js     # Table booking with slot conflict check
                ├── CartScreen.js         # Cart list, delivery address, place order
                ├── HomeScreen.js         # Menu listing, promo banner, pull-to-refresh
                ├── ItemDetailScreen.js   # Nutrition, full description, quantity
                ├── OrderHistoryScreen.js # Live status badges (Pending/Preparing/Ready)
                ├── ProfileScreen.js      # Profile editor, server IP config
                └── SearchScreen.js       # Debounced search & filter modal
```

---

## 🔒 2. Firestore Security Rules

See `/firestore.rules` for full rules. Summary:
- **`menu`**: Publicly readable (`allow read: if true;`), writes restricted to backend Admin SDK (`allow write: if false;`).
- **`users`**: Authenticated users can only read and write their own profile (`request.auth.uid == userId`).
- **`orders`**: Authenticated users can read and create their own orders (`resource.data.userId == request.auth.uid`). Modifying status is handled securely by the backend API.
- **`bookings`**: Users can read and create their own reservations. Users can only update their own booking to `status == 'cancelled'`.

---

## 🚀 3. Step-by-Step Setup & Run Instructions

### Step 3.1: Firebase Setup & Service Account
1. Open the [Firebase Console](https://console.firebase.google.com/) for project **`myresturent-13093`**.
2. **Enable Authentication**:
   - Go to **Authentication** > **Sign-in method**.
   - Enable **Email/Password**.
3. **Enable Cloud Firestore**:
   - Go to **Firestore Database** > **Create database**.
   - Copy the rules from `/firestore.rules` into the **Rules** tab and click **Publish**.
4. **Generate Service Account Key for Backend**:
   - In Firebase Console, click the ⚙️ **Project settings** gear icon.
   - Go to the **Service accounts** tab.
   - Click **Generate new private key** and confirm.
   - Rename the downloaded file to `serviceAccountKey.json`.
   - Place this file in the `backend/` folder: `backend/serviceAccountKey.json`.

---

### Step 3.2: Run Backend & Seed Data

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Seed 18 gourmet restaurant menu items to Firestore
npm run seed

# 4. Start the Express development server
npm run dev
# Or production mode:
npm start
```
The console will output:
```
🚀 Savoria Restaurant Backend is running on PORT: 5000
📱 Local Machine:   http://localhost:5000
📱 Real Phone / LAN: http://192.168.1.XX:5000
🤖 Android Emulator: http://10.0.2.2:5000
```

---

### Step 3.3: Run the React Native Mobile App

```bash
# 1. Open a new terminal and navigate to mobile-app
cd mobile-app

# 2. Install dependencies
npm install

# 3. Start Expo development server
npx expo start
```

#### Running on Android Emulator:
- Press `a` in the terminal to launch the app on your running Android Studio emulator.
- The app automatically connects to `http://10.0.2.2:5000` for backend communication.

#### Running on Physical Android Phone via Expo Go:
1. Install **Expo Go** from Google Play Store on your Android phone.
2. Ensure your phone and development computer are connected to the **SAME Wi-Fi network**.
3. Scan the QR code displayed in the Expo terminal with Expo Go.
4. Open the **Profile tab** > tap **Backend API Server IP**, and enter your computer's LAN IP:
   `http://192.168.1.XX:5000` (substitute `192.168.1.XX` with your computer's local Wi-Fi IP).

---

## 📦 4. Building the Standalone Android APK (EAS Build)

To build a standalone installable `.apk` file that you can install directly on any Android device without needing Expo Go:

### Step 4.1: Install EAS CLI and Log In
```bash
npm install -g eas-cli
eas login
```

### Step 4.2: Configure EAS Build
Inside `mobile-app/`:
```bash
cd mobile-app
eas build:configure
```
This generates `eas.json`. Update `eas.json` to configure APK output:

```json
{
  "cli": {
    "version": ">= 9.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Step 4.3: Trigger APK Build
```bash
eas build -p android --profile preview
```
1. Expo Application Services (EAS) will compile the Android build in the cloud.
2. When finished, EAS provides a direct download link and QR code to download the standalone `.apk` to your phone!
