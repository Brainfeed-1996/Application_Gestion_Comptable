import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_KEYS } from '@/lib/constants';

async function verifySignature(req: NextRequest, signature: string): Promise<boolean> {
  const body = await req.text();
  const secret = process.env.WEBHOOK_SECRET || 'default_secret';

  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('webhook-signature') || '';
    const valid = await verifySignature(req, signature);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = await req.json();
    const event = body.event || body.type;

    switch (event) {
      case 'payment.succeeded':
        console.log('Payment succeeded:', body.data?.id);
        break;
      case 'payment.failed':
        console.log('Payment failed:', body.data?.id);
        break;
      case 'invoice.paid':
        console.log('Invoice paid:', body.data?.id);
        break;
      default:
        console.log('Unhandled event:', event);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
