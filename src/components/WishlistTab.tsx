import React, { useState } from 'react';
import { Plus, Gift, ChevronDown, CheckCircle2, Circle, Edit2, Trash2, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { getDotBgClass, getTextThemeClass, getTaskBgClass } from '../utils/themeHelpers';
import CategoryQuickAdd from './CategoryQuickAdd';

interface WishlistTabProps {
  wishlistTasks: Task[];
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
  accentBg: string;
  accentBgHover: string;
}

const WishlistTab: React.FC<WishlistTabProps> = ({
  wishlistTasks,
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
  accentBg,
  accentBgHover,
}) => {
  const [quickAddCategory, setQuickAddCategory] = useState<string | null>(null);

  const startQuickAdd = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (collapsedWishes[catName]) {
      onToggleCollapse(catName);
    }
    setQuickAddCategory(catName);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end pt-1">
        <button
          onClick={onAddTask}
          title="Добавить"
          className={`flex items-center justify-center px-3 py-1.5 ${accentBg} ${accentBgHover} text-white font-semibold rounded-xl shadow-md transition-all hover:scale-102 active:scale-98`}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      {wishlistTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#D7897F]/20">
          <Gift size={40} className="mx-auto text-rose-200 mb-3" />
          <p className="text-slate-400 text-sm font-medium">Ваш список желаний пока пуст. Загадайте что-нибудь!</p>
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
              <div key={catName} className="space-y-2.5 animate-fade-in">
                <div
                  onClick={() => onToggleCollapse(catName)}
                  className="flex items-center justify-between pb-1 border-b border-rose-100/40 cursor-pointer select-none group/cat"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`} />
                    <h3 className={`text-base font-extrabold ${textTheme} tracking-wide group-hover/cat:underline decoration-2`}>
                      {catName}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 bg-slate-100 rounded-full ml-1">
                      {groupedWishes[catName].length}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => startQuickAdd(catName, e)}
                      className="p-1 hover:bg-rose-100/30 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      aria-label="Быстро добавить"
                      title="Быстро добавить"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-rose-100/30 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
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
                    {groupedWishes[catName].map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          const isButton = (e.target as HTMLElement).closest('button');
                          if (!isButton) {
                            onEditTask(task);
                          }
                        }}
                        className={`relative border px-3.5 py-2 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                          task.completed
                            ? 'bg-slate-50/30 border-slate-100 text-slate-400 line-through opacity-80'
                            : `${getTaskBgClass(task.color || colorVal)} border-black/5 hover:shadow-md`
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <button
                            onClick={() => onToggleComplete(task.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 size={18} className="text-rose-500" />
                            ) : (
                              <Circle size={18} className="text-rose-200 hover:text-rose-400" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <span className={`text-sm font-bold text-slate-800 ${task.completed ? 'line-through text-slate-400 font-semibold' : ''}`}>
                              {task.title}
                            </span>
                            {task.notes && (
                              <p className="text-xs text-slate-500 mt-1 italic font-medium leading-relaxed truncate">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1.5 shrink-0 ml-3">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {!task.completed && (
                          <div className="absolute right-14 top-1.5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Sparkles size={11} className="text-rose-400" />
                          </div>
                        )}
                      </div>
                    ))}

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
