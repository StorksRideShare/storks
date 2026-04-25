#!/bin/bash

BASE_URL="http://localhost:8089"
TOKEN=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDIyMkFBQSIsImtpZCI6Imluc18zQUtPcHlZa1o2WW1WUlRwUHozN1Q4d0g3aDAiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3JlYWwtYmlyZC0yMC5hY2NvdW50cy5kZXYiLCJleHAiOjE3Nzc3MTQ5MjQsImlhdCI6MTc3NzExNDkyNCwiaXNzIjoiaHR0cHM6Ly9yZWFsLWJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2IiwianRpIjoiMDM5MGNiNDgwMWRhZWIwYjlmZDEiLCJuYmYiOjE3NzcxMTQ5MTksInN1YiI6InVzZXJfM0NEeEpyWDlDdldLUm5xZ0xnc0NodGFyV0hxIn0.a_QZ6ePBItcrTNhnW4eCOzzzXgb6yfcfBluZjCEVDG-KmmKbhjJClCDc3ub_FxkuPwcgkdKT-PuBQnefJUczrTFQhK0KSwfQOkBdRT-NTF2QQ_tRZCz4ACncw1pnVpF5hJH5buIpv-il2w_BIRTz7a7jDb830SHXIYRPVTuuK545GosSMJ3L6a495cIsHXresQmv5fKbvBFsMmPifN-J5eVpEaSbp8KYIpKJL7kO79ukdTDp5xSibMwS7WkSAGlySljYKsIUEo6HCTrkEFWI4d3j7w8E2iBx7pABFC26AL_9Dc7y9ayiemdHmrIvqD6tJFus_WHsxotUR2eBjilXnA
GROUP_ID=e7303649-db50-4091-98c4-3e30266366f7
USER_ID=b5bbdba0-7c71-4a0a-b1e7-8691e5b08e01
RIDE_ID=f8820855-3a0e-4734-bdd9-8b3d5b938c1e
CHILD_ID=2ccd93c1-09b1-4c8c-9699-885f4f11b858
echo "=== Storks Safety & Verification API Test Script ==="
echo "Note: Ensure you have Docker Compose running and created the ride_passangers table."

# Enable colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
WHITE='\033[0;97m'
CYAN='\033[0;36m'
NC='\033[0m'


# Check if jq is available for pretty printing
if command -v jq &> /dev/null; then
    PRETTY_JSON="jq ."
else
    PRETTY_JSON="cat"
    echo -e "${YELLOW}⚠️  jq not installed – JSON output will be raw. Install jq for pretty formatting.${NC}"
fi

# Function to print a section header
print_section() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

# Function to make a curl request and format response
call_api() {
    local method=$1
    local url=$2
    local auth_header=$3
    local data=$4
    local description=$5

    echo -e "${YELLOW}➜ ${description}${NC}"
    echo -e "  ${GREEN} Request: ${NC} ${GRAY} $method $url ${NC}"
    if [[ -n "$data" ]]; then
        local formatted_data=$(echo "$data" | $PRETTY_JSON | sed 's/^/    /')
        echo -e "  ${GREEN} Body: ${NC} ${CYAN} $formatted_data  ${NC}"
    fi

    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" =~ ^2 ]]; then
        echo -e "  ${GREEN}✓ Status: $http_code${NC}"
    else
        echo -e "  ${RED}✗ Status: $http_code${NC}"
    fi
    
    echo " "
    echo "  Response:"
    local formatted_body=$(echo "$body" | $PRETTY_JSON | sed 's/^/    /')
    echo -e "${WHITE} $formatted_body ${NC}"
    echo ""
}

# Check token
if [ -z "$TOKEN" ] || [ "$TOKEN" = "your_token_here" ]; then
    echo -e "${RED}❌ Please set TOKEN variable in the script or environment.${NC}"
    exit 1
fi

echo -e "${GREEN}=== Storks Safety & Verification API Test Script ===${NC}"
echo -e "Base URL: $BASE_URL"
echo -e "User ID: $USER_ID"
echo -e "Ride ID: $RIDE_ID"
echo -e "Group ID: $GROUP_ID\n"

# ------------------------------------------------------------
print_section "OTP & QR REQUESTS"

call_api "POST" "$BASE_URL/api/v1/otp/request?type=morning" \
    "$TOKEN" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\"}" \
    "Request Morning OTP"

call_api "POST" "$BASE_URL/api/v1/qr/request?type=morning" \
    "$TOKEN" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\"}" \
    "Request Morning QR"

call_api "POST" "$BASE_URL/api/v1/otp/request?type=afternoon" \
    "$TOKEN" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\"}" \
    "Request Afternoon OTP"

call_api "POST" "$BASE_URL/api/v1/qr/request?type=afternoon" \
    "$TOKEN" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\", \"child_id\":\"$CHILD_ID\"}" \
    "Request Afternoon QR"

# ------------------------------------------------------------
print_section "EMERGENCY EVENTS"

call_api "POST" "$BASE_URL/api/v1/emergency/new" \
    "$TOKEN" "{\"user_id\":\"$USER_ID\", \"ride_id\":\"$RIDE_ID\", \"group_id\":\"$GROUP_ID\", \"event_type\":\"SOS\"}" \
    "SOS Emergency"

call_api "POST" "$BASE_URL/api/v1/emergency/new" \
    "$TOKEN" "{\"user_id\":\"$USER_ID\", \"ride_id\":\"$RIDE_ID\", \"group_id\":\"$GROUP_ID\", \"event_type\":\"Accident\"}" \
    "Accident Emergency"

call_api "POST" "$BASE_URL/api/v1/emergency/new" \
    "$TOKEN" "{\"user_id\":\"$USER_ID\", \"ride_id\":\"$RIDE_ID\", \"group_id\":\"$GROUP_ID\", \"event_type\":\"CheckIn\"}" \
    "Check‑In Event"

call_api "POST" "$BASE_URL/api/v1/emergency/new" \
    "$TOKEN" "{\"user_id\":\"$USER_ID\", \"ride_id\":\"$RIDE_ID\", \"group_id\":\"$GROUP_ID\", \"event_type\":\"Other\"}" \
    "Other Emergency"

echo -e "\n${GREEN}✅ Test script completed.${NC}\n"