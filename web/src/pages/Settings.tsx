import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  InputAdornment,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Grow,
  Avatar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Save,
  Person,
  Notifications,
  Security,
  Palette,
  Language,
  AttachMoney,
  Delete,
  Edit,
  Add,
  Email,
  Phone,
  LocationOn,
  Visibility,
  VisibilityOff,
  DarkMode,
  LightMode,
  Brightness4,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  expenseReminders: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

interface AppSettings {
  language: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  fiscalYearStart: number;
}

interface PaymentMethod {
  id?: number;
  name: string;
  type: string;
  lastFourDigits?: string;
  isDefault: boolean;
}

const Settings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode, toggleTheme } = useThemeContext();
  
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const { user } = useAuth();

  const userId = user?.id || 1;

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: userId,
    username: 'john.doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 234 567 8900',
    address: '123 Main St, City, State 12345',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    budgetAlerts: true,
    expenseReminders: true,
    weeklyReports: false,
    monthlyReports: true,
  });

  // App settings state
  const [appSettings, setAppSettings] = useState<AppSettings>({
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,234.56',
    fiscalYearStart: 1,
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, name: 'Personal Card', type: 'CREDIT_CARD', lastFourDigits: '1234', isDefault: true },
    { id: 2, name: 'Business Card', type: 'CREDIT_CARD', lastFourDigits: '5678', isDefault: false },
    { id: 3, name: 'Cash', type: 'CASH', isDefault: false },
  ]);

  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>({
    name: '',
    type: 'CREDIT_CARD',
    lastFourDigits: '',
    isDefault: false,
  });

  const { showNotification } = useNotification();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileSave = async () => {
    try {
      // In a real app, this would make an API call
      // await axiosInstance.put(`/api/users/${userId}`, profile);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      // In a real app, this would make an API call
      // await axiosInstance.post('/api/users/change-password', passwordData);
      showNotification('Password changed successfully', 'success');
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showNotification('Failed to change password', 'error');
    }
  };

  const handleNotificationsSave = async () => {
    try {
      // In a real app, this would make an API call
      // await axiosInstance.put(`/api/users/${userId}/notifications`, notifications);
      showNotification('Notification settings updated', 'success');
    } catch (error) {
      showNotification('Failed to update notification settings', 'error');
    }
  };

  const handleAppSettingsSave = async () => {
    try {
      // In a real app, this would make an API call
      // await axiosInstance.put(`/api/users/${userId}/settings`, appSettings);
      showNotification('App settings updated', 'success');
    } catch (error) {
      showNotification('Failed to update app settings', 'error');
    }
  };

  const handleAddPaymentMethod = () => {
    setEditingPaymentMethod(null);
    setNewPaymentMethod({
      name: '',
      type: 'CREDIT_CARD',
      lastFourDigits: '',
      isDefault: false,
    });
    setPaymentMethodDialogOpen(true);
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingPaymentMethod(method);
    setNewPaymentMethod(method);
    setPaymentMethodDialogOpen(true);
  };

  const handleSavePaymentMethod = () => {
    if (!newPaymentMethod.name) {
      showNotification('Please enter a payment method name', 'error');
      return;
    }

    if (editingPaymentMethod) {
      // Update existing
      setPaymentMethods(methods =>
        methods.map(m =>
          m.id === editingPaymentMethod.id ? { ...newPaymentMethod, id: m.id } : m
        )
      );
      showNotification('Payment method updated', 'success');
    } else {
      // Add new
      const newMethod = {
        ...newPaymentMethod,
        id: Math.max(...paymentMethods.map(m => m.id || 0)) + 1,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      showNotification('Payment method added', 'success');
    }

    setPaymentMethodDialogOpen(false);
  };

  const handleDeletePaymentMethod = (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(methods => methods.filter(m => m.id !== id));
      showNotification('Payment method deleted', 'success');
    }
  };

  const handleSetDefaultPaymentMethod = (id: number) => {
    setPaymentMethods(methods =>
      methods.map(m => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
    showNotification('Default payment method updated', 'success');
  };

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
  ];
  const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
  const paymentTypes = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'DIGITAL_WALLET'];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Fade in timeout={500}>
        <Paper sx={{ 
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Palette />} label="Preferences" />
          <Tab icon={<AttachMoney />} label="Payment Methods" />
          <Tab icon={<Security />} label="Security" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  fullWidth
                />
              </Box>
              <TextField
                label="Username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                fullWidth
                disabled
                helperText="Username cannot be changed"
              />
              <TextField
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                fullWidth
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleProfileSave}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive notifications via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={(e) =>
                      setNotifications({ ...notifications, emailNotifications: e.target.checked })
                    }
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Budget Alerts"
                  secondary="Get notified when approaching budget limits"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.budgetAlerts}
                    onChange={(e) =>
                      setNotifications({ ...notifications, budgetAlerts: e.target.checked })
                    }
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Expense Reminders"
                  secondary="Remind me to log expenses"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.expenseReminders}
                    onChange={(e) =>
                      setNotifications({ ...notifications, expenseReminders: e.target.checked })
                    }
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Weekly Reports"
                  secondary="Receive weekly spending summaries"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.weeklyReports}
                    onChange={(e) =>
                      setNotifications({ ...notifications, weeklyReports: e.target.checked })
                    }
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Monthly Reports"
                  secondary="Receive monthly financial reports"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.monthlyReports}
                    onChange={(e) =>
                      setNotifications({ ...notifications, monthlyReports: e.target.checked })
                    }
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleNotificationsSave}
              >
                Save Preferences
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Preferences
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* Dark Mode Section */}
              <Card sx={{ 
                p: 2,
                background: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: theme.palette.mode === 'dark' ? 'inherit' : 'white',
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.main : alpha('#fff', 0.2),
                        width: 48,
                        height: 48,
                      }}>
                        {mode === 'dark' ? <DarkMode /> : <LightMode />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          Theme Mode
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Currently using {mode === 'dark' ? 'Dark' : 'Light'} mode
                        </Typography>
                      </Box>
                    </Box>
                    <ToggleButtonGroup
                      value={mode}
                      exclusive
                      onChange={(e, value) => value && toggleTheme()}
                      size="medium"
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.background.paper, 0.8)
                          : alpha('#fff', 0.2),
                        '& .MuiToggleButton-root': {
                          color: theme.palette.mode === 'dark' ? 'inherit' : 'white',
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.mode === 'dark'
                              ? theme.palette.primary.main
                              : alpha('#fff', 0.3),
                            color: theme.palette.mode === 'dark' ? 'white' : 'white',
                          },
                        },
                      }}
                    >
                      <ToggleButton value="light">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LightMode fontSize="small" />
                          <Typography variant="body2">Light</Typography>
                        </Stack>
                      </ToggleButton>
                      <ToggleButton value="dark">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DarkMode fontSize="small" />
                          <Typography variant="body2">Dark</Typography>
                        </Stack>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  
                  <Divider sx={{ my: 2, borderColor: alpha('#fff', 0.2) }} />
                  
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                      Theme Preview
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                      gap: 1,
                    }}>
                      {['#667eea', '#f093fb', '#4facfe', '#fa709a', '#30cfd0'].map((color) => (
                        <Box
                          key={color}
                          sx={{
                            height: 40,
                            borderRadius: 1,
                            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                            {color}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={appSettings.language}
                  onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
                  label="Language"
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={appSettings.currency}
                  onChange={(e) => setAppSettings({ ...appSettings, currency: e.target.value })}
                  label="Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={appSettings.dateFormat}
                  onChange={(e) => setAppSettings({ ...appSettings, dateFormat: e.target.value })}
                  label="Date Format"
                >
                  {dateFormats.map((format) => (
                    <MenuItem key={format} value={format}>
                      {format}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Fiscal Year Start</InputLabel>
                <Select
                  value={appSettings.fiscalYearStart}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, fiscalYearStart: Number(e.target.value) })
                  }
                  label="Fiscal Year Start"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <MenuItem key={month} value={month}>
                      {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleAppSettingsSave}
                >
                  Save Preferences
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Payment Methods Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Payment Methods
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddPaymentMethod}
              >
                Add Payment Method
              </Button>
            </Box>

            <List>
              {paymentMethods.map((method, index) => (
                <React.Fragment key={method.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {method.name}
                          {method.isDefault && (
                            <Chip label="Default" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {method.type.replace('_', ' ')}
                            {method.lastFourDigits && ` ending in ${method.lastFourDigits}`}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {!method.isDefault && (
                        <Button
                          size="small"
                          onClick={() => handleSetDefaultPaymentMethod(method.id!)}
                          sx={{ mr: 1 }}
                        >
                          Set Default
                        </Button>
                      )}
                      <IconButton onClick={() => handleEditPaymentMethod(method)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeletePaymentMethod(method.id!)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Password
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last changed: 30 days ago
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Add an extra layer of security to your account
                </Typography>
              </CardContent>
              <CardActions>
                <Button variant="outlined">
                  Enable 2FA
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Active Sessions
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage your active sessions across devices
                </Typography>
              </CardContent>
              <CardActions>
                <Button variant="outlined" color="error">
                  Sign Out All Devices
                </Button>
              </CardActions>
            </Card>

            <Alert severity="info" sx={{ mt: 3 }}>
              For your security, we recommend using a strong password and enabling two-factor authentication.
            </Alert>
          </Box>
        </TabPanel>
        </Paper>
      </Fade>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              fullWidth
              helperText="Must be at least 8 characters"
            />
            <TextField
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={paymentMethodDialogOpen} onClose={() => setPaymentMethodDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              value={newPaymentMethod.name}
              onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, name: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newPaymentMethod.type}
                onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, type: e.target.value })}
                label="Type"
              >
                {paymentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {(newPaymentMethod.type === 'CREDIT_CARD' || newPaymentMethod.type === 'DEBIT_CARD') && (
              <TextField
                label="Last 4 Digits"
                value={newPaymentMethod.lastFourDigits}
                onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, lastFourDigits: e.target.value })}
                fullWidth
                inputProps={{ maxLength: 4 }}
                helperText="For identification purposes only"
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={newPaymentMethod.isDefault}
                  onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, isDefault: e.target.checked })}
                />
              }
              label="Set as default"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentMethodDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePaymentMethod} variant="contained">
            {editingPaymentMethod ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;
