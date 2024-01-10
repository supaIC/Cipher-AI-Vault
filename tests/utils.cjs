const CRC32 = require("crc-32");

function updateChecksum(chunk, checksum) {
  const moduloValue = 400000000; // Range: 0 to 400_000_000

  // Calculate the signed checksum for the given chunk
  const signedChecksum = CRC32.buf(Buffer.from(chunk, "binary"), 0);

  // Convert the signed checksum to an unsigned value
  const unsignedChecksum = signedChecksum >>> 0;

  // Update the checksum and apply modulo operation
  const updatedChecksum = (checksum + unsignedChecksum) % moduloValue;

  // Return the updated checksum
  return updatedChecksum;
}

module.exports = {
  updateChecksum,
};
