# Dockerfile for location-and-navigation (Go)
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod .
COPY . .
RUN go build -o location-and-navigation main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/location-and-navigation .
EXPOSE 8080
CMD ["./location-and-navigation"]
