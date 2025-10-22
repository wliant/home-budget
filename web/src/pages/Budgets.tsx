import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  FormControlLabel,
  Switch,


  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Skeleton,
  Stack,
  Avatar,
  Badge,
  Container,
  alpha,
  Slide,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,



  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,


  MoreVert,
  Close,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useNotification } from '../contexts/NotificationContext';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

interface Category {
  id: number;
  name: string;
  color?: string;
}

interface TimePeriod {
  startDate: Date | null;
  endDate: Date | null;
}

interface Budget {
  id?: number;
  name: string;
  description?: string;
  amount: number;
  category?: Category;
  budgetType: string;
  period?: TimePeriod;
  active: boolean;
  user?: { id: number };
  createdAt?: string;
  updatedAt?: string;
}

interface BudgetStatus {
  budget: Budget;
  totalExpenses: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

const Budgets: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Budget>({
    name: '',
    description: '',
    amount: 0,
    budgetType: 'MONTHLY',
    active: true,
    period: {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    },
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [showInactive, setShowInactive] = useState(false);

  const { showNotification } = useNotification();

  const userId = user?.id;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      loadBudgets();
      loadCategories();
      loadBudgetStatuses();
    }, 1000);
    return () => clearTimeout(timer);
  }, [showInactive]);

  const loadBudgets = async () => {
    try {
      const endpoint = showInactive 
        ? `/api/budgets/user/${userId}`
        : `/api/budgets/user/${userId}/active`;
      const response = await axiosInstance.get(endpoint);
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      showNotification('Failed to load budgets', 'error');
    }
  };

  const loadBudgetStatuses = async () => {
    try {
      const response = await axiosInstance.get(`/api/budgets/user/${userId}/status`);
      setBudgetStatuses(response.data);
    } catch (error) {
      console.error('Failed to load budget statuses:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axiosInstance.get(`/api/categories/user/${userId}`);
      const flatCategories: Category[] = [];
      const flatten = (cats: any[]) => {
        cats.forEach(cat => {
          flatCategories.push({
            id: cat.id,
            name: cat.name,
            color: cat.color
          });
          if (cat.childCategories && cat.childCategories.length > 0) {
            flatten(cat.childCategories);
          }
        });
      };
      flatten(response.data);
      setCategories(flatCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showNotification('Failed to load categories', 'error');
    }
  };

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        name: budget.name,
        description: budget.description || '',
        amount: budget.amount,
        budgetType: budget.budgetType,
        active: budget.active,
        period: budget.period || {
          startDate: startOfMonth(new Date()),
          endDate: endOfMonth(new Date()),
        },
      });
      setSelectedCategoryId(budget.category?.id || '');
    } else {
      setEditingBudget(null);
      const defaultPeriod = getDefaultPeriod('MONTHLY');
      setFormData({
        name: '',
        description: '',
        amount: 0,
        budgetType: 'MONTHLY',
        active: true,
        period: defaultPeriod,
      });
      setSelectedCategoryId('');
    }
    setOpenDialog(true);
  };

  const getDefaultPeriod = (budgetType: string): TimePeriod => {
    const now = new Date();
    switch (budgetType) {
      case 'DAILY':
        return {
          startDate: now,
          endDate: now,
        };
      case 'WEEKLY':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          startDate: weekStart,
          endDate: weekEnd,
        };
      case 'MONTHLY':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
        };
      case 'QUARTERLY':
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        return {
          startDate: quarterStart,
          endDate: quarterEnd,
        };
      case 'YEARLY':
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31),
        };
      default:
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
        };
    }
  };

  const handleBudgetTypeChange = (budgetType: string) => {
    const period = budgetType === 'CUSTOM' ? formData.period : getDefaultPeriod(budgetType);
    setFormData({ ...formData, budgetType, period });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleSaveBudget = async () => {
    try {
      if (!selectedCategoryId) {
        showNotification('Please select a category', 'warning');
        return;
      }

      const budgetData = {
        ...formData,
        user: { id: userId },
        category: { id: selectedCategoryId },
      };

      if (editingBudget) {
        await axiosInstance.put(`/api/budgets/${editingBudget.id}`, budgetData);
        showNotification('Budget updated successfully', 'success');
      } else {
        await axiosInstance.post('/api/budgets', budgetData);
        showNotification('Budget created successfully', 'success');
      }

      loadBudgets();
      loadBudgetStatuses();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save budget:', error);
      showNotification('Failed to save budget', 'error');
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axiosInstance.delete(`/api/budgets/${budgetId}`);
        showNotification('Budget deleted successfully', 'success');
        loadBudgets();
        loadBudgetStatuses();
      } catch (error) {
        console.error('Failed to delete budget:', error);
        showNotification('Failed to delete budget', 'error');
      }
    }
  };

  const getBudgetStatus = (budgetId: number): BudgetStatus | undefined => {
    return budgetStatuses.find(status => status.budget.id === budgetId);
  };

  const getProgressColor = (percentage: number): 'success' | 'warning' | 'error' => {
    if (percentage <= 70) return 'success';
    if (percentage <= 90) return 'warning';
    return 'error';
  };

  const getGradientColor = (percentage: number): string => {
    if (percentage <= 70) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (percentage <= 90) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
  };

  const budgetTypes = [
    { value: 'DAILY', label: 'Daily', icon: '📅' },
    { value: 'WEEKLY', label: 'Weekly', icon: '📆' },
    { value: 'MONTHLY', label: 'Monthly', icon: '🗓️' },
    { value: 'QUARTERLY', label: 'Quarterly', icon: '📊' },
    { value: 'YEARLY', label: 'Yearly', icon: '📈' },
    { value: 'CUSTOM', label: 'Custom', icon: '⚙️' },
  ];

  // Calculate summary statistics
  const totalBudgetAmount = budgetStatuses.reduce((sum, status) => sum + status.budget.amount, 0);
  const totalSpentAmount = budgetStatuses.reduce((sum, status) => sum + status.totalExpenses, 0);
  const overBudgetCount = budgetStatuses.filter(status => status.isOverBudget).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header Actions */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label="Show Inactive"
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  fullWidth={isMobile}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Add Budget
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>

        {/* Summary Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Grow in timeout={800}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Budget
                    </Typography>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                      ${totalBudgetAmount.toFixed(0)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 56, height: 56 }}>
                    <AccountBalanceWallet />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>

          <Grow in timeout={1000}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Spent
                    </Typography>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                      ${totalSpentAmount.toFixed(0)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 56, height: 56 }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>

          <Grow in timeout={1200}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Remaining
                    </Typography>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                      ${(totalBudgetAmount - totalSpentAmount).toFixed(0)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 56, height: 56 }}>
                    <TrendingDown />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>

          <Grow in timeout={1400}>
            <Card 
              sx={{ 
                background: overBudgetCount > 0 
                  ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                  : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                color: overBudgetCount > 0 ? 'white' : theme.palette.text.primary,
                boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Over Budget
                    </Typography>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                      {overBudgetCount}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(overBudgetCount > 0 ? '#fff' : '#000', 0.2), width: 56, height: 56 }}>
                    {overBudgetCount > 0 ? <Warning /> : <CheckCircle />}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Box>

        {/* Budget Cards */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Active Budgets
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {budgetStatuses.slice(0, isMobile ? 2 : 8).map((status, index) => (
              <Grow in timeout={800 + index * 100} key={status.budget.id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: 20,
                      zIndex: 1,
                    }}
                  >
                    <Badge
                      badgeContent={
                        status.isOverBudget ? (
                          <Warning sx={{ fontSize: 16 }} />
                        ) : (
                          <CheckCircle sx={{ fontSize: 16 }} />
                        )
                      }
                      color={status.isOverBudget ? 'error' : 'success'}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                          {status.budget.name}
                        </Typography>
                        {status.budget.category && (
                          <Chip
                            size="small"
                            label={status.budget.category.name}
                            sx={{
                              backgroundColor: status.budget.category.color,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Box>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>
                    
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Spent
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          ${status.totalExpenses.toFixed(0)} / ${status.budget.amount.toFixed(0)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(status.percentageUsed, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: getGradientColor(status.percentageUsed),
                          },
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          {status.percentageUsed.toFixed(1)}% used
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color={status.remainingAmount < 0 ? 'error' : 'success'}
                          fontWeight="600"
                        >
                          ${Math.abs(status.remainingAmount).toFixed(0)} {status.remainingAmount < 0 ? 'over' : 'left'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenDialog(status.budget)}
                        sx={{ flex: 1, borderRadius: 2 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        onClick={() => handleDeleteBudget(status.budget.id!)}
                        sx={{ borderRadius: 2 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            ))}
          </Box>
        )}

        {/* Budget Table for Desktop */}
        {!isMobile && budgets.length > 0 && (
          <Fade in timeout={1000}>
            <Paper 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Budget Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      {!isTablet && <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>}
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Budget</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Spent</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets.map((budget) => {
                      const status = getBudgetStatus(budget.id!);
                      return (
                        <TableRow 
                          key={budget.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.02),
                            },
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {budget.name}
                              </Typography>
                              {budget.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {budget.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {budget.category && (
                              <Chip
                                label={budget.category.name}
                                size="small"
                                sx={{
                                  backgroundColor: budget.category.color,
                                  color: 'white',
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={budget.budgetType} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          {!isTablet && (
                            <TableCell>
                              {budget.period && budget.period.startDate && budget.period.endDate ? (
                                <Typography variant="caption">
                                  {format(new Date(budget.period.startDate), 'MMM dd')} - 
                                  {format(new Date(budget.period.endDate), 'MMM dd, yyyy')}
                                </Typography>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          )}
                          <TableCell align="right">
                            <Typography fontWeight="600" color="primary">
                              ${budget.amount.toFixed(0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {status ? (
                              <Typography 
                                fontWeight="500"
                                color={status.isOverBudget ? 'error' : 'text.primary'}
                              >
                                ${status.totalExpenses.toFixed(0)}
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {status && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(status.percentageUsed, 100)}
                                  sx={{
                                    width: 80,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 3,
                                      background: getGradientColor(status.percentageUsed),
                                    },
                                  }}
                                />
                                <Typography variant="caption" fontWeight="500">
                                  {status.percentageUsed.toFixed(0)}%
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton 
                                size="small" 
                                onClick={() => handleOpenDialog(budget)}
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteBudget(budget.id!)}
                                sx={{
                                  color: theme.palette.error.main,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                  },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Fade>
        )}

        {/* Add/Edit Budget Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm"
          fullWidth
          TransitionComponent={Slide}
          TransitionProps={{ direction: 'up' } as any}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {editingBudget ? 'Edit Budget' : 'Create New Budget'}
            <IconButton 
              onClick={handleCloseDialog}
              sx={{ color: 'white' }}
              size="small"
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Budget Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
              <TextField
                label="Budget Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <FormControl fullWidth required variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value as number | '')}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: cat.color,
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        />
                        {cat.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Budget Type</InputLabel>
                <Select
                  value={formData.budgetType}
                  onChange={(e) => handleBudgetTypeChange(e.target.value)}
                  label="Budget Type"
                >
                  {budgetTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{type.icon}</span>
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formData.budgetType === 'CUSTOM' && (
                <>
                  <DatePicker
                    label="Start Date"
                    value={formData.period?.startDate}
                    onChange={(newValue) => setFormData({
                      ...formData,
                      period: { ...formData.period!, startDate: newValue }
                    })}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        variant: 'outlined'
                      } 
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.period?.endDate}
                    onChange={(newValue) => setFormData({
                      ...formData,
                      period: { ...formData.period!, endDate: newValue }
                    })}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        variant: 'outlined'
                      } 
                    }}
                  />
                </>
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.success.main,
                      },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>Active</Typography>
                    {formData.active ? (
                      <Chip label="ON" size="small" color="success" />
                    ) : (
                      <Chip label="OFF" size="small" />
                    )}
                  </Box>
                }
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveBudget} 
              variant="contained"
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                },
              }}
            >
              {editingBudget ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default Budgets;
