# AWS Amplify Setup for Ilminate APEX

## App Information
- **App ID**: `d15dkeaak9f84h`
- **Repository**: https://github.com/cjfisher84-source/ilminate-apex
- **Region**: us-east-1

## Environment Variables Required

Configure these in AWS Amplify Console → App settings → Environment variables:

### Authentication (NextAuth)
```bash
NEXTAUTH_URL=https://main.d15dkeaak9f84h.amplifyapp.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
```

### AWS Cognito (if using)
```bash
COGNITO_CLIENT_ID=<your-cognito-client-id>
COGNITO_CLIENT_SECRET=<your-cognito-client-secret>
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/<your-user-pool-id>
COGNITO_DOMAIN=https://<your-domain>.auth.us-east-1.amazoncognito.com
```

### AWS Services
```bash
REGION=us-east-1
DYNAMODB_TABLE_NAME=ilminate-apex-events
S3_RAW_BUCKET=ilminate-apex-raw
```

### AI Services
```bash
ANTHROPIC_API_KEY=<your-anthropic-api-key>
OPENAI_API_KEY=<your-openai-api-key>
```

## Deployment Steps

### 1. Connect Repository to Amplify
```bash
# In AWS Amplify Console:
# 1. Navigate to: https://console.aws.amazon.com/amplify/home?region=us-east-1
# 2. Select app: d15dkeaak9f84h
# 3. Connect to GitHub repository: cjfisher84-source/ilminate-apex
```

### 2. Configure Build Settings
The `amplify.yml` file is already configured in the repository.

### 3. Set Environment Variables
```bash
# Via AWS CLI:
aws amplify update-app \
  --app-id d15dkeaak9f84h \
  --region us-east-1 \
  --environment-variables \
    NEXTAUTH_URL=https://main.d15dkeaak9f84h.amplifyapp.com \
    NEXTAUTH_SECRET=<your-secret> \
    REGION=us-east-1
```

Or configure via Console:
- Go to App settings → Environment variables
- Add each variable listed above
- Click "Save"

### 4. Deploy
```bash
# Push to main branch triggers automatic deployment
git push origin main

# Or manually trigger deployment in Amplify Console
```

## Service Role

Amplify needs a service role to deploy resources. Either:

1. **Let Amplify create it** (Recommended):
   - Select "Create and use a new service role" during setup

2. **Use existing role**:
   - Select `amplifyconsole-backend-role` if it exists

## Branch Configuration

### Main Branch
- **Branch**: `main`
- **Auto-deploy**: Enabled
- **Domain**: `https://main.d15dkeaak9f84h.amplifyapp.com`

### Development Branch (Optional)
- **Branch**: `dev`
- **Auto-deploy**: Enabled
- **Domain**: `https://dev.d15dkeaak9f84h.amplifyapp.com`

## Post-Deployment Verification

After deployment completes:

1. **Check deployment logs**:
   ```
   https://console.aws.amazon.com/amplify/home?region=us-east-1#/d15dkeaak9f84h
   ```

2. **Visit the app**:
   ```
   https://main.d15dkeaak9f84h.amplifyapp.com
   ```

3. **Verify environment variables are set**:
   - Check build logs for environment variable confirmation
   - All required variables should show as "set: yes"

## Troubleshooting

### Build Fails with "NEXTAUTH_SECRET not set"
- Add `NEXTAUTH_SECRET` to environment variables
- Redeploy the app

### Build Fails with Dependency Errors
- Clear cache in Amplify Console
- Redeploy

### 502 Bad Gateway
- Check build logs for errors
- Verify all environment variables are set correctly
- Check NextAuth configuration

## URLs

- **Amplify Console**: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d15dkeaak9f84h
- **Main App**: https://main.d15dkeaak9f84h.amplifyapp.com
- **GitHub Repo**: https://github.com/cjfisher84-source/ilminate-apex

## Next Steps

1. Configure custom domain (optional)
2. Set up additional environments (dev, staging)
3. Configure CI/CD workflows
4. Set up monitoring and alerts
5. Enable custom headers and redirects as needed

