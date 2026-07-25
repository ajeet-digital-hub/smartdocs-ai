/**
 * Deep TLS Diagnostic for MongoDB Atlas
 * Tests various TLS configurations to pinpoint the exact cause.
 * Does NOT expose any credentials, URIs, or secrets.
 */
const tls = require('tls');
const net = require('net');
const crypto = require('crypto');

const HOST = 'ac-umm3nna-shard-00-01.7j064x9.mongodb.net';
const PORT = 27017;

async function testTLS(config, label) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = tls.connect({
      host: HOST,
      port: PORT,
      servername: HOST,
      timeout: 10000,
      ...config,
    });
    socket.on('secureConnect', () => {
      const ms = Date.now() - start;
      const cert = socket.getPeerCertificate(true);
      const result = {
        ok: true,
        ms,
        protocol: socket.getProtocol(),
        cipher: socket.getCipher(),
        authorized: socket.authorized,
        authError: socket.authorized ? null : socket.authorizationError,
        certSubject: cert.subject,
        certIssuer: cert.issuer,
        certFingerprint: cert.fingerprint256,
      };
      socket.destroy();
      resolve(result);
    });
    socket.on('error', (err) => {
      const ms = Date.now() - start;
      resolve({
        ok: false,
        ms,
        error: err.message,
        code: err.code,
        reason: err.reason || '(none)',
      });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, ms: 10000, error: 'TIMEOUT', code: 'TIMEOUT', reason: 'timeout' });
    });
  });
}

async function main() {
  console.log('=== Deep TLS Diagnostic for MongoDB Atlas ===\n');
  console.log('Host: ' + HOST + ':' + PORT);
  console.log('Node.js: ' + process.versions.node);
  console.log('OpenSSL: ' + process.versions.openssl);
  console.log('');

  // Test 1: Default TLS (rejectUnauthorized=true)
  console.log('[1] Default TLS (rejectUnauthorized=true)');
  const r1 = await testTLS({ rejectUnauthorized: true }, 'default');
  consoleResult(r1);

  // Test 2: rejectUnauthorized=false (to see if it's a cert validation issue)
  console.log('\n[2] TLS with rejectUnauthorized=false');
  const r2 = await testTLS({ rejectUnauthorized: false }, 'no-reject');
  consoleResult(r2);

  // Test 3: TLS 1.2 only
  console.log('\n[3] TLS 1.2 only (minVersion=maxVersion=TLSv1.2)');
  const r3 = await testTLS({ rejectUnauthorized: true, minVersion: 'TLSv1.2', maxVersion: 'TLSv1.2' }, 'tls12');
  consoleResult(r3);

  // Test 4: TLS 1.3 only
  console.log('\n[4] TLS 1.3 only (minVersion=maxVersion=TLSv1.3)');
  const r4 = await testTLS({ rejectUnauthorized: true, minVersion: 'TLSv1.3', maxVersion: 'TLSv1.3' }, 'tls13');
  consoleResult(r4);

  // Test 5: TLS 1.2 with rejectUnauthorized=false
  console.log('\n[5] TLS 1.2 with rejectUnauthorized=false');
  const r5 = await testTLS({ rejectUnauthorized: false, minVersion: 'TLSv1.2', maxVersion: 'TLSv1.2' }, 'tls12-noreject');
  consoleResult(r5);

  // Test 6: TLS 1.3 with rejectUnauthorized=false
  console.log('\n[6] TLS 1.3 with rejectUnauthorized=false');
  const r6 = await testTLS({ rejectUnauthorized: false, minVersion: 'TLSv1.3', maxVersion: 'TLSv1.3' }, 'tls13-noreject');
  consoleResult(r6);

  // Test 7: Inspect the suspicious 'nss' certificate
  console.log('\n[7] Inspecting non-Microsoft root CAs in system store');
  inspectRootCAs();

  // Test 8: Try connecting to a known-good HTTPS site to see if TLS works at all
  console.log('\n[8] Control test: TLS to www.google.com:443');
  const r8 = await testTLSControl('www.google.com', 443);
  consoleResult(r8);

  console.log('\n=== Analysis ===');
  console.log('If ALL MongoDB TLS tests fail with internal_error but Google works:');
  console.log('  -> The issue is specific to MongoDB Atlas TLS, likely TLS inspection');
  console.log('  -> A proxy may be intercepting non-standard ports (27017) but not 443');
  console.log('');
  console.log('If Google also fails:');
  console.log('  -> System-wide TLS issue (antivirus/firewall)');
  console.log('');
  console.log('If rejectUnauthorized=false still fails with internal_error:');
  console.log('  -> NOT a certificate validation issue');
  console.log('  -> The server/proxy is sending internal_error during handshake');
  console.log('  -> Strongly indicates TLS inspection proxy');
}

function testTLSControl(host, port) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = tls.connect({
      host: host,
      port: port,
      servername: host,
      rejectUnauthorized: true,
      timeout: 10000,
    });
    socket.on('secureConnect', () => {
      const ms = Date.now() - start;
      const cert = socket.getPeerCertificate(true);
      resolve({
        ok: true,
        ms,
        protocol: socket.getProtocol(),
        cipher: socket.getCipher(),
        authorized: socket.authorized,
        authError: socket.authorized ? null : socket.authorizationError,
        certSubject: cert.subject,
        certIssuer: cert.issuer,
      });
      socket.destroy();
    });
    socket.on('error', (err) => {
      const ms = Date.now() - start;
      resolve({ ok: false, ms, error: err.message, code: err.code, reason: err.reason || '(none)' });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, ms: 10000, error: 'TIMEOUT', code: 'TIMEOUT', reason: 'timeout' });
    });
  });
}

function inspectRootCAs() {
  // Use Node's built-in CA store
  const rootCAs = crypto.createRootCAStore ? null : null;
  // List the system's trusted CAs
  const caList = process.binding('crypto').getRootCertificates ? process.binding('crypto').getRootCertificates() : [];
  console.log('  System root CA count: ' + caList.length);

  // Check for the suspicious 'nss' CA
  const nssCA = caList.find(ca => ca.includes('CN=nss'));
  if (nssCA) {
    console.log('  FOUND: CN=nss certificate in system root store!');
    console.log('  This is a NON-STANDARD certificate that may be a TLS inspection proxy.');
    // Print just the subject/issuer without full cert details
    const lines = nssCA.split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log('  ' + line.trim());
    });
  } else {
    console.log('  CN=nss not found in Node.js root store');
  }
}

function consoleResult(r) {
  if (r.ok) {
    console.log('  Status: TLS OK in ' + r.ms + 'ms');
    console.log('  Protocol: ' + r.protocol);
    console.log('  Cipher: ' + JSON.stringify(r.cipher));
    console.log('  Authorized: ' + r.authorized);
    if (!r.authorized) console.log('  Auth Error: ' + r.authError);
    if (r.certSubject) console.log('  Cert Subject: ' + r.certSubject);
    if (r.certIssuer) console.log('  Cert Issuer: ' + r.certIssuer);
    if (r.certFingerprint) console.log('  Cert Fingerprint (SHA256): ' + r.certFingerprint);
  } else {
    console.log('  Status: TLS FAILED after ' + r.ms + 'ms');
    console.log('  Error: ' + r.error);
    console.log('  Code: ' + r.code);
    console.log('  Reason: ' + r.reason);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
