import { NextResponse } from "next/server";
import { RazorpayProvider } from "@/lib/payment/razorpay-provider";
import { handleWebhookEvent } from "@/lib/subscription/subscription-service";
import PaymentEvent from "@/models/PaymentEvent";
import { logger } from "@/lib/monitoring/logger";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    await dbConnect();
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      logger.warn("RAZORPAY_WEBHOOK_NO_SIGNATURE", { requestId, reason: "Missing signature" });
      return NextResponse.json({ ok: false, error: "Missing Razorpay signature" }, { status: 400 });
    }

    const razorpayProvider = new RazorpayProvider();
    const isSignatureValid = razorpayProvider.verifyWebhookSignature(rawBody, signature);

    if (!isSignatureValid) {
      logger.warn("RAZORPAY_WEBHOOK_INVALID_SIGNATURE", { requestId, reason: "Invalid signature" });
      return NextResponse.json({ ok: false, error: "Invalid Razorpay signature" }, { status: 403 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.entity?.id || event.id; // Razorpay events have 'id' or 'entity.id'
    const eventType = event.event;

    // Idempotency check
    const existingEvent = await PaymentEvent.findOne({ provider: "razorpay", eventId });
    if (existingEvent && existingEvent.processed) {
      logger.info("RAZORPAY_WEBHOOK_DUPLICATE_EVENT", { requestId, eventId, eventType });
      return NextResponse.json({ ok: true, message: "Event already processed" }, { status: 200 });
    }

    // Record the event
    const paymentEvent = await PaymentEvent.create({
      provider: "razorpay",
      eventId,
      eventType,
      payload: event,
      payloadHash: crypto.createHash('sha256').update(rawBody).digest('hex'),
      processed: false,
    });

    await handleWebhookEvent("razorpay", eventType, event, paymentEvent._id);

    return NextResponse.json({ ok: true, message: "Webhook processed" }, { status: 200 });
  } catch (error: unknown) {
    logger.error("RAZORPAY_WEBHOOK_ERROR", {
      requestId,
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return NextResponse.json({ ok: false, error: `Webhook processing failed. (ID: ${requestId})` }, { status: 500 });
  }
}