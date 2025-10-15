# Ilminate APEX - Deployment Guide

## ✅ Repository Setup Complete

- **GitHub Repository**: https://github.com/cjfisher84-source/ilminate-apex
- **AWS Amplify App ID**: `d15dkeaak9f84h`
- **Project Structure**: Next.js 13 with TypeScript and Tailwind CSS
- **Status**: Ready for Amplify deployment

## 🚀 Quick Deploy to AWS Amplify

### Step 1: Connect GitHub to Amplify

1. Go to AWS Amplify Console:
   ```
   https://console.aws.amazon.com/amplify/home?region=us-east-1#/d15dkeaak9f84h
   ```

2. If not already connected, click **"Connect repository"**

3. Select:
   - **GitHub** as the source
   - **Repository**: `cjfisher84-source/ilminate-apex`
   - **Branch**: `main`

4. Click **"Next"**

### Step 2: Review Build Settings

The build settings are automatically configured via `amplify.yml` in the repo.

- Review the settings
- Click **"Next"**

### Step 3: Configure Service Role

Select one of:
- ✅ **Create and use a new service role** (Recommended for new setup)
- Or select existing: `amplifyconsole-backend-role`

Click **"Next"**

### Step 4: Set Environment Variables

⚠️ **CRITICAL**: Add these environment variables before deploying:

Go to **App settings → Environment variables** and add:

#### Required Variables
```bash
NEXTAUTH_URL=https://main.d15dkeaak9f84h.amplifyapp.com
NEXTAUTH_SECRET=<generate-with-command-below>
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### Optional (Add as needed)
```bash
# AWS Services
REGION=us-east-1
DYNAMODB_TABLE_NAME=ilminate-apex-events
S3_RAW_BUCKET=ilminate-apex-raw

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...

# Cognito (if using)
COGNITO_CLIENT_ID=...
COGNITO_CLIENT_SECRET=...
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/...
COGNITO_DOMAIN=https://....auth.us-east-1.amazoncognito.com
```

### Step 5: Save and Deploy

1. Click **"Save and deploy"**
2. Wait 5-10 minutes for build to complete
3. Monitor build logs for any issues

### Step 6: Verify Deployment

Once deployed, visit:
```
https://main.d15dkeaak9f84h.amplifyapp.com
```

You should see the APEX landing page with:
- ✅ AI-powered threat analysis card
- ✅ Automated triage card
- ✅ Real-time monitoring card

## 📦 Project Structure

```
ilminate-apex/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   └── lib/                 # Utilities
├── public/                  # Static assets
├── amplify.yml             # Amplify build config
├── package.json            # Dependencies
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
└── AMPLIFY_SETUP.md        # Detailed setup guide
```

## 🔧 Local Development

### Install Dependencies
```bash
npm install
```

### Create Local Environment File
```bash
# Create .env.local
cat > .env.local << EOF
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOF
```

### Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## 🌐 AWS Amplify URLs

- **Amplify Console**: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d15dkeaak9f84h
- **Main Branch**: https://main.d15dkeaak9f84h.amplifyapp.com
- **GitHub Repo**: https://github.com/cjfisher84-source/ilminate-apex

## 📝 Environment Variables Checklist

Use this checklist when setting up environments:

- [ ] `NEXTAUTH_URL` - Set to Amplify domain
- [ ] `NEXTAUTH_SECRET` - Generate unique secret
- [ ] `REGION` - Set to us-east-1
- [ ] `ANTHROPIC_API_KEY` - For Claude AI
- [ ] `OPENAI_API_KEY` - For OpenAI GPT
- [ ] Cognito credentials (if using)
- [ ] AWS service credentials (DynamoDB, S3, etc.)

## 🐛 Troubleshooting

### Build Fails
1. Check build logs in Amplify Console
2. Verify all environment variables are set
3. Try clearing cache and redeploying

### NEXTAUTH_SECRET Error
- Make sure `NEXTAUTH_SECRET` is set in environment variables
- Must be at least 32 characters
- Redeploy after adding

### 502 Bad Gateway
- Check CloudWatch logs
- Verify environment variables
- Check NextAuth configuration

### Dependencies Not Installing
- Clear npm cache in Amplify Console
- Verify package.json is valid
- Check for version conflicts

## 📚 Next Steps

1. ✅ Deploy to Amplify (follow steps above)
2. ⬜ Add authentication pages
3. ⬜ Implement APEX AI triage system
4. ⬜ Connect to AWS services (DynamoDB, S3)
5. ⬜ Set up monitoring and alerts
6. ⬜ Configure custom domain
7. ⬜ Add CI/CD workflows
8. ⬜ Set up staging environment

## 🔒 Security Notes

- Never commit `.env.local` to git
- Rotate secrets regularly
- Use AWS Secrets Manager for production secrets
- Enable WAF for production deployments
- Review IAM permissions regularly

## 💡 Tips

- Use Amplify's preview deployments for PR reviews
- Set up branch-based environments (dev, staging, prod)
- Monitor build times and optimize as needed
- Use Amplify's built-in monitoring features
- Enable build notifications via SNS

---

**Ready to deploy?** Follow Step 1 above! 🚀

