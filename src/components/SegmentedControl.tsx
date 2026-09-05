import React from 'react';

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selectedValue: string;
  onChange: (val: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onChange
}) => {
  const activeIndex = options.findIndex(o => o.value === selectedValue);

  return (
    <div className="relative flex p-0.5 bg-surface-2 border border-border rounded-md select-none w-fit">
      {/* Sliding active indicator */}
      <div
        className="absolute top-0.5 bottom-0.5 bg-surface rounded-sm shadow-sm transition-all duration-150 ease-out"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${activeIndex * (100 / options.length)}% + 2px)`
        }}
      />
      
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-sm transition-colors duration-150 ease ${
            selectedValue === option.value
              ? 'text-text-primary'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          style={{ width: '90px' }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
export default SegmentedControl;

