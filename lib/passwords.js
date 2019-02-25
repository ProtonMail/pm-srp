import bcrypt from 'bcryptjs';
import {
    arrayToBinaryString,
    arrayToHexString,
    binaryStringToArray,
    concatArrays,
    encodeBase64,
    encodeUtf8,
    SHA512,
    unsafeMD5
} from 'pmcrypto';

import { cleanUsername } from './utils/username';
import { BCRYPT_PREFIX } from './constants';

/**
 * Expand a hash
 * @param {String} str
 * @returns {Promise<Uint8Array>}
 */
export const expandHash = async (str) => {
    const list = await Promise.all([
        SHA512(binaryStringToArray(str + '\x00')),
        SHA512(binaryStringToArray(str + '\x01')),
        SHA512(binaryStringToArray(str + '\x02')),
        SHA512(binaryStringToArray(str + '\x03'))
    ]);

    return concatArrays(list);
};

/**
 * Format a hash
 * @param {String} password
 * @param {String} salt
 * @param {Uint8Array} modulus
 * @returns {Promise<Uint8Array>}
 */
const formatHash = async (password, salt, modulus) => {
    const unexpandedHash = await bcrypt.hash(password, BCRYPT_PREFIX + salt);
    return expandHash(unexpandedHash + arrayToBinaryString(modulus));
};

/**
 * Hash password in version 3.
 * @param {String} password
 * @param {String} salt
 * @param {Uint8Array} modulus
 * @returns {Promise<Uint8Array>}
 */
const hashPassword3 = (password, salt, modulus) => {
    const saltBinary = binaryStringToArray(salt + 'proton');
    return formatHash(password, bcrypt.encodeBase64(saltBinary, 16), modulus);
};

/**
 * Hash password in version 1.
 * @param {String} password
 * @param {String} username
 * @param {Uint8Array} modulus
 * @returns {Promise<Uint8Array>}
 */
const hashPassword1 = async (password, username, modulus) => {
    const value = binaryStringToArray(encodeUtf8(username.toLowerCase()));
    const salt = arrayToHexString(await unsafeMD5(value));
    return formatHash(password, salt, modulus);
};

/**
 * Hash password in version 0.
 * @param {String} password
 * @param {String} username
 * @param {Uint8Array} modulus
 * @returns {Promise<Uint8Array>}
 */
const hashPassword0 = async (password, username, modulus) => {
    const value = await SHA512(binaryStringToArray(username.toLowerCase() + encodeUtf8(password)));
    const prehashed = encodeBase64(arrayToBinaryString(value));
    return hashPassword1(prehashed, username, modulus);
};

/**
 * Hash a password.
 * @param {String} password
 * @param {String} salt
 * @param {String} username
 * @param {Uint8Array} modulus
 * @param {Number} version
 * @returns {Promise<Uint8Array>}
 */
export const hashPassword = ({ password, salt, username, modulus, version }) => {
    if (version === 4 || version === 3) {
        return hashPassword3(password, salt, modulus);
    }

    if (version === 2) {
        return hashPassword1(password, cleanUsername(username), modulus);
    }

    if (version === 1) {
        return hashPassword1(password, username, modulus);
    }

    if (version === 0) {
        return hashPassword0(password, username, modulus);
    }

    throw new Error('Unsupported auth version');
};
