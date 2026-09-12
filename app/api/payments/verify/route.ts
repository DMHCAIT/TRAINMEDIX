import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Maps Razorpay's payment method to the app's Booking.paymentMethod values
const mapPaymentMethod = (method?: string, cardType?: string): string => {
  switch (method) {
    case 'upi': return 'UPI';
    case 'card': return cardType === 'credit' ? 'Credit Card' : 'Debit Card';
    case 'emi': return 'EMI';
    case 'netbanking':
    case 'wallet': return 'International Payment';
    default: return 'UPI';
  }
};

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: 'Razorpay credentials are not configured on the server.' },
        { status: 500 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification fields.' },
        { status: 400 }
      );
    }

    // Recompute the expected signature server-side; never trust the client's claim of success
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed.' },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    return NextResponse.json({
      success: true,
      verified: true,
      paymentMethod: mapPaymentMethod(payment.method, (payment as any).card?.type)
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify Razorpay payment' },
      { status: 500 }
    );
  }
}
