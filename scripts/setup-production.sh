#!/usr/bin/env bash
#
# Production Environment Setup Script
# Creates all DynamoDB tables, IAM roles, and configurations needed for production
#
# Usage:
#   ./scripts/setup-production.sh [--region us-east-1] [--profile ilminate-prod]
#

set -euo pipefail

# Configuration
REGION="${AWS_REGION:-us-east-1}"
PROFILE="${AWS_PROFILE:-ilminate-prod}"
ACCOUNT_ID="${AWS_ACCOUNT_ID:-657258631769}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
    --account-id)
      ACCOUNT_ID="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Set AWS profile if provided
if [[ -n "$PROFILE" ]]; then
  export AWS_PROFILE="$PROFILE"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Ilminate APEX Production Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Region: $REGION"
echo "Profile: $PROFILE"
echo "Account ID: $ACCOUNT_ID"
echo ""

# Verify AWS credentials
echo -e "${YELLOW}Verifying AWS credentials...${NC}"
if ! aws sts get-caller-identity --region "$REGION" > /dev/null 2>&1; then
  echo -e "${RED}Error: AWS credentials not configured or invalid${NC}"
  echo "Please configure AWS credentials:"
  echo "  aws configure --profile $PROFILE"
  exit 1
fi

ACTUAL_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
if [[ "$ACTUAL_ACCOUNT" != "$ACCOUNT_ID" ]]; then
  echo -e "${YELLOW}Warning: Account ID mismatch${NC}"
  echo "Expected: $ACCOUNT_ID"
  echo "Actual: $ACTUAL_ACCOUNT"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo -e "${GREEN}✓ AWS credentials verified${NC}"
echo ""

# Step 1: Create DynamoDB Tables
echo -e "${YELLOW}Step 1: Creating DynamoDB Tables...${NC}"

# Table 1: APEX Events
echo "Creating ilminate-apex-events..."
if aws dynamodb describe-table --table-name ilminate-apex-events --region "$REGION" > /dev/null 2>&1; then
  echo -e "${YELLOW}  Table already exists, skipping...${NC}"
else
  aws dynamodb create-table \
    --table-name ilminate-apex-events \
    --attribute-definitions \
        AttributeName=customerId,AttributeType=S \
        AttributeName=timestamp,AttributeType=N \
    --key-schema \
        AttributeName=customerId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --tags Key=Application,Value=APEX Key=Environment,Value=Production Key=ManagedBy,Value=Script \
    > /dev/null
  
  echo "  Waiting for table to be active..."
  aws dynamodb wait table-exists --table-name ilminate-apex-events --region "$REGION"
  echo -e "${GREEN}  ✓ Table created${NC}"
fi

# Table 2: Quarantined Messages
echo "Creating ilminate-apex-quarantine..."
if aws dynamodb describe-table --table-name ilminate-apex-quarantine --region "$REGION" > /dev/null 2>&1; then
  echo -e "${YELLOW}  Table already exists, skipping...${NC}"
else
  aws dynamodb create-table \
    --table-name ilminate-apex-quarantine \
    --attribute-definitions \
        AttributeName=customerId,AttributeType=S \
        AttributeName=quarantineDate#messageId,AttributeType=S \
    --key-schema \
        AttributeName=customerId,KeyType=HASH \
        AttributeName=quarantineDate#messageId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --tags Key=Application,Value=APEX Key=Environment,Value=Production Key=ManagedBy,Value=Script \
    > /dev/null
  
  echo "  Waiting for table to be active..."
  aws dynamodb wait table-exists --table-name ilminate-apex-quarantine --region "$REGION"
  echo -e "${GREEN}  ✓ Table created${NC}"
fi

# Table 3: Image Scans
echo "Creating ilminate-image-scans..."
if aws dynamodb describe-table --table-name ilminate-image-scans --region "$REGION" > /dev/null 2>&1; then
  echo -e "${YELLOW}  Table already exists, skipping...${NC}"
else
  aws dynamodb create-table \
    --table-name ilminate-image-scans \
    --attribute-definitions \
        AttributeName=messageId,AttributeType=S \
        AttributeName=timestamp,AttributeType=N \
    --key-schema \
        AttributeName=messageId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --tags Key=Application,Value=APEX Key=Environment,Value=Production Key=ManagedBy,Value=Script \
    > /dev/null
  
  echo "  Waiting for table to be active..."
  aws dynamodb wait table-exists --table-name ilminate-image-scans --region "$REGION"
  echo -e "${GREEN}  ✓ Table created${NC}"
