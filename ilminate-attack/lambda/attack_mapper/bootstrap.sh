#!/usr/bin/env bash
set -euo pipefail
LAMBDA_NAME="${LAMBDA_NAME:-ilminate-attack-mapper}"
BUCKET="${ATTACK_S3_BUCKET:-ilminate-config}"
KEY="${ATTACK_S3_KEY:-attack/enterprise-attack.json}"
ROLE_ARN="${ROLE_ARN:?Set IAM role ARN with Lambda basic exec + S3 read}"

pushd lambda/attack_mapper >/dev/null
rm -f package.zip
pip install -r requirements.txt -t .
zip -r package.zip . -x "package.zip"
popd >/dev/null

aws lambda create-function \
  --function-name "$LAMBDA_NAME" \
  --runtime python3.11 \
  --role "$ROLE_ARN" \
  --handler app.handler \
  --timeout 10 \
  --memory-size 256 \
  --environment "Variables={ATTACK_S3_BUCKET=${BUCKET},ATTACK_S3_KEY=${KEY}}" \
  --zip-file "fileb://lambda/attack_mapper/package.zip" >/dev/null || \
aws lambda update-function-code --function-name "$LAMBDA_NAME" --zip-file "fileb://lambda/attack_mapper/package.zip" >/dev/null

API_NAME="ilminate-attack-api-staging"  # NEW staging API
API_ID=$(aws apigateway get-rest-apis --query "items[?name=='${API_NAME}'].id|[0]" --output text)
if [[ -z "$API_ID" || "$API_ID" == "null" ]]; then
  API_ID=$(aws apigateway create-rest-api --name "${API_NAME}" --query id --output text)
fi
PARENT_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='/'].id" --output text)
aws apigateway create-resource --rest-api-id "$API_ID" --parent-id "$PARENT_ID" --path-part map >/dev/null 2>&1 || true
RES_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='/map'].id" --output text)
aws apigateway put-method --rest-api-id "$API_ID" --resource-id "$RES_ID" --http-method POST --authorization-type "NONE" >/dev/null 2>&1 || true
URI="arn:aws:apigateway:$(aws configure get region):lambda:path/2015-03-31/functions/arn:aws:lambda:$(aws configure get region):$(aws sts get-caller-identity --query Account --output text):function:${LAMBDA_NAME}/invocations"
aws apigateway put-integration --rest-api-id "$API_ID" --resource-id "$RES_ID" --http-method POST --type AWS_PROXY --uri "$URI" >/dev/null
aws lambda add-permission --function-name "$LAMBDA_NAME" --statement-id allow-apigw --action lambda:InvokeFunction --principal apigateway.amazonaws.com >/dev/null 2>&1 || true
aws apigateway create-deployment --rest-api-id "$API_ID" --stage-name prod >/dev/null
echo "✅ STAGING API: https://${API_ID}.execute-api.$(aws configure get region).amazonaws.com/prod/map"

