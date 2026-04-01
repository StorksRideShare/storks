# Dockerfile for user-service (Spring Boot Gradle)
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

COPY build.gradle .
COPY gradle ./gradle
COPY src ./src
COPY gradlew ./gradlew
RUN ./gradlew build -x test

EXPOSE 8080

CMD ["./gradlew", "bootRun"]
