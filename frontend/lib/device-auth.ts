import { NextResponse } from "next/server";
import Device from "@/models/Device";
import dbConnect from "@/lib/dbConnect";

/**
 * Helper to extract and verify a device token from Authorization header.
 * Used by device-authenticated endpoints.
 */
export async function verifyDeviceToken(
  request: Request,
  options: { skipSave?: boolean } = {}
): Promise<{
  device: InstanceType<typeof Device> | null;
  error?: string;
  status?: number;
}> {
  try {
    // Ensure DB connection is established before any Mongoose operations
    await dbConnect();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { device: null, error: "Missing or invalid Authorization header", status: 401 };
    }

    const token = authHeader.substring(7);
    if (!token || token.length < 64) { // Device tokens are 32 bytes hex, so 64 chars
      return { device: null, error: "Invalid device token", status: 401 };
    }

    // The dbConnect is now called at the beginning of the function.
    // This try-catch block is for potential errors during the findOne operation.
    // No need for a nested dbConnect here.

    const device = await Device.findOne({ deviceToken: token });
    if (!device) {
      return { device: null, error: "Device not found or token revoked", status: 401 };
    }

    if (!options.skipSave) {
      device.lastSeen = new Date();
      device.status = "online";
      await device.save();
    }

    return { device };
  } catch (error: unknown) {
    // More structured logging for better monitoring
    const err = error as Error;
    console.error("DEVICE TOKEN VERIFY ERROR:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      tokenPrefix: request.headers.get("Authorization")?.substring(0, 10) + "...",
      route: request.url,
    });
    return { device: null, error: "Failed to verify device token", status: 500 };
  }
}
