ARG GO_VERSION=1.25.6

FROM golang:${GO_VERSION} AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV CGO_ENABLED=0
RUN go build -o chat-service ./cmd/api

FROM alpine:3.19
WORKDIR /app

COPY --from=builder /app/chat-service .

EXPOSE 8089
CMD ["./chat-service"]