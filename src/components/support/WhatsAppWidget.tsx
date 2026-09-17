'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  from: 'user' | 'bot';
  text: string;
  time: string;
}

const quickReplies = [
  'How do I book a rotation?',
  'What departments are available?',
  'How does DMHCA certification work?',
  'Can I pay via EMI?',
  'I need to reschedule my rotation',
];

const botResponses: Record<string, string> = {
  'how do i book a rotation?': 'You can book a clinical rotation in 3 simple steps:\n1. Browse departments & choose your specialty\n2. Select a DMHCA-accredited partner hospital\n3. Complete payment via UPI, card, or EMI\n\nHead to the "Book Rotation" tab to get started!',
  'what departments are available?': 'TrainMedix offers rotations across 11 super-specialty departments including Cardiology, Neurology, Orthopedics, Dermatology, Gastroenterology, Pulmonology, Nephrology, Oncology, Pediatrics, Radiology, and Emergency Medicine.',
  'how does dmhca certification work?': 'Upon completing your clinical rotation, TrainMedix issues an official DMHCA-verified digital certificate with a tamper-proof QR code. The certificate is verifiable by any institution worldwide.',
  'can i pay via emi?': 'Yes! TrainMedix supports multiple payment options including UPI, Credit/Debit Cards, Net Banking, and No-Cost EMI plans starting from ₹8,333/month for eligible programs.',
  'i need to reschedule my rotation': 'You can request a reschedule from your Trainee Dashboard under "My Bookings". Rescheduling is free if done 7+ days before the start date. For urgent changes, please contact our support team.',
};

export const WhatsAppWidget: React.FC = () => {
  const pathname = usePathname();
  const { activeTab } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      from: 'bot',
      text: 'Hello! 👋 I\'m TrainMedix Assistant. How can I help you with your clinical training journey today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (pathname?.startsWith('/admin') || activeTab === 'admin') {
    return null;
  }

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulated bot response
    setTimeout(() => {
      const key = text.trim().toLowerCase();
      const response = botResponses[key] || 'Thank you for reaching out! Our team will get back to you shortly. In the meantime, you can explore our departments and booking options on the platform.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        from: 'bot',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-15 h-15 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-2xl shadow-emerald-600/40 flex items-center justify-center cursor-pointer border border-emerald-400/30"
            aria-label="Open support chat"
          >
            <MessageSquare className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[390px] h-[520px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold font-heading">TrainMedix Support</h4>
                  <p className="text-[10px] text-[#E6F4F6] flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                    Online · Typically replies instantly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/60 min-h-0 no-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from === 'bot' && (
                    <div className="w-7 h-7 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <Bot className="w-4 h-4 text-emerald-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                      msg.from === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs font-medium'
                    }`}
                  >
                    {msg.text}
                    <p className={`text-[9px] mt-1.5 text-right font-mono ${msg.from === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                  {msg.from === 'user' && (
                    <div className="w-7 h-7 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <User className="w-4 h-4 text-blue-700" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t border-slate-200/80 bg-white/90 shrink-0">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {quickReplies.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => sendMessage(qr)}
                    className="bg-slate-100/90 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-slate-200/80 hover:border-blue-200/80 whitespace-nowrap transition cursor-pointer"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-3.5 py-3 border-t border-slate-200/80 bg-white flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50/80 border border-slate-300/80 rounded-2xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-medium"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40 text-white w-10 h-10 rounded-2xl flex items-center justify-center transition shrink-0 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
