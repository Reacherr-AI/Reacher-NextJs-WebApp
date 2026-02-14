import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';
import type { BedrockJobMonitorWebhookRequestBody } from '@/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isBedrockJobMonitorWebhookRequestBody = (
  value: unknown
): value is BedrockJobMonitorWebhookRequestBody => {
  if (!isRecord(value)) return false;
  if (typeof value.jobId !== 'string' || value.jobId.trim().length === 0) return false;
  if (typeof value.status !== 'string' || value.status.trim().length === 0) return false;
  return true;
};

export async function POST(req: Request) {
  const payload = await req.text().catch(() => '');

  if (!payload.trim()) {
    return NextResponse.json({ message: 'Request body is required.' }, { status: 400 });
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(payload) as unknown;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isBedrockJobMonitorWebhookRequestBody(parsedPayload)) {
    return NextResponse.json(
      { message: 'Request body must include non-empty jobId and status fields.' },
      { status: 400 }
    );
  }

  const res = await apiFetch('/api/v1/webhook/bedrock-job-monitor', {
    method: 'POST',
    body: JSON.stringify({
      jobId: parsedPayload.jobId.trim(),
      status: parsedPayload.status.trim(),
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const parsed = await parseJsonResponse<unknown>(res);
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  if (res.status === 202 || res.status === 204) {
    return new NextResponse(null, { status: res.status });
  }

  const parsed = await parseJsonResponse<unknown>(res);
  return NextResponse.json(parsed.data, { status: parsed.status });
}


// TESTING
// curl -X POST "https://7ba2-203-110-82-13.ngrok-free.app/api/webhook/bedrock-job-monitor" \
//   -H "Content-Type: application/json" \
//   -d '{
//         "jobId": "YOUR_REAL_INGESTION_JOB_ID",
//         "status": "COMPLETE"
//       }'