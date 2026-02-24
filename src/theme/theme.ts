import { createTheme, alpha } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  const primaryMain = '#008587';
  const primaryLight = '#1dbec1';
  const primaryDark = '#004f51';
  const secondaryColor = isDark ? '#0f3460' : '#f0f4f8';
  const backgroundColor = isDark ? '#1a1a2e' : '#f4f7fa';
  const paperColor = isDark ? '#16213e' : '#ffffff';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
        contrastText: '#fff',
      },
      secondary: {
        main: secondaryColor,
        light: alpha(secondaryColor, 0.8),
        dark: isDark ? '#0a2342' : '#d1d9e6',
        contrastText: isDark ? '#fff' : '#1a1a2e',
      },
      background: {
        default: backgroundColor,
        paper: paperColor,
      },
      text: {
        primary: isDark ? '#ffffff' : '#1a1a2e',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 46, 0.7)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      button: {
        textTransform: 'none',
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '8px 20px',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(primaryMain, 0.4)}`,
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(45deg, ${primaryMain} 30%, ${primaryLight} 90%)`,
            boxShadow: `0 3px 5px 2px ${alpha(primaryMain, 0.3)}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? alpha(paperColor, 0.8) : paperColor,
            backdropFilter: isDark ? 'blur(10px)' : 'none',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
            boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
            padding: '16px',
          },
          head: {
            fontWeight: 800,
            backgroundColor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
            color: isDark ? alpha('#fff', 0.6) : alpha('#000', 0.6),
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.01),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                transition: 'border-color 0.2s',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: primaryMain,
              },
            },
          },
        },
      },
    },
  });
};
