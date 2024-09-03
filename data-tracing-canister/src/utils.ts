import { Principal } from "azle";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate an ID of a type Principal.
 * @returns a Principal ID.
 */
export function generateId(): Principal {
  // Generate a UUID as a string
  const uuidString = uuidv4();

  // Convert the UUID string to a Uint8Array
  const encoder = new TextEncoder();
  const uuidBytes = encoder.encode(uuidString);

  // Convert the UUID bytes to a Principal
  const uuidPrincipal = Principal.fromUint8Array(Uint8Array.from(uuidBytes));

  return uuidPrincipal;
}
