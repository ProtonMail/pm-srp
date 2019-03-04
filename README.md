[![CircleCI](https://circleci.com/gh/ProtonMail/pm-srp.svg?style=svg)](https://circleci.com/gh/ProtonMail/pm-srp)

# pm-srp

ProtonMail SRP and auth library

## Dependencies

This library depends on [`pmcrypto`](https://github.com/ProtonMail/pmcrypto). It is required as a `peerDependency` and it must be initialized first.

## API

### SRP

```js
import { getSrp, getRandomSrpVerifier } from 'pm-srp';
```

### getSrp(data, credentials, [authVersion])
where `data` is an object containing the result of the `auth/info` call.
```js
const data = {
    "Modulus": "-----BEGIN PGP SIGNED MESSAGE-----*-----END SIGNATURE-----",
    "ServerEphemeral": '', // base64 encoded server ephemeral
    "Version": 4,
    "Salt": '', // base64 encoded salt
    "Username": '' // username
}
```

`credentials` is an object containing:
```js
const credentials = {
    username: 'foo', // entered username
    password: 'bar' // entered password
}
```

if an optional `authVersion` is specified, it will override whatever version is passed in `Version` in `data`.

it returns a `Promise` resolving to a `result` containing:
```js
{
    clientEphemeral: '', //  base64 encoded client ephmeral
    clientProof: '', // base64 encoded client proof
    expectedServerProof: '' // base64 encoded expected server proof
    sharedSession: '' // uint8 array with the shared session
};
```

where `ClientEphemeral` and `ClientProof` should be sent in the auth request and the `ExpectedServerProof` should be validated against the received `ServerProof`.

### getRandomSrpVerifier(data, credentials, [authVersion]);
where `data` is an object containing the result of the `auth/modulus` call.
```js
const data = {
    "Modulus": "-----BEGIN PGP SIGNED MESSAGE-----*-----END SIGNATURE-----",
    "ModulusID": "Oq_JB_IkrOx5WlpxzlRPocN3_NhJ80V7DGav77eRtSDkOtLxW2jfI3nUpEqANGpboOyN-GuzEFXadlpxgVp7_g=="
}
```
`credentials` is an object containing:
```js
const credentials = {
    username: 'foo', // entered username
    password: 'bar' // entered password
}
```

if an optional `authVersion` is specified, it will use that instead of the current default version.

it returns a `Promise` resolving to a `result` containing:
```js
{
    version: 4, // auth version used
    salt: '', // base 64 encoded salt
    verifier: '' // base 64 encoded verifier
};
```

where this object should be merged with the rest of the request body in the request to perform.

### Auth

```js
import { computeKeyPassword, generateKeySalt } from 'pm-srp';
```

### computeKeyPassword(password, salt)
Returns the key password given a plaintext `password` and `salt`.

### generateKeySalt()
Returns a base 64 encoded string of 16 random bytes.

### getAuthVersionWithFallback(credentials, data, [lastAuthVersion])
Get the auth version to use for the next attempt.

`credentials` is the entered credentials, `data` is an object containing the result of the `auth/info` call, and `lastAuthVersion` the last used auth version or `undefined`.
Returns an object containing what auth version to use and if all version have been exhausted.
```js
{
    version: 4, // the auth version to use
    done: true // boolean if more attempts can be made after `version` has been used
};
```
