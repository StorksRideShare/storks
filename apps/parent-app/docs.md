

# 📱 Project Setup Guide

This guide will help you set up and run the **mobile app**, **backend server**, and **tests**.

---

## 🔄 1. Get Latest Code from GitHub

```
git checkout feature/booking-driver
git pull origin feature/booking-driver
```

---

## 🔧 1. Change IP Address (IMPORTANT)

The app needs your computer’s IP address to connect to the backend.

### Step 1: Get Your IP Address

Open Command Prompt and run:

```
ipconfig
```

Look for:

```
Wireless LAN adapter Wi-Fi:

   IPv4 Address. . . . . . . . . . . : 10.48.224.185
```

👉 Your **IPv4 Address** (e.g., `10.48.224.185`) is your IP.

---

### Step 2: Update `.env` File

Go to:

```
apps/parent-app/.env
```

Update this line:

```
EXPO_PUBLIC_SERVER_IP=10.48.224.185
```

---

## 🚀 2. Run the Backend Server

```
cd services/booking-and-payment
./gradlew bootRun
```

---

## 📱 3. Run the Mobile App

```
cd apps/parent-app
npx expo start
```

After starting:

* Press **`a`** → Open Android Emulator
* Press **`w`** → Open Web version
* Press **`r`** → To restart

---

## 🧪 4. Run Tests

```
cd services/booking-and-payment
./gradlew test --rerun-tasks
```

---

## 📂 Test Files Location

```
services/booking-and-payment/src/test/java/wdse17/bookingandpayment/service
```

---

## 🔍 5. Where to Find Validations

Backend validation logic is inside:

```
services/booking-and-payment/src/main/java/wdse17/bookingandpayment/service
```

---

## ⚠️ Common Tips

* ✅ Make sure your **phone and computer are on the same Wi-Fi**
* 🔁 If the app can’t connect → recheck your IP address
* 🔄 Restart Expo after changing the `.env` file

