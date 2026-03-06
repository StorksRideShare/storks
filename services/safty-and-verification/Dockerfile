# ---- Build stage ----
FROM eclipse-temurin:21.0.10_7-jdk-ubi10-minimal AS builder
WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
# Copy source code
COPY src src

# Make gradlew executable and build the application
RUN chmod +x gradlew
RUN ./gradlew bootJar

# ---- Run stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose the application port
EXPOSE 8084

# Run the JAR
ENTRYPOINT ["java", "-jar", "-Dserver.port=8084", "app.jar"]