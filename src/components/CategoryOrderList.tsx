import React from 'react';
import { Reorder } from 'motion/react';
import { GripVertical } from 'lucide-react';
import { CatalogColorItem } from '../utils/catalogHelpers';
import { getDotBgClass } from '../utils/themeHelpers';

interface CategoryOrderListProps {
  items: CatalogColorItem[];
  onReorder: (items: CatalogColorItem[]) => void;
  emptyLabel: string;
}

export default function CategoryOrderList({ items, onReorder, emptyLabel }: CategoryOrderListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-[11px] font-medium text-slate-400">
        {emptyLabel}
      </p>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className="flex list-none flex-col gap-1.5"
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.name}
          value={item}
          className="flex cursor-grab items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm active:cursor-grabbing list-none"
          whileDrag={{ scale: 1.01, boxShadow: '0 8px 20px rgba(15,23,42,0.12)', zIndex: 10 }}
        >
          <GripVertical size={15} className="shrink-0 text-slate-300" aria-hidden />
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${getDotBgClass(item.color)}`} />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{item.name}</span>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}