#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';

const promptHidden = async (promptText) => {
  if (!process.stdin.isTTY) {
    throw new Error('No TTY available for password prompt. Pass --password instead.');
  }

  const stdin = process.stdin;
  const stdout = process.stdout;

  stdout.write(promptText);

  return await new Promise((resolve) => {
    let value = '';

    const onData = (buf) => {
      const str = buf.toString('utf8');

      // Enter
      if (str === '\r' || str === '\n') {
        stdout.write('\n');
        cleanup();
        resolve(value);
        return;
      }

      // Ctrl+C
      if (str === '\u0003') {
        stdout.write('\n');
        cleanup();
        process.exit(130);
      }

      // Backspace (Windows + Unix variants)
      if (str === '\b' || str === '\x7f') {
        value = value.slice(0, -1);
        return;
      }

      // Ignore other control characters
      if (str < ' ') return;

      value += str;
    };

    const cleanup = () => {
      try {
        stdin.setRawMode(false);
      } catch {
        // ignore
      }
      stdin.pause();
      stdin.off('data', onData);
    };

    stdin.setEncoding('utf8');
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
};

const MAGIC = 'CSFENC1';

const bigEndianBytesToUint32 = (bytes, offset = 0) => {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
};

const base64ToUint8Array = (base64) => {
  const buf = Buffer.from(base64, 'base64');
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
};

const usage = () => {
  console.log('Decrypt an encrypted export (.enc.csv) into a regular CSV file.');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/decrypt-export.mjs --in <input.enc.csv> --out <output.csv>');
  console.log('');
  console.log('The script will prompt for the password interactively.');
  console.log('If you are running in a non-interactive environment (no TTY), pass:');
  console.log('  --password <password>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/decrypt-export.mjs --in assessments_2026-01-19.enc.csv --out assessments_2026-01-19.csv');
};

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
};

const inPath = getArg('--in');
const outPath = getArg('--out');
let password = getArg('--password');

if (!inPath || !outPath) {
  usage();
  process.exit(1);
}

if (!password) {
  password = await promptHidden('Password: ');
}

if (!password) {
  console.error('Password is required.');
  process.exit(1);
}

const encrypted = new Uint8Array(fs.readFileSync(inPath));
const decoder = new TextDecoder();

const magic = decoder.decode(encrypted.slice(0, MAGIC.length));
if (magic !== MAGIC) {
  throw new Error('Unsupported encrypted export format (missing CSFENC1 magic)');
}

const headerLen = bigEndianBytesToUint32(encrypted, MAGIC.length);
const headerStart = MAGIC.length + 4;
const headerEnd = headerStart + headerLen;

const headerText = decoder.decode(encrypted.slice(headerStart, headerEnd));
const header = JSON.parse(headerText);

if (header?.alg !== 'AES-GCM' || header?.kdf !== 'PBKDF2') {
  throw new Error('Unsupported encryption parameters');
}

const salt = base64ToUint8Array(header.salt);
const iv = base64ToUint8Array(header.iv);
const iterations = header.iterations;

// Node 22+ exposes globalThis.crypto as a read-only getter, so don't assign to it.
const subtle = webcrypto.subtle;

const encoder = new TextEncoder();
const keyMaterial = await subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);

const key = await subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['decrypt']
);

const ciphertext = encrypted.slice(headerEnd);

let plaintext;
try {
  plaintext = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
} catch {
  throw new Error('Decryption failed (wrong password or corrupted file)');
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.from(new Uint8Array(plaintext)));
console.log(`Decrypted to: ${outPath}`);
