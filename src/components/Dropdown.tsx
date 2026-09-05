import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}

export interface DropdownGroup {
  label?: string;
  items: DropdownItem[];
}

export interface DropdownProps {
  trigger: React.ReactNode;
  groups: DropdownGroup[];
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  groups,
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignClass} mt-2 w-52 bg-surface rounded-lg border border-border shadow-xl py-1.5 z-40 origin-top-right transition-all transform`}
          style={{
            animation: 'dropdownEntrance 150ms cubic-bezier(0, 0, 0.2, 1) forwards'
          }}
        >
          {groups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {groupIdx > 0 && <div className="border-t border-border my-1" />}
              {group.label && (
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.08em]">
                  {group.label}
                </div>
              )}
              {group.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3.5 py-2 text-xs font-semibold select-none text-left rounded-md transition-colors leading-none ${
                    item.danger
                      ? 'text-danger hover:bg-danger-bg'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  {item.icon && <span className="mr-2 text-current flex items-center">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes dropdownEntrance {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
export default Dropdown;

