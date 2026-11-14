import React, { useEffect, useRef, useState } from 'react';
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
  onReorderWishlistCategories: (orderedNames: string[]) => void;
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
  onDragEnd,
}: {
  task: Task;
  colorVal: string;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  fulfilled?: boolean;
  draggable?: boolean;
  onDragEnd?: () => void;
}) {
  const controls = useDragControls();

  const rowClass = `group relative flex w-full list-none items-center gap-1 rounded-2xl border px-2 py-1.5 ${
    fulfilled
      ? 'cursor-pointer border-slate-100 bg-slate-50/50 text-slate-500'
      : `cursor-pointer border-black/5 shadow-sm ${getTaskBgClass(task.color || colorVal)} hover:shadow-md`
  }`;

  const inner = (
    <>
      {draggable && (
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          className="-ml-0.5 shrink-0 touch-none cursor-grab rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
          data-no-tab-swipe
          aria-label="Перетащить желание"
        >
          <GripVertical size={14} strokeWidth={2} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onToggleComplete(task.id)}
        className="shrink-0 border-0 bg-transparent p-0 text-slate-300 transition-colors hover:text-rose-500"
      >
        {fulfilled ? (
          <CheckCircle2 size={16} className="text-rose-500" />
        ) : (
          <Circle size={16} className="text-rose-200 hover:text-rose-400" />
        )}
      </button>

      <div className="min-w-0 flex-1 leading-tight">
        <p className={`truncate text-sm font-bold ${fulfilled ? 'font-semibold text-slate-400 line-through' : 'text-slate-800'}`}>
          {task.title}
        </p>
        {task.notes && (
          <p className={`mt-0.5 truncate text-xs font-medium italic ${fulfilled ? 'text-slate-400' : 'text-slate-500'}`}>
            {task.notes}
          </p>
        )}
        {task.link && (
          <a
            href={normalizeExternalUrl(task.link)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
          >
            <ExternalLink size={11} className="shrink-0" />
            <span className="truncate">{task.link.replace(/^https?:\/\//i, '')}</span>
          </a>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {task.link && (
          <a
            href={normalizeExternalUrl(task.link)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg p-1 text-sky-500 opacity-70 transition-colors hover:bg-sky-50 hover:text-sky-700 group-hover:opacity-100"
            title="Открыть ссылку"
            aria-label="Открыть ссылку"
          >
            <ExternalLink size={13} />
          </a>
        )}
        <button
          type="button"
          onClick={() => onEditTask(task)}
          className="rounded-lg p-1 text-slate-400 opacity-60 transition-colors hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
        >
          <Edit2 size={13} />
        </button>
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="rounded-lg p-1 text-red-400 opacity-60 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </button>
      </div>
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
          cursor: 'grabbing',
        }}
        onDragEnd={() => onDragEnd?.()}
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
  const latestOrderRef = useRef(orderedTasks);

  useEffect(() => {
    setOrderedTasks((prev) => {
      const prevIds = prev.map((t) => t.id).join('|');
      const nextIds = tasks.map((t) => t.id).join('|');
      if (prevIds === nextIds) return prev;
      return tasks;
    });
  }, [tasks]);

  useEffect(() => {
    latestOrderRef.current = orderedTasks;
  }, [orderedTasks]);

  const handleReorder = (next: Task[]) => {
    setOrderedTasks(next);
    latestOrderRef.current = next;
  };

  const persistOrder = () => {
    onReorder(categoryName, latestOrderRef.current);
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
          onDragEnd: persistOrder,
        })
      )}
    </Reorder.Group>
  );
}

function WishlistCategorySection({
  catName,
  colorVal,
  dotBg,
  textTheme,
  isCollapsed,
  showQuickAdd,
  tasks,
  onToggleCollapse,
  onStartQuickAdd,
  onQuickAdd,
  onCancelQuickAdd,
  onReorderWishlistItems,
  onEditTask,
  onToggleComplete,
  onDeleteTask,
  onCategoryDragEnd,
}: {
  catName: string;
  colorVal: string;
  dotBg: string;
  textTheme: string;
  isCollapsed: boolean;
  showQuickAdd: boolean;
  tasks: Task[];
  onToggleCollapse: (name: string) => void;
  onStartQuickAdd: (name: string, e: React.MouseEvent) => void;
  onQuickAdd: (name: string, title: string) => void;
  onCancelQuickAdd: () => void;
  onReorderWishlistItems: (categoryName: string, ordered: Task[]) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCategoryDragEnd: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={catName}
      dragListener={false}
      dragControls={controls}
      layout="position"
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="list-none space-y-2.5"
      whileDrag={{
        scale: 1.01,
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)',
        zIndex: 15,
      }}
      onDragEnd={onCategoryDragEnd}
    >
      <div
        onClick={() => onToggleCollapse(catName)}
        className="group/cat flex cursor-pointer select-none items-center justify-between border-b border-rose-100/40 pb-1"
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              e.stopPropagation();
              controls.start(e);
            }}
            className="shrink-0 touch-none cursor-grab rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
            data-no-tab-swipe
            aria-label="Переместить категорию"
            title="Переместить категорию"
          >
            <GripVertical size={15} strokeWidth={2} />
          </button>
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotBg}`} />
          <h3 className={`truncate text-base font-extrabold tracking-wide ${textTheme} decoration-2 group-hover/cat:underline`}>
            {catName}
          </h3>
          <span className="ml-0.5 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
            {tasks.length}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => onStartQuickAdd(catName, e)}
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
            tasks={tasks}
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
                onCancelQuickAdd();
              }}
              onCancel={onCancelQuickAdd}
            />
          )}
        </div>
      )}
    </Reorder.Item>
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
  onReorderWishlistCategories,
  accentBg,
  accentBgHover,
}) => {
  const [quickAddCategory, setQuickAddCategory] = useState<string | null>(null);
  const [showFulfilled, setShowFulfilled] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState(orderedWishlistCategoryNames);
  const latestCategoryOrderRef = useRef(categoryOrder);

  useEffect(() => {
    setCategoryOrder((prev) => {
      const prevJoin = prev.join('|');
      const nextJoin = orderedWishlistCategoryNames.join('|');
      if (prevJoin === nextJoin) return prev;
      return orderedWishlistCategoryNames;
    });
  }, [orderedWishlistCategoryNames]);

  useEffect(() => {
    latestCategoryOrderRef.current = categoryOrder;
  }, [categoryOrder]);

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
        <Reorder.Group
          axis="y"
          values={categoryOrder}
          onReorder={(next) => {
            setCategoryOrder(next);
            latestCategoryOrderRef.current = next;
          }}
          className="flex list-none flex-col gap-6"
        >
          {categoryOrder.map((catName) => {
            const catObj = wishlistCategories.find((c: any) => c.name === catName);
            const colorVal = catObj ? catObj.color : 'red';

            return (
              <WishlistCategorySection
                key={catName}
                catName={catName}
                colorVal={colorVal}
                dotBg={getDotBgClass(colorVal)}
                textTheme={getTextThemeClass(colorVal)}
                isCollapsed={!!collapsedWishes[catName]}
                showQuickAdd={quickAddCategory === catName && !collapsedWishes[catName]}
                tasks={groupedWishes[catName]}
                onToggleCollapse={onToggleCollapse}
                onStartQuickAdd={startQuickAdd}
                onQuickAdd={onQuickAdd}
                onCancelQuickAdd={() => setQuickAddCategory(null)}
                onReorderWishlistItems={onReorderWishlistItems}
                onEditTask={onEditTask}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onCategoryDragEnd={() => onReorderWishlistCategories(latestCategoryOrderRef.current)}
              />
            );
          })}
        </Reorder.Group>
      )}
    </div>
  );
};

export default WishlistTab;