# SmartDocs AI - Staging Infrastructure Setup Guide

This guide provides step-by-step instructions for provisioning and configuring the necessary infrastructure for the SmartDocs AI staging environment. All steps must be completed before a successful deployment can be executed.

**Security Notice:** This guide specifies environment variable names. The actual secret values must **NEVER** be stored in source control, shared in plaintext, or exposed in logs. Use the secret management features of the chosen deployment platform (Vercel).

---

## 1. Deployment Platform (Vercel)

*   **Service:** Vercel
*   **Purpose:** To host the Next.js frontend and serverless API functions. The project is structured as a standard Next.js application, making Vercel the ideal deployment platform.
*   **Account Required:** A Vercel account with the ability to create new projects and manage team settings.

### Configuration Steps

1.  **Create a New Project:** In the Vercel dashboard, create a new project and connect it to the Git repository for this application.
2.  **Framework Preset:** Vercel should automatically detect "Next.js". No changes are needed.
3.  **Root Directory:** Ensure the root directory is set to `frontend` if the project is in a monorepo structure.
4.  **Environment Variables:** This is the central location where all secrets from the subsequent sections will be configured. Navigate to `Project Settings > Environment Variables`.

### Verification

*   After configuring all other services, a successful deployment to the Vercel-provided staging URL (e.g., `smartdocs-ai-staging.vercel.app`) will verify this step.

---

## 2. Database (MongoDB Atlas)

*   **Service:** MongoDB Atlas
*   **Purpose:** The primary database for storing all application data, including users, subscriptions, documents, and Family Guardian data.
*   **Account Required:** A MongoDB Atlas account.

### Configuration Steps

1.  **Create a Staging Cluster:** Provision a new, dedicated cluster for staging (e.g., a low-tier `M10` cluster is sufficient). **Do not use the production cluster.**
2.  **Create a Database:** Within the new cluster, create a database named `smartdocs-staging`.
3.  **Create a Database User:** In `Database Access`, create a new user with a strong, generated password. Grant this user the `readWrite` role for the `smartdocs-staging` database.
4.  **Configure Network Access:** In `Network Access`, add Vercel's IP addresses to the IP access list to allow the deployed application to connect to the database. You can find Vercel's IPs in their documentation or allow access from anywhere (`0.0.0.0/0`) for simplicity in staging (not recommended for production).
5.  **Get Connection String:** Go to your cluster's `Connect` dialog, select "Connect your application", and copy the connection string. Replace `<password>` with the password you generated and specify the database name.

### Environment Variables

*   `DATABASE_URI`: The full MongoDB Atlas connection string.

### Security Precautions

*   Use a unique, strong password for the staging database user.
*   Never expose the connection string on the client side.

### Verification

*   The application will successfully connect and perform read/write operations after deployment. You can verify this by creating a new user account on the staging URL.

---

## 3. Storage (AWS S3)

*   **Service:** Amazon Web Services (AWS) S3
*   **Purpose:** To store user-uploaded files, such as documents and images.
*   **Account Required:** An AWS account.

### Configuration Steps

1.  **Create a Staging Bucket:** In the S3 console, create a new, dedicated bucket named `smartdocs-ai-staging-uploads`. Ensure "Block all public access" is **checked**.
2.  **Create an IAM User:** In the IAM console, create a new user (e.g., `smartdocs-staging-s3-user`) with "Programmatic access".
3.  **Set Permissions:** Create and attach a new inline policy to this user with the following permissions, replacing `smartdocs-ai-staging-uploads` with your bucket name:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject",
                    "s3:GetObject",
                    "s3:DeleteObject"
                ],
                "Resource": "arn:aws:s3:::smartdocs-ai-staging-uploads/*"
            }
        ]
    }
    ```
4.  **Get Credentials:** After creating the user, copy the `Access key ID` and `Secret access key`.

### Environment Variables

*   `S3_UPLOAD_KEY`: The IAM user's Access Key ID.
*   `S3_UPLOAD_SECRET`: The IAM user's Secret Access Key.
*   `S3_UPLOAD_BUCKET`: The name of your staging S3 bucket.
*   `S3_UPLOAD_REGION`: The AWS region of your bucket (e.g., `ap-south-1`).

### Verification

*   After deployment, upload a document through the application and verify it appears in the S3 bucket.

---

## 4. Payment Gateway (Razorpay)

*   **Service:** Razorpay
*   **Purpose:** To process customer payments for subscriptions.
*   **Account Required:** A Razorpay account.

### Configuration Steps

1.  **Enable Test Mode:** In the Razorpay dashboard, ensure you are in **Test Mode**.
2.  **Generate API Keys:** Navigate to `Settings > API Keys` and generate a new key pair.
3.  **Configure Webhooks:** Navigate to `Settings > Webhooks`. Add a new webhook with the following details:
    *   **Webhook URL:** `https://[your-staging-url]/api/payment/webhook/razorpay`
    *   **Active Events:** Select all `payment.*` and `subscription.*` events.
    *   **Secret:** Generate a strong webhook secret.

### Environment Variables

*   `RAZORPAY_KEY_ID`: The `Key ID` from the Razorpay dashboard.
*   `RAZORPAY_KEY_SECRET`: The `Key Secret` from the Razorpay dashboard.
*   `RAZORPAY_WEBHOOK_SECRET`: The secret you created for the webhook endpoint.

### Verification

*   Perform a complete test transaction on the deployed staging application using Razorpay's test card details. Verify the subscription becomes `ACTIVE` in the staging database.

---

## 5. Other Services & Configuration

### Authentication (NextAuth)
*   **Purpose:** Manages user sessions and authentication.
*   **Action:** Generate a strong, random secret for session encryption.
*   **Command:** `openssl rand -base64 32`
*   **Environment Variables:**
    *   `NEXTAUTH_SECRET`: The generated secret.
    *   `NEXTAUTH_URL`: The full URL of the staging deployment.
    *   `APPLICATION_URL`: The full URL of the staging deployment.

### AI Provider (OpenAI)
*   **Purpose:** Powers all AI features (Chat, Document AI, Family Copilot).
*   **Action:** Generate a new API key in the OpenAI dashboard for staging usage.
*   **Environment Variables:**
    *   `OPENAI_API_KEY`: The generated API key.

### Email (SendGrid)
*   **Purpose:** Sends transactional emails (welcome, verification, payment notifications).
*   **Action:** Generate a new API key in the SendGrid dashboard. Verify a "From" address.
*   **Environment Variables:**
    *   `SENDGRID_API_KEY`: The generated API key.
    *   `EMAIL_FROM`: The verified "From" email address.

### Background Jobs (Vercel Cron Jobs)
*   **Purpose:** To run scheduled maintenance tasks, such as processing expired subscriptions.
*   **Action:** After deployment, configure a Cron Job in the Vercel project settings.
*   **Example Configuration:**
    *   **Schedule:** `0 5 * * *` (Runs daily at 5 AM UTC).
    *   **Endpoint:** `GET /api/maintenance/process-subscriptions` (This API route needs to be created to trigger the `subscription-maintenance.ts` service).

---

## Deployment Process

Once all environment variables are configured in the Vercel project settings:

1.  **Push to Git:** Ensure the latest verified commit is on the main/deployment branch of your Git repository.
2.  **Trigger Deployment:** Vercel will automatically detect the push and start a new deployment.
3.  **Monitor Build:** Observe the build logs in the Vercel dashboard to ensure it completes successfully.
4.  **Verify:** Once deployed, use the provided staging URL to begin the live verification tests.