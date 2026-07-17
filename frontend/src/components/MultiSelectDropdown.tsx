import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from './icons';
import { computePopoverPosition, estimateListPopoverHeight, PopoverCoords } from '../utils/popoverPosition';

export interface MultiSelectOption {
  id: string;
  name: string;
}

interface MultiSelectDropdownProps {
  id?: string;
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

const MIN_POPOVER_WIDTH = 280;

// Same portal + fixed-position pattern as DatePicker — this form lives
// inside Modal's scrollable content area, so a plain `position: absolute`
// dropdown here would get clipped/overlap sibling fields instead of
// floating cleanly above everything.
function MultiSelectDropdown({
  id,
  options,
  selectedIds,
  onChange,
  placeholder = 'Select',
  emptyMessage = 'No options yet',
}: MultiSelectDropdownProps) {
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

  const toggleOption = (optionId: string) => {
    onChange(selectedIds.includes(optionId) ? selectedIds.filter((id) => id !== optionId) : [...selectedIds, optionId]);
  };

  const selectedNames = options.filter((option) => selectedIds.includes(option.id)).map((option) => option.name);
  const displayText =
    selectedNames.length === 0
      ? placeholder
      : selectedNames.length <= 2
      ? selectedNames.join(', ')
      : `${selectedNames.slice(0, 2).join(', ')} +${selectedNames.length - 2} more`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={toggleOpen}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      >
        <span className={`truncate ${selectedNames.length ? 'text-gray-900' : 'text-gray-400'}`}>{displayText}</span>
        <span className="text-gray-400 shrink-0">
          <ChevronDownIcon size={16} />
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
                <label
                  key={option.id}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {option.name}
                </label>
              ))
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export default MultiSelectDropdown;
