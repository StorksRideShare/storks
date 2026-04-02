# Build stage
FROM golang:1.26-alpine AS build
# Set the working directory inside the container
WORKDIR /app

# Copy the go.mod and go.sum files from the service directory
COPY services/safety-and-verification/go.mod services/safety-and-verification/go.sum ./services/safety-and-verification/

# Change to the service directory and download dependencies
WORKDIR /app/services/safety-and-verification
RUN go mod download

# Copy the rest of the application code
COPY services/safety-and-verification/ .

# Build the application from the cmd directory
RUN go build -o safety-service ./cmd/safety-and-verification

# Runtime stage
FROM alpine:latest
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=build /app/services/safety-and-verification/safety-service .
EXPOSE 8089
ENTRYPOINT ["./safety-service"]
