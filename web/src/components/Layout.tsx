import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme as useMuiTheme,
  useMediaQuery,
  alpha,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  AccountBalance,
  Category,
  Assessment,
  Settings,
  Logout,
  Person,
  DarkMode,
  LightMode,
  Notifications,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { gradients } from '../theme/theme';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', color: gradients.primary },
    { text: 'Expenses', icon: <Receipt />, path: '/expenses', color: gradients.secondary },
    { text: 'Budgets', icon: <AccountBalance />, path: '/budgets', color: gradients.info },
    { text: 'Categories', icon: <Category />, path: '/categories', color: gradients.warning },
    { text: 'Reports', icon: <Assessment />, path: '/reports', color: gradients.success },
    { text: 'Settings', icon: <Settings />, path: '/settings', color: gradients.dark },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        px: 2,
        py: 2,
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)'
          : gradients.primary,
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalanceWallet sx={{ fontSize: 32, color: 'white' }} />
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              color: 'white',
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            Budget Tracker
          </Typography>
        </Box>
      </Toolbar>
      
      <Box sx={{ px: 2, py: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: mode === 'dark'
              ? alpha(muiTheme.palette.primary.main, 0.1)
              : alpha(muiTheme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                background: gradients.primary,
                fontWeight: 600,
              }}
            >
              {user?.firstName?.[0] || user?.username?.[0] || 'U'}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.firstName || user?.username || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider />
      
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    background: item.color,
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '&:hover': {
                      background: item.color,
                      filter: 'brightness(1.1)',
                    },
                  },
                  '&:hover': {
                    background: alpha(muiTheme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: mode === 'dark'
              ? alpha(muiTheme.palette.info.main, 0.1)
              : alpha(muiTheme.palette.info.main, 0.05),
            border: `1px solid ${alpha(muiTheme.palette.info.main, 0.2)}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Theme Mode
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={1}>
            <IconButton
              size="small"
              onClick={toggleTheme}
              sx={{
                background: mode === 'dark' 
                  ? alpha(muiTheme.palette.primary.main, 0.2)
                  : alpha(muiTheme.palette.warning.main, 0.2),
                '&:hover': {
                  background: mode === 'dark'
                    ? alpha(muiTheme.palette.primary.main, 0.3)
                    : alpha(muiTheme.palette.warning.main, 0.3),
                },
              }}
            >
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
            <Typography variant="body2" fontWeight={500}>
              {mode === 'dark' ? 'Dark' : 'Light'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backdropFilter: 'blur(10px)',
          background: mode === 'dark'
            ? alpha(muiTheme.palette.background.paper, 0.8)
            : alpha(muiTheme.palette.background.paper, 0.9),
          borderBottom: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              background: menuItems.find((item) => item.path === location.pathname)?.color || gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {menuItems.find((item) => item.path === location.pathname)?.text || 'Budget Tracker'}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            {!isMobile && (
              <Tooltip title="Toggle theme">
                <IconButton onClick={toggleTheme} color="inherit">
                  {mode === 'dark' ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  background: gradients.primary,
                  fontWeight: 600,
                }}
              >
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Box>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
              },
            }}
          >
            <MenuItem 
              onClick={() => { 
                handleProfileMenuClose(); 
                navigate('/settings'); 
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { 
                handleProfileMenuClose(); 
                navigate('/settings'); 
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 8 },
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
