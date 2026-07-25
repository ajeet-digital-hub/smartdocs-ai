/**
 * MongoDB TLS Connection Diagnostic Script
 * Does NOT expose any credentials, URIs, or secrets.
 * Tests: DNS -> TCP -> TLS -> (reports where failure occurs)
 */
const net = require('net');
const tls = require('tls');
const dns = require('dns').promises;

const HOSTNAME = 'cluster0.7j064x9.mongodb.net';
const PORT = 27017;

async function main() {
  console.log(`=== MongoDB TLS Connection Diagnostic ===
`);

  // Step 1: DNS SRV resolution
  console.log('[1] DNS SRV Resolution');
  console.log('    Hostname: ' + HOSTNAME);
  let srvs;
  try {
    srvs = await dns.resolveSrv('_mongodb._tcp.' + HOSTNAME);
    console.log('    Status: OK - ' + srvs.length + ' hosts resolved');
    srvs.forEach((s, i) => {
      console.log('    Host ' + (i + 1) + ': ' + s.name + ':' + s.port);
    });
  } catch (e) {
    console.log('    Status: FAILED - ' + e.message + ' (code=' + e.code + ')');
    console.log('    => Failure at DNS resolution stage');
    return;
  }

  // Step 2: DNS TXT record
  console.log(`
[2] DNS TXT Record`);
  try {
    const txt = await dns.resolveTxt('_mongodb._tcp.' + HOSTNAME);
    console.log('    Status: OK');
    console.log('    TXT: ' + JSON.stringify(txt));
  } catch (e) {
    console.log('    Status: FAILED - ' + e.message + ' (code=' + e.code + ')');
  }

  // Step 3: TCP connectivity to each host
  console.log(`
[3] TCP Connectivity (port ${PORT})`);
  const reachableHosts = [];
  for (const srv of srvs) {
    const host = srv.name;
    const result = await testTCP(host, PORT, 8000);
    if (result.ok) {
      console.log('    ' + host + ': TCP connected in ' + result.ms + 'ms');
      reachableHosts.push(host);
    } else {
      console.log('    ' + host + ': TCP FAILED - ' + result.error + ' (code=' + result.code + ')');
    }
  }

  if (reachableHosts.length === 0) {
    console.log(`
    => ALL hosts unreachable at TCP level`);
    console.log('    => Possible causes: firewall, ISP blocking, network issue');
    return;
  }

  // Step 4: TLS handshake to each reachable host
  console.log(`
[4] TLS Handshake (rejectUnauthorized=true)`);
  for (const host of reachableHosts) {
    const result = await testTLS(host, PORT, 10000);
    if (result.ok) {
      console.log('    ' + host + ': TLS OK in ' + result.ms + 'ms');
      console.log('      Protocol: ' + result.protocol);
      console.log('      Cipher: ' + JSON.stringify(result.cipher));
      console.log('      Authorized: ' + result.authorized);
      if (!result.authorized) {
        console.log('      Auth Error: ' + result.authError);
      }
    } else {
      console.log('    ' + host + ': TLS FAILED after ' + result.ms + 'ms');
      console.log('      Error: ' + result.error);
      console.log('      Code: ' + result.code);
      console.log('      Reason: ' + result.reason);
      if (result.code === 'ECONNRESET' || result.reason === 'INTERNAL_ERROR') {
        console.log('      => Server sent TLS alert 80 (internal_error)');
        console.log('      => This is a server-side TLS internal error, NOT a cert validation error');
      }
    }
  }

  // Step 5: Check Node.js TLS configuration
  console.log(`
[5] Node.js TLS Configuration`);
  console.log('    Node.js version: ' + process.versions.node);
  console.log('    OpenSSL version: ' + process.versions.openssl);
  console.log('    Default TLS min version: ' + tls.createSecureContext({}).minVersion || 'TLSv1.2 (default)');
  console.log('    NODE_TLS_REJECT_UNAUTHORIZED: ' + (process.env.NODE_TLS_REJECT_UNAUTHORIZED || '(not set - defaults to 1)'));

  // Step 6: Check for TLS inspection
  console.log(`
[6] TLS Inspection Check`);
  const caCount = require('crypto').createRootCAStore ? 'available' : 'N/A';
  console.log('    NODE_EXTRA_CA_CERTS: ' + (process.env.NODE_EXTRA_CA_CERTS || '(not set)'));
  console.log('    SSL_CERT_FILE: ' + (process.env.SSL_CERT_FILE || '(not set)'));
  console.log('    SSL_CERT_DIR: ' + (process.env.SSL_CERT_DIR || '(not set)'));

  console.log(`
=== Diagnostic Complete ===`);
}

function testTCP(host, port, timeout) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      const ms = Date.now() - start;
      socket.destroy();
      resolve({ ok: true, ms });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, error: 'TIMEOUT', code: 'TIMEOUT' });
    });
    socket.on('error', (err) => {
      const ms = Date.now() - start;
      resolve({ ok: false, error: err.message, code: err.code, ms });
    });
    socket.connect(port, host);
  });
}

function testTLS(host, port, timeout) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = tls.connect({
      host: host,
      port: port,
      servername: host,
      rejectUnauthorized: true,
      timeout: timeout,
      // Use default secure context (system CA store)
    });
    socket.on('secureConnect', () => {
      const ms = Date.now() - start;
      const result = {
        ok: true,
        ms,
        protocol: socket.getProtocol(),
        cipher: socket.getCipher(),
        authorized: socket.authorized,
        authError: socket.authorized ? null : socket.authorizationError,
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
      resolve({ ok: false, ms: timeout, error: 'TIMEOUT', code: 'TIMEOUT', reason: 'timeout' });
    });
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
