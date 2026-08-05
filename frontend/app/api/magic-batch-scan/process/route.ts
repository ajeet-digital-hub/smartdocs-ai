import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MagicBatchScan from '@/models/MagicBatchScan';
import { processBatch } from '@/lib/magic-batch-scan/processor';

/**
 * POST /api/magic-batch-scan/cron-worker
 *
 * This is a secure endpoint intended to be called by a Vercel Cron Job.
 * It finds one 'QUEUED' batch, marks it as 'PROCESSING', and runs the job.
 * This ensures jobs are processed sequentially and durably.
 */
export async function POST(req: NextRequest) {
  // 1. Secure the endpoint
  const authToken = (req.headers.get('authorization') || '').split('Bearer ')[1];
  if (authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

// 2. Find and atomically update one queued job to prevent race conditions
  const batch = await MagicBatchScan.findOneAndUpdate(
    { status: 'QUEUED' } as any,
    { $set: { status: 'PROCESSING', processingStartedAt: new Date() } },
    { sort: { createdAt: 1 }, new: false } // Find oldest, return original
  );

  if (!batch) {
    return NextResponse.json({ ok: true, message: 'No queued jobs to process.' });
  }

  // 3. Execute the long-running job
  try {
    await processBatch(batch._id.toString(), batch.userId.toString());
  } catch (error) {
    console.error(`[CRON_WORKER] Background processing failed for batch ${batch._id}:`, error);
  }

  return NextResponse.json({ ok: true, message: `Processing started for batch ${batch._id}.` });
}