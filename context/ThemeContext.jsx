// // context/ThemeContext.js
// import React, { createContext, useState } from 'react';

// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [themeDark, setThemeDark] = useState(false); // shared value

//   return (
//     <ThemeContext.Provider value={{ themeDark, setThemeDark }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };
// src/context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
