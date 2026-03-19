#!/bin/bash

# Define baseUrl
BASE_URL="http://localhost:8085"
TOKEN=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDIyMkFBQSIsImtpZCI6Imluc18zQUtPcHlZa1o2WW1WUlRwUHozN1Q4d0g3aDAiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3JlYWwtYmlyZC0yMC5hY2NvdW50cy5kZXYiLCJlbWFpbCI6ImNob290eWJhYmEzMjFAZ21haWwuY29tIiwiZXhwIjoxNzczOTA1MDMyLCJmaXJzdE5hbWUiOiJLYXZpbmR1IiwiaWF0IjoxNzczOTA0OTcyLCJpc3MiOiJodHRwczovL3JlYWwtYmlyZC0yMC5jbGVyay5hY2NvdW50cy5kZXYiLCJqdGkiOiIzMTRlM2I2ZWM0Mzg1ZTNmNGI5YSIsImxhc3ROYW1lIjoiTmlybWFsIiwibmJmIjoxNzczOTA0OTY3LCJzdWIiOiJ1c2VyXzNCNzhPaEhNRnllQllmUTJyQjhoYkxFclF2WCIsInVzZXJJZCI6InVzZXJfM0I3OE9oSE1GeWVCWWZRMnJCOGhiTEVyUXZYIn0.o2kCQNB9jaP8BMh7mmPeBaqvZx3e3Aed-SIRcSckqzeSnjU5IugzEII-0ThOjiQRUm-Z36kZk5SHf6A1XwSL8ca_KnUnQfETkpsUQjyal6AdBI138pXeWFD5MKnhZmLw53NP2I0jV4NdRaM1TZ35pag_SUmvvSkzeKiEqfu2cyskdVADt1izACz5dhQv0NljvAAXI3kxJAo07YdnDEyaunYADeglBu9F_cCG2uhzB53Rz-X4Yie5MSFaeM5wI0t-YZKBzfCGxjiqdwTcQVAKvh8XjYeInkWLI8pPp8lm5FYl9VL8AtV1a587Ai1qeIPm5eWLoY9J7BR-fSWfSXBEvA

echo "=== Storks Safety & Verification API Test Script ==="
echo "Note: Ensure you have Docker Compose running and created the ride_passangers table."

# 1. Create a mocked User and mock ride setup manually in DB first, but here we can at least invoke the endpoint
# echo "\n1. Creating Mock User..."
# MOCK_RES=$(curl -s -X POST $BASE_URL/api/v1/test/mock-user -H "Content-Type: application/json" -d '{"role":"driver","provider":"mock_driver_1"}')
# echo $MOCK_RES

# Extract the Token generated from the mock user response.
# In a real shell script, we'd use jq: TOKEN=$(echo $MOCK_RES | jq -r .token)
# For manual testing, you can copy the token from the response above and set it:
# export TOKEN="mock_provider_xxx..."

# Assuming you set the TOKEN environment variable:
if [ -z "$TOKEN" ]; then
    echo "Please set TOKEN manually from the Mock User request to continue automated tests."
    exit 0
fi

echo "\n2. Request Morning OTP..."
curl -s -X POST "$BASE_URL/api/v1/otp/request?type=morning" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"group_id":"00000000-0000-0000-0000-000000000001", "ride_id":"00000000-0000-0000-0000-000000000002"}'

echo "\n\n3. Request Morning QR..."
curl -s -X POST "$BASE_URL/api/v1/qr/request?type=morning" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"group_id":"00000000-0000-0000-0000-000000000001", "ride_id":"00000000-0000-0000-0000-000000000002"}'

echo "\n\nTest script complete. Modify UUIDs for real DB records."
