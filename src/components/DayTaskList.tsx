import React, { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { CheckCircle2, Circle, Clock, Trash2, GripVertical } from 'lucide-react';
import { Task } from '../types';
import { getTaskBgClass, getTaskBorderLeftClass, getDotBgClass, getTextThemeClass } from '../utils/themeHelpers';
import { isTaskCompletedOnDate } from '../utils/taskHelpers';
import { getTaskColorHint } from '../utils/taskColorHints';

interface DayTaskListProps {
  tasks: Task[];
  selectedDate: string;
  defaultColor: string;
  onReorder: (tasks: Task[]) => void;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function DayTaskRow({
  task,
  selectedDate,
  defaultColor,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  task: Task;
  selectedDate: string;
  defaultColor: string;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) {
  const controls = useDragControls();
  const isCompleted = isTaskCompletedOnDate(task, selectedDate);
  const color = task.color || defaultColor;
  const hint = getTaskColorHint(color);

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      layout="position"
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className={`group flex items-center gap-1 rounded-2xl border list-none cursor-pointer px-2 py-1.5 ${
        isCompleted
          ? 'border-slate-100 border-l-[3px] border-l-slate-300 bg-slate-50/30 text-slate-400 line-through opacity-80'
          : `border-slate-100 border-l-[3px] hover:shadow-md ${getTaskBgClass(color)} ${getTaskBorderLeftClass(color)}`
      } ${!isCompleted ? 'shadow-sm' : ''}`}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.14)',
        zIndex: 20,
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button')) onEdit(task);
      }}
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="-ml-0.5 shrink-0 touch-none cursor-grab rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
        data-no-tab-swipe
        aria-label="Перетащить задачу"
      >
        <GripVertical size={14} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={() => onToggleComplete(task.id)}
        className="shrink-0 border-0 bg-transparent p-0 leading-none text-slate-400 transition-colors hover:text-[#6D9773]"
        aria-label={isCompleted ? 'Снять отметку' : 'Отметить выполненной'}
        title={hint && !isCompleted ? hint.label : undefined}
      >
        {isCompleted ? (
          <CheckCircle2 size={16} className="text-[#6D9773]" />
        ) : hint ? (
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full font-bold leading-none ring-1 ring-black/10 ${getDotBgClass(color)} ${getTextThemeClass(color)}`}
          >
            {hint.letter}
          </span>
        ) : (
          <Circle size={16} className="text-slate-300 hover:text-[#6D9773]/80" />
        )}
      </button>

      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-medium">{task.title}</p>
        {task.time && (
          <div className="mt-0.5 flex items-center text-[10px] text-slate-400">
            <span className="flex items-center gap-0.5 rounded border border-amber-100 bg-amber-50 px-1 py-px text-[9px] font-semibold text-amber-700">
              <Clock size={10} className="shrink-0 text-amber-600" />
              <span>{task.time}</span>
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="shrink-0 rounded-md p-1 text-red-400 opacity-60 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title="Удалить"
        aria-label="Удалить"
      >
        <Trash2 size={13} />
      </button>
    </Reorder.Item>
  );
}

export default function DayTaskList({
  tasks,
  selectedDate,
  defaultColor,
  onReorder,
  onToggleComplete,
  onEdit,
  onDelete,
}: DayTaskListProps) {
  const [orderedTasks, setOrderedTasks] = useState(tasks);

  useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  const handleReorder = (next: Task[]) => {
    setOrderedTasks(next);
    onReorder(next);
  };

  return (
    <Reorder.Group
      axis="y"
      values={orderedTasks}
      onReorder={handleReorder}
      className="mt-2.5 flex list-none flex-col gap-2"
    >
      {orderedTasks.map((task) =>
        React.createElement(DayTaskRow, {
          key: task.id,
          task,
          selectedDate,
          defaultColor,
          onToggleComplete,
          onEdit,
          onDelete,
        })
      )}
    </Reorder.Group>
  );
}
