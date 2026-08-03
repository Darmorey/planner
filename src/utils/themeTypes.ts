export type ThemeId = 'standard' | 'forestDark' | 'autumn' | 'gray' | 'bright';

export const THEME_IDS: ThemeId[] = ['standard', 'forestDark', 'autumn', 'gray', 'bright'];

export function isThemeId(value: string | null): value is ThemeId {
  return !!value && (THEME_IDS as string[]).includes(value);
}
