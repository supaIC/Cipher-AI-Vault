// Imports
import { Actor } from "@dfinity/agent";
import * as cycles from "../../interfaces/cmc/cmc";
import * as ledger from "../../interfaces/ledger/index";
import * as distro from "../../interfaces/distro/index";
import { walletAddress } from "../../configs/config";

// Constants
const CANISTER_IDS = {
  cycles: "rkp4c-7iaaa-aaaaa-aaaca-cai",
  ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
  distro: "jeb4e-myaaa-aaaak-aflga-cai",
};
const CONVERSION_DETAILS = {
  rate: 0.0001,
  zeros: "00000000",
};

// Function to create actors for interacting with various canisters
export const createActors = async (currentUser) => {
  try {
    const actors = {};

    const canisters = [
      { name: "cycles", id: CANISTER_IDS.cycles, factory: cycles.idlFactory },
      { name: "ledger", id: CANISTER_IDS.ledger, factory: ledger.idlFactory },
      { name: "distro", id: CANISTER_IDS.distro, factory: distro.idlFactory },
    ];

    for (const { name, id, factory } of canisters) {
      actors[name] = Actor.createActor(factory, {
        agent: currentUser.agent,
        canisterId: id,
      });
    }

    return actors;
  } catch (error) {
    console.error("Error creating actors:", error);
    throw error;
  }
};

// Function to verify a transaction on the ledger
export const verifyTransaction = async (
  block_height,
  amount_sent,
  actor
) => {
  try {
    const ledgerActor = actor;
    const result = await ledgerActor.query_blocks({
      start: block_height,
      length: 1,
    });
    const transferInfo = result.blocks[0].transaction.operation[0].Transfer;
    const transferredAmount = Number(transferInfo.amount.e8s);
    return transferredAmount === amount_sent;
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return false;
  }
};

// Function to handle the cycles top-up process
export const cyclesTopUp = async (currentUser) => {
  try {
    const actors = await createActors(currentUser);

    console.log("Converting rate...");
    const conversionRate =
      await actors.cycles.get_icp_xdr_conversion_rate();
    const actualRate = conversionRate.data.xdr_permyriad_per_icp.toString();
    const finalRate = Number(actualRate + CONVERSION_DETAILS.zeros);
    console.log("The final rate is:", finalRate);

    const amountInXDR = CONVERSION_DETAILS.rate * finalRate;
    console.log("The amount in XDR is:", amountInXDR);

    console.log("Handling plug payment...");
    const amount = CONVERSION_DETAILS.rate * 100000000;
    const result = await window.ic.plug.requestTransfer({
      to: walletAddress,
      amount,
      memo: "Testing",
    });
    console.log("The result of the transfer is:", result);

    const verified = await verifyTransaction(
      result.height.height,
      amount,
      actors.ledger
    );
    if (verified) {
      console.log("The transaction was verified!");
    } else {
      console.log("The transaction was not verified!");
      return;
    }

    console.log("Adding cycles...");
    const balancesBefore = await actors.distro.getBalances();
    console.log("The current balances of the canisters are:", balancesBefore);
    const topupResult = await actors.distro.addCyclesToAll(amountInXDR);
    console.log("The result of the topup is:", topupResult);
    const balancesAfter = await actors.distro.getBalances();
    console.log("The new balances of the canisters are:", balancesAfter);
  } catch (error) {
    console.error("Error in cycles top-up process:", error);
  }
};