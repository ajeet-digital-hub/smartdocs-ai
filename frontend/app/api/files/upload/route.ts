import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/authOptions";
import { BackblazeProvider, StorageConfigurationError } from "@/lib/storage/backblaze-provider";
import dbConnect from "@/lib/dbConnect";
import { getPlan, type PlanId } from "@/lib/plan-config";
import StoredDocument from "@/models/Document";
import Subscription from "@/models/Subscription";
import UserStorage from "@/models/UserStorage";

const SUPPORTED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "A file is required." }, { status: 400 });
    if (!SUPPORTED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ ok: false, error: "Unsupported or invalid file." }, { status: 400 });

    await dbConnect();
    const subscription = await Subscription.findOne({ userId: session.user.id, status: "ACTIVE" }).sort({ updatedAt: -1 });
    const plan = getPlan((subscription?.planId ?? "free") as PlanId);
    if (!plan || plan.limits.storageGB <= 0) return NextResponse.json({ ok: false, error: "Your plan does not include persistent document storage.", upgradeUrl: "/pricing" }, { status: 403 });
    const storageLimit = plan.limits.storageGB * 1024 * 1024 * 1024;
    const storage = await UserStorage.findOne({ userId: session.user.id });
    if ((storage?.usedStorageBytes ?? 0) + file.size > storageLimit) return NextResponse.json({ ok: false, error: "Storage limit exceeded.", upgradeUrl: "/pricing" }, { status: 413 });

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const key = `${session.user.id}/${crypto.randomUUID()}.${extension}`;
    const provider = new BackblazeProvider();
    await provider.upload(key, new Uint8Array(await file.arrayBuffer()), file.type);
    let storageAccounted = false;
    try {
      const updatedStorage = await UserStorage.findOneAndUpdate(
        { userId: session.user.id, usedStorageBytes: { $lte: storageLimit - file.size } },
        { $inc: { usedStorageBytes: file.size }, $setOnInsert: { storageLimitGB: plan.limits.storageGB } },
        { upsert: true, new: true }
      );
      if (!updatedStorage) throw new Error("Storage limit exceeded.");
      storageAccounted = true;
      const document = await StoredDocument.create({ userId: session.user.id, originalName: file.name, storageKey: key, mimeType: file.type, size: file.size, status: "UPLOADED" });
      return NextResponse.json({ ok: true, document: { id: document._id.toString(), originalName: document.originalName, status: document.status } }, { status: 201 });
    } catch (error) {
      if (storageAccounted) await UserStorage.updateOne({ userId: session.user.id }, { $inc: { usedStorageBytes: -file.size } });
      await provider.delete(key);
      throw error;
    }
  } catch (error: unknown) {
    if (error instanceof StorageConfigurationError) return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
