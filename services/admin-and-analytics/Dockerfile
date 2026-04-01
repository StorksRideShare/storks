FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src ./src

RUN ./mvnw dependency:go-offline -B
RUN ./mvnw package -DskipTests

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]

