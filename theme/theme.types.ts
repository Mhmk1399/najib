/**
 * theme.types.ts
 *
 * 'system' حذف شد — تم فقط با دکمه تاگل کنترل می‌شه.
 */

/** تنها دو حالت مجاز */
export type ThemePreference = 'light' | 'dark';

/** همیشه یکی از این دو مقدار */
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
    /** تم فعلی — همیشه 'light' یا 'dark' */
    theme: ThemePreference;

    /** همان theme — چون دیگه system نداریم resolved همیشه برابر theme هست */
    resolvedTheme: ResolvedTheme;

    /** تنظیم تم */
    setTheme: (theme: ThemePreference) => void;

    /** سوئیچ بین light و dark */
    toggleTheme: () => void;

    /** بعد از mount شدن true می‌شه — برای جلوگیری از hydration mismatch */
    mounted: boolean;
}

export interface ThemeProviderProps {
    children: React.ReactNode;

    /**
     * تم پیش‌فرض وقتی هیچ مقداری در localStorage نیست.
     * فقط 'light' یا 'dark' — دیگه 'system' نداریم.
     */
    defaultTheme?: ThemePreference;
}

export interface ThemeScriptProps {
    storageKey?: string;
    /** تم پیش‌فرض — باید با defaultTheme پروایدر یکی باشه */
    defaultTheme?: ThemePreference;
}