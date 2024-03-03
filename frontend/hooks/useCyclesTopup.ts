// Importing IC agent and asset manager for interacting with the Internet Computer.
import { HttpAgent, Actor } from "@dfinity/agent";
// Importing interfaces for cycles top-up feature..
import * as cycles from "../interfaces/cmc/cmc";
import * as ledger from "../interfaces/ledger/index";
import * as distro from "../interfaces/distro/index";

// Importing the wallet address along with the canisterId
import { walletAddress } from "../config";

// Function to create actors for interacting with various canisters
export const createActors = async (currentUser: any) => {
  // Create actors for cycles, ledger, and distro canisters
  const cyclesActor = Actor.createActor(cycles.idlFactory, {
    agent: currentUser.agent as HttpAgent,
    canisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai", // Canister ID for cycles actor
  });
  const ledgerActor = Actor.createActor(ledger.idlFactory, {
    agent: currentUser.agent as HttpAgent,
    canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai", // Canister ID for ledger actor
  });
  const distroActor = Actor.createActor(distro.idlFactory, {
    agent: currentUser.agent as HttpAgent,
    canisterId: "jeb4e-myaaa-aaaak-aflga-cai", // Canister ID for distro actor
  });

  return {
    cycles: cyclesActor,
    ledger: ledgerActor,
    distro: distroActor,
  };
};

// Function to verify a transaction on the ledger
export const verifyTransaction = async (
  block_height: number,
  amount_sent: number,
  actor: any
) => {
  // Create a basic HTTP agent
  const basicAgent = new HttpAgent({ host: "https://ic0.app" });
  const ledgerActor = actor;

  // Query the ledger for transaction details
  const result: any = await ledgerActor.query_blocks({
    start: block_height,
    length: 1,
  });

  // Extract transfer information from the transaction
  const transferInfo = result!.blocks[0].transaction.operation[0].Transfer;

  // Parse transferred amount from the transaction
  const transferredAmount = Number(transferInfo.amount.e8s);

  // Verify if transferred amount matches the expected amount
  if (transferredAmount === amount_sent) {
    return true; // Transaction verified
  } else {
    return false; // Transaction not verified
  }
};

// Main function to handle the cycles top-up process
export const cyclesTopUp = async (currentUser: any) => {
  // Create actors for interacting with canisters
  const actors = await createActors(currentUser);

  // Convert ICP to cycles
  console.log("Converting rate...");
  const conversionRate: any = await actors.cycles.get_icp_xdr_conversion_rate();
  const actualRate = conversionRate.data.xdr_permyriad_per_icp.toString();
  const requiredZeros = "00000000";
  const finalRate = Number(actualRate + requiredZeros);
  console.log("The final rate is: ", finalRate);

  // Calculate amount of cycles to top up
  const amountOfICP = 0.01;
  const amountInXDR = amountOfICP * finalRate;
  console.log("The amount in XDR is: ", amountInXDR);

  // Initiate payment using the Plug Wallet
  console.log("Handling plug payment...");
  const to = walletAddress;
  const amount = amountOfICP * 100000000;
  console.log(amount);
  const memo = "Testing";
  const result = await (window as any).ic.plug.requestTransfer({
    to,
    amount,
    memo,
  });
  console.log("The result of the transfer is: ", result);

  // Verify the transaction on the ledger
  console.log("Verifying the transaction...");
  const verified = await verifyTransaction(
    result.height,
    amount,
    actors.ledger
  );
  if (verified) {
    console.log("The transaction was verified!");
  } else {
    console.log("The transaction was not verified!");
    return;
  }

  // Add cycles to all canisters
  console.log("Adding cycles...");
  const balancesBefore = await actors.distro.getBalances();
  console.log("The current balances of the canisters are: ", balancesBefore);
  const topupResult = await actors.distro.addCyclesToAll(amountInXDR);
  console.log("The result of the topup is: ", topupResult);
  const balancesAfter = await actors.distro.getBalances();
  console.log("The new balances of the canisters are: ", balancesAfter);
};