export const GIVEN_GIFT_RECIPIENT = 'Подаренные';

export function isGivenGift(task: { isGift?: boolean; completed: boolean; giftRecipient?: string }): boolean {
  return !!task.isGift && (task.completed || task.giftRecipient === GIVEN_GIFT_RECIPIENT);
}

export function isActiveGift(task: { isGift?: boolean; completed: boolean; giftRecipient?: string }): boolean {
  return !!task.isGift && !isGivenGift(task);
}