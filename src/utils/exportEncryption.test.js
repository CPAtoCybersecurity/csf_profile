import '@testing-library/jest-dom';
import { buildEncryptedFilename, encryptBytesWithPassword, decryptBytesWithPassword } from './exportEncryption';

describe('exportEncryption', () => {
  beforeAll(() => {
    // Jest/jsdom doesn't always provide these globals, but our encryption helpers use them.
    // eslint-disable-next-line no-undef
    const { TextEncoder, TextDecoder } = require('util');
    if (typeof globalThis.TextEncoder === 'undefined') globalThis.TextEncoder = TextEncoder;
    if (typeof globalThis.TextDecoder === 'undefined') globalThis.TextDecoder = TextDecoder;

    // Ensure Web Crypto is available (Node provides crypto.webcrypto)
    // eslint-disable-next-line no-undef
    const { webcrypto } = require('crypto');
    try {
      // Prefer defineProperty in case crypto is read-only in the environment.
      Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
    } catch {
      globalThis.crypto = webcrypto;
    }
  });

  test('buildEncryptedFilename inserts .enc before final extension', () => {
    expect(buildEncryptedFilename('assessments_2026-01-19.csv')).toBe('assessments_2026-01-19.enc.csv');
    expect(buildEncryptedFilename('export.json')).toBe('export.enc.json');
    expect(buildEncryptedFilename('noext')).toBe('noext.enc');
    expect(buildEncryptedFilename('.env')).toBe('.enc.env');
  });

  test('encryptBytesWithPassword returns envelope with magic + header + ciphertext', async () => {
    const encoder = new TextEncoder();
    const plaintext = encoder.encode('hello world');

    const encrypted = await encryptBytesWithPassword(plaintext, 'password-123', { iterations: 1000 });

    expect(encrypted).toBeInstanceOf(Uint8Array);
    expect(encrypted.length).toBeGreaterThan(0);

    const MAGIC = 'CSFENC1';
    const magicLen = MAGIC.length;
    const magic = new TextDecoder().decode(encrypted.slice(0, magicLen));
    expect(magic).toBe(MAGIC);

    const headerLen =
      (encrypted[magicLen] << 24) |
      (encrypted[magicLen + 1] << 16) |
      (encrypted[magicLen + 2] << 8) |
      encrypted[magicLen + 3];

    expect(headerLen).toBeGreaterThan(0);

    const headerStart = magicLen + 4;
    const headerBytes = encrypted.slice(headerStart, headerStart + headerLen);
    const headerText = new TextDecoder().decode(headerBytes);
    const header = JSON.parse(headerText);

    expect(header.alg).toBe('AES-GCM');
    expect(header.kdf).toBe('PBKDF2');
    expect(header.hash).toBe('SHA-256');
    expect(header.iterations).toBe(1000);
    expect(typeof header.salt).toBe('string');
    expect(typeof header.iv).toBe('string');

    const ciphertextBytes = encrypted.slice(headerStart + headerLen);
    expect(ciphertextBytes.length).toBeGreaterThan(0);
  });

  test('decryptBytesWithPassword restores original plaintext', async () => {
    const encoder = new TextEncoder();
    const plaintext = encoder.encode('csv,data,here\n1,2,3');

    const encrypted = await encryptBytesWithPassword(plaintext, 'pw', { iterations: 1000 });
    const decrypted = await decryptBytesWithPassword(encrypted, 'pw');

    expect(new TextDecoder().decode(decrypted)).toBe('csv,data,here\n1,2,3');
  });
});
