export const FULFILLED_WISHLIST_CATEGORY = 'Исполнилось';

export function isFulfilledWish(task: { isWishlist?: boolean; completed: boolean; wishlistCategory?: string }): boolean {
  return !!task.isWishlist && (task.completed || task.wishlistCategory === FULFILLED_WISHLIST_CATEGORY);
}

export function isActiveWish(task: { isWishlist?: boolean; completed: boolean; wishlistCategory?: string }): boolean {
  return !!task.isWishlist && !isFulfilledWish(task);
}
