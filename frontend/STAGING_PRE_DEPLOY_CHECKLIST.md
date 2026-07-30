# Staging Pre-Deployment Checklist

This checklist must be completed before attempting to deploy the application to the staging environment.

- [ ] **Deployment Platform:** Vercel project created and access granted.
- [ ] **Domain:** Staging subdomain (e.g., `staging.smartdocs.ai`) configured and pointing to the Vercel project.
- [ ] **HTTPS:** SSL certificate provisioned for the staging domain.
- [ ] **MongoDB:** Staging database cluster created and connection string is available.
- [ ] **MongoDB Network Access:** Vercel's IP addresses are whitelisted in MongoDB Atlas.
- [ ] **Storage:** Staging S3 bucket created and access credentials are available.
- [ ] **Razorpay:** Test Mode API keys and Webhook Secret are generated.
- [ ] **Razorpay Webhook:** Webhook endpoint is configured in the Razorpay dashboard pointing to the staging URL.
- [ ] **Email:** SendGrid API key and a verified "From" address are available.
- [ ] **AI Providers:** OpenAI API key for staging is available.
- [ ] **Authentication:** A secure `NEXTAUTH_SECRET` has been generated.
- [ ] **Environment Variables:** All variables listed in `.env.staging.example` have been securely configured in the Vercel project's environment settings.
- [ ] **Background Jobs:** Cron job configuration for `subscription-maintenance.ts` has been planned (e.g., using Vercel Cron Jobs).
- [ ] **Monitoring:** A project has been set up in an error tracking service (e.g., Sentry, LogRocket) and the DSN is available.