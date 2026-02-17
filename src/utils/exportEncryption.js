// CRA's ESLint config can flag `globalThis` as undefined (`no-undef`) in some setups.
// We use `globalThis` to access Web Crypto (`globalThis.crypto.subtle`) in a way that
// works across modern browsers and Jest/Node, so we declare it as a known global here.
/* global globalThis */
// Export encryption helpers (client-side)
//
// Encrypted export envelope format (all bytes):
//   [MAGIC ASCII bytes][headerLen u32 big-endian][header JSON UTF-8][ciphertext bytes]
//
// The header is intentionally self-describing and contains only non-secret parameters
// required to reproduce the derived key and decrypt later (e.g., salt/iv/iterations).
// The password is never stored anywhere.

const MAGIC = 'CSFENC1'; // Magic bytes to identify encrypted export format
const DEFAULT_PBKDF2_ITERATIONS = 210000; //increase this value as needed over time

const concatUint8Arrays = (...arrays) => {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
};

const uint32ToBigEndianBytes = (value) => {
  const out = new Uint8Array(4);
  out[0] = (value >>> 24) & 0xff;
  out[1] = (value >>> 16) & 0xff;
  out[2] = (value >>> 8) & 0xff;
  out[3] = value & 0xff;
  return out;
};

const bigEndianBytesToUint32 = (bytes, offset = 0) => {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === 'function') return btoa(binary);
  // Jest/Node fallback
  // eslint-disable-next-line no-undef
  if (typeof Buffer !== 'undefined') return Buffer.from(binary, 'binary').toString('base64');

  throw new Error('Base64 encoding not available in this environment');
};

const base64ToUint8Array = (base64) => {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {                                                                                                                                                    
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }

  // Jest/Node fallback
  // eslint-disable-next-line no-undef
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(base64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  throw new Error('Base64 decoding not available in this environment');
};

const getCryptoSubtle = () => {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API not available in this environment');
  }
  return subtle;
};

/**
 * Creates a clear filename indicator for password-protected exports.
 *
 * Example:
 * - "assessments_2026-01-19.csv" -> "assessments_2026-01-19.enc.csv"
 * - "export.json" -> "export.enc.json"
 */
export const buildEncryptedFilename = (baseFilename) => {
  const lastDot = baseFilename.lastIndexOf('.');
  if (lastDot === -1) return `${baseFilename}.enc`;
  return `${baseFilename.slice(0, lastDot)}.enc${baseFilename.slice(lastDot)}`;
};

/**
 * Encrypts raw bytes using a user-supplied password.
 *
 * - KDF: PBKDF2 (SHA-256)
 * - Cipher: AES-GCM (256-bit)
 *
 * Returns a Uint8Array that includes a small self-describing header so the
 * file can be decrypted later without storing any password in the app.
 */
export const encryptBytesWithPassword = async (
  plaintextBytes,
  password,
  { iterations = DEFAULT_PBKDF2_ITERATIONS } = {}
) => {
  if (!password) {
    throw new Error('Password is required for encryption');
  }

  const subtle = getCryptoSubtle();
  const encoder = new TextEncoder();

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );

  const ciphertext = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    plaintextBytes
  );

  const header = {
    v: 1,
    alg: 'AES-GCM',
    keySize: 256,
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iterations,
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer)
  };

  const headerBytes = encoder.encode(JSON.stringify(header));
  const headerLenBytes = uint32ToBigEndianBytes(headerBytes.length);
  const magicBytes = encoder.encode(MAGIC);

  return concatUint8Arrays(
    magicBytes,
    headerLenBytes,
    headerBytes,
    new Uint8Array(ciphertext)
  );
};

/**
 * Decrypts bytes produced by encryptBytesWithPassword.
 *
 * - Validates the MAGIC prefix
 * - Reads the embedded header (salt/iv/iterations)
 * - Derives the same AES key from the password
 * - Decrypts and returns the plaintext bytes
 */
export const decryptBytesWithPassword = async (encryptedBytes, password) => {
  if (!password) {
    throw new Error('Password is required for decryption');
  }
  if (!(encryptedBytes instanceof Uint8Array)) {
    throw new Error('Encrypted data must be a Uint8Array');
  }

  const subtle = getCryptoSubtle();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const magicLen = MAGIC.length;
  const magic = decoder.decode(encryptedBytes.slice(0, magicLen));
  if (magic !== MAGIC) {
    throw new Error('Unsupported encrypted export format');
  }

  if (encryptedBytes.length < magicLen + 4) {
    throw new Error('Encrypted export is truncated');
  }

  const headerLen = bigEndianBytesToUint32(encryptedBytes, magicLen);
  const headerStart = magicLen + 4;
  const headerEnd = headerStart + headerLen;

  if (encryptedBytes.length < headerEnd) {
    throw new Error('Encrypted export header is truncated');
  }

  const headerText = decoder.decode(encryptedBytes.slice(headerStart, headerEnd));
  const header = JSON.parse(headerText);

  if (header?.alg !== 'AES-GCM' || header?.kdf !== 'PBKDF2') {
    throw new Error('Unsupported encryption parameters');
  }

  const salt = base64ToUint8Array(header.salt);
  const iv = base64ToUint8Array(header.iv);
  const iterations = header.iterations;

  const keyMaterial = await subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['decrypt']
  );

  const ciphertext = encryptedBytes.slice(headerEnd);

  try {
    const plaintext = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      ciphertext
    );

    return new Uint8Array(plaintext);
  } catch (e) {
    // Wrong password, wrong parameters, or tampered data
    throw new Error('Decryption failed (wrong password or corrupted file)');
  }
};
