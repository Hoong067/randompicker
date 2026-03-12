import React, { createContext, useContext } from 'react';
import DEFAULT_THEME from './theme';

const ThemeContext = createContext(DEFAULT_THEME);

export const ThemeProvider = ({ value, children }) => {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
