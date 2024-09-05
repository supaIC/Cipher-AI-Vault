
// agent.d.ts

import { HttpAgent } from "@dfinity/agent";
import { Cycles } from "../../interfaces/cmc/cmc";
import { Ledger } from "./interfaces/ledger/index";
import { Distro } from "../../interfaces/distro/index";

declare const walletAddress: string;

declare const CANISTER_IDS: {
  cycles: string;
  ledger: string;
  distro: string;
};

declare const CONVERSION_DETAILS: {
  rate: number;
  zeros: string;
};

export declare function createActors(currentUser: { agent: HttpAgent }): Promise<{
  cycles: Cycles;
  ledger: Ledger;
  distro: Distro;
}>;

export declare function verifyTransaction(
  block_height: number,
  amount_sent: number,
  actor: Ledger
): Promise<boolean>;

export declare function cyclesTopUp(currentUser: { agent: HttpAgent }): Promise<void>;