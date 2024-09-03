import { Ed25519KeyIdentity } from '@dfinity/identity';
import { readFileSync } from 'fs';

const secretKey = readFileSync('./identity.secret', { encoding: 'utf8' });

export const custodianIdentity = Ed25519KeyIdentity.fromSecretKey(
  Buffer.from(secretKey, 'hex')
);