fi

echo ""

# Step 2: Create IAM Roles for Lambda Functions
echo -e "${YELLOW}Step 2: Creating IAM Roles...${NC}"

# Role for ilminate-email Lambda
ROLE_NAME_EMAIL="ilminate-email-lambda-role"
echo "Creating IAM role: $ROLE_NAME_EMAIL..."
if aws iam get-role --role-name "$ROLE_NAME_EMAIL" --region "$REGION" > /dev/null 2>&1; then
  echo -e "${YELLOW}  Role already exists, skipping...${NC}"
else
  # Create trust policy
  cat > /tmp/email-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create role
  aws iam create-role \
    --role-name "$ROLE_NAME_EMAIL" \
    --assume-role-policy-document file:///tmp/email-trust-policy.json \
    --description "IAM role for ilminate-email Lambda functions" \
    --tags Key=Application,Value=APEX Key=Environment,Value=Production \
    > /dev/null

  # Attach policies
  aws iam attach-role-policy \
    --role-name "$ROLE_NAME_EMAIL" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

  # Create and attach DynamoDB policy
  cat > /tmp/email-dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/ilminate-apex-events",
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/ilminate-apex-quarantine",
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/ilminate-image-scans"
      ]
    }
  ]
}
EOF

  aws iam put-role-policy \
    --role-name "$ROLE_NAME_EMAIL" \
    --policy-name DynamoDBAccess \
    --policy-document file:///tmp/email-dynamodb-policy.json

  echo -e "${GREEN}  ✓ Role created${NC}"
fi

# Role for ilminate-agent Lambda
ROLE_NAME_AGENT="ilminate-agent-lambda-role"
echo "Creating IAM role: $ROLE_NAME_AGENT..."
if aws iam get-role --role-name "$ROLE_NAME_AGENT" --region "$REGION" > /dev/null 2>&1; then
  echo -e "${YELLOW}  Role already exists, skipping...${NC}"
else
  # Create trust policy
  cat > /tmp/agent-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create role
  aws iam create-role \
    --role-name "$ROLE_NAME_AGENT" \
    --assume-role-policy-document file:///tmp/agent-trust-policy.json \
    --description "IAM role for ilminate-agent Lambda functions" \
    --tags Key=Application,Value=APEX Key=Environment,Value=Production \
    > /dev/null

  # Attach policies
  aws iam attach-role-policy \
    --role-name "$ROLE_NAME_AGENT" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

  # Create and attach DynamoDB policy
  cat > /tmp/agent-dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/ilminate-apex-events",
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/ilminate-image-scans"
      ]
    }
  ]
}
EOF

  aws iam put-role-policy \
    --role-name "$ROLE_NAME_AGENT" \
    --policy-name DynamoDBAccess \
    --policy-document file:///tmp/agent-dynamodb-policy.json

  echo -e "${GREEN}  ✓ Role created${NC}"
fi

# Cleanup temp files
rm -f /tmp/*-trust-policy.json /tmp/*-dynamodb-policy.json

echo ""

# Step 3: Output Role ARNs
echo -e "${YELLOW}Step 3: IAM Role ARNs${NC}"
EMAIL_ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME_EMAIL" --query 'Role.Arn' --output text)
AGENT_ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME_AGENT" --query 'Role.Arn' --output text)

echo "Email Lambda Role ARN:"
echo "  $EMAIL_ROLE_ARN"
echo ""
echo "Agent Lambda Role ARN:"
echo "  $AGENT_ROLE_ARN"
echo ""

# Step 4: Verify Tables
echo -e "${YELLOW}Step 4: Verifying Tables...${NC}"
TABLES=$(aws dynamodb list-tables --region "$REGION" --query 'TableNames[?starts_with(@, `ilminate-`)]' --output text)
echo "Created tables:"
for table in $TABLES; do
  STATUS=$(aws dynamodb describe-table --table-name "$table" --region "$REGION" --query 'Table.TableStatus' --output text)
  echo -e "  ${GREEN}✓${NC} $table ($STATUS)"
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Production Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update ilminate-email Lambda functions to use role: $EMAIL_ROLE_ARN"
echo "2. Update ilminate-agent Lambda functions to use role: $AGENT_ROLE_ARN"
echo "3. Configure environment variables in AWS Amplify"
echo "4. Test data pipeline with sample events"
echo ""
echo "See PRODUCTION_SETUP_GUIDE.md for detailed next steps."

