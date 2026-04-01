# Storks Microservice - Java/Spring Boot

This service is part of the Storks Ride Share ecosystem.

## 🏗️ Technology Stack
- Java 21
- Spring Boot 3.4.5
- Gradle
- PostgreSQL / Redis / Kafka

## 🛠️ Shared Libraries
All Java services include the `libs` project via `includeBuild`.
- **Common**: `com.storks:common`
- **Configs**: `com.storks:configs`
- **Events**: `com.storks:events`

## 🚀 Running Locally

1. Ensure common libraries are built:
   ```bash
   (cd ../../libs && ./gradlew build)
   ```

2. Run the service:
   ```bash
   ./gradlew bootRun
   ```

## 📜 API Documentation
All APIs follow the `/api/v1/` prefix.

## ✅ Health Checks
Monitor health at:
- `/actuator/health`

## 🧪 Testing
Run tests:
```bash
./gradlew test
```
