#!/bin/bash

# Define baseUrl
BASE_URL="http://localhost:8085"
TOKEN=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDIyMkFBQSIsImtpZCI6Imluc18zQUtPcHlZa1o2WW1WUlRwUHozN1Q4d0g3aDAiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3JlYWwtYmlyZC0yMC5hY2NvdW50cy5kZXYiLCJleHAiOjE3NzQ2MTcxMDcsImlhdCI6MTc3NDAxNzEwNywiaXNzIjoiaHR0cHM6Ly9yZWFsLWJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2IiwianRpIjoiYTdlNTAxZmViMGE0ZGQ5MTdmZmUiLCJuYmYiOjE3NzQwMTcxMDIsInN1YiI6InVzZXJfM0I3OE9oSE1GeWVCWWZRMnJCOGhiTEVyUXZYIn0.EcOy5O5dO0Ehn_icB2ahC2e5GJtWmlWtHeLRBF_-M2lMsrsm-sZHJx6RBaNQVGKRUIL-hLEL3pPSbts3XudKJ9nuDsrPAfN_tJ3TiGvmPP-cC3KVDpKFgvQPNjkkDwhXpsEs1rKeM6SRDf5ofezCmvv0sr3sF3e6xg18mByVvs3PMANtrrV_T_4VgTBolcL7kyjAU4O0VQABE13GY5w6_Fx-FcxQV-Kmvf4-YoF2nXCJ0ZZDkaWgYxu_SI3gdY8JmSSLZK5V8AgQctzraipzL_KZ6KXnS08sRMdbtBIxgqcDDrCYYlF22qUvk_MVSmUvLMj2qBLYwUTouE1LGY4gBQ

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
    
curl -s -X POST "$BASE_URL/api/v1/otp/request?type=afternoon" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"group_id":"00000000-0000-0000-0000-000000000001", "ride_id":"00000000-0000-0000-0000-000000000002"}'

echo "\n\n3. Request Morning QR..."
curl -s -X POST "$BASE_URL/api/v1/qr/request?type=afternoon" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"group_id":"00000000-0000-0000-0000-000000000001", "ride_id":"00000000-0000-0000-0000-000000000002"}'


echo "\n\nTest script complete. Modify UUIDs for real DB records."
