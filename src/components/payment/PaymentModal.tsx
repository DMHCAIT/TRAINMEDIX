'use client';

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import type { Booking } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: Partial<Booking>;
  onPaymentSuccess: (method: Booking['paymentMethod']) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<Booking['paymentMethod']>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const basePrice = bookingData.amountPaid || 45000;
  const gstAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + gstAmount;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(paymentMethod);
      }, 1500);
    }, 2000);
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
              <div className="flex justify-between"><span>Payment Method:</span> <span className="font-semibold">{paymentMethod}</span></div>
              <div className="flex justify-between"><span>Hospital:</span> <span className="font-semibold">{bookingData.hospitalName}</span></div>
              <div className="flex justify-between"><span>Specialization:</span> <span className="font-semibold">{bookingData.subDepartment || bookingData.departmentName}</span></div>
              <div className="flex justify-between"><span>Broad Category:</span> <span className="font-semibold">{bookingData.departmentName}</span></div>
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
              <div className="border-t border-blue-200 pt-2 flex items-center justify-between font-bold text-sm text-slate-900">
                <span>Total Amount Payable:</span>
                <span className="text-[#2F855A] text-lg font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Select Payment Option
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI (GPay / PhonePe)', icon: Smartphone },
                  { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
                  { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
                  { id: 'EMI', label: 'Easy EMI Options', icon: Building },
                  { id: 'International Payment', label: 'International Card', icon: Globe }
                ].map((m) => {
                  const Icon = m.icon;
                  const selected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as Booking['paymentMethod'])}
                      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition touch-target ${
                        selected
                          ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${selected ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Form Inputs */}
            <form onSubmit={handlePay} className="space-y-4">
              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Enter VPA / UPI ID</label>
                  <input
                    type="text"
                    required
                    placeholder="doctor@okaxis / 9876543210@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none touch-target"
                  />
                </div>
              )}

              {(paymentMethod === 'Debit Card' || paymentMethod === 'Credit Card' || paymentMethod === 'International Payment') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4532 •••• •••• 8891"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none touch-target"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="MM / YY"
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none touch-target"
                    />
                    <input
                      type="password"
                      required
                      placeholder="CVV"
                      maxLength={3}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none touch-target"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'EMI' && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-[#2F855A]">Available No-Cost EMI Options:</p>
                  <p>• HDFC Bank — ₹{(totalAmount / 3).toFixed(0)} / mo (3 Months)</p>
                  <p>• ICICI Bank — ₹{(totalAmount / 6).toFixed(0)} / mo (6 Months)</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#2F855A] hover:bg-[#276749] text-white font-bold text-sm py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#2F855A]/20 touch-target cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isProcessing ? 'Processing Secure Payment...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} & Confirm Booking`}</span>
              </button>
            </form>

            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              256-bit Encrypted SSL Gateway · DMHCA Payment Protection
            </p>

          </div>
        )}

      </div>
    </div>
  );
};
