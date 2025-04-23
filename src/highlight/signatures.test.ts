import { describe, expect, it } from 'vitest';
import { verifyEcdsaSignature, verifyEip1271Signature } from './signatures';
import { SET_ALIAS_TYPES } from '../agents/aliases';

function createDomain(chainId: number, salt: string) {
  return {
    name: 'highlight',
    version: '0.1.0',
    chainId,
    salt,
    verifyingContract: '0x0000000000000000000000000000000000000001'
  };
}

describe('ECDSA', () => {
  it('should return true for valid signature', async () => {
    const salt =
      '0xdd5af5826f3e745ed67794977e6e30e8fecdd1c60aa13426b9bd995c604e77df';
    const message = {
      from: '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70',
      alias: '0x22c1d617008f98F883DF01b347Ca78f12A3562A7'
    };

    const signature =
      '0xf6497f04d464f72e7e628019a60b73b333408f4661cc66c8e476eb4a9210dc966f38c8d20fea33574c8270b26254dceea9379b75f0dbd577efe6429b65278ac61c';

    const result = await verifyEcdsaSignature(
      createDomain(11155111, salt),
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
      createDomain(11155111, salt),
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
      '0x275fc929b1ccbc58fabdb159cc0fc85dca668fe0de82e91b91bbd2cd5f49324802d30cb4db5b90c07f3e57781d90947e0c8c500ee7f17674b1d4e0e7593ebf5c1b';

    const result = await verifyEip1271Signature(
      createDomain(11155111, salt),
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
      createDomain(11155111, salt),
      message.from,
      SET_ALIAS_TYPES,
      message,
      signature
    );

    expect(result).toBe(false);
  });
});
