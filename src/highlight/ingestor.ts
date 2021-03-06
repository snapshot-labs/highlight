import snapshot from '@snapshot-labs/snapshot.js';
import { set } from '../addons/aws';
import db from '../utils/mysql';

export default async function(body) {
  // @TODO check envelop format

  // Verify signature
  const isValid = await snapshot.utils.verify(body.address, body.sig, body.data);
  if (!isValid) return Promise.reject();
  console.log('Signature is valid');

  // Store on AWS S3
  try {
    await set(body.sig, body);
  } catch (e) {
    console.log(e);
    return Promise.reject();
  }

  // Index receipt
  try {
    const domain = body.data.domain;
    const receipt = {
      sig: body.sig,
      address: body.address,
      hash: snapshot.utils.getHash(body.data),
      domain: `${domain.name}/${domain.version}`,
      ts: body.data.message.timestamp
    };
    await db.queryAsync('INSERT IGNORE INTO receipts SET ?', [receipt]);
  } catch (e) {
    console.log(e);
    return Promise.reject();
  }

  console.log('Ingestor approved', body.sig);
}
