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
  FormControlLabel,
  Checkbox,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Grow,
  Slide,
  Card,
  CardContent,
  Avatar,
  Stack,
  Skeleton,
  Tooltip,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AttachMoney,
  CalendarToday,
  Category as CategoryIcon,
  Receipt,
  CreditCard,
  AccountBalanceWallet,
  LocalAtm,
  Smartphone,
  AccountBalance,
  Repeat,
  FilterList,
  Search,
  Close,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ViewList,
  ViewModule,
  MoreVert,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfMonth, endOfMonth, isToday, isYesterday, subDays } from 'date-fns';
import { useNotification } from '../contexts/NotificationContext';
import axiosInstance from '../api/axiosInstance';

interface Category {
  id: number;
  name: string;
  color?: string;
}

interface Expense {
  id?: number;
  description: string;
  amount: number;
  date: Date;
  category?: Category;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  user?: { id: number };
}

const Expenses: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('month');
  
  const [formData, setFormData] = useState<Expense>({
    description: '',
    amount: 0,
    date: new Date(),
    notes: '',
    isRecurring: false,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

  const { showNotification } = useNotification();

  // Mock user ID - in real app, get from auth context
  const userId = 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExpenses();
      loadCategories();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, selectedCategory, dateFilter]);

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category?.id === selectedCategory);
    }

    // Date filter
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(expense => isToday(expense.date));
        break;
      case 'week':
        filtered = filtered.filter(expense => expense.date >= subDays(now, 7));
        break;
      case 'month':
        filtered = filtered.filter(expense => 
          expense.date >= startOfMonth(now) && expense.date <= endOfMonth(now)
        );
        break;
    }

    setFilteredExpenses(filtered);
  };

  const loadExpenses = async () => {
    try {
      const response = await axiosInstance.get(`/api/expenses/user/${userId}`);
      const expensesData = response.data.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
      setExpenses(expensesData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      showNotification('Failed to load expenses', 'error');
      setLoading(false);
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

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        notes: expense.notes || '',
        isRecurring: expense.isRecurring || false,
        paymentMethod: expense.paymentMethod,
        recurrenceFrequency: expense.recurrenceFrequency,
      });
      setSelectedCategoryId(expense.category?.id || '');
    } else {
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: 0,
        date: new Date(),
        notes: '',
        isRecurring: false,
      });
      setSelectedCategoryId('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
  };

  const handleSaveExpense = async () => {
    try {
      const expenseData = {
        ...formData,
        user: { id: userId },
        category: selectedCategoryId ? { id: selectedCategoryId } : undefined,
      };

      if (editingExpense) {
        await axiosInstance.put(`/api/expenses/${editingExpense.id}`, expenseData);
        showNotification('Expense updated successfully', 'success');
      } else {
        await axiosInstance.post('/api/expenses', expenseData);
        showNotification('Expense created successfully', 'success');
      }

      loadExpenses();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save expense:', error);
      showNotification('Failed to save expense', 'error');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axiosInstance.delete(`/api/expenses/${expenseId}`);
        showNotification('Expense deleted successfully', 'success');
        loadExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
        showNotification('Failed to delete expense', 'error');
      }
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'CREDIT_CARD': return <CreditCard />;
      case 'DEBIT_CARD': return <CreditCard />;
      case 'CASH': return <LocalAtm />;
      case 'BANK_TRANSFER': return <AccountBalance />;
      case 'DIGITAL_WALLET': return <Smartphone />;
      default: return <AccountBalanceWallet />;
    }
  };

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: <LocalAtm /> },
    { value: 'CREDIT_CARD', label: 'Credit Card', icon: <CreditCard /> },
    { value: 'DEBIT_CARD', label: 'Debit Card', icon: <CreditCard /> },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: <AccountBalance /> },
    { value: 'DIGITAL_WALLET', label: 'Digital Wallet', icon: <Smartphone /> },
  ];

  const recurrenceFrequencies = [
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY',
  ];

  // Calculate statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
  const recurringCount = filteredExpenses.filter(e => e.isRecurring).length;

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const ExpenseCard = ({ expense }: { expense: Expense }) => (
    <Grow in timeout={800}>
      <Card 
        sx={{ 
          height: '100%',
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
        {expense.isRecurring && (
          <Badge
            badgeContent={<Repeat sx={{ fontSize: 12 }} />}
            color="secondary"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              '& .MuiBadge-badge': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }
            }}
          />
        )}
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {expense.description}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {expense.category && (
                  <Chip
                    size="small"
                    label={expense.category.name}
                    sx={{
                      backgroundColor: expense.category.color,
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                )}
                <Chip
                  size="small"
                  label={getDateLabel(expense.date)}
                  variant="outlined"
                  icon={<CalendarToday sx={{ fontSize: 14 }} />}
                />
              </Box>
            </Box>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
          
          <Box mb={2}>
            <Typography variant="h5" fontWeight={700} color="error" gutterBottom>
              ${expense.amount.toFixed(2)}
            </Typography>
            {expense.paymentMethod && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {getPaymentMethodIcon(expense.paymentMethod)}
                <Typography variant="caption" color="text.secondary">
                  {expense.paymentMethod.replace('_', ' ')}
                </Typography>
              </Box>
            )}
          </Box>

          {expense.notes && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {expense.notes}
            </Typography>
          )}

          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpenDialog(expense)}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="text"
              color="error"
              onClick={() => handleDeleteExpense(expense.id!)}
              sx={{ borderRadius: 2 }}
            >
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header Actions */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              fullWidth={isMobile}
              sx={{
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(240, 147, 251, 0.6)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Add Expense
            </Button>
          </Box>
        </Fade>

        {/* Statistics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4
        }}>
          <Grow in timeout={600}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Expenses
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ${totalExpenses.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>

          <Grow in timeout={800}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Transactions
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {filteredExpenses.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                    <Receipt />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>

          <Grow in timeout={1000}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Average
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ${averageExpense.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                    <AttachMoney />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>

          <Grow in timeout={1200}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Recurring
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {recurringCount}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                    <Repeat />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Box>

        {/* Filters */}
        <Fade in timeout={1400}>
          <Paper 
            sx={{ 
              p: 2,
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <TextField
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: cat.color,
                          }}
                        />
                        {cat.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <ToggleButtonGroup
                value={dateFilter}
                exclusive
                onChange={(e, value) => value && setDateFilter(value)}
                size="small"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="today">Today</ToggleButton>
                <ToggleButton value="week">Week</ToggleButton>
                <ToggleButton value="month">Month</ToggleButton>
              </ToggleButtonGroup>

              {!isMobile && (
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, value) => value && setViewMode(value)}
                  size="small"
                >
                  <ToggleButton value="list">
                    <ViewList />
                  </ToggleButton>
                  <ToggleButton value="grid">
                    <ViewModule />
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            </Stack>
          </Paper>
        </Fade>

        {/* Expenses Display */}
        {loading ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: viewMode === 'grid' 
              ? { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }
              : '1fr',
            gap: 3 
          }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : viewMode === 'grid' || isMobile ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3 
          }}>
            {filteredExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </Box>
        ) : (
          <Fade in timeout={1600}>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow 
                      key={expense.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        },
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          {getDateLabel(expense.date)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {expense.description}
                          {expense.isRecurring && (
                            <Chip
                              icon={<Repeat />}
                              label="Recurring"
                              size="small"
                              color="secondary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {expense.category && (
                          <Chip
                            label={expense.category.name}
                            size="small"
                            sx={{
                              backgroundColor: expense.category.color,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="error" fontWeight={600}>
                          ${expense.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {expense.paymentMethod && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {getPaymentMethodIcon(expense.paymentMethod)}
                            <Typography variant="body2">
                              {expense.paymentMethod.replace('_', ' ')}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {expense.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(expense)}
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
                            onClick={() => handleDeleteExpense(expense.id!)}
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        )}

        {/* Add/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Slide}
          TransitionProps={{ direction: 'up' } as any}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value as number | '')}
                  label="Category"
                >
                  <MenuItem value="">None</MenuItem>
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
              
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod || ''}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  label="Payment Method"
                >
                  <MenuItem value="">None</MenuItem>
                  {paymentMethods.map(method => (
                    <MenuItem key={method.value} value={method.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {method.icon}
                        {method.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isRecurring || false}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  />
                }
                label="Recurring Expense"
              />

              {formData.isRecurring && (
                <FormControl fullWidth>
                  <InputLabel>Recurrence Frequency</InputLabel>
                  <Select
                    value={formData.recurrenceFrequency || ''}
                    onChange={(e) => setFormData({ ...formData, recurrenceFrequency: e.target.value })}
                    label="Recurrence Frequency"
                  >
                    {recurrenceFrequencies.map(freq => (
                      <MenuItem key={freq} value={freq}>
                        {freq.charAt(0) + freq.slice(1).toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveExpense} 
              variant="contained"
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(240, 147, 251, 0.6)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {editingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default Expenses;
