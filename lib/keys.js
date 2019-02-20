import bcrypt from 'bcryptjs';
import getRandomValues from 'get-random-values';
import { binaryStringToArray, arrayToBinaryString, encodeBase64, decodeBase64 } from 'pmcrypto';

import { BCRYPT_PREFIX } from './constants';

/**
 * Compute the key password.
 * @param {String} password plaintext password
 * @param {String} salt base 64 encoded string
 * @returns {Promise<String>}
 */
export const computeKeyPassword = async (password, salt) => {
    if (salt && salt.length) {
        const saltBinary = binaryStringToArray(decodeBase64(salt));
        const hash = await bcrypt.hash(password, BCRYPT_PREFIX + bcrypt.encodeBase64(saltBinary, 16));
        // Remove bcrypt prefix and salt (first 29 characters)
        return hash.slice(29);
    }

    // No salt, old-style
    return password;
};

/**
 * Generate salt for a key.
 * @returns {String}
 */
export const generateKeySalt = () => encodeBase64(arrayToBinaryString(getRandomValues(new Uint8Array(16))));
