import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon } from './icons';
import { computePopoverPosition, PopoverCoords } from '../utils/popoverPosition';

interface DatePickerProps {
  id?: string;
  value: string; // ISO yyyy-mm-dd, or '' for no selection
  onChange: (value: string) => void;
  placeholder?: string;
  // Greys out and blocks selecting any day before today, and stops "previous
  // month" navigation once the visible month is the current one — used
  // anywhere a past date wouldn't make sense (project/task due dates).
  disablePast?: boolean;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const POPOVER_WIDTH = 288; // matches w-72
// Worst case: header + weekday row + a 6-row month + the "Clear date" row,
// at p-5 padding — used to decide whether to flip the popover above the
// trigger instead of measuring after render.
const ESTIMATED_POPOVER_HEIGHT = 420;

const toIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseIso = (iso: string): Date | null => {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDisplay = (iso: string): string => {
  const date = parseIso(iso);
  if (!date) return '';
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
};

// Self-contained calendar popover — <input type="date">'s actual calendar
// widget is rendered by the OS/browser and can't be restyled beyond the
// text field itself, so this replaces it entirely for a consistent look.
//
// Rendered via a portal to document.body with `position: fixed`, computed
// from the trigger button's real screen coordinates — NOT `position:
// absolute` inside the form. This form lives inside Modal's scrollable
// content area, and an absolutely-positioned popover there gets clipped or
// spills outside the card instead of floating cleanly above everything.
function DatePicker({ id, value, onChange, placeholder = 'Select date', disablePast = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = parseIso(value);
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());
  const [coords, setCoords] = useState<PopoverCoords>({ top: 0, left: 0, width: POPOVER_WIDTH });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const openPicker = () => {
    setViewDate(selected ?? new Date());
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords(computePopoverPosition(rect, ESTIMATED_POPOVER_HEIGHT, POPOVER_WIDTH));
    }
    setIsOpen(true);
  };

  const goToMonth = (delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleSelectDay = (day: number) => {
    if (disablePast && isPastDay(day)) return;
    onChange(toIso(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)));
    setIsOpen(false);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstDayOfWeek });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  const isSelected = (day: number) =>
    !!selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
  const isPastDay = (day: number) => new Date(year, month, day) < todayStart;
  // Once the visible month is the current month, there's nothing earlier
  // that isn't fully in the past — stop navigation there instead of letting
  // the user browse into a month where every day is disabled.
  const isPrevMonthDisabled =
    disablePast && (year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth()));

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={openPicker}
        className="w-full flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white pl-3.5 pr-3 py-2.5 text-sm text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      >
        <span className="text-gray-400">
          <CalendarIcon size={16} />
        </span>
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value ? formatDisplay(value) : placeholder}</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width }}
            className="z-[60] bg-white rounded-2xl border border-gray-100 shadow-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                disabled={isPrevMonthDisabled}
                aria-label="Previous month"
                className="w-7 h-7 flex items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors text-xs disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              >
                &#9664;
              </button>
              <span className="text-base font-semibold text-indigo-600">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                aria-label="Next month"
                className="w-7 h-7 flex items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors text-xs"
              >
                &#9654;
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1.5">
              {leadingBlanks.map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {days.map((day) => {
                const disabled = disablePast && isPastDay(day);
                return (
                  <div key={day} className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      disabled={disabled}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                        disabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected(day)
                          ? 'bg-indigo-600 text-white font-semibold'
                          : isToday(day)
                          ? 'text-indigo-600 font-semibold hover:bg-indigo-50'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="mt-3 w-full text-center text-xs text-gray-400 hover:text-red-600 transition-colors py-1"
              >
                Clear date
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export default DatePicker;
