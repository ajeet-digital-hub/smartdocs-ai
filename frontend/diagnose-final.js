/**
 * Final diagnostic: Google control test + nss certificate check
 * Does NOT expose any credentials, URIs, or secrets.
 */
const tls = require('tls');

async function testTLS(host, port) {
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

async function main() {
  // Control test: Google HTTPS (port 443)
  console.log('[Control] TLS to www.google.com:443');
  const r = await testTLS('www.google.com', 443);
  if (r.ok) {
    console.log('  Status: TLS OK in ' + r.ms + 'ms');
    console.log('  Protocol: ' + r.protocol);
    console.log('  Cipher: ' + JSON.stringify(r.cipher));
    console.log('  Authorized: ' + r.authorized);
    console.log('  Cert Subject: ' + r.certSubject);
    console.log('  Cert Issuer: ' + r.certIssuer);
  } else {
    console.log('  Status: TLS FAILED after ' + r.ms + 'ms');
    console.log('  Error: ' + r.error);
    console.log('  Code: ' + r.code);
    console.log('  Reason: ' + r.reason);
  }

  // Check for nss certificate in Node's root store
  console.log('\n[Root CAs] Checking Node.js root certificate store');
  const rootCerts = tls.rootCertificates || [];
  console.log('  Total root CAs in Node.js store: ' + rootCerts.length);
  const nssCert = rootCerts.find(cert => cert.includes('CN=nss'));
  if (nssCert) {
    console.log('  FOUND: CN=nss certificate in Node.js root store!');
    console.log('  This is a NON-STANDARD certificate that may be a TLS inspection proxy.');
    // Print just the subject/issuer lines
    const lines = nssCert.split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log('  ' + line.trim());
    });
  } else {
    console.log('  CN=nss not found in Node.js root store');
  }

  // Also check for any non-standard CAs
  console.log('\n[Root CAs] Non-standard root CAs (not from common public CAs):');
  const standardIssuers = ['DigiCert', 'GlobalSign', 'Sectigo', 'Let\'s Encrypt', 'GoDaddy', 'Entrust', 'VeriSign', 'Comodo', 'Atos', 'Amazon', 'Google', 'Microsoft'];
  const nonStandard = rootCerts.filter(cert => {
    return !standardIssuers.some(issuer => cert.includes(issuer));
  });
  if (nonStandard.length > 0) {
    console.log('  Found ' + nonStandard.length + ' non-standard root CA(s):');
    nonStandard.forEach((cert, i) => {
      const lines = cert.split('\n');
      const subjectLine = lines.find(l => l.includes('Subject:')) || lines.find(l => l.includes('CN='));
      console.log('  [' + (i + 1) + '] ' + (subjectLine || 'Unknown'));
    });
  } else {
    console.log('  (none found)');
  }

  console.log('\n=== Summary ===');
  console.log('If Google TLS works but MongoDB TLS fails with internal_error:');
  console.log('  -> TLS inspection proxy is intercepting port 27017 (MongoDB)');
  console.log('  -> The proxy does not properly handle MongoDB Atlas TLS');
  console.log('  -> The CN=nss certificate is likely the proxy\'s root CA');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
