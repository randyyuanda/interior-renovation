import {
  Box,
  Container,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  LogoutOutlined,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Brush as BrushIcon,
  AdminPanelSettings as AdminIcon,
  LightMode,
  DarkMode,
  Menu as MenuIcon,
  Person,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { useThemeMode } from "../store/themeStore";
import type { ReactNode } from "react";
import { useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  icon: ReactNode;
  subtitle?: string;
}

export default function MainLayout({
  children,
  title,
  icon,
  subtitle,
}: MainLayoutProps) {
  const { logout, user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Home Owners", icon: <PeopleIcon />, path: "/home-owners" },
    { label: "Designers", icon: <BrushIcon />, path: "/interior-designers" },
  ];

  if (user?.role === "superadmin") {
    navItems.push({
      label: "Admin Panel",
      icon: <AdminIcon />,
      path: "/super-admin",
    });
  }

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(233,69,96,0.1)"
                : "rgba(233,69,96,0.05)",
            p: 1,
            borderRadius: 2,
          }}
        >
          <BrushIcon />
        </Box>
        <Typography variant="h6" fontWeight={800} color="text.primary">
          RENO<span style={{ color: theme.palette.primary.main }}>VATE</span>
        </Typography>
      </Box>

      <List sx={{ px: 2, pt: 3, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? "primary.main" : "transparent",
                  color: active ? "#fff" : "text.secondary",
                  "&:hover": {
                    bgcolor: active ? "primary.dark" : "action.hover",
                    color: active ? "#fff" : "text.primary",
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: active ? "#fff" : "inherit", minWidth: 40 }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutOutlined />}
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            color: "error.main",
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(244,67,54,0.3)"
                : "rgba(244,67,54,0.1)",
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 260,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 260,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {SidebarContent}
        </Drawer>
      )}

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // Critical for preventing horizontal overflow
          position: "relative",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            height: 70,
            display: "flex",
            alignItems: "center",
            px: { xs: 2, sm: 4 },
            width: "100%",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}
          >
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} color="inherit">
                <MenuIcon />
              </IconButton>
            )}
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ color: "primary.main", display: "flex" }}>
                  {icon}
                </Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {title}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      ml: 1.5,
                      fontWeight: 500,
                      opacity: 0.8,
                      display: { xs: "none", md: "block" },
                    }}
                  >
                    • {subtitle}
                  </Typography>
                )}
              </Box>
            )}
            {isMobile && (
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ flexGrow: 1, color: "text.primary" }}
              >
                RENO
                <span style={{ color: theme.palette.primary.main }}>VATE</span>
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip
              title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            >
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === "dark" ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileClick}
                size="small"
                sx={{ ml: 0.5 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "secondary.main",
                    color: "secondary.contrastText",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {user?.email.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleProfileClose}
          onClick={handleProfileClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              borderRadius: 2,
              minWidth: 180,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="text.primary"
              noWrap
            >
              {user?.role === "superadmin" ? "Super Admin" : "Administrator"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ opacity: 0.8 }}
            >
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1.2, color: "error.main" }}
          >
            <ListItemIcon>
              <LogoutOutlined fontSize="small" sx={{ color: "error.main" }} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              py: { xs: 3, md: 4 },
              mb: isMobile ? "80px" : 0,
              flexGrow: 1,
            }}
          >
            {children}
          </Container>
        </Box>

        {isMobile && (
          <Paper
            elevation={10}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              borderRadius: 0,
              border: "none",
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <BottomNavigation
              showLabels
              value={location.pathname}
              onChange={(_event, newValue) => handleNav(newValue)}
              sx={{
                height: 70,
                bgcolor: "background.paper",
                "& .MuiBottomNavigationAction-root": {
                  minWidth: 0,
                  flex: 1,
                },
              }}
            >
              <BottomNavigationAction
                label="Home"
                value="/dashboard"
                icon={<DashboardIcon />}
              />
              <BottomNavigationAction
                label="Owners"
                value="/home-owners"
                icon={<PeopleIcon />}
              />
              <BottomNavigationAction
                label="Designers"
                value="/interior-designers"
                icon={<BrushIcon />}
              />
              {user?.role === "superadmin" && (
                <BottomNavigationAction
                  label="Admin"
                  value="/super-admin"
                  icon={<AdminIcon />}
                />
              )}
            </BottomNavigation>
          </Paper>
        )}
      </Box>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 260,
          },
        }}
      >
        {SidebarContent}
      </Drawer>
    </Box>
  );
}
