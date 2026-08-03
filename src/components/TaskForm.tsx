import { Task } from '../types';
import WishlistForm from './forms/WishlistForm';
import GiftForm from './forms/GiftForm';
import SomedayForm from './forms/SomedayForm';
import DailyTaskForm from './forms/DailyTaskForm';
import { FormSubmitPayload } from './forms/formHelpers';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: FormSubmitPayload) => void;
  initialTask?: Task | null;
  defaultDate?: string;
  defaultIsWishlist?: boolean;
  defaultIsGift?: boolean;
  defaultIsSomeday?: boolean;
  defaultGiftRecipient?: string;
  defaultWishlistCategory?: string;
  defaultSomedayCategory?: string;
  onZoomImage?: (imgUrl: string) => void;
}

export default function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultDate,
  defaultIsWishlist,
  defaultIsGift,
  defaultIsSomeday,
  defaultGiftRecipient,
  defaultWishlistCategory,
  defaultSomedayCategory,
  onZoomImage,
}: TaskFormProps) {
  // Mode must come from initialTask when editing (same logic as the former useEffect)
  const isWishlist = initialTask ? !!initialTask.isWishlist : !!defaultIsWishlist;
  const isGift = initialTask ? !!initialTask.isGift : !!defaultIsGift;
  const isSomeday = initialTask
    ? ((!initialTask.isWishlist && !initialTask.isGift && !initialTask.date) || !!defaultIsSomeday)
    : !!defaultIsSomeday;

  if (isWishlist) {
    return (
      <WishlistForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        initialTask={initialTask}
        defaultWishlistCategory={defaultWishlistCategory}
        onZoomImage={onZoomImage}
      />
    );
  }

  if (isGift) {
    return (
      <GiftForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        initialTask={initialTask}
        defaultGiftRecipient={defaultGiftRecipient}
        onZoomImage={onZoomImage}
      />
    );
  }

  if (isSomeday) {
    return (
      <SomedayForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        initialTask={initialTask}
        defaultDate={defaultDate}
        defaultSomedayCategory={defaultSomedayCategory}
        onZoomImage={onZoomImage}
      />
    );
  }

  return (
    <DailyTaskForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialTask={initialTask}
      defaultDate={defaultDate}
      onZoomImage={onZoomImage}
    />
  );
}
