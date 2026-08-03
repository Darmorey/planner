export type ThemeId = 'standard' | 'autumn' | 'gray' | 'bright';

export const THEME_IDS: ThemeId[] = ['standard', 'autumn', 'gray', 'bright'];

export function isThemeId(value: string | null): value is ThemeId {
  return !!value && (THEME_IDS as string[]).includes(value);
}

/** Default task/category color for a UI theme. */
export function getDefaultTaskColor(theme: ThemeId): string {
  switch (theme) {
    case 'standard':
      return 'green';
    case 'autumn':
      return 'orange';
    case 'bright':
      return 'purple';
    case 'gray':
    default:
      return 'blue';
  }
}
