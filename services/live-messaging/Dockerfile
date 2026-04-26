# Build stage
FROM gradle:8-jdk21-alpine AS build
WORKDIR /home/gradle/src
# Copy the Gradle wrapper and configuration files from the root
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copy the shared libraries and the service itself
COPY libs libs
COPY services/live-messaging services/live-messaging

# Build only the messaging service
# 1. Fix line endings
# 2. Prune settings.gradle to only include messaging and libs (prevents Gradle from looking for missing services)
RUN sed -i 's/\r$//' gradlew && \
    chmod +x gradlew && \
    sed -i '/services:/ { /live-messaging/!d }' settings.gradle && \
    ./gradlew :services:live-messaging:bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /home/gradle/src/services/live-messaging/build/libs/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]