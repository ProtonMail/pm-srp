import { getKeys, getCleartextMessage, binaryStringToArray, decodeBase64, verifyMessage } from 'pmcrypto';

import withPromiseCache from './promiseCache';
import { VERIFICATION_STATUS, SRP_MODULUS_KEY } from '../constants';

const { NOT_SIGNED, SIGNED_AND_VALID } = VERIFICATION_STATUS;

const readArmoredWithCache = withPromiseCache((key) => getKeys(key));

/**
 * Get modulus keys.
 * @return {Promise}
 */
export const getModulusKeys = () => readArmoredWithCache(SRP_MODULUS_KEY);

/**
 * Verify the modulus signature with the SRP public key
 * @param {Object} keys
 * @param {Object} modulus
 * @return {Promise}
 */
export const verifyModulus = async (keys, modulus) => {
    try {
        const { verified = NOT_SIGNED } = await verifyMessage({
            message: modulus,
            publicKeys: keys
        });

        if (verified !== SIGNED_AND_VALID) {
            throw new Error();
        }
    } catch (e) {
        throw new Error('Unable to verify server identity');
    }
};

/**
 * Verify modulus from the API and get the value.
 * @param {String} modulus - Armored modulus string
 * @returns {Promise<Uint8Array>}
 */
export const verifyAndGetModulus = async (modulus) => {
    const [publicKeys, modulusParsed] = await Promise.all([getModulusKeys(), getCleartextMessage(modulus)]);
    await verifyModulus(publicKeys, modulusParsed);
    return binaryStringToArray(decodeBase64(modulusParsed.getText()));
};
