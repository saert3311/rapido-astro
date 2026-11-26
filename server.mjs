import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getContactConfigStatus, handleContactRequest } from './src/lib/contact-handler.ts';

const MAX_BODY_BYTES = 64 * 1024;

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function applySecurityHeaders(res) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }
}

function getCacheControl(urlPath, ext) {
  if (urlPath.startsWith('/_astro/') || ext === '.webp' || ext === '.png') {
    return 'public, max-age=31536000, immutable';
  }
  if (ext === '.html') {
    return 'public, max-age=0, must-revalidate';
  }
  return 'public, max-age=3600';
}

function toWebHeaders(rawHeaders) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else if (typeof value === 'string') {
      headers.set(key, value);
    }
  }
  return headers;
}

async function readBodyWithLimit(req, limitBytes) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > limitBytes) {
      req.pause();
      const err = new Error('Payload too large');
      err.code = 'PAYLOAD_TOO_LARGE';
      throw err;
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function statFileIfExists(filePath) {
  try {
    const stat = await fsp.stat(filePath);
    return stat.isFile() ? stat : null;
  } catch {
    return null;
  }
}

async function resolveStaticFile(resolvedDist, decodedPath) {
  const trimmed = decodedPath.replace(/^\/+/, '');
  const candidates = [];

  if (trimmed === '') {
    candidates.push(path.resolve(resolvedDist, 'index.html'));
  } else if (decodedPath.endsWith('/')) {
    candidates.push(path.resolve(resolvedDist, trimmed, 'index.html'));
  } else {
    candidates.push(path.resolve(resolvedDist, trimmed));
    candidates.push(path.resolve(resolvedDist, trimmed, 'index.html'));
  }

  for (const candidate of candidates) {
    if (!candidate.startsWith(resolvedDist + path.sep)) {
      continue;
    }
    const stat = await statFileIfExists(candidate);
    if (stat) {
      return { filePath: candidate, stat };
    }
  }

  return null;
}

function parsePositiveInt(value, fallback) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : fallback;
}

