'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Expected format: YYYY-MM-DD or DD-MM-YYYY or empty
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select Date',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value into a Date object or fallback to today
  const parseDate = (valString: string): Date => {
    if (!valString) return new Date();
    // Handles YYYY-MM-DD or DD-MM-YYYY
    if (valString.includes('-')) {
      const parts = valString.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    const d = new Date(valString);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const selectedDate = value ? parseDate(value) : null;
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  // Update viewDate when popover opens or value changes
  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Format date to standard string format YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number): string => {
    const y = year.toString();
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Format date for display button e.g. "01-09-2026" or "1 Sep 2026"
  const getDisplayValue = (): string => {
    if (!value) return placeholder;
    const d = parseDate(value);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calendar Days calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const dateStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(dateStr);
    setViewDate(today);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const today = new Date();
  const isCurrentMonthToday =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const todayDay = today.getDate();

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-white border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-left transition flex items-center justify-between gap-2 shadow-2xs cursor-pointer select-none ${
          isOpen
            ? 'border-[#3597A4] ring-2 ring-[#3597A4]/20 shadow-md'
            : 'border-[#3597A4]'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-[#3597A4] shrink-0" />
          <span className={`truncate ${value ? 'text-slate-900 font-extrabold font-mono' : 'text-slate-400'}`}>
            {getDisplayValue()}
          </span>
        </div>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-slate-400 hover:text-rose-500 p-0.5 rounded-full transition"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Animated Floating Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 z-50 w-72 bg-white/95 backdrop-blur-md border border-[#E6F4F6] rounded-3xl shadow-2xl p-4 text-slate-900"
          >
            {/* Header: Month & Year navigation */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-900 font-heading">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-[#E6F4F6] text-slate-600 hover:text-[#3597A4] flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-[#E6F4F6] text-slate-600 hover:text-[#3597A4] flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center py-2">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="text-[10px] font-bold text-slate-400 uppercase">
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const isSelected =
                  selectedDate &&
                  selectedDate.getFullYear() === currentYear &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getDate() === dayNumber;

                const isToday = isCurrentMonthToday && todayDay === dayNumber;

                return (
                  <motion.button
                    key={`day-${dayNumber}`}
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSelectDay(dayNumber)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer relative mx-auto ${
                      isSelected
                        ? 'bg-[#3597A4] text-white shadow-md shadow-[#3597A4]/30'
                        : isToday
                        ? 'bg-[#E6F4F6] text-[#3597A4] border border-[#3597A4]'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#3597A4]'
                    }`}
                  >
                    {dayNumber}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] font-bold">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[#3597A4] hover:underline cursor-pointer"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
