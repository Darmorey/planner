import { ThemeId, getDefaultTaskColor } from './themeTypes';
import { FULFILLED_WISHLIST_CATEGORY } from './wishlistHelpers';
import { GIVEN_GIFT_RECIPIENT } from './giftHelpers';

export const WISHLIST_CATEGORIES_STORAGE_KEY = 'wishlist_categories_custom';
export const GIFT_RECIPIENTS_STORAGE_KEY = 'gift_recipients_custom';

export interface CatalogColorItem {
  name: string;
  color: string;
}

export const DEFAULT_WISHLIST_CATEGORIES: CatalogColorItem[] = [
  { name: 'Одежда', color: 'red' },
  { name: 'Дом', color: 'green' },
  { name: 'Хобби', color: 'purple' },
];

export function getDefaultGiftRecipients(theme: ThemeId = 'standard'): CatalogColorItem[] {
  return [
    { name: 'Папа', color: getDefaultTaskColor(theme) },
    { name: 'Мама', color: 'red' },
    { name: 'Лёша', color: 'purple' },
    { name: 'Бабушка', color: 'green' },
  ];
}

function parseCatalog(raw: string | null, fallback: CatalogColorItem[]): CatalogColorItem[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as CatalogColorItem[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  return fallback;
}

export function loadWishlistCategories(): CatalogColorItem[] {
  return parseCatalog(
    localStorage.getItem(WISHLIST_CATEGORIES_STORAGE_KEY),
    DEFAULT_WISHLIST_CATEGORIES
  );
}

export function loadGiftRecipients(theme: ThemeId = 'standard'): CatalogColorItem[] {
  return parseCatalog(
    localStorage.getItem(GIFT_RECIPIENTS_STORAGE_KEY),
    getDefaultGiftRecipients(theme)
  );
}

export function saveWishlistCategories(items: CatalogColorItem[]): void {
  localStorage.setItem(WISHLIST_CATEGORIES_STORAGE_KEY, JSON.stringify(items));
}

export function saveGiftRecipients(items: CatalogColorItem[]): void {
  localStorage.setItem(GIFT_RECIPIENTS_STORAGE_KEY, JSON.stringify(items));
}

/** Sort visible section names: catalog order first, then task-only names. */
export function orderSectionNamesByCatalog(
  catalog: CatalogColorItem[],
  namesWithContent: string[],
  excludeNames: string[] = []
): string[] {
  const exclude = new Set(excludeNames);
  const contentSet = new Set(namesWithContent.filter(n => !exclude.has(n)));
  const catalogNames = catalog.map(c => c.name).filter(n => !exclude.has(n));

  const ordered: string[] = [];
  catalogNames.forEach(name => {
    if (contentSet.has(name)) ordered.push(name);
  });

  const rest = [...contentSet]
    .filter(name => !catalogNames.includes(name))
    .sort((a, b) => a.localeCompare(b, 'ru'));

  return [...ordered, ...rest];
}