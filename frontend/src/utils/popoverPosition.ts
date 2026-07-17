const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 8;

export interface PopoverCoords {
  top: number;
  left: number;
  width: number;
}

// Shared by DatePicker/SingleSelectDropdown/MultiSelectDropdown — decides
// where a floating popover should render relative to its trigger. Flips
// above the trigger if there isn't enough room below (this was the actual
// bug: a task card near the bottom of the viewport would open its status
// dropdown downward regardless, pushing "Completed" off-screen), flips to
// the trigger's right edge if it would overflow the viewport's right edge,
// and clamps so the popover always stays fully on-screen either way.
export function computePopoverPosition(triggerRect: DOMRect, estimatedHeight: number, minWidth: number): PopoverCoords {
  const width = Math.max(triggerRect.width, minWidth);

  const left =
    triggerRect.left + width > window.innerWidth - VIEWPORT_MARGIN ? triggerRect.right - width : triggerRect.left;

  const spaceBelow = window.innerHeight - triggerRect.bottom - TRIGGER_GAP;
  const spaceAbove = triggerRect.top - TRIGGER_GAP;
  const shouldFlipUp = estimatedHeight > spaceBelow && spaceAbove > spaceBelow;

  let top = shouldFlipUp ? triggerRect.top - estimatedHeight - TRIGGER_GAP : triggerRect.bottom + TRIGGER_GAP;
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, window.innerHeight - estimatedHeight - VIEWPORT_MARGIN));

  return { top, left: Math.max(VIEWPORT_MARGIN, left), width };
}

// Options lists render capped at max-h-60 (240px) with overflow-y-auto —
// this estimates the actual rendered height so short lists don't reserve
// (or flip for) more room than they'll really take up.
export function estimateListPopoverHeight(optionCount: number): number {
  const ROW_HEIGHT = 36;
  const CONTAINER_PADDING = 16;
  const MAX_HEIGHT = 240;
  return Math.min(Math.max(optionCount, 1) * ROW_HEIGHT + CONTAINER_PADDING, MAX_HEIGHT);
}
