import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  flexRatio?: string; // e.g. "flex-[2]", "flex-[1.5]"
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal = (a as any)[sortField];
    let bVal = (b as any)[sortField];

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return sortOrder === 'asc' 
      ? aVal - bVal
      : bVal - aVal;
  });

  return (
    <div className="w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden select-none">
      {/* Header Row */}
      <div className="flex items-center h-10 px-5 bg-surface-2 border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-[0.06em]">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={`flex items-center ${col.flexRatio || 'flex-1'} ${
              col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
            } ${col.sortable ? 'cursor-pointer hover:text-text-primary' : ''}`}
            onClick={() => col.sortable && typeof col.accessor === 'string' && handleSort(col.accessor as string)}
          >
            <span>{col.header}</span>
            {col.sortable && (
              <ArrowUpDown className="w-3 h-3 ml-1 text-text-faint" />
            )}
          </div>
        ))}
      </div>

      {/* Body Rows */}
      <div className="divide-y divide-border">
        {sortedData.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick && onRowClick(row)}
            className={`group flex items-center h-14 px-5 text-sm transition-colors duration-100 hover:bg-brand-light/40 ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
          >
            {columns.map((col, idx) => {
              const value = typeof col.accessor === 'function'
                ? col.accessor(row)
                : (row as any)[col.accessor as string];

              return (
                <div
                  key={idx}
                  className={`flex items-center ${col.flexRatio || 'flex-1'} ${
                    col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                  } text-text-secondary group-hover:text-text-primary`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
export default DataTable;

