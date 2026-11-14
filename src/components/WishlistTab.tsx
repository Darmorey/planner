import React, { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import {
  Plus,
  Gift,
  ChevronDown,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  GripVertical,
} from 'lucide-react';
import { Task } from '../types';
import { getDotBgClass, getTextThemeClass, getTaskBgClass } from '../utils/themeHelpers';
import CategoryQuickAdd from './CategoryQuickAdd';
import { normalizeExternalUrl } from './forms/formHelpers';

interface WishlistTabProps {
  wishlistTasks: Task[];
  fulfilledWishlistTasks: Task[];
  wishlistCategories: any[];
  groupedWishes: { [key: string]: Task[] };
  orderedWishlistCategoryNames: string[];
  collapsedWishes: Record<string, boolean>;
  onToggleCollapse: (categoryName: string) => void;
  onAddTask: () => void;
  onQuickAdd: (categoryName: string, title: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderWishlistItems: (categoryName: string, ordered: Task[]) => void;
  accentBg: string;
  accentBgHover: string;
}

function WishRow({
  task,
  colorVal,
  onEditTask,
  onToggleComplete,
  onDeleteTask,
  fulfilled = false,
  draggable = false,
}: {
  task: Task;
  colorVal: string;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  fulfilled?: boolean;
  draggable?: boolean;
}) {
  const controls = useDragControls();

  const rowClass = `relative flex items-center justify-between rounded-2xl border px-3.5 py-2 transition-all group list-none ${
    fulfilled
      ? 'cursor-pointer bg-slate-50/50 border-slate-100 text-slate-500'
      : `cursor-pointer ${getTaskBgClass(task.color || colorVal)} border-black/5 hover:shadow-md`
  }`;

  const inner = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {draggable && (
          <button
            type="button"
            onPointerDown={(e) => controls.start(e)}
            className="shrink-0 touch-none cursor-grab rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
            data-no-tab-swipe
            aria-label="Перетащить желание"
          >
            <GripVertical size={14} strokeWidth={2} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className="shrink-0 text-slate-300 transition-colors hover:text-rose-500"
        >
          {fulfilled ? (
            <CheckCircle2 size={18} className="text-rose-500" />
          ) : (
            <Circle size={18} className="text-rose-200 hover:text-rose-400" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <span className={`text-sm font-bold text-slate-800 ${fulfilled ? 'font-semibold text-slate-400 line-through' : ''}`}>
            {task.title}
          </span>
          {task.notes && (
            <p className={`mt-1 truncate text-xs font-medium italic leading-relaxed ${fulfilled ? 'text-slate-400' : 'text-slate-500'}`}>
              {task.notes}
            </p>
          )}
          {task.link && (
            <a
              href={normalizeExternalUrl(task.link)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1 inline-flex max-w-full items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <ExternalLink size={11} className="shrink-0" />
              <span className="truncate">{task.link.replace(/^https?:\/\//i, '')}</span>
            </a>
          )}
        </div>
      </div>

      <div className="ml-3 flex shrink-0 gap-1.5">
        {task.link && (
          <a
            href={normalizeExternalUrl(task.link)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg p-1.5 text-sky-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
            title="Открыть ссылку"
            aria-label="Открыть ссылку"
          >
            <ExternalLink size={13} />
          </a>
        )}
        <button
          type="button"
          onClick={() => onEditTask(task)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <Edit2 size={13} />
        </button>
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="rounded-lg bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {!fulfilled && (
        <div className="pointer-events-none absolute right-14 top-1.5 opacity-0 transition-opacity group-hover:opacity-10">
          <Sparkles size={11} className="text-rose-400" />
        </div>
      )}
    </>
  );

  const onRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('a')) onEditTask(task);
  };

  if (draggable) {
    return (
      <Reorder.Item
        value={task}
        dragListener={false}
        dragControls={controls}
        layout="position"
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className={rowClass}
        whileDrag={{
          scale: 1.02,
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.14)',
          zIndex: 20,
        }}
        onClick={onRowClick}
      >
        {inner}
      </Reorder.Item>
    );
  }

  return (
    <div onClick={onRowClick} className={rowClass}>
      {inner}
    </div>
  );
}

function WishlistCategoryList({
  categoryName,
  tasks,
  colorVal,
  onReorder,
  onEditTask,
  onToggleComplete,
  onDeleteTask,
}: {
  categoryName: string;
  tasks: Task[];
  colorVal: string;
  onReorder: (categoryName: string, ordered: Task[]) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [orderedTasks, setOrderedTasks] = useState(tasks);

  useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  const handleReorder = (next: Task[]) => {
    setOrderedTasks(next);
    onReorder(categoryName, next);
  };

  return (
    <Reorder.Group
      axis="y"
      values={orderedTasks}
      onReorder={handleReorder}
      className="flex list-none flex-col gap-2"
    >
      {orderedTasks.map((task) =>
        React.createElement(WishRow, {
          key: task.id,
          task,
          colorVal,
          onEditTask,
          onToggleComplete,
          onDeleteTask,
          draggable: true,
        })
      )}
    </Reorder.Group>
  );
}

const WishlistTab: React.FC<WishlistTabProps> = ({
  wishlistTasks,
  fulfilledWishlistTasks,
  wishlistCategories,
  groupedWishes,
  orderedWishlistCategoryNames,
  collapsedWishes,
  onToggleCollapse,
  onAddTask,
  onQuickAdd,
  onEditTask,
  onToggleComplete,
  onDeleteTask,
  onReorderWishlistItems,
  accentBg,
  accentBgHover,
}) => {
  const [quickAddCategory, setQuickAddCategory] = useState<string | null>(null);
  const [showFulfilled, setShowFulfilled] = useState(false);

  const startQuickAdd = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (collapsedWishes[catName]) {
      onToggleCollapse(catName);
    }
    setQuickAddCategory(catName);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setShowFulfilled((v) => !v)}
          className={`text-[10px] font-light italic tracking-wide transition-colors sm:text-[11px] ${
            showFulfilled
              ? 'font-normal text-rose-600'
              : 'text-slate-500 hover:text-rose-500'
          }`}
        >
          {showFulfilled ? '← Актуальные желания' : 'Исполнилось'}
          {!showFulfilled && fulfilledWishlistTasks.length > 0 && (
            <span className="ml-1 font-semibold not-italic text-slate-400">({fulfilledWishlistTasks.length})</span>
          )}
        </button>

        {!showFulfilled && (
          <button
            type="button"
            onClick={onAddTask}
            title="Добавить"
            className={`flex shrink-0 items-center justify-center rounded-xl px-3 py-1.5 ${accentBg} ${accentBgHover} font-semibold text-white shadow-md transition-all hover:scale-102 active:scale-98`}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {showFulfilled ? (
        fulfilledWishlistTasks.length === 0 ? (
          <div className="rounded-2xl border border-[#D7897F]/20 bg-white py-12 text-center">
            <Gift size={40} className="mx-auto mb-3 text-rose-200" />
            <p className="text-sm font-medium text-slate-400">Пока нет исполненных желаний</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fulfilledWishlistTasks.map((task) =>
              React.createElement(WishRow, {
                key: task.id,
                task,
                colorVal: 'red',
                onEditTask,
                onToggleComplete,
                onDeleteTask,
                fulfilled: true,
              })
            )}
          </div>
        )
      ) : wishlistTasks.length === 0 ? (
        <div className="rounded-2xl border border-[#D7897F]/20 bg-white py-12 text-center">
          <Gift size={40} className="mx-auto mb-3 text-rose-200" />
          <p className="text-sm font-medium text-slate-400">Ваш список желаний пока пуст. Загадайте что-нибудь!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderedWishlistCategoryNames.map((catName) => {
            const catObj = wishlistCategories.find((c: any) => c.name === catName);
            const colorVal = catObj ? catObj.color : 'red';

            const dotBg = getDotBgClass(colorVal);
            const textTheme = getTextThemeClass(colorVal);
            const isCollapsed = !!collapsedWishes[catName];
            const showQuickAdd = quickAddCategory === catName && !isCollapsed;

            return (
              <div key={catName} className="animate-fade-in space-y-2.5">
                <div
                  onClick={() => onToggleCollapse(catName)}
                  className="group/cat flex cursor-pointer select-none items-center justify-between border-b border-rose-100/40 pb-1"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotBg}`} />
                    <h3 className={`text-base font-extrabold tracking-wide ${textTheme} decoration-2 group-hover/cat:underline`}>
                      {catName}
                    </h3>
                    <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                      {groupedWishes[catName].length}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => startQuickAdd(catName, e)}
                      className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-rose-100/30 hover:text-rose-500"
                      aria-label="Быстро добавить"
                      title="Быстро добавить"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-rose-100/30 hover:text-rose-500"
                      aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90 text-slate-400' : 'text-slate-600'}`}
                      />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-2">
                    <WishlistCategoryList
                      categoryName={catName}
                      tasks={groupedWishes[catName]}
                      colorVal={colorVal}
                      onReorder={onReorderWishlistItems}
                      onEditTask={onEditTask}
                      onToggleComplete={onToggleComplete}
                      onDeleteTask={onDeleteTask}
                    />

                    {showQuickAdd && (
                      <CategoryQuickAdd
                        placeholder="Новое желание…"
                        onSubmit={(title) => {
                          onQuickAdd(catName, title);
                          setQuickAddCategory(null);
                        }}
                        onCancel={() => setQuickAddCategory(null)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistTab;