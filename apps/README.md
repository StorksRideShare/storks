# Storks Apps Ecosystem

This directory contains our frontend and mobile applications.

## 📱 Mobile Apps
Both mobile apps are built with **Expo (React Native)**.

### [Parent App](./parent-app)
- **Purpose**: Unified platform for parents to manage child rides, track trips, and communicate with drivers.
- **Tech Stack**: Expo, React Native, Gluestack UI, Clerk Auth.
- **Port**: 3001 (Dev), 8081 (Internal)

### [Driver App](./driver-app)
- **Purpose**: Dedicated app for drivers to manage trips, QR verification, and real-time navigation.
- **Tech Stack**: Expo, React Native.
- **Port**: 3002

## 🖥️ Web Apps

### [Admin Web](./admin-web)
- **Purpose**: Back-office dashboard for ride monitoring, user verification, and analytics.
- **Tech Stack**: Next.js, React.
- **Port**: 3003

### [Website (Placeholder)](./website)
- **Purpose**: Marketing and landing page (User will initialize with Astro).
- **Port**: 3000

## 🚀 Running Apps Locally

1. **Setup dependencies**:
   ```bash
   pnpm install
   ```

2. **Run an app**:
   ```bash
   cd <app-directory>
   pnpm dev # for Next.js/Website
   pnpm expo start # for Mobile apps
   ```
