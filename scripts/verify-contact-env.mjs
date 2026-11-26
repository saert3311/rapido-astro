import fs from 'node:fs';
import path from 'node:path';
import { getContactConfigStatus } from '../src/lib/contact-handler.ts';

function loadDotEnvIfPresent(envPath = path.resolve('.env')) {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  let url = process.env.VERIFY_BASE_URL || '';
  let checkMailjet = false;

  for (const arg of argv) {
    if (arg.startsWith('--url=')) {
      url = arg.slice('--url='.length).trim();
    } else if (arg === '--check-mailjet') {
      checkMailjet = true;
    }
  }

  return { url: url.replace(/\/+$/, ''), checkMailjet };
}

async function main() {
  loadDotEnvIfPresent();
  const { url, checkMailjet } = parseArgs(process.argv.slice(2));
  const status = getContactConfigStatus(process.env);
  let failed = false;

  const shouldCheckLocalEnv = !url || checkMailjet;
  if (shouldCheckLocalEnv) {
    console.log('Contact Configuration Preflight:');
    console.log(`- TURNSTILE_SECRET_KEY: ${status.turnstileConfigured ? 'OK' : 'MISSING/PLACEHOLDER'}`);
    console.log(
      `- MAILJET_API_KEY & MAILJET_SECRET_KEY: ${status.mailjetConfigured ? 'OK' : 'MISSING/PLACEHOLDER'}`
    );
    console.log(
      `- MAILJET_CONTACT_LIST_ID (optional): ${status.mailjetListConfigured ? 'OK' : 'NOT_SET'}`
    );

    if (!status.ready) {
      console.error(`Missing or placeholder required variables: ${status.missing.join(', ')}`);
      failed = true;
    }
  }

  if (checkMailjet) {
    if (!status.mailjetConfigured) {
      console.error('Mailjet credential check skipped: API key/secret not configured.');
      failed = true;
    } else {
      const apiKey = (process.env.MAILJET_API_KEY || '').trim();
      const secretKey = (process.env.MAILJET_SECRET_KEY || '').trim();
      const auth = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
      try {
        const res = await fetch('https://api.mailjet.com/v3/REST/apikey', {
          headers: { Authorization: `Basic ${auth}` },
        });
        if (!res.ok) {
          console.error(`Mailjet API credential check failed: HTTP ${res.status}`);
          failed = true;
        } else {
          console.log('- Mailjet API credential handshake: OK (HTTP 200)');
        }
      } catch (err) {
        console.error(
          `Mailjet API credential check failed: ${err instanceof Error ? err.message : String(err)}`
        );
        failed = true;
      }
    }
  }

  if (url) {
    for (const endpoint of ['/healthz', '/readyz']) {
      try {
        const res = await fetch(`${url}${endpoint}`);
        const bodyText = await res.text();
        if (!res.ok) {
          console.error(`Endpoint ${endpoint} returned HTTP ${res.status}: ${bodyText}`);
          failed = true;
        } else {
          console.log(`- ${endpoint}: OK (HTTP ${res.status})`);
        }
      } catch (err) {
        console.error(
          `Endpoint ${endpoint} unreachable: ${err instanceof Error ? err.message : String(err)}`
        );
        failed = true;
      }
    }
  }

  process.exit(failed ? 1 : 0);
}

main();
