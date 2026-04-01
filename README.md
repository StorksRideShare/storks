# Storks Ride Share - Microservices Ecosystem

Modernized microservices architecture for the Storks Ride Share application.

## 🏗️ Architecture Overview

The system is built on a distributed microservices architecture using Java (Spring Boot) and Go, with a robust shared infrastructure.

### Apps
- **Website**: Marketing site (Astro).
- **Parent App**: Mobile application for parents (Expo).
- **Driver App**: Mobile application for drivers (Expo).
- **Admin Web**: Back-office management portal (Next.js).

### Microservices
- **User Service**: Identity and profile management.
- **Booking Service**: Trip bookings and payment processing.
- **Location Service**: Real-time tracking and navigation (Go).
- **Matching Intelligence**: Algorithmic matching of drivers and riders.
- **Live Messaging**: Real-time communication via WebSockets.
- **Safety Service**: Verification and safety monitoring (Go).
- **Admin Service**: Analytics and system-wide management.

### Shared Infrastructure
- **Postgres**: Primary relational database.
- **Redis**: Distributed caching and session management.
- **Kafka**: Event-driven communication (Apache Kafka).
- **Nginx**: API Gateway and routing.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js & PNPM
- Java 21 & Gradle

### Local Development

1. **Bootstrap Infrastructure**:
   ```bash
   docker-compose up -d postgres redis kafka
   ```

2. **Run Services**:
   ```bash
   docker-compose up -d
   ```

3. **Check Health**:
   ```bash
   ./scripts/health-check.sh
   ```

## 🛠️ Shared Libraries (`libs/`)
- `common`: Base exceptions, DTOs, and utilities.
- `configs`: Standard Spring Boot configurations for Redis and Kafka.
- `events`: Shared event schemas for inter-service communication.

## 📜 API Versioning
All APIs are versioned and follow the `/api/v1/` prefix.
- `GET /api/v1/users/profile`
- `POST /api/v1/bookings/request`
- ...

## 🧪 Testing
Run tests from the root or within individual service directories:
```bash
./gradlew test
```
