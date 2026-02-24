import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './store/authStore.tsx';
import { ThemeModeProvider, useThemeMode } from './store/themeStore.tsx';
import { getTheme } from './theme/theme.ts';

const Root = () => {
  const { mode } = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <Root />
    </ThemeModeProvider>
  </StrictMode>
);
