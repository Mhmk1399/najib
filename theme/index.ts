/**
 * index.ts — Public API
 */

export type {
    ThemePreference,
    ResolvedTheme,
    ThemeContextValue,
    ThemeProviderProps,
    ThemeScriptProps,
} from './theme.types';

export {
    brandColors,
    lightTokens,
    darkTokens,
    fontTokens,
    themeClasses,
} from './theme-colors';

export type { ThemeClasses } from './theme-colors';

export { ThemeProvider, useTheme } from '../contexts/theme-context';

export { ThemeScript } from '../components/global/theme-script';
