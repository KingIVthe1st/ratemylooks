#!/bin/bash

# RateMyLooks.ai Worker Endpoint Testing Script
# This script tests all Worker endpoints to ensure they're functioning correctly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to local development URL
WORKER_URL="${1:-http://localhost:8787}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing RateMyLooks.ai Worker${NC}"
echo -e "${BLUE}URL: $WORKER_URL${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Counter for passed/failed tests
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5

    echo -e "${YELLOW}Testing: $name${NC}"

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$WORKER_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$WORKER_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    # Extract status code and body
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    # Check if status code matches expected
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Status: $status_code"
        echo -e "Response: ${body:0:150}..."
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} - Expected: $expected_status, Got: $status_code"
        echo -e "Response: $body"
        ((FAILED++))
    fi
    echo ""
}

# Test 1: Health Check
test_endpoint \
    "Health Check" \
    "GET" \
    "/health" \
    "" \
    "200"

# Test 2: Root Endpoint
test_endpoint \
    "Root Endpoint" \
    "GET" \
    "/" \
    "" \
    "200"

# Test 3: Get Pricing
test_endpoint \
    "Get Pricing" \
    "GET" \
    "/api/payment/pricing" \
    "" \
    "200"

# Test 4: Get Analysis Limits
test_endpoint \
    "Get Analysis Limits" \
    "GET" \
    "/api/analyze/limits" \
    "" \
    "200"

# Test 5: Get Supported Formats
test_endpoint \
    "Get Supported Formats" \
    "GET" \
    "/api/analyze/formats" \
    "" \
    "200"

# Test 6: Test AI Connection
test_endpoint \
    "Test AI Connection" \
    "GET" \
    "/api/test-ai" \
    "" \
    "200"

# Test 7: 404 Not Found
test_endpoint \
    "404 Not Found" \
    "GET" \
    "/nonexistent-route" \
    "" \
    "404"

# Test 8: CORS Preflight
echo -e "${YELLOW}Testing: CORS Preflight${NC}"
cors_response=$(curl -s -w "\n%{http_code}" -X OPTIONS "$WORKER_URL/api/analyze" \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST")
cors_status=$(echo "$cors_response" | tail -n1)

if [ "$cors_status" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - CORS Preflight: $cors_status"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - CORS Preflight: $cors_status"
    ((FAILED++))
fi
echo ""

# Test 9: Base64 Analysis (Missing Data - Should Fail)
test_endpoint \
    "Base64 Analysis - No Data" \
    "POST" \
    "/api/analyze/base64" \
    '{"options":{}}' \
    "400"

# Test 10: Create Checkout (Invalid Tier)
test_endpoint \
    "Create Checkout - Invalid Tier" \
    "POST" \
    "/api/payment/create-checkout" \
    '{"tier":"invalid","email":"test@example.com"}' \
    "400"

# Test 11: Create Checkout (Valid Test Mode)
test_endpoint \
    "Create Checkout - Valid Tier" \
    "POST" \
    "/api/payment/create-checkout" \
    '{"tier":"basic","email":"test@example.com","ratingId":"test-123"}' \
    "200"

# Test 12: Verify Payment (No Session)
test_endpoint \
    "Verify Payment - No Session" \
    "POST" \
    "/api/payment/verify-payment" \
    '{}' \
    "200"

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${BLUE}Total:  $((PASSED + FAILED))${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed${NC}"
    exit 1
fi
