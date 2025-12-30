import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark';

interface AdminThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  resetTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Chỉ lấy theme từ localStorage nếu đang ở admin
    const savedTheme = localStorage.getItem('adminTheme');
    return (savedTheme === 'dark' ? 'dark' : 'light') as ThemeMode;
  });

  useEffect(() => {
    // Apply theme to admin container
    if (theme === 'dark') {
      document.documentElement.classList.add('admin-dark');
      localStorage.setItem('adminTheme', 'dark');
    } else {
      document.documentElement.classList.remove('admin-dark');
      localStorage.setItem('adminTheme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const resetTheme = () => {
    setTheme('light');
    document.documentElement.classList.remove('admin-dark');
    localStorage.removeItem('adminTheme');
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, resetTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
};
