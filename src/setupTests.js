// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom does not provide TextEncoder/TextDecoder; jspdf's PNG support
// (fast-png → iobuffer) needs them at import time.
import { TextEncoder, TextDecoder } from 'util';
import { webcrypto } from 'crypto';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// jsdom also lacks crypto.getRandomValues, which uuid requires.
// Keep it configurable — exportEncryption.test.js redefines crypto itself.
if (!global.crypto || !global.crypto.getRandomValues) {
  Object.defineProperty(global, 'crypto', { value: webcrypto, configurable: true });
}