function resolveClientIp(req, trustProxy) {
  if (trustProxy) {
    const cfIp = req.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string' && cfIp.trim()) {
      return cfIp.trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) {
      return realIp.trim();
    }
    const forwardedFor = req.headers['x-forwarded-for'];
    const forwardedRaw = Array.isArray(forwardedFor)
      ? forwardedFor[forwardedFor.length - 1]
      : forwardedFor;
    if (typeof forwardedRaw === 'string' && forwardedRaw.trim()) {
      const parts = forwardedRaw
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function createAppServer({
  distDir = path.resolve('dist'),
  env = {},
  rateLimitMax,
  rateLimitWindowMs,
} = {}) {
  const resolvedDist = path.resolve(distDir);
  const initialEnv = { ...process.env, ...env };
  const trustProxy = String(initialEnv.TRUST_PROXY ?? '').toLowerCase() === 'true';
  const maxRequests = parsePositiveInt(rateLimitMax ?? initialEnv.CONTACT_RATE_LIMIT_MAX, 5);
  const windowMs = parsePositiveInt(
    rateLimitWindowMs ?? initialEnv.CONTACT_RATE_LIMIT_WINDOW_MS,
    10 * 60 * 1000
  );
  const rateBuckets = new Map();

  function checkRateLimit(ip) {
    const now = Date.now();
    const cutoff = now - windowMs;
    const timestamps = (rateBuckets.get(ip) || []).filter((ts) => ts > cutoff);

    if (timestamps.length >= maxRequests) {
      rateBuckets.set(ip, timestamps);
      const retryAfterSeconds = Math.max(1, Math.ceil((timestamps[0] + windowMs - now) / 1000));
      return { allowed: false, retryAfterSeconds };
    }

    timestamps.push(now);
    rateBuckets.set(ip, timestamps);

    if (rateBuckets.size > 5000) {
      for (const [key, entries] of rateBuckets.entries()) {
        const active = entries.filter((ts) => ts > cutoff);
        if (active.length === 0) {
          rateBuckets.delete(key);
        } else {
          rateBuckets.set(key, active);
        }
      }
    }

    return { allowed: true, retryAfterSeconds: 0 };
  }

  return http.createServer(async (req, res) => {
    applySecurityHeaders(res);

    const method = (req.method || 'GET').toUpperCase();
    let rawPathname = '/';
    try {
      rawPathname = new URL(req.url || '/', 'http://localhost').pathname;
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad Request');
      return;
    }

    // Health check endpoint for Docker HEALTHCHECK and orchestrators
    if (rawPathname === '/healthz') {
      if (method !== 'GET' && method !== 'HEAD') {
        res.writeHead(405, {
          'Content-Type': 'text/plain; charset=utf-8',
          Allow: 'GET, HEAD',
        });
        res.end('Method Not Allowed');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      if (method === 'HEAD') {
        res.end();
        return;
      }
      res.end(JSON.stringify({ ok: true, status: 'healthy' }));
      return;
    }

    // Readiness probe endpoint verifying built assets and contact configuration
    if (rawPathname === '/readyz') {
      if (method !== 'GET' && method !== 'HEAD') {
        res.writeHead(405, {
          'Content-Type': 'text/plain; charset=utf-8',
          Allow: 'GET, HEAD',
        });
        res.end('Method Not Allowed');
        return;
      }

      const runtimeEnv = { ...process.env, ...env };
      const assetsReady = Boolean(await statFileIfExists(path.resolve(resolvedDist, 'index.html')));
      const config = getContactConfigStatus(runtimeEnv);
      const ready = assetsReady && config.ready;

      res.writeHead(ready ? 200 : 503, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      if (method === 'HEAD') {
        res.end();
        return;
      }
      res.end(
        JSON.stringify({
          ok: ready,
          status: ready ? 'ready' : 'not_ready',
          checks: {
            assets: assetsReady,
            turnstile: config.turnstileConfigured,
            mailjet: config.mailjetConfigured,
            mailjetList: config.mailjetListConfigured,
          },
          ...(!config.ready ? { missing: config.missing } : {}),
        })
      );
      return;
    }

    // Contact API endpoint (delegates to shared handler used by Cloudflare Worker)
    if (rawPathname === '/api/contact') {
      try {
        const runtimeEnv = { ...process.env, ...env };
        const clientIp = resolveClientIp(req, trustProxy);

        if (method === 'POST') {
          const limit = checkRateLimit(clientIp);
          if (!limit.allowed) {
            if (runtimeEnv.__silentLogs !== true) {
              console.warn(
                JSON.stringify({
                  ts: new Date().toISOString(),
                  level: 'warn',
                  event: 'contact.rate_limited',
                  retryAfterSeconds: limit.retryAfterSeconds,
                })
              );
            }
            res.writeHead(429, {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
              'Retry-After': String(limit.retryAfterSeconds),
            });
            res.end(
              JSON.stringify({
                ok: false,
                error: {
                  code: 'RATE_LIMITED',
                  message:
                    'Has realizado demasiadas consultas en poco tiempo. Espera unos minutos o llámanos al 640 39 74 34.',
                },
              })
            );
            return;
          }
        }

        const hasBody = method !== 'GET' && method !== 'HEAD';
        const bodyBuffer = hasBody ? await readBodyWithLimit(req, MAX_BODY_BYTES) : undefined;
        const requestUrl = `http://${req.headers.host || 'localhost'}${req.url || '/api/contact'}`;
        const webReq = new Request(requestUrl, {
          method,
          headers: toWebHeaders(req.headers),
          ...(hasBody ? { body: bodyBuffer } : {}),
        });

        const webRes = await handleContactRequest(webReq, { ...runtimeEnv, __clientIp: clientIp });
        webRes.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        applySecurityHeaders(res);
        res.statusCode = webRes.status;

        if (method === 'HEAD') {
          res.end();
          return;
        }

        const resText = await webRes.text();
        res.end(resText);
        return;
      } catch (err) {
        if (err && err.code === 'PAYLOAD_TOO_LARGE') {
          res.writeHead(413, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            Connection: 'close',
          });
          res.on('finish', () => req.destroy());
          res.end(
            JSON.stringify({
              ok: false,
              error: {
                code: 'PAYLOAD_TOO_LARGE',
                message: 'El cuerpo de la solicitud supera el tamaño máximo permitido.',
              },
            })
          );
          return;
        }

        res.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: 'SERVER_ERROR',
              message: 'Error interno al procesar la solicitud.',
            },
          })
        );
        return;
      }
    }

    // Static assets from distDir
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, {
        'Content-Type': 'text/plain; charset=utf-8',
        Allow: 'GET, HEAD',
      });
      res.end('Method Not Allowed');
      return;
    }

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(rawPathname);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad Request');
      return;
    }

    if (decodedPath.includes('\0')) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad Request');
      return;
    }

    const match = await resolveStaticFile(resolvedDist, decodedPath);
    if (!match) {
      const notFoundPath = path.resolve(resolvedDist, '404.html');
      const notFoundStat = notFoundPath.startsWith(resolvedDist + path.sep)
        ? await statFileIfExists(notFoundPath)
        : null;

      if (notFoundStat) {
        res.writeHead(404, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Content-Length': String(notFoundStat.size),
        });
        if (method === 'HEAD') {
          res.end();
          return;
        }
        fs.createReadStream(notFoundPath).pipe(res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      if (method === 'HEAD') {
        res.end();
        return;
      }
      res.end('Not Found');
      return;
    }

    const ext = path.extname(match.filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const cacheControl = getCacheControl(decodedPath, ext);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'Content-Length': String(match.stat.size),
    });

    if (method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(match.filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  });
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 3000;
  const server = createAppServer();

  const startupConfig = getContactConfigStatus(process.env);
  if (process.env.NODE_ENV === 'production' && !startupConfig.ready) {
    console.warn(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'server.contact_config_incomplete',
        missing: startupConfig.missing,
      })
    );
  }

  server.listen(port, host, () => {
    console.log(`rapido-astro listening on http://${host}:${port}`);
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
