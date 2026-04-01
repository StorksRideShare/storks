#!/bin/bash

# Simple health check script for microservices

SERVICES=(
  "http://localhost:8083/actuator/health" # user-service
  "http://localhost:8088/actuator/health" # booking-service
  "http://localhost:8085/actuator/health" # admin-service
  "http://localhost:8084/actuator/health" # matching-intelligence
  "http://localhost:8086/actuator/health" # live-messaging
)

echo "🔍 Checking microservices health..."

for url in "${SERVICES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" == "200" ]; then
    echo "✅ $url is UP"
  else
    echo "❌ $url is DOWN (Status: $status)"
  fi
done

echo "🔍 Checking frontend services..."
for port in 3000 3001 3002 3003; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Port $port is LISTENING"
  else
    echo "❌ Port $port is NOT LISTENING"
  fi
done
