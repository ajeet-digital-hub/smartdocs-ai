# Staging Setup Checklist

- [ ] **Deployment Platform:** Vercel project created and access granted to the deployment team.
- [ ] **MongoDB Staging:** Dedicated Atlas cluster and database user created; connection string is ready.
- [ ] **Storage Staging:** Dedicated S3 bucket and IAM user created; access credentials are ready.
- [ ] **Razorpay TEST:** Test Mode API keys and Webhook Secret are generated and ready.
- [ ] **Razorpay Webhook:** Webhook endpoint URL is configured in the Razorpay dashboard.
- [ ] **Email:** Staging email provider (SendGrid) API key is ready.
- [ ] **AI Provider:** Staging AI provider (OpenAI) API key is ready.
- [ ] **Authentication:** `NEXTAUTH_SECRET` has been generated and is ready.
- [ ] **Domain/HTTPS:** Staging domain is configured and SSL is active.
- [ ] **Background Jobs:** Vercel Cron Job schedule and endpoint have been planned.
- [ ] **Environment Variables:** All required variables have been securely added to the Vercel project settings.
- [ ] **Deployment Access:** The engineer has the necessary permissions to trigger and monitor deployments in Vercel.