#!/bin/bash
#
# Rate Limiting Test Script
# Tests the rate limiting configuration on various endpoints
#
# Usage: ./scripts/test_rate_limiting.sh [endpoint] [requests]
#
# Endpoints:
#   graphql    - Test GraphQL endpoint (default)
#   login      - Test login endpoint
#   signup     - Test signup endpoint  
#   translate  - Test translations endpoint
#
# Example: ./scripts/test_rate_limiting.sh graphql 100

set -e

# Configuration
BASE_URL="${API_URL:-http://localhost:5001}"
ENDPOINT="${1:-graphql}"
NUM_REQUESTS="${2:-100}"
PARALLEL="${3:-5}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Rate Limiting Test Script${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Target: ${YELLOW}$BASE_URL${NC}"
echo -e "Endpoint: ${YELLOW}$ENDPOINT${NC}"
echo -e "Requests: ${YELLOW}$NUM_REQUESTS${NC}"
echo -e "Parallel: ${YELLOW}$PARALLEL${NC}"
echo ""

# GraphQL query for testing
GRAPHQL_QUERY='{"query":"{ __typename }"}'

# Login mutation (will fail auth but tests rate limiting)
LOGIN_MUTATION='{"query":"mutation { tokenAuth(input: {email: \"test@test.com\", password: \"wrongpassword\"}) { access } }"}'

# Signup mutation (will fail validation but tests rate limiting)
SIGNUP_MUTATION='{"query":"mutation { signUp(input: {email: \"ratelimit-test@test.com\", password: \"Test123!\"}) { access } }"}'

# Function to make requests and track responses
make_requests() {
    local url="$1"
    local data="$2"
    local method="${3:-POST}"
    local count=0
    local success=0
    local rate_limited=0
    local errors=0
    
    echo -e "${BLUE}Starting $NUM_REQUESTS requests to $url...${NC}"
    echo ""
    
    # Arrays to store response times and codes
    declare -a response_codes
    declare -a response_times
    
    start_time=$(date +%s.%N)
    
    for i in $(seq 1 $NUM_REQUESTS); do
        if [ "$method" == "POST" ]; then
            response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
                -X POST \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$url" 2>/dev/null)
        else
            response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
                "$url" 2>/dev/null)
        fi
        
        # Parse response
        http_code=$(echo "$response" | tail -2 | head -1)
        time_total=$(echo "$response" | tail -1)
        
        response_codes+=("$http_code")
        response_times+=("$time_total")
        
        # Count by status
        case "$http_code" in
            200|201)
                ((success++))
                status_color=$GREEN
                ;;
            429)
                ((rate_limited++))
                status_color=$RED
                ;;
            *)
                ((errors++))
                status_color=$YELLOW
                ;;
        esac
        
        # Progress indicator (every 10 requests)
        if [ $((i % 10)) -eq 0 ] || [ "$http_code" == "429" ]; then
            echo -e "Request $i: ${status_color}HTTP $http_code${NC} (${time_total}s)"
        fi
        
        # If rate limited, show when it happened
        if [ "$http_code" == "429" ] && [ $rate_limited -eq 1 ]; then
            echo -e "\n${RED}🚫 RATE LIMITED after $i requests!${NC}\n"
        fi
    done
    
    end_time=$(date +%s.%N)
    total_time=$(echo "$end_time - $start_time" | bc)
    
    echo ""
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}  Results Summary${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    echo -e "Total requests:    ${YELLOW}$NUM_REQUESTS${NC}"
    echo -e "Successful (2xx):  ${GREEN}$success${NC}"
    echo -e "Rate limited (429):${RED}$rate_limited${NC}"
    echo -e "Other errors:      ${YELLOW}$errors${NC}"
    echo -e "Total time:        ${YELLOW}${total_time}s${NC}"
    echo -e "Requests/second:   ${YELLOW}$(echo "scale=2; $NUM_REQUESTS / $total_time" | bc)${NC}"
    echo ""
    
    if [ $rate_limited -gt 0 ]; then
        echo -e "${GREEN}✅ Rate limiting is WORKING!${NC}"
        echo -e "   Requests were blocked after hitting the limit."
    else
        echo -e "${YELLOW}⚠️  No rate limiting detected.${NC}"
        echo -e "   Either the limit is higher than $NUM_REQUESTS requests,"
        echo -e "   or rate limiting is not configured for this endpoint."
    fi
    echo ""
}

