import React, { useState } from 'react';
import { Plus, Gift, ChevronDown, CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { getDotBgClass, getTextThemeClass, getTaskBgClass } from '../utils/themeHelpers';
import CategoryQuickAdd from './CategoryQuickAdd';

interface GiftsTabProps {
  giftsTasks: Task[];
  givenGiftTasks: Task[];
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

function GiftRow({
  task,
  colorVal,
  onEditTask,
  onToggleComplete,
  onDeleteTask,
  given = false,
}: {
  task: Task;
  colorVal: string;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  given?: boolean;
}) {
  return (
    <div
      onClick={(e) => {
        const isButton = (e.target as HTMLElement).closest('button');
        if (!isButton) onEditTask(task);
      }}
      className={`relative flex cursor-pointer items-center justify-between rounded-2xl border px-3.5 py-2 transition-all group ${
        given
          ? 'border-slate-100 bg-slate-50/50 text-slate-500'
          : `${getTaskBgClass(task.color || colorVal)} border-black/5 hover:shadow-md`
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className="shrink-0 text-slate-300 transition-colors hover:text-pink-500"
        >
          {given ? (
            <CheckCircle2 size={18} className="text-pink-500" />
          ) : (
            <Circle size={18} className="text-pink-200 hover:text-pink-400" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <span className={`text-sm font-bold text-slate-800 ${given ? 'font-semibold text-slate-400 line-through' : ''}`}>
            {task.title}
          </span>
          {task.notes && (
            <p className={`mt-1 truncate text-xs font-medium italic leading-relaxed ${given ? 'text-slate-400' : 'text-slate-500'}`}>
              {task.notes}
            </p>
          )}
        </div>
      </div>

      <div className="ml-3 flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => onEditTask(task)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-pink-50 hover:text-pink-600"
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

      {!given && (
        <div className="pointer-events-none absolute right-14 top-1.5 opacity-0 transition-opacity group-hover:opacity-10">
          <Gift size={11} className="text-pink-400" />
        </div>
      )}
    </div>
  );
}

const GiftsTab: React.FC<GiftsTabProps> = ({
  giftsTasks,
  givenGiftTasks,
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
  const [showGiven, setShowGiven] = useState(false);

  const startQuickAdd = (recName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (collapsedGifts[recName]) {
      onToggleCollapse(recName);
    }
    setQuickAddRecipient(recName);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setShowGiven(v => !v)}
          className={`text-[10px] font-light italic tracking-wide transition-colors sm:text-[11px] ${
            showGiven
              ? 'font-normal text-pink-600'
              : 'text-slate-500 hover:text-pink-500'
          }`}
        >
          {showGiven ? '← Актуальные подарки' : 'Подаренные'}
          {!showGiven && givenGiftTasks.length > 0 && (
            <span className="ml-1 font-semibold not-italic text-slate-400">({givenGiftTasks.length})</span>
          )}
        </button>

        {!showGiven && (
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

      {showGiven ? (
        givenGiftTasks.length === 0 ? (
          <div className="rounded-2xl border border-pink-100/60 bg-white py-12 text-center">
            <Gift size={40} className="mx-auto mb-3 text-pink-200" />
            <p className="text-sm font-medium text-slate-400">Пока нет подаренных подарков</p>
          </div>
        ) : (
          <div className="space-y-2">
            {givenGiftTasks.map(task =>
              React.createElement(GiftRow, {
                key: task.id,
                task,
                colorVal: 'pink',
                onEditTask,
                onToggleComplete,
                onDeleteTask,
                given: true,
              })
            )}
          </div>
        )
      ) : giftsTasks.length === 0 ? (
        <div className="rounded-2xl border border-pink-100/60 bg-white py-12 text-center">
          <Gift size={40} className="mx-auto mb-3 text-pink-200" />
          <p className="text-sm font-medium text-slate-400">Ваш список подарков пока пуст. Добавьте идеи подарков!</p>
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
              <div key={recName} className="animate-fade-in space-y-2.5">
                <div
                  onClick={() => onToggleCollapse(recName)}
                  className="group/rec flex cursor-pointer select-none items-center justify-between border-b border-pink-50 pb-1"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotBg}`} />
                    <h3 className={`text-base font-extrabold tracking-wide ${textTheme} decoration-2 group-hover/rec:underline`}>
                      {recName}
                    </h3>
                    <span className="ml-1 rounded-full border border-pink-100/50 bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-600">
                      {groupedGifts[recName].length}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => startQuickAdd(recName, e)}
                      className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-pink-50 hover:text-pink-600"
                      aria-label="Быстро добавить"
                      title="Быстро добавить"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-pink-50 hover:text-pink-600"
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
                    {groupedGifts[recName].map((task) =>
                      React.createElement(GiftRow, {
                        key: task.id,
                        task,
                        colorVal,
                        onEditTask,
                        onToggleComplete,
                        onDeleteTask,
                      })
                    )}

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