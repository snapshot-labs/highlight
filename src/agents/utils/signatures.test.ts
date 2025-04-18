import { describe, expect, it } from 'vitest';
import { verifyEcdsaSignature, verifyEip1271Signature } from './signatures';
import { SET_ALIAS_TYPES } from '../aliases';

describe('ECDSA', () => {
  it('should return true for valid signature', async () => {
    const salt =
      '0xdd5af5826f3e745ed67794977e6e30e8fecdd1c60aa13426b9bd995c604e77df';
    const message = {
      from: '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70',
      alias: '0x22c1d617008f98F883DF01b347Ca78f12A3562A7'
    };

    const signature =
      '0xf577a9220b23957e94aa0fdc9a2707522ec881fee5484c2142b744d8a8141887056dd9ff79ea740c9353f8f03f0c5a1cf9ad5a41f70c9d3659cb2f5f9724bc3b1c';

    const result = await verifyEcdsaSignature(
      11155111,
      salt,
      message.from,
      SET_ALIAS_TYPES,
      message,
      signature
    );

    expect(result).toBe(true);
  });

  it('should return false for valid signature', async () => {
    const salt =
      '0xdd5af5826f3e745ed67794977e6e30e8fecdd1c60aa13426b9bd995c604e77df';
    const message = {
      from: '0x866A13CEAF33659DBE80aee6D67f0A303F97047f',
      alias: '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70'
    };

    const signature =
      '0xee4eca1bbcc10a15f862637a9db6987049be7312b13c55bc6e5b1edc7f567f7062fde75eecfbc1abcd0c2807806b5548008bf8b681bea4f8af4da39c1da1b3471c';

    const result = await verifyEcdsaSignature(
      11155111,
      salt,
      message.from,
      SET_ALIAS_TYPES,
      message,
      signature
    );

    expect(result).toBe(false);
  });
});

describe('eip1271', () => {
  it('should return true for valid signature', async () => {
    const salt =
      '0x2f7825c4048760606cca7ddf1f57efbce3fdc2c8443a2e2aa8595992ab4a1494';
    const message = {
      from: '0x8edfcc5f141ffc2b6892530d1fb21bbcdc74b455',
      alias: '0xCbe6064F307251a62E457F298C18107C905e2573'
    };

    const signature =
      '0x6b5c3987af94800a607cded216769d78b88ddbead9161aa9288c4e7045b912bd0c486b58c5842710396a1941fcee2fbf4fa6bcc345ca51758a62c88e413031991b';

    const result = await verifyEip1271Signature(
      11155111,
      salt,
      message.from,
      SET_ALIAS_TYPES,
      message,
      signature
    );

    expect(result).toBe(true);
  });

  it('should return false for invalid signature', async () => {
    const salt =
      '0x2f7825c4048760606cca7ddf1f57efbce3fdc2c8443a2e2aa8595992ab4a1494';
    const message = {
      from: '0x8edfcc5f141ffc2b6892530d1fb21bbcdc74b455',
      alias: '0xCbe6064F307251a62E457F298C18107C905e2573'
    };

    const signature =
      '0xee4eca1bbcc10a15f862637a9db6987049be7312b13c55bc6e5b1edc7f567f7062fde75eecfbc1abcd0c2807806b5548008bf8b681bea4f8af4da39c1da1b3471c';

    const result = await verifyEip1271Signature(
      11155111,
      salt,
      message.from,
      SET_ALIAS_TYPES,
      message,
      signature
    );

    expect(result).toBe(false);
  });
});
