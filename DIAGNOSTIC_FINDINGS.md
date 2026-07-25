# MongoDB Atlas TLS Alert 80 — Diagnostic Findings

## Investigation Date
March 2025

## Environment
- **Application:** Next.js 14 (App Router) + Express.js backend
- **Node.js:** v22.11.0
- **MongoDB Driver:** mongodb@7.5.0 (npm package)
- **OpenSSL:** 3.0.15+quic (bundled with Node.js)
- **MongoDB Atlas Cluster:** Cluster0 (Free Tier)
  - Shard hosts: `ac-umm3nna-shard-00-00.7j064x9.mongodb.net:27017`
  - Shard hosts: `ac-umm3nna-shard-00-01.7j064x9.mongodb.net:27017`
  - Shard hosts: `ac-umm3nna-shard-00-02.7j064x9.mongodb.net:27017`
- **Atlas Network Access:** IP `103.55.61.90` (current public IP)

---

## Root Cause: IP Whitelist Propagation Delay

### The Error
```
E8580000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error
SSL alert number 80
```
This error was occurring on **all three Atlas shard hosts simultaneously**.

### Diagnosis Methodology

1. **SRV Record Resolution** — Confirmed all 3 shard hosts resolved correctly via `_mongodb._tcp.cluster0.7j064x9.mongodb.net` SRV lookup
2. **Raw TCP Connectivity Test** — Raw TCP connections succeeded on all 3 shards (port 27017), proving network reachability
3. **TLS Handshake Test (with SNI)** — TLS connections **failed** on all 3 shards with Alert 80
4. **TLS Handshake Test (by IP)** — Same failure when connecting by resolved IP address
5. **TLS Version Negotiation Test** — Tested forcing TLSv1.2 only, TLSv1.3 only, and TLSv1.2+ (default) — all failed identically
6. **Repeated Testing** — Ran the full test suite again approximately 10-15 minutes after refreshing the Atlas IP whitelist entry

### Evidence

After the IP whitelist propagation completed, the same diagnostics showed:

```
TLS Handshake: SUCCESS — Cipher: {"name":"TLS_AES_128_GCM_SHA256","version":"TLSv1.3","standardName":"TLS_AES_128_GCM_SHA256"}
MongoDB driver connection: SUCCESS — Connected to "smartdoc-ai-test" database
```

### Why Alert 80 Specifically

Alert 80 (`tlsv1 alert internal error`) from Atlas does **not** mean there's a TLS configuration mismatch. Instead, it indicates Atlas's infrastructure rejected the TLS connection at a level above the TLS handshake itself. The typical causes are:

| Cause | Diagnosis Result |
|-------|-----------------|
| TLS version mismatch (Atlas requires 1.2+) | ❌ Not the cause — tested all versions |
| Cipher suite mismatch | ❌ Not the cause — OpenSSL 3.x has compatible ciphers |
| Certificate validation failure | ❌ Not the cause — test used `rejectUnauthorized: false` |
| SNI (Server Name Indication) missing | ❌ Not the cause — tested with and without `servername` |
| **IP not whitelisted / whitelist propagation** | ✅ **Confirmed root cause** |
| Atlas-side internal error | ❌ Cluster status was Active |

---

## Secondary Finding: .env.local File Corruption

During investigation, a **pre-existing corruption** was discovered in `frontend/.env.local` that will cause runtime failures independent of the TLS issue:

### Bug 1: Inline `#` Truncates Turnstile Key
```
Line 22: NEXT_PUBLIC_TURNSTILE_SITEKEY=your_turnstile_sit# MongoDB
```
- The `# MongoDB` comment was accidentally appended to the value
- dotenv parses `#` as an inline comment delimiter
- Result: `NEXT_PUBLIC_TURNSTILE_SITEKEY` is parsed as `your_turnstile_sit` (truncated)
- Impact: Turnstile CAPTCHA verification will fail

### Bug 2: Corrupted Database Name
```
Line 24: MONGODB_DB_NAME=smartdocse_key
```
- Expected value: `smartdocs_ai`
- The suffix `_key` leaked in from `TURNSTILE_SECRET_KEY` (line 25)
- Cause: A copy-paste or editor auto-format error when the `# MongoDB` comment got displaced
- Impact: Application will connect to database `smartdocse_key` instead of `smartdocs_ai`

### Fix Required
The affected section (lines 21-25) should be corrected to:
```env
# CAPTCHA
NEXT_PUBLIC_TURNSTILE_SITEKEY=your_turnstile_sitekey
# MongoDB
MONGODB_URI=mongodb+srv://srofficial1974_db_user:My%40Pass%23123@cluster0.7j064x9.mongodb.net/smartdocs_ai?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=smartdocs_ai
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

---

## Files in This Commit

| File | Purpose |
|------|---------|
| `diagnose.js` | Raw TCP + TLS diagnostics for all 3 Atlas shards |
| `test_tls.js` | MongoDB driver TLS connection test |
| `test_env_corruption.js` | Analysis of .env.local corruption bugs |
| `test_rerun_tls.js` | Verification test after IP propagation |
| `DIAGNOSTIC_FINDINGS.md` | This file — full documentation of findings |

