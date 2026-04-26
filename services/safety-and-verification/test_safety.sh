#!/bin/bash

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:8089"}
TOKEN=${TOKEN:-"eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDIyMkFBQSIsImtpZCI6Imluc18zQUtPcHlZa1o2WW1WUlRwUHozN1Q4d0g3aDAiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3JlYWwtYmlyZC0yMC5hY2NvdW50cy5kZXYiLCJleHAiOjE3Nzc3MTQ5MjQsImlhdCI6MTc3NzExNDkyNCwiaXNzIjoiaHR0cHM6Ly9yZWFsLWJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2IiwianRpIjoiMDM5MGNiNDgwMWRhZWIwYjlmZDEiLCJuYmYiOjE3NzcxMTQ5MTksInN1YiI6InVzZXJfM0NEeEpyWDlDdldLUm5xZ0xnc0NodGFyV0hxIn0.a_QZ6ePBItcrTNhnW4eCOzzzXgb6yfcfBluZjCEVDG-KmmKbhjJClCDc3ub_FxkuPwcgkdKT-PuBQnefJUczrTFQhK0KSwfQOkBdRT-NTF2QQ_tRZCz4ACncw1pnVpF5hJH5buIpv-il2w_BIRTz7a7jDb830SHXIYRPVTuuK545GosSMJ3L6a495cIsHXresQmv5fKbvBFsMmPifN-J5eVpEaSbp8KYIpKJL7kO79ukdTDp5xSibMwS7WkSAGlySljYKsIUEo6HCTrkEFWI4d3j7w8E2iBx7pABFC26AL_9Dc7y9ayiemdHmrIvqD6tJFus_WHsxotUR2eBjilXnA"}
GROUP_ID=${GROUP_ID:-"e7303649-db50-4091-98c4-3e30266366f7"}
USER_ID=${USER_ID:-"b5bbdba0-7c71-4a0a-b1e7-8691e5b08e01"}
RIDE_ID=${RIDE_ID:-"f8820855-3a0e-4734-bdd9-8b3d5b938c1e"}
CHILD_ID=${CHILD_ID:-"2ccd93c1-09b1-4c8c-9699-885f4f11b858"}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
WHITE='\033[0;97m'
NC='\033[0m'

if command -v jq &> /dev/null; then
    PRETTY_JSON="jq ."
else
    PRETTY_JSON="cat"
fi

print_header() {
    echo -e "\n${BLUE}========================================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================================================${NC}"
}

call_api() {
    local method=$1
    local url=$2
    local body=$3
    local desc=$4
    local expected_status=$5

    echo -e "${MAGENTA}[TEST] ${desc}${NC}"
    echo -e "  ${GRAY}Request:  ${NC} ${method} ${url}"
    
    if [ -n "$body" ]; then
        local formatted_body=$(echo "$body" | $PRETTY_JSON | sed 's/^/    /')
        echo -e "  ${GRAY}Payload:  ${NC}\n${CYAN}$formatted_body${NC}"
    fi

    local response
    local http_code
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" -H "Authorization: Bearer $TOKEN")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$body")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" == "$expected_status" ]; then
        echo -e "  ${GREEN}✓ Success (${http_code})${NC}"
    else
        echo -e "  ${RED}✗ Failed. Expected: $expected_status, Got: $http_code${NC}"
    fi

    local formatted_body=$(echo "$body" | $PRETTY_JSON | sed 's/^/    /')
    echo -e "  ${GRAY}Response: ${NC}\n${WHITE}$formatted_body${NC}\n"
}

echo -e "${GREEN}=== Storks Safety & Verification Comprehensive Test Suite ===${NC}"
echo -e "Target URL: $BASE_URL"
echo -e "Testing 10+ core endpoints and failure scenarios."

print_header "1. SYSTEM CHECKS"
call_api "GET" "$BASE_URL/api/v1/health" "" "Health Check Validation" "200"

print_header "2. MORNING VERIFICATION FLOW"
call_api "POST" "$BASE_URL/api/v1/otp/request?type=morning" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\"}" "Request Morning OTP" "200"
call_api "POST" "$BASE_URL/api/v1/otp/verify?type=morning" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\", \"otp\":\"123456\"}" "Verify Morning OTP (Failure Case)" "400"
call_api "POST" "$BASE_URL/api/v1/qr/request?type=morning" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\"}" "Request Morning QR" "200"
call_api "POST" "$BASE_URL/api/v1/qr/verify?type=morning" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\", \"qr_payload\":\"invalid-payload\"}" "Verify Morning QR (Failure Case)" "400"

print_header "3. AFTERNOON VERIFICATION FLOW"
call_api "POST" "$BASE_URL/api/v1/otp/request?type=afternoon" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\"}" "Request Afternoon OTP" "200"
call_api "POST" "$BASE_URL/api/v1/qr/request?type=afternoon" "{\"group_id\":\"$GROUP_ID\", \"ride_id\":\"$RIDE_ID\", \"child_id\":\"$CHILD_ID\"}" "Request Afternoon QR" "200"

print_header "4. EMERGENCY EVENT TRIGGERS"
call_api "POST" "$BASE_URL/api/v1/emergency/new" "{\"user_id\":\"$USER_ID\", \"ride_id\":\"$RIDE_ID\", \"group_id\":\"$GROUP_ID\", \"event_type\":\"SOS\"}" "Trigger SOS Emergency" "200"
call_api "POST" "$BASE_URL/api/v1/emergency/new" "{\"user_id\":\"$USER_ID\", \"ride_id\":\"$RIDE_ID\", \"group_id\":\"$GROUP_ID\", \"event_type\":\"Accident\"}" "Trigger Accident Emergency" "200"
call_api "POST" "$BASE_URL/api/v1/emergency/new" "{\"user_id\":\"$USER_ID\", \"ride_id\":\"$RIDE_ID\", \"group_id\":\"$GROUP_ID\", \"event_type\":\"CheckIn\"}" "Trigger Check-In Event" "200"
call_api "POST" "$BASE_URL/api/v1/emergency/new" "{\"user_id\":\"$USER_ID\", \"ride_id\":\"$RIDE_ID\", \"group_id\":\"$GROUP_ID\", \"event_type\":\"Other\"}" "Trigger Fallback/Other Emergency" "200"

print_header "5. BACKGROUND SCHEDULER"
call_api "POST" "$BASE_URL/api/v1/demo/scheduler/trigger" "" "Trigger Demo Scheduler Job" "200"

echo -e "${GREEN}=== Comprehensive Test Suite Execution Complete ===${NC}"
