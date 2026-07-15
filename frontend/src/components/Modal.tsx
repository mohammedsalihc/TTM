import { ReactNode, useEffect, useRef, useState } from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // Most forms fit max-w-md; wider forms (e.g. Add Project, with its two-
  // column date pickers) can opt into more room instead of everyone being
  // squeezed into the same width.
  maxWidthClassName?: string;
}

const TRANSITION_MS = 180;

// Shared shell for any "Add X" / "Edit X" form (Employees, Managers,
// Projects, ...) — pages own the open/close state and pass form content in.
function Modal({ isOpen, onClose, title, children, maxWidthClassName = 'max-w-md' }: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSettled, setHasSettled] = useState(false);
  const rafRef = useRef(0);

  // Stay mounted a beat after isOpen flips false so the exit transition can
  // actually play instead of the modal just vanishing.
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setHasSettled(false);
      // Double rAF: the first frame just commits the "hidden" starting
      // styles to the DOM; only the second flips to visible, giving the
      // browser a full paint in between so the transition actually plays
      // instead of snapping straight to the end state.
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setIsVisible(true));
        rafRef.current = raf2;
      });
      rafRef.current = raf1;
      return () => cancelAnimationFrame(rafRef.current);
    }
    setIsVisible(false);
    setHasSettled(false);
    const timeout = setTimeout(() => setShouldRender(false), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Once the enter transition finishes, drop the transform/transition
  // classes entirely instead of leaving `scale-100` (still a `transform`
  // declaration, even though it's a no-op numerically). Some browsers keep
  // treating an element with any transform as its own composited layer,
  // which can leave a child <img> preview looking soft until something
  // forces a repaint (e.g. zooming). No transform at rest = no layer = full
  // clarity immediately.
  useEffect(() => {
    if (!isVisible) return;
    const timeout = setTimeout(() => setHasSettled(true), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [isVisible]);

  useEffect(() => {
    if (!shouldRender) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidthClassName} bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-6 max-h-[90vh] overflow-y-auto ${
          hasSettled
            ? 'opacity-100'
            : `transition-all ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'}`
        }`}
        style={hasSettled ? undefined : { transitionDuration: `${TRANSITION_MS}ms` }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
