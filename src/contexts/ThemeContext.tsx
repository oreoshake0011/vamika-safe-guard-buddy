
import React, { createContext, useContext } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProviderContext = createContext<null>(null);

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  // Set light theme on body
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);

  return (
    <ThemeProviderContext.Provider {...props} value={null}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  return { theme: 'light' };
};
