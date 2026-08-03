export interface TaskRecurrence {
  pattern: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval?: number; // e.g. every X days
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export type TaskCategory = 'task' | 'event'; // 'task' = Задача, 'event' = Событие
export type TaskScope = 'personal' | 'work'; // 'personal' = Личные, 'work' = Рабочие

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  scope: TaskScope;
  date?: string; // YYYY-MM-DD, optional for "someday" tasks
  time?: string; // HH:MM, optional
  duration?: number; // in minutes, optional
  endDate?: string; // YYYY-MM-DD, optional for multi-day tasks/events
  endTime?: string; // HH:MM, optional
  completed: boolean;
  isWishlist?: boolean; // if true, belongs to the Wishlist tab
  isGift?: boolean; // if true, belongs to the Gifts tab
  wishlistCategory?: string; // Custom category for wishlist items (e.g., Одежда, Дом, Хобби)
  giftRecipient?: string; // Custom recipient/person for gifts (e.g., Папа, Мама, Лёша, Бабушка)
  somedayCategory?: string; // Custom category for someday tasks (e.g., Идеи, Планы, Покупки, Разное)
  notes?: string;
  link?: string; // Optional URL (primarily for wishlist items)
  recurrence: TaskRecurrence;
  color?: string; // Added color field for selecting custom task/event color
  image?: string; // Base64 encoded compressed image uri (primarily for wishes/gifts)
  excludedDates?: string[]; // Array of YYYY-MM-DD strings where this recurring task is excluded/deleted
  completedDates?: string[]; // Array of YYYY-MM-DD strings where this recurring task is completed
}

export interface DayNote {
  id: string;
  /** YYYY-MM-DD; omit/empty = show every day */
  date?: string;
  title: string;
  content: string;
  createdAt: number;
}
