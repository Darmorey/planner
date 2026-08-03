import React, { useState } from 'react';
import { Plus, ListTodo, ChevronDown, CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { getDotBgClass, getTextThemeClass, getTaskBgClass } from '../utils/themeHelpers';
import CategoryQuickAdd from './CategoryQuickAdd';

interface SomedayTabProps {
  somedayTasks: Task[];
  somedayCategories: any[];
  groupedSomeday: { [key: string]: Task[] };
  orderedSomedayCategoryNames: string[];
  collapsedSomeday: Record<string, boolean>;
  onToggleCollapse: (categoryName: string) => void;
  onAddTask: () => void;
  onQuickAdd: (categoryName: string, title: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  accentBg: string;
  accentBgHover: string;
}

const SomedayTab: React.FC<SomedayTabProps> = ({
  somedayTasks,
  somedayCategories,
  groupedSomeday,
  orderedSomedayCategoryNames,
  collapsedSomeday,
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
    if (collapsedSomeday[catName]) {
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

      {somedayTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#6D9773]/15 font-medium">
          <ListTodo size={40} className="mx-auto text-[#6D9773]/40 mb-3" />
          <p className="text-slate-400 text-sm">Ваш список «Без срока» пока пуст. Добавьте идеи или планы!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderedSomedayCategoryNames.map((catName) => {
            const catObj = somedayCategories.find((c: any) => c.name === catName);
            const colorVal = catObj ? catObj.color : 'dark';

            const dotBg = getDotBgClass(colorVal);
            const textTheme = getTextThemeClass(colorVal);
            const isCollapsed = !!collapsedSomeday[catName];
            const showQuickAdd = quickAddCategory === catName && !isCollapsed;

            return (
              <div key={catName} className="space-y-2.5 animate-fade-in">
                <div
                  onClick={() => onToggleCollapse(catName)}
                  className="flex items-center justify-between pb-1 border-b border-[#6D9773]/10 cursor-pointer select-none group/cat"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`} />
                    <h3 className={`text-base font-extrabold ${textTheme} tracking-wide group-hover/cat:underline decoration-2`}>
                      {catName}
                    </h3>
                    <span className="text-[10px] text-slate-450 font-bold px-2 py-0.5 bg-[#6D9773]/10 rounded-full ml-1 border border-[#6D9773]/15">
                      {groupedSomeday[catName].length}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => startQuickAdd(catName, e)}
                      className="p-1 hover:bg-[#6D9773]/10 rounded-lg text-slate-400 hover:text-[#6D9773] transition-colors"
                      aria-label="Быстро добавить"
                      title="Быстро добавить"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-[#6D9773]/10 rounded-lg text-slate-400 hover:text-[#6D9773] transition-colors"
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
                    {groupedSomeday[catName].map((task) => {
                      const itemCol = task.color || colorVal;

                      return (
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
                              : `${getTaskBgClass(itemCol)} border-black/5 hover:shadow-md`
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                            <button
                              onClick={() => onToggleComplete(task.id)}
                              className="p-0.5 text-slate-400 hover:text-[#6D9773] shrink-0"
                            >
                              {task.completed ? (
                                <CheckCircle2 size={19} className="text-[#6D9773] animate-scale-up" />
                              ) : (
                                <Circle size={19} className="text-slate-350 hover:text-[#6D9773]/80" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <span className={`text-sm font-bold text-slate-800 ${task.completed ? 'line-through text-slate-400 font-semibold' : ''}`}>
                                {task.title}
                              </span>
                              {task.notes && (
                                <p className="text-xs text-slate-500 mt-1 font-medium italic truncate">{task.notes}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1.5 shrink-0 ml-3">
                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1.5 hover:bg-[#6D9773]/10 text-slate-400 hover:text-[#6D9773] rounded-lg transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-105 text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {showQuickAdd && (
                      <CategoryQuickAdd
                        placeholder="Новая задача…"
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

export default SomedayTab;
