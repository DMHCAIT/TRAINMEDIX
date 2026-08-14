'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  className = '',
  icon,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Detect available screen space below to determine whether to drop down or pop up
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 220 && rect.top > 220) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${isOpen ? 'z-[999]' : 'z-10'} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-white border rounded-2xl px-3.5 py-3 text-xs font-semibold text-left transition flex items-center justify-between gap-2 shadow-2xs cursor-pointer select-none ${isOpen
          ? 'border-[#2F855A] ring-2 ring-[#2F855A]/20 shadow-md'
          : 'border-[#CBE5D7] hover:border-[#2F855A]'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-[#2F855A] shrink-0">{icon}</span>}
          <span className={`truncate ${selectedOption ? 'text-slate-900 font-extrabold' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-[#2F855A]" />
        </motion.div>
      </button>

      {/* Animated Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: dropUp ? -4 : 4, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute left-0 right-0 z-[999] max-h-56 overflow-y-auto bg-white border-2 border-[#C5DED0] rounded-2xl shadow-2xl p-1.5 space-y-0.5 ring-1 ring-black/5 ${
              dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            }`}
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ x: 2 }}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition flex items-center justify-between gap-2 cursor-pointer ${isSelected
                      ? 'bg-[#EBF7F1] text-[#2F855A]'
                      : 'text-slate-700 hover:bg-[#F4F9F6] hover:text-[#2F855A]'
                      }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#2F855A] shrink-0 font-bold" />}
                  </motion.button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
