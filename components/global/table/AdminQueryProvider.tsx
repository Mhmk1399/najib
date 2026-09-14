"use client";

import {
  useAdminTheme,
  getAdminDataThemeVars,
  getAdminThemePalette,
} from "@/components/admin/useAdminTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";

export function AdminQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 1,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <AdminThemeVariableBridge />
      {children}
    </QueryClientProvider>
  );
}

function AdminThemeVariableBridge() {
  const theme = useAdminTheme();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const vars = getAdminDataThemeVars(theme) as Record<string, string>;
    const palette = getAdminThemePalette(theme);
    const previous = new Map<string, string>();

    for (const [key, value] of Object.entries(vars)) {
      if (!key.startsWith("--")) continue;
      previous.set(key, root.style.getPropertyValue(key));
      root.style.setProperty(key, value);
    }

    const oldBackground = body.style.backgroundColor;
    const oldColor = body.style.color;
    const oldScheme = body.style.colorScheme;
    const oldAdminTheme = body.dataset.adminTheme;
    const oldRootDir = root.getAttribute("dir");
    const oldBodyDir = body.getAttribute("dir");
    root.setAttribute("dir", "rtl");
    body.setAttribute("dir", "rtl");
    body.style.backgroundColor = palette.canvas;
    body.style.color = palette.text;
    body.style.colorScheme = theme;
    body.dataset.adminTheme = theme;

    return () => {
      for (const [key, value] of previous) {
        if (value) root.style.setProperty(key, value);
        else root.style.removeProperty(key);
      }
      body.style.backgroundColor = oldBackground;
      body.style.color = oldColor;
      body.style.colorScheme = oldScheme;
      if (oldRootDir === null) root.removeAttribute("dir");
      else root.setAttribute("dir", oldRootDir);
      if (oldBodyDir === null) body.removeAttribute("dir");
      else body.setAttribute("dir", oldBodyDir);
      if (oldAdminTheme === undefined) delete body.dataset.adminTheme;
      else body.dataset.adminTheme = oldAdminTheme;
    };
  }, [theme]);

  return null;
}
