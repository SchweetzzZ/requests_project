import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  dotColor?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  leadingIcon?: ReactNode;
  variant?: 'toolbar' | 'form';
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

const WRAP_VARIANTS = {
  toolbar: 'min-w-[130px] max-w-[200px]',
  form: 'w-full',
};

const TRIGGER_VARIANTS = {
  toolbar:
    'h-9 w-full flex items-center justify-between gap-2 px-2.5 border border-zinc-200 rounded-lg bg-white text-zinc-700 text-xs font-medium cursor-pointer transition-all hover:enabled:border-zinc-300 hover:enabled:bg-zinc-50 shadow-2xs',
  form: 'h-11 w-full flex items-center justify-between gap-2.5 px-3.5 border border-zinc-300 rounded-[10px] bg-white text-ink text-[13.5px] font-semibold cursor-pointer transition-all hover:enabled:border-zinc-400',
};

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Selecione…',
  leadingIcon,
  variant = 'toolbar',
  disabled = false,
  ariaLabel,
  className = '',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  function updateCoords() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = Math.min(options.length * 36 + 10, 220);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 10 && rect.top > menuHeight;

    const top = openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4;
    setCoords({
      top: Math.max(8, top),
      left: rect.left,
      width: variant === 'form' ? rect.width : Math.max(rect.width, 160),
    });
  }

  function handleToggle() {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }

  function handleSelect(optValue: T) {
    onChange(optValue);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    function handleScroll(event: Event) {
      if (menuRef.current && menuRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const isFilterActive = variant === 'toolbar' && value !== '';

  return (
    <div className={`relative ${WRAP_VARIANTS[variant]} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`${TRIGGER_VARIANTS[variant]} ${isFilterActive ? 'border-violet-400! bg-violet-50/70! !text-violet-800 !font-semibold' : ''} ${isOpen ? '!border-violet-600 !ring-2 !ring-violet-600/15' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {leadingIcon && <span className="text-zinc-500 flex items-center shrink-0">{leadingIcon}</span>}
          {selectedOption?.dotColor && (
            <span
              className="h-[7px] w-[7px] rounded-full inline-block shrink-0"
              style={{ backgroundColor: selectedOption.dotColor }}
            />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          size={variant === 'toolbar' ? 13 : 14}
          className={`text-zinc-500 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            className="bg-white border border-zinc-200 rounded-lg p-1 shadow-lg animate-dropdown max-h-60 overflow-y-auto"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
            role="listbox"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-md border-0 bg-transparent text-zinc-800 text-xs font-medium text-left cursor-pointer transition-colors hover:bg-zinc-100 hover:text-black ${opt.value === value ? '!bg-violet-50 !text-violet-700 !font-semibold' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.dotColor && (
                  <span
                    className="h-[7px] w-[7px] rounded-full inline-block shrink-0"
                    style={{ backgroundColor: opt.dotColor }}
                  />
                )}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
