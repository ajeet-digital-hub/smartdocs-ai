import Device from "@/models/Device";
import crypto from "crypto";

/**
 * Verify a device token by hashing it and looking up the hash in the database.
 * Returns the Device document if found, or null if the token is invalid/missing.
 */
export async function verifyDeviceToken(token?: string) {
  if (!token) return null;
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const device = await Device.findOne({ clientTokenHash: hash });
  return device;
}

