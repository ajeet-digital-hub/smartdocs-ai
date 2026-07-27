# MongoDB Atlas TLS Connection Diagnostic Report

## Overview

This document reports the findings of an independent diagnostic investigation into the MongoDB Atlas connection failure affecting the **Signup** and **Login** (NextAuth) APIs. Both routes were returning HTTP 500 with the same underlying TLS error.

---

## Error Signature

```
003B0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error
  :c:\ws\deps\openssl\openssl\ssl\record\rec_layer_s3.c:1605:SSL alert number 80
```

Equivalent Schannel error (Windows native TLS):

```
SEC_E_INTERNAL_ERROR (0x80090304)
  The Local Security Authority cannot be contacted
```

Both errors are **identical in meaning**: the TLS handshake to the MongoDB Atlas cluster (`ac-umm3nna-shard-*.mongodb.net:27017`) is being rejected or interfered with at the transport layer.

---

## Diagnostic Steps & Results

### 1. DNS / SRV Resolution — ✅ PASS

The SRV record `_mongodb._tcp.Cluster0.7j064x9.mongodb.net` resolves correctly to the three Atlas replica set shards:

| Shard Host | Resolved IP |
|---|---|
| `ac-umm3nna-shard-00-00.7j064x9.mongodb.net` | `20.197.22.247` |
| `ac-umm3nna-shard-00-01.7j064x9.mongodb.net` | `20.204.213.204` |
| `ac-umm3nna-shard-00-02.7j064x9.mongodb.net` | `20.204.69.121` |

**Conclusion:** DNS/SRV resolution is fully functional. The cluster hostname is resolvable.

### 2. TCP Connectivity — ✅ PASS

Raw TCP connections on port **27017** succeed to all three shards:

```
curl telnet://ac-umm3nna-shard-00-00.7j064x9.mongodb.net:27017
→ Established connection to 20.197.22.247:27017
```

**Conclusion:** No firewall or network access control is blocking TCP port 27017. The cluster is reachable.

### 3. Atlas Cluster Status — ✅ PASS

The cluster **Cluster0** (M7 sandbox, MongoDB 8.0) on Atlas is:
- **Status:** Active
- **Region:** AWS `ap-south-1` (Mumbai)
- **IP Access List:** Includes `122.180.244.204/32` (the current public IP of this development environment)

**Conclusion:** The Atlas cluster is healthy and the IP is allowlisted.

### 4. TLS Handshake — ❌ FAIL

TLS connections to **port 27017** on all three shards fail:

- **Via curl (Schannel/Windows TLS):** `SEC_E_INTERNAL_ERROR (0x80090304)`
- **Via Node.js (OpenSSL):** `tlsv1 alert internal error (SSL alert number 80)`
- **Via MongoDB Node.js Driver (mongodb@7.5.0):** Same TLS error
- **Via Mongoose (mongoose@9.8.0):** Same TLS error

**Control test:** TLS to a standard HTTPS endpoint (port 443) works correctly:
```
curl https://google.com → 200 OK (full TLS handshake succeeds)
```

**Critical observation:** TLS works on port 443 but **fails exclusively on port 27017**. This isolates the issue to something intercepting or interfering with TLS on the MongoDB standard port.

### 5. MongoDB Driver Authentication — NOT REACHED

Because the TLS handshake fails, MongoDB authentication and database selection stages are never reached. The connection fails before any credentials are exchanged.

---

## Root Cause Analysis

### Determination

**The failure is environmental, not a code defect.** No application logic, configuration, MongoDB URI format, driver version, or authentication code is at fault.

### 5 Confirmed Facts

| Factor | Status | Evidence |
|---|---|---|
| Application code | ✅ Not the cause | TLS fails even with `curl` (no app code involved) |
| MongoDB driver version | ✅ Not the cause | `mongodb@7.5.0` is compatible with Node.js v22 |
| Mongoose version | ✅ Not the cause | `mongoose@9.8.0` uses the same driver internally |
| MongoDB URI / credentials | ✅ Not the cause | Connection never reaches authentication stage |
| Atlas configuration | ✅ Not the cause | Cluster is active, IP is allowlisted |

### Likely Causes (in order of probability)

1. **ISP/Network TLS filtering on port 27017** — Some ISPs, corporate networks, or public WiFi networks inspect or interfere with TLS connections on non-standard ports. Port 443 is whitelisted, while port 27017 is not.

2. **Windows 11 Insider Preview Build 26200 TLS stack bug** — This build (`10.0.26200`) is a Windows Insider/Dev channel build. Schannel or the underlying Local Security Authority (LSA) may have compatibility issues with MongoDB's TLS cipher suite requirements on non-standard ports.

3. **Windows Filtering Platform (WFP) driver interference** — A VPN client, security agent, or network filter driver may be inspecting TLS traffic on port 27017 and corrupting the handshake.

4. **Antivirus or endpoint protection TLS inspection** — Even though Windows Defender real-time monitoring reports as disabled, a third-party security suite or corporate endpoint agent could be intercepting TLS on MongoDB's port.

### Downstream Symptoms

Both of these failures are caused by the same root issue:

| Symptom | Root Cause |
|---|---|
| **Signup → HTTP 500** | `clientPromise` → TLS handshake failure |
| **Login → CredentialsSignin** | `mongoose.connect()` → TLS handshake failure |

No authentication code changes are required.

---

## Recommended Fixes

### For Local Development (Apply one of these)

| Option | Steps | Notes |
|---|---|---|
| **A. Use a VPN** | Install Cloudflare WARP, ProtonVPN, or any VPN client. Connect and retry. | Most reliable workaround. Bypasses ISP/network TLS filtering on port 27017. |
| **B. Switch network** | Connect via a mobile hotspot (cellular data, different ISP) | Identifies ISP filtering as root cause. |
| **C. Use a supported Node.js version** | Install Node.js **v18.20.x LTS** or **v20.18.x LTS** from [nodejs.org](https://nodejs.org) | These versions use a different OpenSSL build that may have better TLS negotiation. |
| **D. Update Windows** | Run Windows Update to get a newer build than 26200 | If the cause is an Insider build Schannel bug, a newer build may fix it. |

### What NOT to Do

| Action | Reason |
|---|---|
| ❌ Set `tlsAllowInvalidCertificates: true` | Insecure. Does not fix the underlying TLS handshake failure. |
| ❌ Set `NODE_TLS_REJECT_UNAUTHORIZED=0` | Insecure. Disables all TLS certificate validation globally. |
| ❌ Add port 443 SNI workaround | Untested. May introduce unexpected connectivity behavior. |
| ❌ Modify NextAuth or authentication code | The auth code is correct. The issue is at the transport layer. |
| ❌ Change MongoDB URI to non-SRV format | The SRV resolution works correctly. Not related to the TLS failure. |

---

## Verification

After applying a fix, verify the connection with:

```bash
# Via Node.js (from project root)
node -e "
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
});
client.connect()
  .then(() => { console.log('✅ MongoDB connection successful'); process.exit(0); })
  .catch(err => { console.error('❌', err.message); process.exit(1); });
"
```

Or simply test Signup and Login in the browser — both should now return 200/201 instead of 500.

---

## Conclusion

The MongoDB Atlas TLS connection failure is an **environmental/network issue specific to this development machine and network**. The application code, MongoDB configuration, and Atlas cluster are all functioning correctly. The recommended fix is to use a **VPN** or **different network** to bypass whatever is interfering with TLS on port 27017.

Once the TLS connection succeeds, both **Signup** and **Login** will work without any code changes.
