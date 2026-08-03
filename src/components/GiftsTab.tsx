import React, { useState } from 'react';
import { Plus, Gift, ChevronDown, CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { getDotBgClass, getTextThemeClass, getTaskBgClass } from '../utils/themeHelpers';
import CategoryQuickAdd from './CategoryQuickAdd';

interface GiftsTabProps {
  giftsTasks: Task[];
  giftRecipients: any[];
  groupedGifts: { [key: string]: Task[] };
  orderedGiftRecipientNames: string[];
  collapsedGifts: Record<string, boolean>;
  onToggleCollapse: (recipientName: string) => void;
  onAddTask: () => void;
  onQuickAdd: (recipientName: string, title: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  accentBg: string;
  accentBgHover: string;
}

const GiftsTab: React.FC<GiftsTabProps> = ({
  giftsTasks,
  giftRecipients,
  groupedGifts,
  orderedGiftRecipientNames,
  collapsedGifts,
  onToggleCollapse,
  onAddTask,
  onQuickAdd,
  onEditTask,
  onToggleComplete,
  onDeleteTask,
  accentBg,
  accentBgHover,
}) => {
  const [quickAddRecipient, setQuickAddRecipient] = useState<string | null>(null);

  const startQuickAdd = (recName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (collapsedGifts[recName]) {
      onToggleCollapse(recName);
    }
    setQuickAddRecipient(recName);
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

      {giftsTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-pink-100/60">
          <Gift size={40} className="mx-auto text-pink-200 mb-3" />
          <p className="text-slate-400 text-sm font-medium">Ваш список подарков пока пуст. Добавьте идеи подарков!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderedGiftRecipientNames.map((recName) => {
            const recObj = giftRecipients.find((r: any) => r.name === recName);
            const colorVal = recObj ? recObj.color : 'blue';

            const dotBg = getDotBgClass(colorVal);
            const textTheme = getTextThemeClass(colorVal);
            const isCollapsed = !!collapsedGifts[recName];
            const showQuickAdd = quickAddRecipient === recName && !isCollapsed;

            return (
              <div key={recName} className="space-y-2.5 animate-fade-in">
                <div
                  onClick={() => onToggleCollapse(recName)}
                  className="flex items-center justify-between pb-1 border-b border-pink-50 cursor-pointer select-none group/rec"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`} />
                    <h3 className={`text-base font-extrabold ${textTheme} tracking-wide group-hover/rec:underline decoration-2`}>
                      {recName}
                    </h3>
                    <span className="text-[10px] text-pink-600 bg-pink-50 font-bold px-2 py-0.5 rounded-full ml-1 border border-pink-100/50">
                      {groupedGifts[recName].length}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => startQuickAdd(recName, e)}
                      className="p-1 hover:bg-pink-50 rounded-lg text-slate-400 hover:text-pink-600 transition-colors"
                      aria-label="Быстро добавить"
                      title="Быстро добавить"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-pink-50 rounded-lg text-slate-400 hover:text-pink-600 transition-colors"
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
                    {groupedGifts[recName].map((task) => (
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
                            className="text-slate-300 hover:text-pink-500 transition-colors shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 size={18} className="text-pink-500" />
                            ) : (
                              <Circle size={18} className="text-pink-200 hover:text-pink-400" />
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
                            className="p-1.5 hover:bg-pink-50 text-slate-400 hover:text-pink-600 rounded-lg transition-colors"
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
                            <Gift size={11} className="text-pink-400" />
                          </div>
                        )}
                      </div>
                    ))}

                    {showQuickAdd && (
                      <CategoryQuickAdd
                        placeholder="Новый подарок…"
                        onSubmit={(title) => {
                          onQuickAdd(recName, title);
                          setQuickAddRecipient(null);
                        }}
                        onCancel={() => setQuickAddRecipient(null)}
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

export default GiftsTab;
