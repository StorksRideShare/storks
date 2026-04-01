FROM golang:1.26.1-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go env -w GOPROXY=https://goproxy.io,direct
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o safty-service ./cmd/safty-and-verification

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/safty-service .

# Add tzdata for the timezone loading in Go
RUN apk add --no-cache tzdata
ENV TZ=Asia/Colombo

EXPOSE 8085
CMD ["./safty-service"]
