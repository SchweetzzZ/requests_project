import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { components } from '../api/schema';

type Status = components['schemas']['AlterarStatusSolicitacaoDto']['status'];

interface StatusDropdownProps {
  status: Status;
  disabled?: boolean;
  onChange: (newStatus: Status) => void;
  ariaLabel?: string;
}

interface StatusOption {
  value: Status;
  label: string;
  dotColor: string;
}

const STATUS_STYLES: Record<Status, string> = {
  Aberto: 'text-amber-800 bg-amber-50/90 border border-amber-200/80 hover:bg-amber-100/70',
  'Em Atendimento': 'text-sky-800 bg-sky-50/90 border border-sky-200/80 hover:bg-sky-100/70',
  Concluído: 'text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 hover:bg-emerald-100/70',
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'Aberto', label: 'Aberto', dotColor: '#d97706' },
  { value: 'Em Atendimento', label: 'Em Atendimento', dotColor: '#0284c7' },
  { value: 'Concluído', label: 'Concluído', dotColor: '#16a34a' },
];

export function StatusDropdown({
  status,
  disabled = false,
  onChange,
  ariaLabel,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];

  function updateCoords() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 114;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 10 && rect.top > menuHeight;

    const top = openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4;
    setCoords({
      top: Math.max(8, top),
      left: rect.left,
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

  function handleSelect(newStatus: Status) {
    if (newStatus !== status) {
      onChange(newStatus);
    }
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

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        className={`cursor-pointer inline-flex items-center gap-1.5 h-[25px] px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all select-none hover:shadow-2xs max-sm:text-[10px] max-sm:h-[23px] max-sm:px-2 ${STATUS_STYLES[currentOption.value]} ${isOpen ? 'ring-2 ring-violet-500/25' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || `Status: ${status}`}
      >
        <span className="h-1.5 w-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: currentOption.dotColor }} />
        <span>{status}</span>
        {disabled ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <ChevronDown
            size={11}
            className={`text-current opacity-70 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            className="bg-white border border-zinc-200 rounded-lg p-1 shadow-lg animate-dropdown min-w-[140px]"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            role="listbox"
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === status}
                className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-md border-0 bg-transparent text-zinc-800 text-xs font-medium text-left cursor-pointer transition-colors hover:bg-zinc-100 hover:text-black ${opt.value === status ? '!bg-violet-50 !text-violet-700 !font-semibold' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="h-1.5 w-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: opt.dotColor }} />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
