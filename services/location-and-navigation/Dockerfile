# Build stage
FROM golang:1.26-alpine AS build
# Set the working directory inside the container
WORKDIR /app

# Copy the go.mod and go.sum files from the service directory
COPY services/location-and-navigation/go.mod services/location-and-navigation/go.sum ./services/location-and-navigation/

# Change to the service directory and download dependencies
WORKDIR /app/services/location-and-navigation
RUN go mod download

# Copy the rest of the application code
COPY services/location-and-navigation/ .

# Build the application
RUN go build -o location-service main.go

# Runtime stage
FROM alpine:latest
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=build /app/services/location-and-navigation/location-service .
EXPOSE 8082
ENTRYPOINT ["./location-service"]
