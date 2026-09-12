'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertCircle
} from 'lucide-react';
import type { Booking } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: Partial<Booking>;
  onPaymentSuccess: (method: Booking['paymentMethod']) => void;
}

// Loads the Razorpay Checkout script once and reuses it on subsequent opens
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onPaymentSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paidMethod, setPaidMethod] = useState<Booking['paymentMethod']>('UPI');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const basePrice = bookingData.amountPaid || 45000;
  const gstAmount = Math.round(basePrice * 0.18);
  const razorpayFee = Math.round(basePrice * 0.04);
  const totalAmount = basePrice + gstAmount + razorpayFee;

  const handlePayWithRazorpay = async () => {
    setError('');
    setIsProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout. Please check your connection.');
      }

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          receipt: `booking_${Date.now()}`,
          notes: {
            hospitalName: bookingData.hospitalName,
            departmentName: bookingData.departmentName
          }
        })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order.');
      }

      const rzp = new (window as any).Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'DMHCA / TrainMedix',
        description: `${bookingData.departmentName || 'Clinical Rotation'} - ${bookingData.hospitalName || ''}`,
        order_id: orderData.order.id,
        prefill: {
          name: bookingData.traineeName,
          email: bookingData.traineeEmail,
          contact: bookingData.traineePhone
        },
        theme: { color: '#2F855A' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json();

            if (!verifyData.success || !verifyData.verified) {
              setError(verifyData.error || 'Payment verification failed. Please contact support.');
              setIsProcessing(false);
              return;
            }

            setPaidMethod(verifyData.paymentMethod || 'UPI');
            setIsSuccess(true);
            setIsProcessing(false);
            setTimeout(() => {
              onPaymentSuccess(verifyData.paymentMethod || 'UPI');
            }, 1500);
          } catch (err: any) {
            setError('Payment succeeded but verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false)
        }
      });

      rzp.on('payment.failed', (resp: any) => {
        setError(resp?.error?.description || 'Payment failed. Please try again.');
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong while starting the payment.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-slate-900">

        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">DMHCA Secure Payment Desk</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg touch-target flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Payment Successful!</h2>
            <p className="text-xs text-slate-600">
              Your hospital training slot has been reserved. Booking Confirmation & Receipt sent via Email & WhatsApp.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between"><span>Amount Paid:</span> <span className="font-bold text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Payment Method:</span> <span className="font-semibold">{paidMethod}</span></div>
              <div className="flex justify-between"><span>Hospital:</span> <span className="font-semibold">{bookingData.hospitalName}</span></div>
              <div className="flex justify-between"><span>Specialization:</span> <span className="font-semibold">{bookingData.subDepartment || bookingData.departmentName}</span></div>
              <div className="flex justify-between"><span>Category:</span> <span className="font-semibold">{bookingData.departmentName}</span></div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">

            {/* Price Summary Breakdown */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Clinical Training Fee ({bookingData.duration}):</span>
                <span className="font-semibold">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>GST (18% Govt Tax):</span>
                <span className="font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Razorpay (4%):</span>
                <span className="font-semibold">₹{razorpayFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex items-center justify-between font-bold text-sm text-slate-900">
                <span>Total Amount Payable:</span>
                <span className="text-[#2F855A] text-lg font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 text-center">
              You'll be redirected to Razorpay's secure checkout to pay via UPI, Card, Netbanking, or Wallet.
            </p>

            {error && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handlePayWithRazorpay}
              disabled={isProcessing}
              className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-sm py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/20 touch-target cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Opening Secure Checkout...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} with Razorpay`}</span>
            </button>

            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              256-bit Encrypted SSL Gateway · Powered by Razorpay
            </p>

          </div>
        )}

      </div>
    </div>
  );
};

