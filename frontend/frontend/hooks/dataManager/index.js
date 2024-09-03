import fetch from 'isomorphic-fetch';
import { HttpAgent } from '@dfinity/agent';

import { TRACING_CANISTER_ID, FACADE_CANISTER_ID } from '../config';
import { createActor as createTracingActor } from './declarations/tracing';
import { createActor as createFacadeActor } from './declarations/facade';
import { custodianIdentity } from './identity';

const agent = new HttpAgent.create({
  identity: custodianIdentity,
  host: 'http://127.0.0.1:4943',
  fetch,
});

export const tracing = createTracingActor(TRACING_CANISTER_ID, { agent });
export const facade = createFacadeActor(FACADE_CANISTER_ID, { agent });