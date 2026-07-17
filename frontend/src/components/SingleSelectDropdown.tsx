import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from './icons';
import { computePopoverPosition, estimateListPopoverHeight, PopoverCoords } from '../utils/popoverPosition';

export interface SelectOption {
  id: string;
  name: string;
}

interface SingleSelectDropdownProps {
  id?: string;
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  // Smaller trigger sizing for space-constrained contexts (e.g. a status
  // control on a task board card) — same component/behavior, just less
  // visual weight than the standard form-field sizing.
  compact?: boolean;
}

const MIN_POPOVER_WIDTH = 280;

// Same portal + fixed-position + visual language as DatePicker and
// MultiSelectDropdown — a plain native <select> looks out of place next to
// those, and this form lives inside Modal's scrollable content area, so a
// `position: absolute` popover here would clip/overlap sibling fields.
function SingleSelectDropdown({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select',
  emptyMessage = 'No options yet',
  compact = false,
}: SingleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords>({ top: 0, left: 0, width: 0 });
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

  const toggleOpen = () => {
    if (!isOpen) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setCoords(computePopoverPosition(rect, estimateListPopoverHeight(options.length), MIN_POPOVER_WIDTH));
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const selectedName = options.find((option) => option.id === value)?.name;
  const triggerPadding = compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2.5 text-sm';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${triggerPadding}`}
      >
        <span className={`truncate ${selectedName ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedName ?? placeholder}
        </span>
        <span className="text-gray-400 shrink-0">
          <ChevronDownIcon size={compact ? 14 : 16} />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width }}
            className="z-[60] bg-white rounded-2xl border border-gray-100 shadow-xl py-2 max-h-60 overflow-y-auto"
          >
            {options.length === 0 ? (
              <p className="text-sm text-gray-400 px-3.5 py-2.5">{emptyMessage}</p>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                    option.id === value ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export default SingleSelectDropdown;
