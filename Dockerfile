# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# Stage 1: Dependency Cache
# -----------------------------------------------------------------------------
FROM gradle:8-jdk21-alpine AS build-cache
WORKDIR /home/gradle/src

# Copy only the configuration files first
COPY --chown=gradle:gradle settings.gradle build.gradle gradlew gradlew.bat ./
COPY --chown=gradle:gradle gradle ./gradle

# Copy all project build.gradle files to cache dependencies
COPY --chown=gradle:gradle libs/common/build.gradle ./libs/common/
COPY --chown=gradle:gradle libs/configs/build.gradle ./libs/configs/
COPY --chown=gradle:gradle libs/events/build.gradle ./libs/events/
COPY --chown=gradle:gradle libs/models/build.gradle ./libs/models/
COPY --chown=gradle:gradle services/admin-and-analytics/build.gradle ./services/admin-and-analytics/
COPY --chown=gradle:gradle services/booking-and-payment/build.gradle ./services/booking-and-payment/
COPY --chown=gradle:gradle services/live-messaging/build.gradle ./services/live-messaging/
COPY --chown=gradle:gradle services/matching-intelligence/build.gradle ./services/matching-intelligence/
COPY --chown=gradle:gradle services/user-service/build.gradle ./services/user-service/

# Download dependencies (this will be cached)
RUN gradle dependencies --no-daemon || true

# -----------------------------------------------------------------------------
# Stage 2: Full Build
# -----------------------------------------------------------------------------
FROM build-cache AS build
WORKDIR /home/gradle/src

# Copy the rest of the source code
COPY --chown=gradle:gradle . .

# Build all libraries and services
RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle :services:admin-and-analytics:bootJar \
           :services:booking-and-payment:bootJar \
           :services:live-messaging:bootJar \
           :services:matching-intelligence:bootJar \
           :services:user-service:bootJar \
           --no-daemon -x test

# -----------------------------------------------------------------------------
# Runtime Stages
# -----------------------------------------------------------------------------

# Admin Service
FROM eclipse-temurin:21-jre-alpine AS admin-service
WORKDIR /app
COPY --from=build /home/gradle/src/services/admin-and-analytics/build/libs/app.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]

# Booking Service
FROM eclipse-temurin:21-jre-alpine AS booking-service
WORKDIR /app
COPY --from=build /home/gradle/src/services/booking-and-payment/build/libs/app.jar app.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "app.jar"]

# User Service
FROM eclipse-temurin:21-jre-alpine AS user-service
WORKDIR /app
COPY --from=build /home/gradle/src/services/user-service/build/libs/app.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]

# Matching Intelligence
FROM eclipse-temurin:21-jre-alpine AS matching-intelligence
WORKDIR /app
COPY --from=build /home/gradle/src/services/matching-intelligence/build/libs/app.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]

# Live Messaging
FROM eclipse-temurin:21-jre-alpine AS live-messaging
WORKDIR /app
COPY --from=build /home/gradle/src/services/live-messaging/build/libs/app.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
