#!/usr/bin/env bash
#
# Production Environment Verification Script
# Verifies all DynamoDB tables, IAM roles, and configurations
#
# Usage:
#   ./scripts/verify-production.sh [--region us-east-1] [--profile ilminate-prod]
#

set -euo pipefail

# Configuration
REGION="${AWS_REGION:-us-east-1}"
PROFILE="${AWS_PROFILE:-ilminate-prod}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --region)
      REGION="$2"
      shift 2
      ;;
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

if [[ -n "$PROFILE" ]]; then
  export AWS_PROFILE="$PROFILE"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Production Environment Verification${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

ERRORS=0

# Check DynamoDB Tables
echo -e "${YELLOW}Checking DynamoDB Tables...${NC}"
TABLES=("ilminate-apex-events" "ilminate-apex-quarantine" "ilminate-image-scans")

for table in "${TABLES[@]}"; do
  if aws dynamodb describe-table --table-name "$table" --region "$REGION" > /dev/null 2>&1; then
    STATUS=$(aws dynamodb describe-table --table-name "$table" --region "$REGION" --query 'Table.TableStatus' --output text)
    if [[ "$STATUS" == "ACTIVE" ]]; then
      echo -e "${GREEN}  ✓${NC} $table (ACTIVE)"
    else
      echo -e "${YELLOW}  ⚠${NC} $table ($STATUS)"
      ((ERRORS++))
    fi
  else
    echo -e "${RED}  ✗${NC} $table (NOT FOUND)"
    ((ERRORS++))
  fi
done

echo ""

# Check IAM Roles
echo -e "${YELLOW}Checking IAM Roles...${NC}"
ROLES=("ilminate-email-lambda-role" "ilminate-agent-lambda-role")

for role in "${ROLES[@]}"; do
  if aws iam get-role --role-name "$role" > /dev/null 2>&1; then
    ARN=$(aws iam get-role --role-name "$role" --query 'Role.Arn' --output text)
    echo -e "${GREEN}  ✓${NC} $role"
    echo "      ARN: $ARN"
  else
    echo -e "${RED}  ✗${NC} $role (NOT FOUND)"
    ((ERRORS++))
  fi
done

echo ""

# Summary
if [[ $ERRORS -eq 0 ]]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo -e "${GREEN}========================================${NC}"
  exit 0
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}✗ Found $ERRORS issue(s)${NC}"
  echo -e "${RED}========================================${NC}"
  exit 1
fi


