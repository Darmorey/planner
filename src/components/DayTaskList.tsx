import React, { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import {
  CheckCircle2, Circle, Clock, Edit2, Trash2, GripVertical,
} from 'lucide-react';
import { Task } from '../types';
import { getTaskBgClass, getTaskBorderLeftClass } from '../utils/themeHelpers';
import { isTaskCompletedOnDate } from '../utils/taskHelpers';

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

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      layout="position"
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className={`flex items-center justify-between px-3.5 py-2 rounded-2xl border group cursor-pointer list-none ${
        isCompleted
          ? 'bg-slate-50/30 border-slate-100 border-l-4 border-l-slate-300 text-slate-400 line-through opacity-80'
          : `border-slate-100 border-l-4 hover:shadow-md ${getTaskBgClass(color)} ${getTaskBorderLeftClass(color)}`
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
      <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          className="shrink-0 touch-none rounded-lg p-1 text-slate-300 transition-colors hover:bg-black/5 hover:text-slate-500 active:cursor-grabbing cursor-grab"
          aria-label="Перетащить задачу"
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className="shrink-0 border-0 bg-transparent p-0.5 text-slate-400 transition-colors hover:text-[#6D9773]"
        >
          {isCompleted ? (
            <CheckCircle2 size={19} className="text-[#6D9773]" />
          ) : (
            <Circle size={19} className="text-slate-300 hover:text-[#6D9773]/80" />
          )}
        </button>

        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">{task.title}</p>
          {task.time && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-700">
                <Clock size={11} className="shrink-0 text-amber-600" />
                <span>{task.time}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[#6D9773]/10 hover:text-[#6D9773]"
          title="Редактировать"
        >
          <Edit2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="rounded-lg bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100"
          title="Удалить"
        >
          <Trash2 size={14} />
        </button>
      </div>
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
      className="mt-2.5 flex list-none flex-col gap-2.5"
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
