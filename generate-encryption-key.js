// Generate a secure encryption key for production
// Run this with: node generate-encryption-key.js

const crypto = require('crypto');

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('🔐 Generate Secure Encryption Keys\n');

console.log('Production Encryption Key (32 chars minimum):');
console.log(generateSecureKey(32));
console.log('');

console.log('Alternative Key (64 chars for extra security):');
console.log(generateSecureKey(64));
console.log('');

console.log('📋 Instructions:');
console.log('1. Copy one of the keys above');
console.log('2. Add it as NEXT_PUBLIC_ENCRYPTION_KEY in Vercel');
console.log('3. Keep this key secure - never share it publicly');
console.log('4. Use the same key for both development and production');
