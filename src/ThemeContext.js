import React, { createContext, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });

export const ThemeContext = createContext();

export function ThemeProviderComponent({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const storedTheme = ls.get("darkMode");
      // Check if storedTheme is a valid non-empty value before parsing
      if (storedTheme) {
        return JSON.parse(storedTheme);
      }
      return false;
    } catch (error) {
      console.error("Error parsing darkMode preference:", error);
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      ls.set("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}
