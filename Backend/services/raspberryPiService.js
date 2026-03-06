import http from 'http';
import https from 'https';
import { URL } from 'url';

const DEFAULT_PI_BASE_URL = 'http://raspberrypi.local:8080';

function getPiBaseUrl() {
  return (process.env.PI_BASE_URL || DEFAULT_PI_BASE_URL).trim().replace(/\/+$/, '');
}

function requestJson(urlString, { method = 'GET', headers = {}, body, timeoutMs = 5000 } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const req = transport.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method,
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data = null;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch {
            // non-json response
          }

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data });
          } else {
            const msg = (data && (data.message || data.error)) || raw || `HTTP ${res.statusCode}`;
            const err = new Error(msg);
            err.statusCode = res.statusCode;
            err.response = { status: res.statusCode, data, raw };
            reject(err);
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Timeout after ${timeoutMs}ms`));
    });

    if (body !== undefined) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }

    req.end();
  });
}

export async function getDeviceStatus() {
  const base = getPiBaseUrl();
  const { data } = await requestJson(`${base}/status`, { method: 'GET' });
  return data || { connected: false };
}

export async function connectDevice({ userId, deviceId } = {}) {
  const base = getPiBaseUrl();
  const { data } = await requestJson(`${base}/connect`, {
    method: 'POST',
    body: { userId, deviceId },
  });
  return data || { connected: true };
}

export async function disconnectDevice({ userId, deviceId } = {}) {
  const base = getPiBaseUrl();
  const { data } = await requestJson(`${base}/disconnect`, {
    method: 'POST',
    body: { userId, deviceId },
  });
  return data || { connected: false };
}