# Function to test with parallel requests (more aggressive)
make_parallel_requests() {
    local url="$1"
    local data="$2"
    local method="${3:-POST}"
    
    echo -e "${BLUE}Making $NUM_REQUESTS parallel requests to test burst protection...${NC}"
    echo ""
    
    # Create a temporary file for results
    tmp_file=$(mktemp)
    
    start_time=$(date +%s.%N)
    
    # Use xargs for parallel execution
    if [ "$method" == "POST" ]; then
        seq 1 $NUM_REQUESTS | xargs -P $PARALLEL -I {} \
            sh -c "curl -s -w '%{http_code}\n' -o /dev/null -X POST -H 'Content-Type: application/json' -d '$data' '$url'" \
            >> "$tmp_file" 2>/dev/null
    else
        seq 1 $NUM_REQUESTS | xargs -P $PARALLEL -I {} \
            sh -c "curl -s -w '%{http_code}\n' -o /dev/null '$url'" \
            >> "$tmp_file" 2>/dev/null
    fi
    
    end_time=$(date +%s.%N)
    total_time=$(echo "$end_time - $start_time" | bc)
    
    # Count responses
    success=$(grep -c "^200$\|^201$" "$tmp_file" 2>/dev/null || echo 0)
    rate_limited=$(grep -c "^429$" "$tmp_file" 2>/dev/null || echo 0)
    errors=$(grep -c -v "^200$\|^201$\|^429$" "$tmp_file" 2>/dev/null || echo 0)
    
    rm -f "$tmp_file"
    
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}  Parallel Request Results${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    echo -e "Total requests:    ${YELLOW}$NUM_REQUESTS${NC}"
    echo -e "Parallel workers:  ${YELLOW}$PARALLEL${NC}"
    echo -e "Successful (2xx):  ${GREEN}$success${NC}"
    echo -e "Rate limited (429):${RED}$rate_limited${NC}"
    echo -e "Other errors:      ${YELLOW}$errors${NC}"
    echo -e "Total time:        ${YELLOW}${total_time}s${NC}"
    echo -e "Requests/second:   ${YELLOW}$(echo "scale=2; $NUM_REQUESTS / $total_time" | bc)${NC}"
    echo ""
    
    if [ $rate_limited -gt 0 ]; then
        echo -e "${GREEN}✅ Rate limiting is WORKING!${NC}"
    else
        echo -e "${YELLOW}⚠️  No rate limiting detected in burst test.${NC}"
    fi
    echo ""
}

# Test based on selected endpoint
case "$ENDPOINT" in
    graphql)
        echo -e "${YELLOW}Testing GraphQL endpoint rate limiting...${NC}"
        echo -e "Limit: 60/min (anonymous), 300/min (authenticated)"
        echo ""
        make_requests "$BASE_URL/api/graphql/" "$GRAPHQL_QUERY" "POST"
        ;;
    
    login)
        echo -e "${YELLOW}Testing login endpoint rate limiting...${NC}"
        echo -e "Limit: 30/min by IP"
        echo ""
        make_requests "$BASE_URL/api/graphql/" "$LOGIN_MUTATION" "POST"
        ;;
    
    signup)
        echo -e "${YELLOW}Testing signup endpoint rate limiting...${NC}"
        echo -e "Limit: 10/min by IP"
        echo ""
        make_requests "$BASE_URL/api/graphql/" "$SIGNUP_MUTATION" "POST"
        ;;
    
    translate)
        echo -e "${YELLOW}Testing translations API rate limiting...${NC}"
        echo -e "Default API rate limit"
        echo ""
        make_requests "$BASE_URL/api/translations/locales/" "" "GET"
        ;;
    
    burst)
        echo -e "${YELLOW}Testing burst protection with parallel requests...${NC}"
        echo ""
        make_parallel_requests "$BASE_URL/api/graphql/" "$GRAPHQL_QUERY" "POST"
        ;;
    
    all)
        echo -e "${YELLOW}Testing all endpoints...${NC}"
        echo ""
        
        echo -e "\n${BLUE}=== GraphQL Endpoint ===${NC}\n"
        NUM_REQUESTS=70 make_requests "$BASE_URL/api/graphql/" "$GRAPHQL_QUERY" "POST"
        
        echo -e "\n${BLUE}=== Login Endpoint ===${NC}\n"
        NUM_REQUESTS=35 make_requests "$BASE_URL/api/graphql/" "$LOGIN_MUTATION" "POST"
        
        echo -e "\n${BLUE}=== Signup Endpoint ===${NC}\n"
        NUM_REQUESTS=15 make_requests "$BASE_URL/api/graphql/" "$SIGNUP_MUTATION" "POST"
        ;;
    
    *)
        echo -e "${RED}Unknown endpoint: $ENDPOINT${NC}"
        echo ""
        echo "Available endpoints:"
        echo "  graphql   - Test GraphQL endpoint (60/min anon)"
        echo "  login     - Test login mutation (30/min)"
        echo "  signup    - Test signup mutation (10/min)"
        echo "  translate - Test translations API"
        echo "  burst     - Test with parallel requests"
        echo "  all       - Test all endpoints"
        exit 1
        ;;
esac

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Test Complete${NC}"
echo -e "${BLUE}======================================${NC}"
